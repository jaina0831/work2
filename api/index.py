from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    HTTPException,
    Depends,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse

from pydantic import BaseModel
from typing import Optional, List, Literal, Dict, Any
from uuid import uuid4
import os
import logging

from supabase import create_client, Client
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

from openai import OpenAI

# ---------------------------------------------------------
# logging
# ---------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

# ---------------------------------------------------------
# env
# ---------------------------------------------------------
load_dotenv()

OPENAI_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_KEY:
    raise RuntimeError("Missing OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_KEY)

# ---------------------------------------------------------
# app
# ---------------------------------------------------------
app = FastAPI()

# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://work2-phi.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,
)

# ---------------------------------------------------------
# Supabase
# ---------------------------------------------------------
sb: Optional[Client] = None
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

try:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    else:
        sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase client initialized")
except Exception:
    logger.exception("Supabase client init failed")
    sb = None

# ---------------------------------------------------------
# Firebase Admin init
# ---------------------------------------------------------
firebase_app = None
try:
    firebase_type = os.environ.get("FIREBASE_TYPE", "service_account")
    firebase_project_id = os.environ.get("FIREBASE_PROJECT_ID")
    firebase_private_key_id = os.environ.get("FIREBASE_PRIVATE_KEY_ID")
    firebase_private_key = os.environ.get("FIREBASE_PRIVATE_KEY")
    firebase_client_email = os.environ.get("FIREBASE_CLIENT_EMAIL")
    firebase_client_id = os.environ.get("FIREBASE_CLIENT_ID")
    firebase_client_x509_cert_url = os.environ.get("FIREBASE_CLIENT_X509_CERT_URL")

    if not (firebase_project_id and firebase_private_key and firebase_client_email):
        logger.error("Missing Firebase service account envs")
    else:
        private_key = firebase_private_key.replace("\\n", "\n")
        cred_info = {
            "type": firebase_type,
            "project_id": firebase_project_id,
            "private_key_id": firebase_private_key_id,
            "private_key": private_key,
            "client_email": firebase_client_email,
            "client_id": firebase_client_id,
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": firebase_client_x509_cert_url,
        }
        cred = credentials.Certificate(cred_info)
        firebase_app = firebase_admin.initialize_app(cred)
        logger.info("Firebase admin initialized from env vars")
except Exception:
    logger.exception("Firebase admin init failed")
    firebase_app = None

# ---------------------------------------------------------
# Firebase auth dependencies
# ---------------------------------------------------------
security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    if firebase_app is None:
        raise HTTPException(500, "Firebase not configured")
    if credentials is None:
        raise HTTPException(401, "Missing Authorization header")

    token = credentials.credentials
    try:
        decoded = firebase_auth.verify_id_token(token)
        return decoded
    except Exception:
        logger.exception("verify_id_token failed")
        raise HTTPException(401, "Invalid or expired token")

def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Optional[Dict[str, Any]]:
    """有登入就回 user，沒登入就回 None（for /posts GET）"""
    if credentials is None:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None

# ---------------------------------------------------------
# Schemas
# ---------------------------------------------------------
class CommentOut(BaseModel):
    id: int
    post_id: int
    author: str
    text: str
    created_at: str

class PostOut(BaseModel):
    id: int
    author: str
    title: str
    content: str
    image_url: Optional[str] = None
    author_avatar: Optional[str] = None
    likes_count: int
    created_at: str
    is_liked: bool = False
    comments: List[CommentOut] = []

class CommentIn(BaseModel):
    post_id: int
    text: str

# ---- Chat schemas ----
Role = Literal["system", "user", "assistant"]

class ChatMessage(BaseModel):
    role: Role
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    reply: str

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
_user_cache: Dict[str, Dict[str, Optional[str]]] = {}

