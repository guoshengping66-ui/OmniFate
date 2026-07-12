Coding Standards Audit / Risk Report
=====================================
Project: OmniFate / Destiny Platform (khanfate.com)
Date: 2026-07-11
Scope: Frontend (Next.js 15.5, React 19, TypeScript) + Backend (Python 3.9, FastAPI)
------------------------------------------------------------

A-1 [CRITICAL] JWT_SECRET_KEY may be empty in production
  File: backend/config.py
  config.py defaults JWT_SECRET_KEY: str = "" with no runtime validation.
  An empty secret key means JWT tokens can be forged trivially.
  Fix: add a validation check that raises on empty SECRET_KEY in production, or
  set a strong random value in the .env.production file.

A-2 [HIGH] No Redis — token blacklist lost on every restart
  Backend log: "REDIS_URL not set — token blacklist uses in-memory storage
  (lost on restart)."
  Every PM2 restart invalidates the in-memory blacklist, allowing all
  previously-logged-out sessions to be reused.
  Fix: configure REDIS_URL in production .env.

A-3 [HIGH] Rate limiting ineffective without Redis
  Backend log: "PRODUCTION WARNING: REDIS_URL is not set. Rate limiting uses
  in-memory per-worker storage — an attacker can bypass all rate limits by
  hitting different workers."
  Combined with PM2 running a single process this is partially mitigated,
  but a server restart resets all counters.
  Fix: same as A-2 — configure REDIS_URL.

A-4 [HIGH] CSP contains "unsafe-inline" and "unsafe-eval"
  File: frontend/next.config.js (Content-Security-Policy header)
  These directives defeat script-injection protection. unsafe-inline is
  needed for Next.js' own inline scripts, but unsafe-eval can be removed
  in most cases.

A-5 [HIGH] Server allows root SSH login with password
  The server at 47.250.166.40 accepts password-based SSH for root.
  Password auth is vulnerable to brute-force and credential theft.
  Fix: disable PasswordAuthentication in sshd_config, use SSH keys only.

A-6 [MEDIUM] nginx proxy_hide_header Cache-Control on HTML pages
  File: /etc/nginx/conf.d/frontend.conf
  The "proxy_hide_header Cache-Control" directive strips Next.js's
  no-cache headers from the upstream response, then nginx adds its own.
  If Cloudflare settings override the replacement header, HTML could be
  cached and serve stale chunk references.
  Impact: after deploy, users hitting a cached HTML page may get
  ChunkLoadError 404s for old JS/CSS hashes.

A-7 [MEDIUM] Server-side env potentially exposed via client bundle
  The next.config.js has BACKEND_URL as a build-time env. Any
  NEXT_PUBLIC_* variables in .env.local would be bundled client-side.
  Verify no secrets are in NEXT_PUBLIC_* vars.

A-8 [MEDIUM] Git global config has http.sslverify=false
  SSL verification is globally disabled for git. This means git operations
  cannot detect MITM attacks on GitHub connections.
  Fix: git config --global --unset http.sslverify

A-9 [LOW] ALLOWED_ORIGINS includes localhost in DEBUG mode
  File: backend/config.py
  Localhost origins in ALLOWED_ORIGINS are only allowed in debug mode,
  but the list is not narrowed to specific ports.

A-10 [LOW] 4 moderate npm vulnerabilities
  npm audit reports 4 moderate-severity vulnerabilities.
  Run "npm audit fix" to address.

B. Code Quality Issues
------------------------------------------------------------

B-1 [MEDIUM] Dead root globals.css file
  File: frontend/src/app/globals.css
  Not imported by any file. The [locale]/globals.css is the active one.
  This causes confusion about which file to edit.
  Fix: delete frontend/src/app/globals.css.

B-2 [MEDIUM] CSS style system had duplicate/hardcoded color values
  (Partially fixed in recent session) Additional hardcoded gold colors
  remain in:
  - frontend/src/app/[locale]/layout.tsx (inline border style)
  - frontend/src/app/[locale]/reading/[id]/page.tsx (gradient)
  - frontend/src/app/[locale]/shop/page.tsx (gradient)
  - frontend/src/components/DailyDashboard.tsx (score color map)

B-3 [LOW] gitignore missing entries
  tmp-chrome-login-final/ and plink.exe are not in .gitignore.
  These files were almost committed in a previous session.

B-4 [LOW] deploy.sh uses Linux paths (Windows compatibility)
  The deploy.sh script assumes a Linux environment, which is correct for
  the server but not usable for local Windows testing.

B-5 [LOW] Proxied server password in command history
  The SSH password "PINGping815!" has been passed as a plink command-line
  argument. This is visible in Windows process lists and shell history.
  Fix: use SSH key authentication instead.

C. Configuration & Deployment
------------------------------------------------------------

C-1 [MEDIUM] No automated backup strategy visible
  The database (PostgreSQL) and uploaded assets have no visible backup
  configuration. If the disk fails, all user data is lost.

C-2 [LOW] No .env.local on production server
  Only .env.production exists. This is acceptable but any values that
  should differ between staging and production must go in .env.production.

C-3 [LOW] No pm2-logrotate configured
  PM2 logs grow unbounded. /root/.pm2/logs/ will fill disk over time.
  Install pm2-logrotate or configure log rotation.

D. Dependency & Build
------------------------------------------------------------

D-1 [LOW] 4 moderate npm vulnerabilities
  Run "npm audit fix" in frontend directory to auto-fix.

D-2 [LOW] Node.js v20.20.2 on server (latest v20 is ~v20.18)
  Minor version behind latest; upgrade unlikely to break compatibility.

D-3 [INFO] 497 frontend packages, 173 funding packages
  Many dependencies; each is a potential supply-chain risk.
  Periodically audit with npm audit --audit-level=high.
