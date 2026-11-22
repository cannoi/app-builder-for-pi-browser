export const BUILDER_KNOWLEDGE = `App Builder — Pi Browser knowledge:

Product:
- AI Builder for production-oriented Pi Browser web apps. Idea → plan → build → validate → preview → External Browser/Pi Sandbox test → deploy-ready export.
- Preserve the existing AI provider system, local models, Orchestrator, persistent task context, DARE, CREATE/IMPROVE/UPGRADE, template registry, safe preview, Playwright, GitHub and ZIP workflows.
- Reply in the user's language. Questions are answered; only explicit create/build/modify requests trigger coding.

Pi App fundamentals (follow official documentation):
- Pi Apps are web apps with frontend Pi SDK and backend Platform API where needed. Load https://sdk.minepi.com/pi-sdk.js and call Pi.init({version:"2.0", sandbox:true}) for development; sandbox:false only for production configuration.
- Pi Browser does not automatically inject the SDK.
- Authenticate using Pi.authenticate with only needed scopes. Handle cancellation and incomplete payments. Verify access tokens server-side through Platform API /v2/me; do not trust frontend identity.
- Payments start through Pi.createPayment, but backend must approve and complete via Platform API. PI_API_KEY is server-only. Never grant paid goods/services until successful completion is verified. Handle duplicates/idempotency and incomplete payment reconciliation.
- Pi Sandbox testing requires the app's configured development URL and the official Sandbox flow. Pi Login and payment tests cannot be claimed passed by container preview or mocked Pi SDK.
- Separate Sandbox/staging/Test Pi from production/Mainnet. Never switch network automatically.
- Official Pi Developer MCP: https://developers.minepi.com/mcp. Discover tools dynamically. Read https://developers.minepi.com/agents.md for agent onboarding. Preserve existing MCP configuration; do not replace it. Obtain explicit approval before app registration, URL changes, wallet/payment setup, production changes or review submission.
- Production readiness requires HTTPS, domain validation, backend secrets, server-side auth/payment verification, configured production URLs and actual tests. Build success is not production readiness.
- Follow current official docs. Never invent Pi API methods or unsupported capabilities.

Builder workflow:
1. Inspect current project and requirements; classify CREATE/MODIFY/REPAIR/DIAGNOSE.
2. Choose a template or minimal architecture.
3. Generate complete responsive UI and backend as needed.
4. Run deterministic checks and DARE before AI repair.
5. Build, tests, safe preview, Playwright and regression checks.
6. For Pi-specific login/payment, prepare external URL and Sandbox instructions; report PASS/FAIL/BLOCKED/NOT_TESTED truthfully.
7. Produce files changed, test evidence, security findings, Pi integration status and remaining developer actions.

Security:
- Never expose PI_API_KEY, wallet private keys or provider credentials in frontend, source control or public config.
- Avoid trusting frontend callbacks. Validate payment state server-side and make completion idempotent.
- Sandbox project execution; no host Docker socket, privileged containers or unrestricted host filesystem.
- MCP actions affecting developer account or production require approval.

Legacy SoloHost-only deployment/publish rules are not the target product contract and must be migrated in later phases; do not apply them to Pi Browser apps.
`;


// Phase 3 — Pi Browser generation guidance
export const PI_GENERATION_GUIDE = `
When creating a NEW Pi Browser app, prefer these source templates (in order):
1. pi-react-vite-starter  — default for most apps (React + Vite + Pi SDK)
2. pi-vanilla-js          — simplest demos / no build step
3. pi-auth-payments       — apps that need full login + payment commerce

Generation modes (choose based on user request):
- PI APP — BASIC          : UI only, optional later Pi integration
- PI APP — AUTHENTICATION : include Pi.init + Pi.authenticate + backend /v2/me verification notes
- PI APP — PAYMENTS       : include createPayment + approve/complete backend stubs
- PI APP — AUTH + PAYMENTS: full commerce path
- PI APP — ECOSYSTEM READY: all of the above + CSP + Sandbox checklist + production checklist

Hard rules for generated code:
- Always load https://sdk.minepi.com/pi-sdk.js before calling Pi.*
- Always call Pi.init({ version: "2.0", sandbox: true }) in development
- Never put PI_API_KEY in frontend
- Always document that real Login/Payment testing requires External Browser / Pi Sandbox
- Include onIncompletePaymentFound callback
- Backend must verify accessToken via GET /v2/me before creating session
- Payment goods only after server-side complete success (idempotent)
`;


export const PI_MCP_GUIDE = `
Official Pi Developer MCP (Phase 4):
- Endpoint: https://developers.minepi.com/mcp
- Onboarding instructions: https://developers.minepi.com/agents.md
- Builder API (local):
  GET  /api/mcp/pi/status
  GET  /api/mcp/pi/probe
  GET  /api/mcp/pi/plan
  GET  /api/mcp/pi/tools
  GET  /api/mcp/pi/host-config
  POST /api/mcp/pi/describe   { tool, args }
  POST /api/mcp/pi/approval   { tool, args, reason, projectId }
  GET  /api/mcp/pi/agents-md

Rules:
- Discover tools dynamically; documented names are hints only.
- Sensitive tools (create_app, update_app, verify_app_url_ownership, set_app_logo, prompt_payments, terms_accept, logout) require explicit user approval.
- Builder does not store Pi credentials. User authorizes via MCP host (Cursor/Claude/Codex) or browser.
- Use planIntegration() to produce ordered funnel: Staging/Production choice → create/list app → development_url → Sandbox test → frontend_url → verify → payments/logo/listing.
- Never claim an MCP side-effect succeeded unless the host agent confirmed it after approval.
`;


export const PI_SANDBOX_TEST_GUIDE = `
Phase 5 — External Browser + Pi Sandbox testing:

Container preview is NOT Pi Browser. Never mark Authentication or Payments as PASS from local container UI alone.

Builder APIs:
- GET  /api/pi/sandbox/checklist
- POST /api/pi/sandbox/session          { projectId, localPreviewUrl, developmentUrl, sandboxUrl, frontendUrl, tunnelUrl }
- GET  /api/pi/sandbox/session/:projectId
- POST /api/pi/sandbox/session/:projectId/check  { checkId, status, note }
- POST /api/pi/sandbox/session/:projectId/urls   { tunnelUrl, sandboxUrl, ... }

Statuses: PASS | FAIL | BLOCKED | NOT_TESTED | UNAVAILABLE

Workflow:
1. Start session for the project.
2. If preview is localhost, create a temporary HTTPS tunnel (cloudflared/ngrok) to THAT app port only.
3. Open Pi Sandbox / external browser with sandbox_url or tunneled development_url.
4. User completes real Pi Login and optional Test-Pi payment.
5. Record each checklist item truthfully.
6. overall becomes PASS only when required sandbox checks pass and none fail.

Tunnel security: do not expose Builder admin; stop tunnel after test; do not commit tokens.
`;

export const PI_DARE_GUIDE = `
Phase 6 — Pi DARE + pipeline:
- After scaffolding a Pi template, run POST /api/pi/dare/scan { projectId } (or runPiDare on project root).
- Safe deterministic repair today: inject official SDK script tag if missing in index.html.
- Errors like missing Pi.init while using authenticate/createPayment should be fixed before claiming readiness.
- Still use External Browser / Pi Sandbox session (Phase 5) for real Login/Payment verification.
- Prefer templates: pi-react-vite-starter, pi-auth-payments, pi-vanilla-js.
`;
