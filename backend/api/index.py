"""Vercel Serverless Function entry point for FastAPI"""
import sys
import os

_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root not in sys.path:
    sys.path.insert(0, _root)

# Make 'backend' importable when running from backend/ root
_backend_dir = os.path.join(_root, "backend")
if os.path.isdir(_backend_dir) and _backend_dir not in sys.path:
    sys.path.insert(0, _root)
elif not os.path.isdir(_backend_dir):
    # We ARE the backend root — create a synthetic 'backend' package
    import types
    _pkg = types.ModuleType("backend")
    _pkg.__path__ = [_root]
    sys.modules["backend"] = _pkg

from mangum import Mangum
from backend.main import app

handler = Mangum(app, lifespan="off")
