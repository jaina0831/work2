from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from uuid import uuid4
import os

from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")

sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # 允許你所有 Vercel preview 子網域（每次部署都會變）
    allow_origin_regex=r"https://.*\.vercel\.app$",
    # 另外把本機與後端自己的網域也加進去
    allow_origins=[
        "http://localhost:5173",
        "https://work2-enfq.onrender.com",
    ],
    allow_credentials=True,
    # 預檢會用到 OPTIONS，這裡要允許
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    # 你有自訂 header：X-Client-Id，這裡放通
    allow_headers=["*"],
    # 可選：要不要讓瀏覽器能讀部分回應標頭
    expose_headers=["*"],
    max_age=86400,
)

# --------- schemas ----------
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

# --------- helpers ----------
def _row_to_post_with_comments(row) -> PostOut:
    # 取 comments
    comments = (
        sb.table("comments")
        .select("*")
        .eq("post_id", row["id"])
        .order("created_at", desc=True)
        .execute()
    ).data
    return PostOut(
        id=row["id"],
        author=row["author"],
        title=row["title"],
        content=row["content"],
        image_url=row.get("image_url"),
        likes_count=row["likes_count"],
        created_at=row["created_at"],
        comments=comments or [],
    )

# --------- routes ----------
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/posts", response_model=List[PostOut])
def list_posts():
    rows = (
        sb.table("posts")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    ).data
    return [_row_to_post_with_comments(r) for r in (rows or [])]

@app.get("/posts/{post_id}", response_model=PostOut)
def get_post(post_id: int):
    row = sb.table("posts").select("*").eq("id", post_id).single().execute().data
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
    image_url = None
    if image:
        ext = os.path.splitext(image.filename)[1].lower() or ".jpg"
        key = f"{uuid4().hex}{ext}"
        data = await image.read()
        # 上傳到 bucket 'images'
        up = sb.storage.from_("images").upload(key, data, file_options={"contentType": image.content_type})
        if up is None or getattr(up, "error", None):
            raise HTTPException(500, f"upload error: {getattr(up,'error',None)}")
        # 取得 public URL
        image_url = sb.storage.from_("images").get_public_url(key)

    inserted = (
        sb.table("posts").insert({
            "author": author, "title": title, "content": content,
            "image_url": image_url, "likes_count": 0
        }).select("*").single().execute()
    ).data
    return _row_to_post_with_comments(inserted)

@app.post("/posts/{post_id}/like", response_model=PostOut)
def toggle_like(post_id: int, x_client_id: Optional[str] = Header(None)):
    if not x_client_id:
        raise HTTPException(400, "Missing X-Client-Id")

    # 是否已按過？
    liked = (
        sb.table("likes")
        .select("*")
        .eq("post_id", post_id)
        .eq("device_id", x_client_id)
        .maybe_single()
        .execute()
    ).data

    if liked:
        # 取消喜歡
        sb.table("likes").delete().eq("id", liked["id"]).execute()
        sb.table("posts").update({"likes_count": sb.rpc("coalesce", {"value": "likes_count-1"})}).eq("id", post_id).execute()
        # 上面那行用 rpc 不直觀，改為安全做法：讀值-1
        post = sb.table("posts").select("*").eq("id", post_id).single().execute().data
        sb.table("posts").update({"likes_count": max(0, (post["likes_count"] or 0) - 1)}).eq("id", post_id).execute()
    else:
        # 新增喜歡
        sb.table("likes").insert({"post_id": post_id, "device_id": x_client_id}).execute()
        post = sb.table("posts").select("*").eq("id", post_id).single().execute().data
        sb.table("posts").update({"likes_count": (post["likes_count"] or 0) + 1}).eq("id", post_id).execute()

    row = sb.table("posts").select("*").eq("id", post_id).single().execute().data
    return _row_to_post_with_comments(row)

class CommentIn(BaseModel):
    post_id: int
    author: str
    text: str

@app.post("/comments", response_model=CommentOut)
def add_comment(payload: CommentIn):
    # 確認 post 存在
    exists = sb.table("posts").select("id").eq("id", payload.post_id).maybe_single().execute().data
    if not exists:
        raise HTTPException(404, "Post not found")
    inserted = (
        sb.table("comments").insert(payload.__dict__).select("*").single().execute()
    ).data
    return inserted
