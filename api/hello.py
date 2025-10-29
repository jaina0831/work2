# api/hello.py  —— 極小測試，不依賴 FastAPI
from http import HTTPStatus

def handler(request):
    body = b'OK: /api/hello'
    headers = [(b'content-type', b'text/plain')]
    return HTTPStatus.OK, headers, body
