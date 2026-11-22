/**
 * Phase 3 — lightweight Pi Browser readiness checks (static).
 * These are deterministic signals for DARE / quality gate; they do NOT claim Sandbox PASS.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const SDK_URL = 'https://sdk.minepi.com/pi-sdk.js';

export async function scanPiReadiness(projectRoot) {
  const findings = [];
  const files = await walk(projectRoot);
  const joined = files.map(f => f.content).join('\n');

  const hasSdkScript = joined.includes(SDK_URL) || joined.includes('sdk.minepi.com/pi-sdk');
  const hasInit = /Pi\.init\s*\(/.test(joined);
  const hasAuth = /Pi\.authenticate\s*\(/.test(joined);
  const hasCreatePayment = /Pi\.createPayment\s*\(/.test(joined);
  const hasIncomplete = /onIncompletePaymentFound/.test(joined);
  const exposesApiKey = /PI_API_KEY/.test(joined) && !/process\.env\.PI_API_KEY|server\.example/.test(joined);
  const claimsSandboxPass = /payment completed|login success|signed in/i.test(joined) && !/Sandbox|sandbox/.test(joined);

  if (!hasSdkScript) findings.push({ level: 'warn', code: 'PI_SDK_SCRIPT_MISSING', message: 'Official Pi SDK script not found' });
  if (hasAuth && !hasInit) findings.push({ level: 'error', code: 'PI_INIT_MISSING', message: 'Pi.authenticate used without Pi.init' });
  if (hasCreatePayment && !hasInit) findings.push({ level: 'error', code: 'PI_INIT_MISSING_PAYMENT', message: 'Pi.createPayment used without Pi.init' });
  if ((hasAuth || hasCreatePayment) && !hasIncomplete) findings.push({ level: 'warn', code: 'PI_INCOMPLETE_HANDLER_MISSING', message: 'onIncompletePaymentFound handler not detected' });
  if (exposesApiKey) findings.push({ level: 'error', code: 'PI_API_KEY_EXPOSED', message: 'Possible PI_API_KEY exposure in frontend or non-server file' });

  return {
    hasSdkScript,
    hasInit,
    hasAuth,
    hasCreatePayment,
    findings,
    // Never auto-mark Sandbox testing as PASS from static scan
    sandboxTest: 'NOT_TESTED',
    note: 'Static scan only. Real Login/Payment requires External Browser + Pi Sandbox.'
  };
}

async function walk(dir, base = dir, out = []) {
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'dist') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, base, out);
    else if (/\.(html|js|jsx|ts|tsx|mjs|cjs|md)$/i.test(e.name)) {
      try {
        const content = await fs.readFile(full, 'utf8');
        out.push({ file: path.relative(base, full), content });
      } catch {}
    }
  }
  return out;
}
