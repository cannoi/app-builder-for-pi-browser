# PHASE 5 REPORT — External Browser + Pi Sandbox Testing
**App Builder — Pi Browser** · `2.0.0-pi-browser`
Date: 2026-11-21

## Goal
Make Authentication and Payment testing honest: real checks happen in External Browser / Pi Sandbox, with recorded evidence — never inferred from container preview.

## Delivered

### 1. Module `src/pi/sandbox-testing.js`
- `createSandboxSession()` — creates a structured test session with URLs, tunnel guidance, checklist
- `recordCheck()` — updates a checklist item with PASS/FAIL/BLOCKED/NOT_TESTED/UNAVAILABLE
- `saveSession` / `loadSession` — persist under `project/.builder/sandbox-session.json`
- `formatSessionReport()` — markdown report for chat/export
- `TUNNEL_GUIDANCE` — cloudflared / ngrok / localtunnel with security notes
- `buildExternalBrowserInstructions()` — step-by-step for the developer

### 2. Checklist items
| ID | Scope |
|----|-------|
| sdk_loaded | static |
| pi_init | static |
| auth_flow | sandbox |
| session_backend | sandbox |
| payment_create | sandbox |
| payment_approve | sandbox |
| payment_complete | sandbox |
| incomplete_handler | sandbox |
| csp_frame | static |
| https_production | production |

### 3. REST API
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/pi/sandbox/checklist` | Statuses + checklist + tunnel guidance |
| POST | `/api/pi/sandbox/session` | Start session |
| GET | `/api/pi/sandbox/session/:projectId` | Load session + report |
| POST | `/api/pi/sandbox/session/:projectId/check` | Record one check result |
| POST | `/api/pi/sandbox/session/:projectId/urls` | Update tunnel/sandbox/frontend URLs |

### 4. AI knowledge
- `PI_SANDBOX_TEST_GUIDE` — forbids claiming auth/payment PASS without Sandbox evidence

## Hard rules enforced in design
1. Container preview ≠ Pi Sandbox
2. Overall PASS only when required checks pass and none fail
3. Tunnel only the app port, not Builder admin
4. Stop tunnels after testing; do not commit tokens

## Deferred
- Auto-launch OS browser from container (host-dependent; instructions provided instead)
- Built-in cloudflared binary (guidance only to keep image lean)
- Full UI panel (Phase 7)

## Definition of Done
- [x] Session model with honest statuses
- [x] External browser instructions
- [x] Tunnel guidance + security notes
- [x] Persist session per project
- [x] API surface
- [x] AI guide updated
- [x] Syntax checks passed
