# api/main.py
from fastapi import FastAPI, UploadFile, Form, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Set, Dict
from datetime import datetime
from supabase import create_client, Client
from uuid import uuid4
import os

app = FastAPI(
    title="FastAPI",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ── Supabase ─────────────────────────────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
BUCKET = "images"  # 請在 Supabase Storage 建立公開 bucket: images

# ── in-memory data（Serverless 會重置，僅示範） ───────────
posts: List["Post"] = []
comments: List["Comment"] = []
post_id_counter = 1
comment_id_counter = 1

# 限制同裝置只能按一次：post_id -> set(client_ids)
like_map: Dict[int, Set[str]] = {}

# Vercel 可寫路徑（如果日後要存暫存檔）
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# ── Schemas ─────────────────────────────────────────────
class Comment(BaseModel):
    id: int
    post_id: int
    author: str
    text: str
    created_at: datetime

class CommentIn(BaseModel):
    post_id: int
    author: str
    text: str

class Post(BaseModel):
    id: int
    author: str
    title: str
    content: str
    image_url: Optional[str] = None
    likes: int = 0
    created_at: datetime
    comments: List[Comment] = Field(default_factory=list)
    type: Literal["shelter","cafe"] = "shelter"
    name: str = "untitled"
    lat: float = 0.0
    lng: float = 0.0
    addr: str = ""

# ── APIs ────────────────────────────────────────────────
@app.get("/posts", response_model=List[Post])
def list_posts():
    return sorted(posts, key=lambda p: p.created_at, reverse=True)

@app.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: int):
    for p in posts:
        if p.id == post_id:
            return p
    raise HTTPException(status_code=404, detail="Post not found")

@app.post("/posts", response_model=Post)
def create_post(
    author: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    global post_id_counter

    image_url = None
    if image is not None:
        try:
            data = image.file.read()
            # 絕對不撞名：時間戳 + uuid + 原檔名；並允許 upsert 避免 409
            filename = f"{int(datetime.utcnow().timestamp())}_{uuid4().hex}_{image.filename}"
            supabase.storage.from_(BUCKET).upload(
                filename,
                data,
                {
                    "contentType": image.content_type or "application/octet-stream",
                    "upsert": True,
                },
            )
            image_url = supabase.storage.from_(BUCKET).get_public_url(filename)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"upload_image_failed: {e}")

    new_post = Post(
        id=post_id_counter,
        author=author,
        title=title,
        content=content,
        image_url=image_url,
        likes=0,
        created_at=datetime.utcnow(),
        comments=[],
    )
    post_id_counter += 1
    posts.append(new_post)
    return new_post

@app.post("/posts/{post_id}/like", response_model=Post)
def like_post(post_id: int, x_client_id: str = Header(None, convert_underscores=False)):
    """
    用前端送來的 'X-Client-Id' 限制同裝置只能按一次。
    """
    if not x_client_id:
        raise HTTPException(status_code=400, detail="missing X-Client-Id header")

    target = next((p for p in posts if p.id == post_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Post not found")

    liked = like_map.setdefault(post_id, set())
    if x_client_id in liked:
        return target  # 已按過，直接回現況

    liked.add(x_client_id)
    target.likes += 1
    return target

@app.post("/comments", response_model=Comment)
def add_comment(payload: CommentIn):
    global comment_id_counter
    if not any(p.id == payload.post_id for p in posts):
        raise HTTPException(status_code=404, detail="Post not found")

    c = Comment(
        id=comment_id_counter,
        post_id=payload.post_id,
        author=payload.author,
        text=payload.text,
        created_at=datetime.utcnow(),
    )
    comment_id_counter += 1
    comments.append(c)
    for p in posts:
        if p.id == payload.post_id:
            p.comments.append(c)
            break
    return c

@app.delete("/posts/{post_id}")
def delete_post(post_id: int):
    global posts, comments
    target = next((p for p in posts if p.id == post_id), None)
    if not target:
        return {"ok": False, "error": "Post not found"}
    posts = [p for p in posts if p.id != post_id]
    comments = [c for c in comments if c.post_id != post_id]
    like_map.pop(post_id, None)
    return {"ok": True}

@app.get("/places")
def list_places():
    # 你若日後要塞資料再改；先回空陣列讓前端不報錯
    return []
