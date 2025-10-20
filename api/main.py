from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from supabase import create_client, Client
import os, shutil


app = FastAPI(
    title="FastAPI",
    version="0.1.0",
    root_path="/api",          # ← 關鍵：讓 /api/* 路由到 /posts 這些路由
    docs_url="/docs", 
    openapi_url="/api/openapi.json",
    redoc_url=None
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ✅ 用 getenv，避免環境變數缺少時直接崩潰
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client | None = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
BUCKET = "images"

# in-memory 資料
posts: List["Post"] = []
comments: List["Comment"] = []
post_id_counter = 1
comment_id_counter = 1

# ✅ Vercel 可寫路徑：/tmp
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

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

@app.get("/posts", response_model=List[Post])
def list_posts():
    return sorted(posts, key=lambda p: p.created_at, reverse=True)

@app.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: int):
    for p in posts:
        if p.id == post_id:
            return p
    raise RuntimeError("Post not found")

@app.post("/posts", response_model=Post)
def create_post(
    author: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    image: UploadFile | None = File(None)
):
    global post_id_counter

    image_url = None

    try:
        if image:
            data = image.file.read()
            filename = f"{post_id_counter}_{int(datetime.utcnow().timestamp())}_{image.filename}"

            # 優先走 Supabase
            if supabase is not None:
                try:
                    supabase.storage.from_(BUCKET).upload(
                        filename,
                        data,
                        {"contentType": image.content_type, "upsert": True}
                    )
                    image_url = supabase.storage.from_(BUCKET).get_public_url(filename)
                except Exception as e:
                    print("⚠️ Supabase upload failed:", e)
                    image_url = None

            # 如果 Supabase 沒設成功，就存 /tmp/uploads
            if image_url is None:
                os.makedirs(UPLOAD_DIR, exist_ok=True)
                path = os.path.join(UPLOAD_DIR, filename)
                with open(path, "wb") as f:
                    f.write(data)
                image_url = f"/api/static/{filename}"

    except Exception as e:
        print("❌ Image upload error:", e)
        image_url = None

    new_post = Post(
        id=post_id_counter,
        author=author,
        title=title,
        content=content,
        image_url=image_url,
        likes=0,
        created_at=datetime.utcnow(),
        comments=[]
    )

    post_id_counter += 1
    posts.append(new_post)
    return new_post


@app.post("/posts/{post_id}/like", response_model=Post)
def like_post(post_id: int):
    for p in posts:
        if p.id == post_id:
            p.likes += 1
            return p
    raise RuntimeError("Post not found")

@app.post("/comments", response_model=Comment)
def add_comment(payload: CommentIn):
    global comment_id_counter
    c = Comment(
        id=comment_id_counter, post_id=payload.post_id,
        author=payload.author, text=payload.text, created_at=datetime.utcnow()
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

    # 跟建立時一致：/api/static/
    if target.image_url and target.image_url.startswith("/api/static/"):
        filename = target.image_url.replace("/api/static/", "")
        path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

    posts = [p for p in posts if p.id != post_id]
    comments = [c for c in comments if c.post_id != post_id]
    return {"ok": True}