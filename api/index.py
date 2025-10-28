# api/index.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/__ping")
def ping():
    return {"pong": True}
