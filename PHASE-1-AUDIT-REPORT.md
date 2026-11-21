# Phase 1 — Repository Audit & Migration Baseline

Target release: `2.0.0-pi-browser`
Source archive: App Builder for Pi SoloHost `v1.8.46`

## Status
**AUDIT COMPLETE — implementation has not started.** Source is being migrated from a copied workspace; the uploaded source archive is preserved unchanged.

## Confirmed repository baseline
- Node ESM project; package name `pi-app-factory`, version `1.8.46`, Node `>=22`.
- Core application is modular and contains 116 files under `src` and 94 test files under `tests` (at audit time).
- Main AI system contract and product-specific knowledge are centralized in `src/ai/prompts.js` and `src/ai/knowledge.js`.
- Pi/SoloHost product assumptions also exist in pipeline, runtime/preview, release, GitHub publishing, security, UI, localization, templates, docs, and rule files; changing prompts alone would not constitute a complete conversion.
- Existing useful systems to preserve include AI gateway/provider routing, project/job pipeline, DARE, persistent project/task context, templates, project workspace, security scanner, native preview, protected sandbox, Playwright, GitHub publishing/export, feedback, settings, and logs.

## High-impact SoloHost coupling discovered
- `src/ai/prompts.js`: `SOLOHOST_CONTRACT`, `SYSTEM`, first-message routing, build/upgrade instructions, SoloHost badge and release contract.
- `src/ai/knowledge.js`: end-to-end SoloHost product knowledge and install/publish workflow.
- `src/jobs/pipeline.js`: SoloHost-specific generation stages, template readiness, preview messaging, runtime contract preflight, release flow.
- `src/release/*`: SoloHost package creation, field policy, validation, API, synchronizer and readiness logic.
- `src/github/*`: GHCR/SoloHost image publication assumptions and package messaging.
- `src/runtime/*`, `src/preview.js`, `src/security/*`: container/runtime and SoloHost assumptions.
- `public/app.js`, `public/index.html`, `public/styles.css`, `public/i18n.js`, `public/ai-panel.js`, `src/i18n/*`, `src/universal/*`: user-facing name, install kit, badge, support text and preview guidance.
- `docs/*`, root/solohost README/config/compose, Docker labels and build workflows need an explicit product decision or rewrite.
- `rules/*.rule` currently target `PI_SOLOHOST`.

## Preserve vs replace decision
### Preserve and adapt
AI provider engine, local AI, AI orchestration, persistent task context, DARE/checkpoint/rollback, template registry/matcher, CREATE/IMPROVE/UPGRADE, safe workspace and preview, Playwright, GitHub source workflow, ZIP import/export, settings, feedback, logs, security controls, and test harness.

### Replace or isolate behind Pi Browser product contract
SoloHost system prompts/knowledge, SoloHost package validation/release artifact, installation card, SoloHost publish instructions, SoloHost runtime assumptions, target rules, UI branding and badges, deployment readiness logic.

### Do not remove blindly
The existing protected preview/sandbox and container-related code. It may be reused for isolated generated-project builds and local preview, but Pi Sandbox login/payment testing must be external-browser based and must never be claimed as a container-internal Pi Browser test.

## Baseline verification
- Runtime available in audit container: Node `v22.16.0`, npm `10.9.2`.
- `npm ci --ignore-scripts --no-audit --no-fund` did not complete before the environment execution timeout; dependency installation and full baseline test suite therefore remain **NOT RUN / BLOCKED**. No test pass/fail claim is made.
- Source archive remains unchanged. Working copy is under `app-builder-pi-solohost-main`.

## Proposed gated implementation phases
1. **Phase 1 — Audit & baseline:** completed; this report.
2. **Phase 2 — Product identity + Pi Browser contract:** package metadata, product branding, new contract/knowledge/prompt; preserve existing engine; add contract tests.
3. **Phase 3 — Pi SDK integration primitives:** reusable Pi SDK bootstrap, environment/sandbox configuration, auth/payment integration patterns and server-side verification scaffolds; official docs evidence and safe secret handling.
4. **Phase 4 — Pi MCP integration capability:** endpoint configuration/discovery/onboarding docs, tool-capability handling, approval gates; do not fake unavailable MCP tools.
5. **Phase 5 — External Browser + Pi Sandbox test workflow:** local preview remains, external URL/tunnel remains opt-in and scoped, sandbox instructions, test-state distinctions (`PASS/FAIL/BLOCKED/NOT_TESTED/UNAVAILABLE`); never test Pi login in container.
6. **Phase 6 — Templates, DARE and generation pipeline migration:** convert target rules/templates/readiness and deterministic Pi checks; preserve two-cycle repair guard and regression protections.
7. **Phase 7 — UI/UX, documentation and packaging:** complete branding, bilingual UI, README, Docker labels, release/package metadata, migration/deployment guidance.
8. **Phase 8 — Full validation, security, regression and release packaging:** install dependencies, run tests/build/simulation/security checks where available, fix regressions, final report and `2.0.0-pi-browser` archive.

## Phase 1 acceptance
- Repository inspected and main coupling points identified: **PASS**.
- Preservation boundaries defined: **PASS**.
- Test baseline established: **BLOCKED** (dependency install timed out).
- Implementation changes: **NONE**.

## Next phase
Phase 2 begins only after this audit report is reviewed in the conversation. It will make the product identity and contract migration without yet attempting broad Pi SDK/payment/MCP implementation.