def get_user_profile(uid: str) -> Dict[str, Optional[str]]:
    """
    從 Firebase 取 displayName / photoURL / email
    做一個簡單快取避免一直打 Firebase Admin
    """
    if uid in _user_cache:
        return _user_cache[uid]

    try:
        u = firebase_auth.get_user(uid)
        profile = {
            "displayName": u.display_name,
            "photoURL": u.photo_url,
            "email": u.email,
        }
        _user_cache[uid] = profile
        return profile
    except Exception:
        logger.exception("firebase_auth.get_user failed")
        profile = {"displayName": None, "photoURL": None, "email": None}
        _user_cache[uid] = profile
        return profile

def _row_to_post_with_comments(row, viewer_uid: Optional[str]) -> PostOut:
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    # comments
    cres = (
        sb.table("comments")
        .select("*")
        .eq("post_id", row["id"])
        .order("created_at", desc=True)
        .execute()
    )
    comments = cres.data or []

    # is_liked
    is_liked = False
    if viewer_uid:
        lres = (
            sb.table("likes")
            .select("id")
            .eq("post_id", row["id"])
            .eq("device_id", viewer_uid)  # 用 uid 當 device_id
            .limit(1)
            .execute()
        )
        is_liked = bool((lres.data or []))

    return PostOut(
        id=row["id"],
        author=row.get("author") or "匿名",
        title=row.get("title") or "",
        content=row.get("content") or "",
        image_url=row.get("image_url"),
        author_avatar=row.get("author_avatar"),
        likes_count=row.get("likes_count", 0) or 0,
        created_at=row["created_at"],
        is_liked=is_liked,
        comments=comments,
    )

def recompute_likes_count(post_id: int) -> int:
    """最穩：每次 like/unlike 後，重新計算 likes 表數量，回寫 posts.likes_count"""
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    all_likes = (
        sb.table("likes")
        .select("id")
        .eq("post_id", post_id)
        .execute()
        .data
        or []
    )
    count = len(all_likes)
    sb.table("posts").update({"likes_count": count}).eq("id", post_id).execute()
    return count

# ---------------------------------------------------------
# Routes
# ---------------------------------------------------------
@app.get("/", include_in_schema=False)
def root():
    return JSONResponse(
        {
            "message": "Work2 後端 API 正常運作中",
            "docs": "/docs",
            "example_endpoints": ["/posts", "/comments", "/chat"],
        }
    )

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/health/supabase")
def health_supabase():
    return {"sb": bool(sb)}

SYSTEM_PROMPT = """
你是「浪浪領地的小管家」，語氣溫暖可愛但不裝傻，使用繁體中文。
...（略，保留你原本內容即可）
"""

@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(payload: ChatRequest, user=Depends(get_current_user)):
    try:
        logger.info("Chat request from uid=%s", user.get("uid"))

        messages = [{"role": "system", "content": SYSTEM_PROMPT}] + [
            {"role": m.role, "content": m.content} for m in payload.messages
        ]

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
        )

        reply = completion.choices[0].message.content
        return {"reply": reply}

    except Exception:
        logger.exception("ERROR in /chat")
        raise HTTPException(status_code=500, detail="AI error")

