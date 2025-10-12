from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List
from urllib.parse import urlparse
from datetime import datetime
import os, shutil

app = FastAPI()

# 允許前端跨網域請求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === 模擬資料 ===
posts: List["Post"] = []
comments: List["Comment"] = []
post_id_counter = 1
comment_id_counter = 1

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# === 資料模型 ===
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
    comments: List[Comment] = []

# === API ===

# 取得所有貼文（新到舊排序）
@app.get("/posts", response_model=List[Post])
def list_posts():
    return sorted(posts, key=lambda p: p.created_at, reverse=True)

# 取得單篇貼文
@app.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: int):
    for p in posts:
        if p.id == post_id:
            return p
    raise RuntimeError("Post not found")


# 新增貼文
@app.post("/posts", response_model=Post)
def create_post(
    author: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = None

):
    global post_id_counter
    image_url = None
    if image:
        path = os.path.join(UPLOAD_DIR, image.filename)
        with open(path, "wb") as f:
            shutil.copyfileobj(image.file, f)
        image_url = f"/static/{image.filename}"

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

# 按讚
@app.post("/posts/{post_id}/like", response_model=Post)
def like_post(post_id: int):
    for p in posts:
        if p.id == post_id:
            p.likes += 1
            return p
    raise RuntimeError("Post not found")

# 新增留言
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
    # 找到要刪的貼文
    target = None
    for p in posts:
        if p.id == post_id:
            target = p
            break
    if not target:
        return {"ok": False, "error": "Post not found"}

    # 刪除圖片檔（若存在）
    if target.image_url and target.image_url.startswith("/static/"):
        filename = target.image_url.replace("/static/", "")
        path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

    # 刪除該貼文與其留言
    posts = [p for p in posts if p.id != post_id]
    comments = [c for c in comments if c.post_id != post_id]
    return {"ok": True}