import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

try:
    from a2wsgi import ASGIMiddleware
    from app.main import app as fastapi_app
    application = ASGIMiddleware(fastapi_app)
except Exception as e:
    def application(environ, start_response):
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [f"Error: {str(e)}".encode()]