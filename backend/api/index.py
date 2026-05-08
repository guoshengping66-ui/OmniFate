"""Vercel Serverless Function entry point for FastAPI"""
from mangum import Mangum
from main import app

handler = Mangum(app, lifespan="off")
