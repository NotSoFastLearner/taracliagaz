import logging
import os
import sys
import threading

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

_app = None
_init_lock = threading.Lock()


def application(environ, start_response):
    global _app

    if _app is None:
        with _init_lock:
            if _app is None:
                try:
                    from a2wsgi import ASGIMiddleware
                    from app.main import app as fastapi_app

                    _app = ASGIMiddleware(fastapi_app)
                except Exception:
                    logging.getLogger("passenger_wsgi").exception("WSGI startup failed")
                    raise

    return _app(environ, start_response)