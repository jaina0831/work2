from fastapi import FastAPI, UploadFile, Form, File, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.routing import APIRoute
from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict, Set
from datetime import datetime
import os, shutil

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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vercel 只能寫 /tmp
UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=UPLOAD_DIR), name="static")

# ---- Models ----
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
    # 你原本帶的欄位也保留
    type: Literal["shelter", "cafe"] = "shelter"
    name: str = "untitled"
    lat: float = 0.0
    lng: float = 0.0
    addr: str = ""

# ---- In-memory store（serverless 會清空，但符合你目前需求）----
posts: List[Post] = []
comments: List[Comment] = []
post_id_counter = 1
comment_id_counter = 1
like_map: Dict[int, Set[str]] = {}
# 同裝置只能按一次；再按一次 = 收回
# 以 X-Client-Id 當 key：post_id -> set(client_ids)


# ---- Health ----
@app.get("/health")
def health():
    return {"ok": True, "time": datetime.utcnow().isoformat()}

# ---- List posts ----
@app.get("/posts", response_model=List[Post])
def list_posts():
    # 新到舊
    return sorted(posts, key=lambda p: p.created_at, reverse=True)

# ---- Get one ----
@app.get("/posts/{post_id}", response_model=Post)
def get_post(post_id: int):
    target = next((p for p in posts if p.id == post_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Post not found")
    return target

# ---- Create ----
@app.post("/posts", response_model=Post)
def create_post(
    author: str = Form(...),
    title: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    global post_id_counter
    image_url = None
    if image:
        # 存到 /tmp/uploads，並透過 /static 提供
        safe_name = image.filename.replace("/", "_").replace("\\", "_")
        path = os.path.join(UPLOAD_DIR, safe_name)
        with open(path, "wb") as f:
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

# ---- Like toggle（同裝置可收回）----
@app.post("/posts/{post_id}/like", response_model=Post)
def like_post(
    post_id: int,
    x_client_id: str = Header(None, convert_underscores=False),
):
    if not x_client_id:
        raise HTTPException(status_code=400, detail="missing X-Client-Id header")

    target = next((p for p in posts if p.id == post_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Post not found")

    liked = like_map.setdefault(post_id, set())
    if x_client_id in liked:
        # 收回
        liked.remove(x_client_id)
        if target.likes > 0:
            target.likes -= 1
    else:
        # 第一次按
        liked.add(x_client_id)
        target.likes += 1

    return target

# ---- Comment ----
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

# ---- Delete ----
@app.delete("/posts/{post_id}")
def delete_post(post_id: int):
    global posts, comments
    target = next((p for p in posts if p.id == post_id), None)
    if not target:
        return {"ok": False, "error": "Post not found"}

    # 刪圖片（若存在）
    if target.image_url and target.image_url.startswith("/static/"):
        filename = target.image_url.replace("/static/", "")
        path = os.path.join(UPLOAD_DIR, filename)
        if os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

    # 清單資料
    posts = [p for p in posts if p.id != post_id]
    comments = [c for c in comments if c.post_id != post_id]
    like_map.pop(post_id, None)

    return {"ok": True}

    @app.get("/")
def root_ok():
    return {"ok": True}

@app.get("/__routes")
def list_routes():
    return sorted([r.path for r in app.router.routes])