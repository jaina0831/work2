from fastapi import FastAPI, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, File
from typing import Optional, List, Literal
from datetime import datetime
from supabase import create_client, Client
import os, shutil

app = FastAPI(
    title="FastAPI",
    version="0.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
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

    if image:
        data = image.file.read()
        filename = f"{post_id_counter}_{image.filename}"
        supabase.storage.from_(BUCKET).upload(filename, data, {"contentType": image.content_type})
        image_url = supabase.storage.from_(BUCKET).get_public_url(filename)

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
