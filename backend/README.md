# Backend - Run instructions

Quick steps to run the FastAPI backend on Windows (PowerShell):

1) From the `backend` folder, create and activate a virtual environment (optional but recommended):

```powershell
# Create venv
python -m venv .venv

# Activate (PowerShell)
.\.venv\Scripts\Activate.ps1

# If activation is blocked by ExecutionPolicy, run once as admin or for your user:
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

2) Install dependencies:

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade pip setuptools wheel
.\.venv\Scripts\python.exe -m pip install -r .\requirements.txt
```

3) Start the server (two options):

- Recommended: use the helper script (avoids activation policy problems):

```powershell
# From backend folder
.\run_server.ps1
```

- Or run uvicorn directly (ensure PYTHONPATH points to the backend folder so `import app` works):

```powershell
$env:PYTHONPATH = "$(Resolve-Path .).Path"
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000/docs to view the automatic API docs.

Troubleshooting
- "ModuleNotFoundError: No module named 'app'": make sure you're running from the `backend` folder and that `PYTHONPATH` includes it (see run_server.ps1 or the direct command above).
- Activation blocked by PowerShell ExecutionPolicy: use the run_server.ps1 script (it calls the venv python directly), or set ExecutionPolicy for your user.
- If a package fails to build, install Visual C++ Build Tools or move the repo to an ASCII-only path if you see encoding errors from OneDrive paths.
