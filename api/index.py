from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Form,
    Header,
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

logger.info("OPENAI_API_KEY loaded: %s", "YES" if OPENAI_KEY else "NO")

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
# Supabase init
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
# Firebase Admin init（從環境變數讀 service account）
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
# Firebase Auth dependency（Secured API 用）
# ---------------------------------------------------------
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """
    從 Authorization: Bearer <ID_TOKEN> 解析 Firebase 使用者
    """
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

# ---------------------------------------------------------
# Helpers：從 Firebase 取得作者資訊（author / author_avatar）
# ---------------------------------------------------------
def _get_author_from_firebase(decoded: Dict[str, Any]) -> Dict[str, Optional[str]]:
    uid = decoded.get("uid")
    email = decoded.get("email")
    name = decoded.get("name")
    picture = decoded.get("picture")

    author = None
    avatar = None

    if name and isinstance(name, str) and name.strip():
        author = name.strip()
    if picture and isinstance(picture, str) and picture.strip():
        avatar = picture.strip()

    try:
        if uid:
            u = firebase_auth.get_user(uid)
            if not author and u.display_name:
                author = u.display_name
            if not avatar and u.photo_url:
                avatar = u.photo_url
            if not author and u.email:
                author = u.email
    except Exception:
        logger.warning("firebase_auth.get_user failed for uid=%s", uid)

    if not author:
        author = email or uid or "匿名"

    return {"author": author, "author_avatar": avatar}

# ---------------------------------------------------------
# Schemas（命名完全配合你原本的 author）
# ---------------------------------------------------------
class CommentOut(BaseModel):
    id: int
    post_id: int
    author: str
    text: str
    created_at: str
    author_avatar: Optional[str] = None

class PostOut(BaseModel):
    id: int
    author: str
    title: str
    content: str
    image_url: Optional[str] = None
    likes_count: int
    created_at: str
    author_avatar: Optional[str] = None
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
def _row_to_comment_out(row) -> CommentOut:
    return CommentOut(
        id=row["id"],
        post_id=row["post_id"],
        author=row.get("author") or "匿名",
        text=row.get("text") or "",
        created_at=row["created_at"],
        author_avatar=row.get("author_avatar"),
    )

def _row_to_post_with_comments(row) -> PostOut:
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    res = (
        sb.table("comments")
        .select("*")
        .eq("post_id", row["id"])
        .order("created_at", desc=True)
        .execute()
    )
    comments_rows = res.data or []
    comments = [_row_to_comment_out(r) for r in comments_rows]

    return PostOut(
        id=row["id"],
        author=row.get("author") or "匿名",
        title=row.get("title") or "",
        content=row.get("content") or "",
        image_url=row.get("image_url"),
        likes_count=row.get("likes_count", 0) or 0,
        created_at=row["created_at"],
        author_avatar=row.get("author_avatar"),
        comments=comments,
    )

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

你會協助使用者了解：
- 流浪動物認養流程
- 送養與收容相關資訊
- 基本貓狗照護觀念
- 網站功能與使用導覽

【重要回答格式規則】
1. 只要出現「條列」或「多個重點」，必須使用「換行條列」。
2. 每一個重點必須「獨立成一行」，不可與其他重點同一行。
3. 條列格式請統一使用以下其中一種（擇一即可）：
   - 「• 圓點條列」
   - 「1.、2.、3. 數字條列」
4. 每個條列項目之間需保留換行，讓內容容易閱讀。
5. 若條列項目下有補充說明，請使用縮排的「-」作為子項目。

【禁止事項】
- 不可將多個條列內容寫在同一行。
- 不可輸出一整段沒有換行的長文字。
- 不可捏造不存在的收容單位、貓咪資訊或聯絡方式。

【醫療相關】
- 若涉及醫療，只能提供一般照護方向與提醒就醫，不可做診斷。

【結尾規則】
- 回答結尾請加一句簡短、溫暖的追問

如果不確定使用者需求，請先提出 1 個澄清問題再回答。
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

@app.get("/posts", response_model=List[PostOut])
def list_posts():
    if sb is None:
        raise HTTPException(500, "Supabase not configured")
    rows = (
        sb.table("posts")
        .select("*")
        .order("created_at", desc=True)
        .execute()
        .data
        or []
    )
    return [_row_to_post_with_comments(r) for r in rows]

