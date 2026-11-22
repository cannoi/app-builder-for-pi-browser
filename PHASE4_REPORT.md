# PHASE 4 REPORT — Official Pi Developer MCP
**App Builder — Pi Browser** · `2.0.0-pi-browser`
Date: 2026-11-21

## Goal
Integrate the official Pi Developer MCP capability so the Builder can discover, plan, and gate MCP actions without inventing tools or storing credentials.

## Delivered

### 1. MCP client module
`src/mcp/pi-developers.js`
- Default endpoint: `https://developers.minepi.com/mcp`
- Fetches official onboarding text from `https://developers.minepi.com/agents.md`
- `probe()` — connectivity + best-effort tool discovery
- `listKnownTools()` — discovered or documented tool names
- `planIntegration()` — ordered funnel (Staging/Production → create/list → URLs → verify → payments/logo/listing)
- `requiresApproval()` / `buildApprovalRequest()` — approval gates for sensitive tools
- `hostConfigSnippet()` — JSON config for Cursor / Claude / Codex style hosts
- `describeToolCall()` — dry-run metadata for planning UIs
- **Never stores Pi credentials or access tokens**

Sensitive tools (approval required):
`create_app`, `update_app`, `verify_app_url_ownership`, `prepare_app_logo_upload`, `set_app_logo`, `prompt_payments`, `terms_accept`, `logout`

### 2. Builder HTTP API
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/mcp/pi/status` | Client state + host config |
| GET | `/api/mcp/pi/probe` | Live probe of MCP + agents.md |
| GET | `/api/mcp/pi/plan` | Integration plan steps |
| GET | `/api/mcp/pi/tools` | Known/discovered tools |
| GET | `/api/mcp/pi/host-config` | MCP server snippet for coding agents |
| POST | `/api/mcp/pi/describe` | Describe a tool call (no side effects) |
| POST | `/api/mcp/pi/approval` | Record pending sensitive action |
| GET | `/api/mcp/pi/agents-md` | Metadata from official agents.md |

### 3. AI knowledge
- `PI_MCP_GUIDE` added to knowledge base and referenced from prompts
- AI instructed to discover tools, use approval gates, and not claim side-effects without host confirmation

## Design decisions (important)
1. **Builder is not a full MCP host.** Real tool execution + Pi sign-in happens in the user's MCP-capable coding agent after they attach `https://developers.minepi.com/mcp`.
2. Builder focuses on discovery, ordered planning, and **approval gates** so sensitive developer-account actions cannot run silently.
3. Graceful degradation when the endpoint is unreachable from the container network.
4. Documented tool list from agents.md is used only as a fallback hint — discovery remains preferred.

## Verification
- `node --check src/mcp/pi-developers.js` → OK
- `node --check src/api/routes.js` → OK
- `node --check src/ai/knowledge.js` / `prompts.js` → OK

## Deferred to later phases
- Phase 5: External Browser open + tunnel workflow for Sandbox testing
- Automatic deep link from approval card → coding agent session
- UI panel “Pi MCP Status” (Phase 7)

## Definition of Done
- [x] Official MCP endpoint wired
- [x] agents.md onboarding fetch
- [x] Tool discovery / documented fallback
- [x] Integration plan funnel
- [x] Approval gate for sensitive tools
- [x] Host config snippet for coding agents
- [x] Local REST API surface
- [x] AI knowledge updated
- [x] No credential storage
