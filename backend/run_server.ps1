<#
Run the backend FastAPI server in a consistent way on Windows PowerShell.

What this script does:
- Creates a virtualenv at ./ .venv if it doesn't exist
- Upgrades pip/setuptools/wheel and installs requirements.txt inside the venv
- Sets PYTHONPATH to the backend folder so Python can import the `app` package
- Runs uvicorn through the venv python (avoids running Activate.ps1 which can be blocked by ExecutionPolicy)

Usage:
  Open PowerShell and run from the `backend` folder:
    .\run_server.ps1

If you prefer to run manually, see backend/README.md for equivalent commands.
#>

Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$venvDir = Join-Path $scriptDir ".venv"
$pythonExe = Join-Path $venvDir "Scripts\python.exe"

function Ensure-VenvAndDeps {
    if (-not (Test-Path $pythonExe)) {
        Write-Host "Creating virtual environment at: $venvDir"
        & python -m venv $venvDir
        if ($LASTEXITCODE -ne 0) { throw "Failed to create virtualenv" }
    }

    Write-Host "Upgrading pip, setuptools, wheel inside venv..."
    & $pythonExe -m pip install --upgrade pip setuptools wheel | Out-Null

    if (Test-Path (Join-Path $scriptDir 'requirements.txt')) {
        Write-Host "Installing requirements from requirements.txt..."
        & $pythonExe -m pip install -r (Join-Path $scriptDir 'requirements.txt')
    } else {
        Write-Host "No requirements.txt found in $scriptDir"
    }
}

try {
    Ensure-VenvAndDeps
} catch {
    Write-Error "Error preparing virtualenv and dependencies: $_"
    exit 1
}

# Ensure the backend folder is on PYTHONPATH so `import app` works
$env:PYTHONPATH = $scriptDir

Write-Host "Starting uvicorn (app.main:app) on http://127.0.0.1:8000"
& $pythonExe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
