from fastapi import FastAPI, UploadFile, Form, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional, List, Dict, Set
from datetime import datetime
import os, shutil

app = FastAPI(title="cats-api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# Vercel 可寫入路徑
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# ------- Models -------
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
    likes: int = 0
    created_at: datetime
    comments: List[Comment] = []
    # 你前端用到的地圖欄位先保留預設
    type: str = "shelter"
    name: str = "untitled"
    lat: float = 0.0
    lng: float = 0.0
    addr: str = ""

# ------- In-Memory State -------
posts: List[Post] = []
comments: List[Comment] = []
post_id_counter = 1
comment_id_counter = 1

# 每篇貼文的已點讚 set：{post_id: {client_id,...}}
liked_by: Dict[int, Set[str]] = {}

# ------- Routes -------
@app.get("/health")
def health():
    return {"ok": True}

@app.get("/posts", response_model=List[Post])
def list_posts():
    return sorted(posts, key=lambda p: p.created_at, reverse=True)

@app.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: int):
    p = next((x for x in posts if x.id == post_id), None)
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")
    return p

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
        # 儲存到 /tmp，並透過 /static/ 提供
        safe_name = image.filename or f"img_{post_id_counter}.bin"
        file_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(file_path, "wb") as f:
            shutil.copyfileobj(image.file, f)
        image_url = f"/static/{safe_name}"

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
def toggle_like(post_id: int, x_client_id: Optional[str] = Header(None)):
    """同一台電腦（以 X-Client-Id 辨識）只能按一次，再按會收回"""
    p = next((x for x in posts if x.id == post_id), None)
    if not p:
        raise HTTPException(status_code=404, detail="Post not found")

    client = x_client_id or "anon"
    s = liked_by.setdefault(post_id, set())
    if client in s:
        s.remove(client)
        p.likes = max(0, p.likes - 1)
    else:
        s.add(client)
        p.likes += 1
    return p

class CommentIn(BaseModel):
    post_id: int
    author: str
    text: str

@app.post("/comments", response_model=Comment)
def add_comment(payload: CommentIn):
    global comment_id_counter
    p = next((x for x in posts if x.id == payload.post_id), None)
    if not p:
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
    p.comments.append(c)
    return c

@app.delete("/posts/{post_id}")
def delete_post(post_id: int):
    global posts, comments
    p = next((x for x in posts if x.id == post_id), None)
    if not p:
        return {"ok": False, "error": "Post not found"}

    # 刪掉已上傳圖片
    if p.image_url and p.image_url.startswith("/static/"):
        fn = p.image_url.replace("/static/", "")
        fp = os.path.join(UPLOAD_DIR, fn)
        if os.path.exists(fp):
            try:
                os.remove(fp)
            except:
                pass

    posts = [x for x in posts if x.id != post_id]
    comments = [c for c in comments if c.post_id != post_id]
    liked_by.pop(post_id, None)

    return {"ok": True}