# ---------------------------
# Posts (GET 可不登入；POST/LIKE/DELETE 必須登入)
# ---------------------------
@app.get("/posts", response_model=List[PostOut])
def list_posts(user=Depends(get_optional_user)):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    viewer_uid = user.get("uid") if user else None

    rows = (
        sb.table("posts")
        .select("*")
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    return [_row_to_post_with_comments(r, viewer_uid) for r in rows]

@app.get("/posts/{post_id}", response_model=PostOut)
def get_post(post_id: int, user=Depends(get_optional_user)):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    viewer_uid = user.get("uid") if user else None

    row = (
        sb.table("posts")
        .select("*")
        .eq("id", post_id)
        .maybe_single()
        .execute()
        .data
    )
    if not row:
        raise HTTPException(404, "Post not found")

    return _row_to_post_with_comments(row, viewer_uid)

@app.post("/posts", response_model=PostOut)
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None),
    user=Depends(get_current_user),
):
    try:
        if sb is None:
            raise HTTPException(500, "Supabase not configured")

        uid = user.get("uid")
        profile = get_user_profile(uid)
        author = profile.get("displayName") or profile.get("email") or "匿名"
        author_avatar = profile.get("photoURL")

        image_url = None
        if image:
            ext = os.path.splitext(image.filename)[1].lower() or ".jpg"
            key = f"{uuid4().hex}{ext}"
            data = await image.read()

            up_res = sb.storage.from_("images").upload(
                key,
                data,
                file_options={
                    "contentType": image.content_type or "application/octet-stream"
                },
            )

            if getattr(up_res, "error", None) or (
                isinstance(up_res, dict) and up_res.get("error")
            ):
                raise HTTPException(
                    500,
                    f"upload error: {getattr(up_res,'error',None) or up_res.get('error')}",
                )

            pub = sb.storage.from_("images").get_public_url(key)
            image_url = (
                pub
                if isinstance(pub, str)
                else (pub.get("publicUrl") if isinstance(pub, dict) else None)
            )

        ins = (
            sb.table("posts")
            .insert(
                {
                    "author": author,
                    "author_avatar": author_avatar,
                    "title": title,
                    "content": content,
                    "image_url": image_url,
                    "likes_count": 0,
                }
            )
            .execute()
        )

        if not ins.data:
            raise HTTPException(500, "insert posts returned no data")

        row = ins.data[0]
        return _row_to_post_with_comments(row, uid)

    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /posts failed")
        raise HTTPException(500, "internal_error")

@app.post("/posts/{post_id}/like", response_model=PostOut)
def toggle_like(post_id: int, user=Depends(get_current_user)):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    uid = user.get("uid")

    try:
        post = (
            sb.table("posts")
            .select("*")
            .eq("id", post_id)
            .maybe_single()
            .execute()
            .data
        )
        if not post:
            raise HTTPException(404, "Post not found")

        # ✅ 不用 maybe_single，避免 406
        liked_rows = (
            sb.table("likes")
            .select("id")
            .eq("post_id", post_id)
            .eq("device_id", uid)
            .limit(1)
            .execute()
            .data
            or []
        )
        liked = liked_rows[0] if liked_rows else None

        if liked:
            sb.table("likes").delete().eq("id", liked["id"]).execute()
        else:
            sb.table("likes").insert({"post_id": post_id, "device_id": uid}).execute()

        # ✅ 每次重算最穩（避免多點同時按造成錯）
        recompute_likes_count(post_id)

        row = (
            sb.table("posts")
            .select("*")
            .eq("id", post_id)
            .maybe_single()
            .execute()
            .data
        )
        return _row_to_post_with_comments(row, uid)

    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /posts/{post_id}/like failed")
        raise HTTPException(500, "internal_error")

@app.post("/comments", response_model=CommentOut)
def add_comment(payload: CommentIn, user=Depends(get_current_user)):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    uid = user.get("uid")
    profile = get_user_profile(uid)
    author = profile.get("displayName") or profile.get("email") or "匿名"

    try:
        exists = (
            sb.table("posts")
            .select("id")
            .eq("id", payload.post_id)
            .limit(1)
            .execute()
            .data
        )
        if not exists:
            raise HTTPException(404, "Post not found")

        insert_payload = {
            "post_id": payload.post_id,
            "author": author,
            "text": payload.text,
        }

        resp = sb.table("comments").insert(insert_payload).execute()
        if not resp.data:
            raise HTTPException(500, "insert comments returned no data")
        return resp.data[0]

    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /comments failed")
        raise HTTPException(500, "internal_error")

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, user=Depends(get_current_user)):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    post = (
        sb.table("posts")
        .select("id, image_url")
        .eq("id", post_id)
        .maybe_single()
        .execute()
        .data
    )
    if not post:
        raise HTTPException(404, "Post not found")

    sb.table("likes").delete().eq("post_id", post_id).execute()
    sb.table("comments").delete().eq("post_id", post_id).execute()

    image_url = post.get("image_url")
    if image_url:
        filename = image_url.split("/")[-1].split("?")[0]
        sb.storage.from_("images").remove([filename])

    sb.table("posts").delete().eq("id", post_id).execute()
    return {"status": "ok", "deleted_id": post_id}
