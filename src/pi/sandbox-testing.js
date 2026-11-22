/**
 * Phase 5 — External Browser + Pi Sandbox testing workflow
 *
 * Hard rules:
 * - Container / local preview is NOT Pi Browser and cannot complete real Pi Login or Payments.
 * - Real tests happen in External Browser or official Pi Sandbox.
 * - Results must be recorded as PASS | FAIL | BLOCKED | NOT_TESTED | UNAVAILABLE — never inferred from static code alone.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

export const TEST_STATUSES = ['PASS', 'FAIL', 'BLOCKED', 'NOT_TESTED', 'UNAVAILABLE'];

export const CHECKLIST = [
  { id: 'sdk_loaded', title: 'Pi SDK script loaded', scope: 'static' },
  { id: 'pi_init', title: 'Pi.init called (sandbox mode for dev)', scope: 'static' },
  { id: 'auth_flow', title: 'Pi Authentication works in Sandbox', scope: 'sandbox' },
  { id: 'session_backend', title: 'Backend verifies accessToken via /v2/me', scope: 'sandbox' },
  { id: 'payment_create', title: 'Pi.createPayment starts in Sandbox', scope: 'sandbox' },
  { id: 'payment_approve', title: 'Backend approves payment', scope: 'sandbox' },
  { id: 'payment_complete', title: 'Backend completes payment after txid', scope: 'sandbox' },
  { id: 'incomplete_handler', title: 'onIncompletePaymentFound handled', scope: 'sandbox' },
  { id: 'csp_frame', title: 'CSP allows Pi Sandbox frame-ancestors', scope: 'static' },
  { id: 'https_production', title: 'Production URL is HTTPS public', scope: 'production' }
];

/**
 * Build a sandbox test session plan for a project.
 */
export function createSandboxSession({
  projectId,
  projectName,
  localPreviewUrl = null,
  developmentUrl = null,
  sandboxUrl = null,
  frontendUrl = null,
  tunnelUrl = null
} = {}) {
  const id = `sandbox-${Date.now().toString(36)}`;
  const checks = CHECKLIST.map(c => ({
    ...c,
    status: c.scope === 'static' ? 'NOT_TESTED' : 'NOT_TESTED',
    note: '',
    testedAt: null
  }));

  return {
    id,
    projectId: projectId || null,
    projectName: projectName || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    urls: {
      localPreviewUrl,
      developmentUrl,
      tunnelUrl,
      sandboxUrl,
      frontendUrl
    },
    externalBrowser: {
      recommended: true,
      instructions: buildExternalBrowserInstructions({
        localPreviewUrl,
        developmentUrl,
        tunnelUrl,
        sandboxUrl,
        frontendUrl
      })
    },
    tunnel: {
      required: needsTunnel(localPreviewUrl, developmentUrl),
      providers: ['cloudflared', 'ngrok', 'localtunnel'],
      guidance: TUNNEL_GUIDANCE
    },
    checks,
    summary: {
      overall: 'NOT_TESTED',
      passed: 0,
      failed: 0,
      blocked: 0,
      notTested: checks.length
    },
    warnings: [
      'Do not mark auth/payment as PASS from container preview alone.',
      'Open Pi Sandbox or external browser with an authorized Pi account.',
      'Staging/Testnet vs Mainnet must match the registered app network.'
    ]
  };
}

function needsTunnel(localPreviewUrl, developmentUrl) {
  const u = localPreviewUrl || developmentUrl || '';
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(u);
}

export function buildExternalBrowserInstructions(urls = {}) {
  const steps = [];
  steps.push('1. Keep the app dev server running inside Builder/preview.');
  if (urls.tunnelUrl) {
    steps.push(`2. Public tunnel URL ready: ${urls.tunnelUrl}`);
  } else if (needsTunnel(urls.localPreviewUrl, urls.developmentUrl)) {
    steps.push('2. Create a temporary HTTPS tunnel to your local preview (cloudflared / ngrok). Only expose this project port.');
  } else {
    steps.push('2. Use the public development/frontend HTTPS URL.');
  }
  if (urls.sandboxUrl) {
    steps.push(`3. Open official Pi Sandbox URL in your browser: ${urls.sandboxUrl}`);
  } else {
    steps.push('3. Open Pi Sandbox from Pi Developers console for this app (sandbox_url), or use Pi Browser where available.');
  }
  steps.push('4. Sign in with Pi when prompted. Complete Authentication test.');
  steps.push('5. If payments are enabled, run a Test-Pi payment and confirm backend approve + complete.');
  steps.push('6. Return to Builder and record each checklist item as PASS / FAIL / BLOCKED.');
  if (urls.frontendUrl) {
    steps.push(`7. Production frontend URL (for later verify): ${urls.frontendUrl}`);
  }
  return steps;
}

