from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
import os, logging

# ---- logging ----
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

app = FastAPI()

# ---- Supabase init (安全防呆版) ----
from supabase import create_client, Client
sb: Optional[Client] = None
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
try:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        logger.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    else:
        sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase client initialized")
except Exception as e:
    logger.exception("Supabase client init failed")
    sb = None

# ---- schemas ----
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
    likes_count: int
    created_at: str
    comments: List[CommentOut] = []

# ---- helpers ----
def _row_to_post_with_comments(row) -> PostOut:
    if sb is None:
        raise HTTPException(500, "Supabase not configured")
    # 讀 comments（可空）
    res = sb.table("comments").select("*").eq("post_id", row["id"]).order("created_at", desc=True).execute()
    comments = (res.data or [])
    return PostOut(
        id=row["id"],
        author=row["author"],
        title=row["title"],
        content=row["content"],
        image_url=row.get("image_url"),
        likes_count=row.get("likes_count", 0) or 0,
        created_at=row["created_at"],
        comments=comments
    )

# ---- routes ----
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/health/supabase")
def health_supabase():
    return {"sb": bool(sb)}

@app.get("/posts", response_model=List[PostOut])
def list_posts():
    if sb is None:
        raise HTTPException(500, "Supabase not configured")
    rows = sb.table("posts").select("*").order("created_at", desc=True).execute().data or []
    return [_row_to_post_with_comments(r) for r in rows]

@app.get("/posts/{post_id}", response_model=PostOut)
def get_post(post_id: int):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")
    row = sb.table("posts").select("*").eq("id", post_id).maybe_single().execute().data
    if not row:
        raise HTTPException(404, "Post not found")
    return _row_to_post_with_comments(row)

@app.post("/posts", response_model=PostOut)
async def create_post(
    author: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(None)
):
    if sb is None:
        logger.error("POST /posts with sb=None")
        raise HTTPException(500, "Supabase not configured")
    try:
        image_url = None
        if image:
            # ---- Storage 上傳（bucket: images）----
            ext = os.path.splitext(image.filename)[1].lower() or ".jpg"
            key = f"{uuid4().hex}{ext}"
            data = await image.read()
            ct = image.content_type or "application/octet-stream"
            up = sb.storage.from_("images").upload(key, data, file_options={"contentType": ct})
            # supabase-py v2 可能回傳 dict-like
            if not up or (isinstance(up, dict) and up.get("error")):
                logger.error("upload failed: %s", up)
                raise HTTPException(500, "Image upload failed")
            pub = sb.storage.from_("images").get_public_url(key)
            image_url = pub if isinstance(pub, str) else getattr(pub, "public_url", None) or pub.get("publicUrl")

        # ---- 插入 posts（確保這些欄位存在）----
        ins = sb.table("posts").insert({
            "author": author,
            "title": title,
            "content": content,
            "image_url": image_url,
            "likes_count": 0
            # "created_at" 交給資料庫 default now()
        }).select("*").single().execute()
        row = ins.data
        return _row_to_post_with_comments(row)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("POST /posts failed")
        raise HTTPException(500, "internal_error")

@app.post("/posts/{post_id}/like", response_model=PostOut)
def toggle_like(post_id: int, x_client_id: Optional[str] = Header(None)):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")
    if not x_client_id:
        raise HTTPException(400, "Missing X-Client-Id")
    try:
        liked = sb.table("likes").select("*").eq("post_id", post_id).eq("device_id", x_client_id).maybe_single().execute().data
        post = sb.table("posts").select("*").eq("id", post_id).single().execute().data
        if not post:
            raise HTTPException(404, "Post not found")

        if liked:
            sb.table("likes").delete().eq("id", liked["id"]).execute()
            sb.table("posts").update({"likes_count": max(0, (post.get("likes_count") or 0) - 1)}).eq("id", post_id).execute()
        else:
            sb.table("likes").insert({"post_id": post_id, "device_id": x_client_id}).execute()
            sb.table("posts").update({"likes_count": (post.get("likes_count") or 0) + 1}).eq("id", post_id).execute()

        row = sb.table("posts").select("*").eq("id", post_id).single().execute().data
        return _row_to_post_with_comments(row)
    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /posts/{post_id}/like failed")
        raise HTTPException(500, "internal_error")

class CommentIn(BaseModel):
    post_id: int
    author: str
    text: str

@app.post("/comments", response_model=CommentOut)
def add_comment(payload: CommentIn):
    if sb is None:
        raise HTTPException(500, "Supabase not configured")
    try:
        exists = sb.table("posts").select("id").eq("id", payload.post_id).maybe_single().execute().data
        if not exists:
            raise HTTPException(404, "Post not found")
        ins = sb.table("comments").insert(payload.__dict__).select("*").single().execute()
        return ins.data
    except HTTPException:
        raise
    except Exception:
        logger.exception("POST /comments failed")
        raise HTTPException(500, "internal_error")
