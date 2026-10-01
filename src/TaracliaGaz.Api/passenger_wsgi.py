import os
import sys

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

_app = None


def application(environ, start_response):
    global _app

    if _app is None:
        from a2wsgi import ASGIMiddleware
        from app.main import app as fastapi_app

        _app = ASGIMiddleware(fastapi_app)

    return _app(environ, start_response)