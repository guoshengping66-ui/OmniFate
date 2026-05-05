$Host.UI.RawUI.WindowTitle = "MingPan ZhiJing - Starting"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition

function Info($msg)   { Write-Host "  > $msg" -ForegroundColor Cyan }
function OK($msg)     { Write-Host "  OK $msg" -ForegroundColor Green }
function Warn($msg)   { Write-Host "  WARN $msg" -ForegroundColor Yellow }
function Err($msg)    { Write-Host "  ERR $msg" -ForegroundColor Red }
function Banner($msg) {
    Write-Host ""
    Write-Host ("=" * 55) -ForegroundColor DarkGray
    Write-Host "  $msg" -ForegroundColor Magenta
    Write-Host ("=" * 55) -ForegroundColor DarkGray
}

Banner "MingPan ZhiJing - All-in-one Fortune Platform"
Write-Host "  BaZi + Astrology + Tarot + AI FaceReading" -ForegroundColor DarkGray
Write-Host ""

# ---- Step 0: Check tools ----
Banner "Step 0: Check environment"

$pyCmd = ""
foreach ($c in @("python", "python3", "py")) {
    try {
        $v = & $c --version 2>&1
        if ($v -match "Python 3\.(\d+)") {
            $minor = [int]$Matches[1]
            if ($minor -ge 10) { OK "Python $v found"; $pyCmd = $c; break }
        }
    } catch {}
}
if (-not $pyCmd) {
    Err "Python 3.10+ not found. Install from https://python.org/downloads"
    Read-Host "Press Enter to exit"; exit 1
}

try { $nv = node --version 2>&1; OK "Node.js $nv found" }
catch { Err "Node.js not found. Install from https://nodejs.org"; Read-Host "Press Enter to exit"; exit 1 }

# ---- Step 1: Python venv ----
Banner "Step 1: Python virtual environment"

$BACKEND  = Join-Path $ROOT "backend"
$VENV_DIR = Join-Path $ROOT ".venv"

if (-not (Test-Path $VENV_DIR)) {
    Info "Creating .venv ..."
    & $pyCmd -m venv $VENV_DIR
    OK "Virtual environment created"
} else {
    OK "Virtual environment already exists, skipping"
}

$PIP = Join-Path $VENV_DIR "Scripts\pip.exe"
$PY  = Join-Path $VENV_DIR "Scripts\python.exe"

Info "Upgrading pip ..."
& $PIP install --upgrade pip -q

$REQ    = Join-Path $BACKEND "requirements.txt"
$MARKER = Join-Path $VENV_DIR ".deps_installed"

if (Test-Path $MARKER) {
    OK "Python deps already installed (delete .venv\.deps_installed to reinstall)"
} elseif (Test-Path $REQ) {
    Info "Installing Python deps (first time may take 3-5 min) ..."
    & $PIP install -r $REQ -q
    if ($LASTEXITCODE -eq 0) {
        "installed" | Set-Content $MARKER
        OK "Python deps installed"
    } else {
        Warn "Some deps failed (face analysis may not work, core features OK)"
    }
} else {
    Warn "requirements.txt not found, skipping"
}

# ---- Step 2: npm deps ----
Banner "Step 2: Frontend npm packages"

$FRONTEND = Join-Path $ROOT "frontend"
$NM       = Join-Path $FRONTEND "node_modules"

if (-not (Test-Path $NM)) {
    Info "Installing npm packages (first time ~1-2 min) ..."
    Push-Location $FRONTEND
    npm install --prefer-offline --no-audit --no-fund 2>&1 | Out-Null
    Pop-Location
    OK "npm packages installed"
} else {
    OK "node_modules already present, skipping"
}

# ---- Step 3: .env ----
Banner "Step 3: Environment config"

