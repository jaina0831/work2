# api/hello.py
def handler(request):
    # 一定回傳 (status_code:int, headers:list[tuple[bytes,bytes]], body:bytes)
    return 200, [(b"content-type", b"text/plain")], b"OK: /api/hello"
