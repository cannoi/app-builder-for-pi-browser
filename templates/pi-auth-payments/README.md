# {{APP_NAME}}

Pi Browser starter built with React + Vite + official Pi SDK.

## Features
- Pi Authentication (`Pi.authenticate`)
- Pi Payments (create → backend approve → backend complete)
- Sandbox mode by default
- CSP headers suitable for Pi Sandbox iframe

## Local development
```bash
npm install
npm run dev
```

Open the Vite URL in **Pi Sandbox** (or external browser via Sandbox) to test real Login / Payments.
Container-only preview cannot complete Pi Authentication.

## Backend (required for production)
See `api/server.example.js`. You must:
1. Verify `accessToken` with `GET /v2/me`
2. Approve payments with Server API Key
3. Complete payments after on-chain confirmation
4. Never expose `PI_API_KEY` to the frontend

## Official docs
- https://developers.minepi.com/docs
- https://developers.minepi.com/agents.md
