#!/usr/bin/env python3.9
"""Simple backend launcher with auto-restart.

PM2 kills the uvicorn process before it finishes importing heavy modules
(pydantic, sqlalchemy, langchain, etc.) on Python 3.9. This wrapper runs
as a PM2 "long-running" process and manages uvicorn as a subprocess,
handling restarts internally.
"""
import subprocess, sys, time, signal, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))
os.environ["PYTHONUNBUFFERED"] = "1"

CMD = [sys.executable, "-m", "uvicorn", "backend.main:app",
       "--host", "0.0.0.0", "--port", "8002", "--log-level", "info"]

running = True
proc = None

def shutdown(sig, frame):
    global running, proc
    running = False
    # Kill the child uvicorn process to release the port
    if proc and proc.poll() is None:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except Exception:
            proc.kill()

signal.signal(signal.SIGTERM, shutdown)
signal.signal(signal.SIGINT, shutdown)

while running:
    print(f"[LAUNCHER] Starting backend at {time.strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    try:
        proc = subprocess.Popen(CMD)
        proc.wait()
        rc = proc.returncode
        proc = None
        if not running:
            break
        print(f"[LAUNCHER] Backend exited with code {rc}, restarting in 3s...", flush=True)
        time.sleep(3)
    except Exception as e:
        print(f"[LAUNCHER] Error: {e}", flush=True)
        time.sleep(5)

print("[LAUNCHER] Shutdown.", flush=True)
