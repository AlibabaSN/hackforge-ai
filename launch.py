#!/usr/bin/env python3
"""
HackForge AI — Complete Executable Prototype Launcher
Launches FastAPI Backend (Port 8000) and Next.js Frontend (Port 3000) with automatic browser opening.
"""

import os
import sys
import time
import subprocess
import webbrowser

BANNER = """
====================================================================
  _   _    _    ____ _  _______ ___  ____   ____ _____   _    ___ 
 | | | |  / \  / ___| |/ /  ___/ _ \|  _ \ / ___| ____| / \  |_ _|
 | |_| | / _ \| |   | ' /| |_ | | | | |_) | |  _|  _|  / _ \  | | 
 |  _  |/ ___ \ |___| . \|  _|| |_| |  _ <| |_| | |___/ ___ \ | | 
 |_| |_/_/   \_\____|_|\_\_|   \___/|_| \_\\____|_____/_/   \_\___|

           MULTI-MODEL AGENT MESH & 16-AGENT DOMAIN ROSTER
====================================================================
"""

def main():
    print(BANNER)
    root_dir = os.path.abspath(os.path.dirname(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    python_exe = os.path.join(backend_dir, ".venv", "Scripts", "python.exe")
    if not os.path.exists(python_exe):
        python_exe = sys.executable

    print("[1/4] Seeding Database with Demo Projects & Models...")
    try:
        subprocess.run([python_exe, "-m", "app.seed"], cwd=backend_dir, check=True)
        print("      ✓ Database seeded successfully!")
    except Exception as e:
        print(f"      ! Database seed note: {e}")

    print("\n[2/4] Starting FastAPI Backend Engine (http://localhost:8000)...")
    backend_cmd = [
        python_exe, "-m", "uvicorn", "app.main:app",
        "--host", "127.0.0.1", "--port", "8000", "--reload"
    ]
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)
    print("      ✓ FastAPI Backend server process launched.")

    print("\n[3/4] Starting Next.js Web Dashboard (http://localhost:3000)...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    built = os.path.exists(os.path.join(frontend_dir, ".next"))
    frontend_cmd = [npm_cmd, "run", "start" if built else "dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir)
    print(f"      ✓ Next.js Frontend server process launched ({'production start' if built else 'dev mode'}).")

    print("\n[4/4] Opening HackForge AI Dashboard in Browser...")
    time.sleep(3)
    webbrowser.open("http://localhost:3000")

    print("\n====================================================================")
    print("  🚀 HACKFORGE AI IS LIVE AND RUNNING!")
    print("--------------------------------------------------------------------")
    print("  • Main App Workspace Dashboard:  http://localhost:3000/")
    print("  • Specialized Agent Roster (16): http://localhost:3000/agents")
    print("  • Model Mesh Control Center:     http://localhost:3000/models")
    print("  • Model Performance Matrix:      http://localhost:3000/models/compare")
    print("  • OpenAPI Interactive Docs:      http://localhost:8000/docs")
    print("====================================================================")
    print("Press Ctrl+C to stop all servers.\n")

    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down HackForge AI servers gracefully...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Servers stopped. Goodbye!")

if __name__ == "__main__":
    main()
