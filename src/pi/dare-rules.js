/**
 * Phase 6 — Pi-specific deterministic checks (DARE-compatible style)
 * Safe, minimal repairs only. AI is still used for non-deterministic design work.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { scanPiReadiness } from './readiness.js';

const SDK_SNIPPET = `<script src="https://sdk.minepi.com/pi-sdk.js"></script>`;

/**
 * Run Pi deterministic scan + optional safe patches.
 * @returns {{ ok: boolean, findings: array, repairs: array, next: string }}
 */
export async function runPiDare(sourceDir, { applySafeRepairs = true } = {}) {
  const readiness = await scanPiReadiness(sourceDir);
  const repairs = [];
  const findings = [...(readiness.findings || [])];

  if (applySafeRepairs) {
    // Safe repair: inject official SDK script into root index.html if missing and file exists
    const indexCandidates = [
      path.join(sourceDir, 'index.html'),
      path.join(sourceDir, 'public', 'index.html')
    ];
    for (const indexPath of indexCandidates) {
      try {
        let html = await fs.readFile(indexPath, 'utf8');
        if (!/sdk\.minepi\.com\/pi-sdk\.js/i.test(html) && /<\/head>/i.test(html)) {
          html = html.replace(/<\/head>/i, `  ${SDK_SNIPPET}\n</head>`);
          await fs.writeFile(indexPath, html, 'utf8');
          repairs.push({ ruleId: 'PI_INJECT_SDK_SCRIPT', file: path.relative(sourceDir, indexPath), message: 'Injected official Pi SDK script into index.html' });
          // refresh finding
          const idx = findings.findIndex(f => f.code === 'PI_SDK_SCRIPT_MISSING');
          if (idx >= 0) findings.splice(idx, 1);
        }
      } catch { /* file absent */ }
    }
  }

  const hasErrors = findings.some(f => f.level === 'error');
  return {
    ok: !hasErrors,
    readiness,
    findings,
    repairs,
    next: hasErrors ? 'AI' : (findings.length ? 'REVIEW' : 'CONTINUE'),
    note: 'Pi DARE only applies safe deterministic fixes (e.g. missing SDK script tag). Auth/payment logic still requires AI + Sandbox verification.'
  };
}

/**
 * Map readiness findings to DARE-like fingerprints for logging/history.
 */
export function piFindingsToFingerprints(findings = []) {
  return findings.map(f => f.code);
}

export default { runPiDare, piFindingsToFingerprints };
