# Pi Browser App Contract

App Builder target: production-oriented web apps for Pi Browser.

## Official integration
- Pi SDK: https://sdk.minepi.com/pi-sdk.js
- Initialize before SDK methods: `Pi.init({ version: "2.0", sandbox: true })` for development; `sandbox: false` only in explicitly configured production.
- Pi Browser does not automatically inject the SDK.
- Authenticate using `Pi.authenticate` with the narrowest required scopes. Handle cancellation and incomplete payments.
- Verify access tokens on the backend using Platform API `/v2/me` with Bearer token; frontend user details are presentation only.
- Payments start via `Pi.createPayment`; server approves/completes using Platform API and server-only `PI_API_KEY`. Grant paid goods/services only after completion succeeds. Use idempotency and incomplete-payment reconciliation.
- Pi login and payment E2E must use External Browser + Pi Sandbox. Container preview/mock tests cannot be reported as Pi integration PASS.
- Keep Sandbox/staging/Test Pi separate from production/Mainnet. No automatic network switching.
- Official MCP: `https://developers.minepi.com/mcp`; dynamically discover tools and follow `https://developers.minepi.com/agents.md`. Preserve existing MCP configuration. User approval required for app registration, URLs, wallet/payment setup, production changes and review submission.
- Production readiness requires HTTPS, domain ownership validation, secure backend secrets, server verification and Developer Portal configuration. Build passing alone is not production-ready.

## Security
- Never expose Server API Key, wallet private keys, or provider secrets in frontend or source control.
- Verify identity/payment server-side. Do not trust frontend callbacks.
- Protect payment completion from duplicate processing.
- Run project code in isolation; no Docker socket, privileged container or unrestricted host filesystem.

## Official references
- https://developers.minepi.com/docs/build-first-app/GettingStarted
- https://developers.minepi.com/docs/authenticate-user/Authentication
- https://developers.minepi.com/docs/accept-payment/Payments
- https://developers.minepi.com/docs/api-reference/Platform
- https://developers.minepi.com/docs/build-first-app/Sandbox
- https://developers.minepi.com/agents
- https://developers.minepi.com/agents.md