$ENV_FILE = Join-Path $BACKEND ".env"
if (-not (Test-Path $ENV_FILE)) {
    $envContent = "SECRET_KEY=destiny-dev-secret`nDEBUG=true`nDATABASE_URL=sqlite+aiosqlite:///./destiny_dev.db`nALLOWED_ORIGINS=[`"http://localhost:3000`"]`nOPENAI_API_KEY=`nSTRIPE_SECRET_KEY=`nCHROMA_HOST=localhost`nCHROMA_PORT=8001`n"
    [System.IO.File]::WriteAllText($ENV_FILE, $envContent, (New-Object System.Text.UTF8Encoding $false))
    OK ".env generated (SQLite dev mode)"
    Warn "Edit backend\.env and set OPENAI_API_KEY to enable AI analysis"
} else {
    OK ".env exists"
    $ec = Get-Content $ENV_FILE -Raw -ErrorAction SilentlyContinue
    if ($ec -match "OPENAI_API_KEY=sk-") { OK "OPENAI_API_KEY is set" }
    else { Warn "OPENAI_API_KEY not set -> AI runs in mock mode" }
}

# ---- Step 4: Launch services ----
Banner "Step 4: Start services"

$UVICORN = Join-Path $VENV_DIR "Scripts\uvicorn.exe"
if (-not (Test-Path $UVICORN)) { $UVICORN = $null }

Info "Starting FastAPI backend  -> http://localhost:8002"
$backendCmd = if ($UVICORN) {
    "Set-Location '$BACKEND'; `$env:PYTHONPATH='$ROOT'; & '$UVICORN' backend.main:app --host 0.0.0.0 --port 8002 --reload"
} else {
    "Set-Location '$BACKEND'; `$env:PYTHONPATH='$ROOT'; & '$PY' -m uvicorn backend.main:app --host 0.0.0.0 --port 8002 --reload"
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='Backend FastAPI :8000'; $backendCmd" -WindowStyle Normal
Start-Sleep -Seconds 2

Info "Starting Next.js frontend -> http://localhost:3000"
$frontendCmd = "Set-Location '$FRONTEND'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle='Frontend Next.js :3000'; $frontendCmd" -WindowStyle Normal

# ---- Step 5: Wait and open browser ----
Banner "Waiting for services to start..."
Write-Host "  (Press Ctrl+C to stop all services)" -ForegroundColor DarkGray

$maxWait    = 45
$backendOK  = $false
$frontendOK = $false

for ($i = 1; $i -le $maxWait; $i++) {
    Start-Sleep -Seconds 1
    $done  = "#" * $i
    $blank = "-" * ($maxWait - $i)
    Write-Host "`r  [$done$blank] ${i}s " -NoNewline -ForegroundColor DarkGray

    if (-not $backendOK) {
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:8002/health" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
            if ($r.StatusCode -eq 200) { $backendOK = $true }
        } catch {}
    }
    if (-not $frontendOK) {
        try {
            $r = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
            if ($r.StatusCode -eq 200) { $frontendOK = $true }
        } catch {}
    }
    if ($backendOK -and $frontendOK) { break }
}

Write-Host ""

# ---- Result ----
Banner "Launch Result"

if ($backendOK)  { OK "Backend  http://localhost:8002  ready" }
else             { Warn "Backend  http://localhost:8002  not responding yet (may still be starting)" }

if ($frontendOK) { OK "Frontend http://localhost:3000  ready" }
else             { Warn "Frontend http://localhost:3000  not responding yet (Next.js first compile is slow)" }

Write-Host ""
Write-Host "  +-----------------------------------------------+" -ForegroundColor DarkGray
Write-Host "  |  Website  : http://localhost:3000             |" -ForegroundColor Cyan
Write-Host "  |  API Docs : http://localhost:8000/docs        |" -ForegroundColor Cyan
Write-Host "  |  Health   : http://localhost:8000/health      |" -ForegroundColor Cyan
Write-Host "  +-----------------------------------------------+" -ForegroundColor DarkGray
Write-Host ""

try { Start-Process "http://localhost:3000"; OK "Opened browser" }
catch { Info "Please open http://localhost:3000 manually" }

Write-Host ""
Write-Host "  Press Enter to close this window (services keep running)" -ForegroundColor DarkGray
Read-Host