@app.get("/posts/{post_id}", response_model=PostOut)
def get_post(post_id: int):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")
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
    return _row_to_post_with_comments(row)

# ✅ 發文必須登入，author / author_avatar 從 Firebase 取得（不收前端 author）
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

        author_info = _get_author_from_firebase(user)
        author = author_info["author"]
        author_avatar = author_info["author_avatar"]

        image_url = None
        if image:
            ext = os.path.splitext(image.filename)[1].lower() or ".jpg"
            key = f"{uuid4().hex}{ext}"
            data = await image.read()

            up_res = sb.storage.from_("images").upload(
                key,
                data,
                file_options={"contentType": image.content_type or "application/octet-stream"},
            )

            if getattr(up_res, "error", None) or (isinstance(up_res, dict) and up_res.get("error")):
                raise HTTPException(500, f"upload error: {getattr(up_res,'error',None) or up_res.get('error')}")

            pub = sb.storage.from_("images").get_public_url(key)
            image_url = pub if isinstance(pub, str) else (pub.get("publicUrl") if isinstance(pub, dict) else None)

        ins = (
            sb.table("posts")
            .insert(
                {
                    "author": author,
                    "author_avatar": author_avatar,  # ✅ 表建議要有這欄位，沒有也可先刪掉這行
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
        return _row_to_post_with_comments(row)

    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /posts failed")
        raise HTTPException(500, "internal_error")

# ✅ 按讚/收回讚：必須登入，使用 Firebase uid 當唯一識別
# ⚠️ 這裡我沿用 likes.device_id 欄位來存 uid（不需要改 schema）
@app.post("/posts/{post_id}/like", response_model=PostOut)
def toggle_like(post_id: int, user=Depends(get_current_user)):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    uid = user.get("uid")
    if not uid:
        raise HTTPException(401, "Invalid token (missing uid)")

    try:
        # 取目前 post
        post = (
            sb.table("posts")
            .select("*")
            .eq("id", post_id)
            .single()
            .execute()
            .data
        )
        if not post:
            raise HTTPException(404, "Post not found")

        # 查 likes 是否已存在（同一個 uid）
        liked = (
            sb.table("likes")
            .select("*")
            .eq("post_id", post_id)
            .eq("device_id", uid)  # ✅ device_id 存 uid
            .maybe_single()
            .execute()
            .data
        )

        if liked:
            # 收回讚
            sb.table("likes").delete().eq("id", liked["id"]).execute()
            sb.table("posts").update(
                {"likes_count": max(0, (post.get("likes_count") or 0) - 1)}
            ).eq("id", post_id).execute()
        else:
            # 按讚
            sb.table("likes").insert({"post_id": post_id, "device_id": uid}).execute()
            sb.table("posts").update(
                {"likes_count": (post.get("likes_count") or 0) + 1}
            ).eq("id", post_id).execute()

        # 回傳更新後 post（含 comments）
        row = (
            sb.table("posts")
            .select("*")
            .eq("id", post_id)
            .single()
            .execute()
            .data
        )
        return _row_to_post_with_comments(row)

    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /posts/{post_id}/like failed")
        raise HTTPException(500, "internal_error")

# ✅ 留言必須登入，author / author_avatar 從 Firebase 取得（不收前端 author）
@app.post("/comments", response_model=CommentOut)
def add_comment(payload: CommentIn, user=Depends(get_current_user)):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")

    try:
        exists = (
            sb.table("posts")
            .select("id")
            .eq("id", payload.post_id)
            .maybe_single()
            .execute()
            .data
        )
        if not exists:
            raise HTTPException(404, "Post not found")

        author_info = _get_author_from_firebase(user)

        insert_payload = {
            "post_id": payload.post_id,
            "text": payload.text,
            "author": author_info["author"],
            "author_avatar": author_info["author_avatar"],  # ✅ 表建議要有這欄位，沒有也可先刪掉這行
        }

        resp = sb.table("comments").insert(insert_payload).execute()
        if not resp.data:
            raise HTTPException(500, "insert comments returned no data")

        return _row_to_comment_out(resp.data[0])

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
        .single()
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