export const TUNNEL_GUIDANCE = {
  cloudflared: {
    title: 'Cloudflare Tunnel (recommended)',
    commands: [
      '# Install cloudflared, then:',
      'cloudflared tunnel --url http://127.0.0.1:PORT'
    ],
    notes: 'Produces a temporary https://*.trycloudflare.com URL. Point development_url / Sandbox at that URL only for this app.'
  },
  ngrok: {
    title: 'ngrok',
    commands: [
      'ngrok http PORT'
    ],
    notes: 'Use the https forwarding URL. Do not expose the whole Builder — only the app port.'
  },
  localtunnel: {
    title: 'localtunnel',
    commands: [
      'npx localtunnel --port PORT'
    ],
    notes: 'Quick ephemeral HTTPS URL. Suitable for short Sandbox tests.'
  },
  security: [
    'Never tunnel the Builder admin port itself if avoidable.',
    'Do not commit tunnel auth tokens.',
    'Stop the tunnel after testing.'
  ]
};

/**
 * Update a single checklist item status.
 */
export function recordCheck(session, checkId, status, note = '') {
  if (!TEST_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}. Use one of ${TEST_STATUSES.join(', ')}`);
  }
  const check = session.checks.find(c => c.id === checkId);
  if (!check) throw new Error(`Unknown check id: ${checkId}`);
  check.status = status;
  check.note = String(note || '').slice(0, 500);
  check.testedAt = new Date().toISOString();
  session.updatedAt = check.testedAt;
  session.summary = summarize(session.checks);
  return session;
}

export function summarize(checks) {
  const counts = { PASS: 0, FAIL: 0, BLOCKED: 0, NOT_TESTED: 0, UNAVAILABLE: 0 };
  for (const c of checks) counts[c.status] = (counts[c.status] || 0) + 1;
  let overall = 'NOT_TESTED';
  if (counts.FAIL > 0) overall = 'FAIL';
  else if (counts.BLOCKED > 0) overall = 'BLOCKED';
  else if (counts.PASS > 0 && counts.NOT_TESTED === 0 && counts.UNAVAILABLE === 0) overall = 'PASS';
  else if (counts.PASS > 0) overall = 'PARTIAL';
  return {
    overall,
    passed: counts.PASS,
    failed: counts.FAIL,
    blocked: counts.BLOCKED,
    notTested: counts.NOT_TESTED,
    unavailable: counts.UNAVAILABLE
  };
}

/**
 * Persist session under project metadata directory.
 */
export async function saveSession(projectRoot, session) {
  const dir = path.join(projectRoot, '.builder');
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, 'sandbox-session.json');
  await fs.writeFile(file, JSON.stringify(session, null, 2), 'utf8');
  return file;
}

export async function loadSession(projectRoot) {
  const file = path.join(projectRoot, '.builder', 'sandbox-session.json');
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Produce a human-readable report block for chat / export.
 */
export function formatSessionReport(session) {
  const lines = [];
  lines.push(`# Pi Sandbox Test Session — ${session.projectName || session.projectId || 'app'}`);
  lines.push(`Session: ${session.id}`);
  lines.push(`Overall: ${session.summary.overall}`);
  lines.push('');
  lines.push('## URLs');
  for (const [k, v] of Object.entries(session.urls || {})) {
    if (v) lines.push(`- ${k}: ${v}`);
  }
  lines.push('');
  lines.push('## External browser steps');
  for (const s of session.externalBrowser?.instructions || []) lines.push(`- ${s}`);
  lines.push('');
  lines.push('## Checklist');
  for (const c of session.checks) {
    lines.push(`- [${c.status}] ${c.title}${c.note ? ` — ${c.note}` : ''}`);
  }
  lines.push('');
  lines.push('## Warnings');
  for (const w of session.warnings || []) lines.push(`- ${w}`);
  return lines.join('\n');
}

export default {
  TEST_STATUSES,
  CHECKLIST,
  createSandboxSession,
  recordCheck,
  summarize,
  saveSession,
  loadSession,
  formatSessionReport,
  buildExternalBrowserInstructions,
  TUNNEL_GUIDANCE
};
