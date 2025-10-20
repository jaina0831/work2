from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from supabase import create_client, Client
from os import getenv
import os, tempfile

# ----------------------
# App 基本設定
# ----------------------
app = FastAPI(
    title="FastAPI",
    version="0.1.0",
    root_path="/api",           # 對外走 /api/*
    docs_url="/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ----------------------
# Supabase 連線 & Storage
# ----------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

BUCKET = "images"  # 請在 Storage 建 public bucket: images

# /tmp 作為 fallback（若沒設 Supabase）
UPLOAD_DIR = os.path.join(tempfile.gettempdir(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
# 若你還有舊資料在 /api/static/xxx，保留這個 mount 當備援
app.mount("/api/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# ----------------------
# Pydantic 模型（回傳用）
# ----------------------
class Comment(BaseModel):
    id: int
    post_id: int
    author: str
    text: str
    created_at: datetime

class Post(BaseModel):
    id: int
    author: str
    title: str
    content: str
    image_url: Optional[str] = None
    likes: int
    created_at: datetime
    # 下方欄位你的前端有用，留著預設值即可
    comments: List[Comment] = Field(default_factory=list)
    type: Literal["shelter","cafe"] = "shelter"
    name: str = "untitled"
    lat: float = 0.0
    lng: float = 0.0
    addr: str = ""

# ----------------------
# 圖片上傳（Storage 優先，退回 /tmp）
# ----------------------
def upload_image(image: UploadFile) -> Optional[str]:
    if not image:
        return None
    data = image.file.read()
    filename = f"{int(datetime.utcnow().timestamp())}_{image.filename}"

    # 走 Supabase Storage
    if supabase is not None:
        try:
            supabase.storage.from_(BUCKET).upload(
                filename,
                data,
                {"contentType": image.content_type or "application/octet-stream", "upsert": True}
            )
            return supabase.storage.from_(BUCKET).get_public_url(filename)
        except Exception as e:
            print("⚠️ Supabase upload failed:", e)

    # 退回 /tmp（不持久）
    path = os.path.join(UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        f.write(data)
    return f"/api/static/{filename}"

# ----------------------
# API：Posts（走資料庫）
# ----------------------
@app.get("/posts", response_model=List[Post])
def list_posts():
    rows = supabase.table("posts").select("*").order("created_at", desc=True).execute().data
    # 合併 comments（前端需要）
    if rows:
        ids = [r["id"] for r in rows]
        cmts = supabase.table("comments").select("*").in_("post_id", ids).order("created_at").execute().data
        by_post = {}
        for c in cmts or []:
            by_post.setdefault(c["post_id"], []).append(c)
        for r in rows:
            r["comments"] = by_post.get(r["id"], [])
            # 填充你前端額外欄位
            r.setdefault("type", "shelter")
            r.setdefault("name", "untitled")
            r.setdefault("lat", 0.0)
            r.setdefault("lng", 0.0)
            r.setdefault("addr", "")
    return rows or []

@app.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: int):
    rows = supabase.table("posts").select("*").eq("id", post_id).limit(1).execute().data
    if not rows:
        raise HTTPException(404, "Post not found")
    post = rows[0]
    cmts = supabase.table("comments").select("*").eq("post_id", post_id).order("created_at").execute().data
    post["comments"] = cmts or []
    post.setdefault("type", "shelter")
    post.setdefault("name", "untitled")
    post.setdefault("lat", 0.0)
    post.setdefault("lng", 0.0)
    post.setdefault("addr", "")
    return post

@app.post("/posts", response_model=Post)
def create_post(
    author: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None)
):
    image_url = upload_image(image) if image else None
    row = supabase.table("posts").insert({
        "author": author,
        "title": title,
        "content": content,
        "image_url": image_url
    }).select("*").execute().data[0]
    # 新增回傳要帶 comments 空陣列，符合前端型態
    row["comments"] = []
    row.setdefault("type", "shelter")
    row.setdefault("name", "untitled")
    row.setdefault("lat", 0.0)
    row.setdefault("lng", 0.0)
    row.setdefault("addr", "")
    return row

@app.post("/posts/{post_id}/like", response_model=Post)
def like_post(post_id: int):
    rows = supabase.table("posts").select("likes").eq("id", post_id).limit(1).execute().data
    if not rows:
        raise HTTPException(404, "Post not found")
    likes = int(rows[0]["likes"] or 0) + 1
    supabase.table("posts").update({"likes": likes}).eq("id", post_id).execute()
    # 回傳完整的 post
    return get_post(post_id)

@app.delete("/posts/{post_id}")
def delete_post(post_id: int):
    # 先取出 image_url 以便刪除 Storage 檔案（可選）
    rows = supabase.table("posts").select("image_url").eq("id", post_id).limit(1).execute().data
    if not rows:
        raise HTTPException(404, "Post not found")
    image_url = rows[0]["image_url"]

    # 刪 Storage 檔案（若是 supabase URL）
    if image_url and SUPABASE_URL and image_url.startswith(SUPABASE_URL):
        try:
            name = image_url.rsplit("/", 1)[-1]
            supabase.storage.from_(BUCKET).remove([name])
        except Exception:
            pass
    # 刪 /tmp 檔案（fallback）
    if image_url and image_url.startswith("/api/static/"):
        filename = image_url.replace("/api/static/", "")
        path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

    # 刪 DB 資料（on delete cascade 會順帶刪留言）
    supabase.table("posts").delete().eq("id", post_id).execute()
    return {"ok": True}

# ----------------------
# API：Comments（走資料庫）
# ----------------------
class CommentIn(BaseModel):
    post_id: int
    author: str
    text: str

@app.post("/comments", response_model=Comment)
def add_comment(payload: CommentIn):
    # 確認 post 存在
    exists = supabase.table("posts").select("id").eq("id", payload.post_id).limit(1).execute().data
    if not exists:
        raise HTTPException(404, "Post not found")
    row = supabase.table("comments").insert({
        "post_id": payload.post_id,
        "author": payload.author,
        "text": payload.text
    }).select("*").execute().data[0]
    return row

def require_db():
    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase not configured. Set SUPABASE_URL & SUPABASE_ANON_KEY on Vercel and redeploy."
        )

def require_db():
    if supabase is None:
        raise HTTPException(
            500,
            "Supabase not configured. Set SUPABASE_URL & SUPABASE_ANON_KEY on Vercel and redeploy."
        )

@app.get("/api/health")
def health_check():
    return {
        "env_loaded": bool(getenv("SUPABASE_URL") and getenv("SUPABASE_ANON_KEY")),
        "using": "supabase" if supabase else "none",
    }
