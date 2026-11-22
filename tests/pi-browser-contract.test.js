import test from 'node:test';
import assert from 'node:assert/strict';
import { PI_BROWSER_CONTRACT, SYSTEM } from '../src/ai/prompts.js';
import { BUILDER_KNOWLEDGE } from '../src/ai/knowledge.js';
import pkg from '../package.json' with { type: 'json' };

test('Pi Browser contract covers official SDK, server verification, and Sandbox test boundary', () => {
  assert.match(PI_BROWSER_CONTRACT, /sdk\.minepi\.com\/pi-sdk\.js/);
  assert.match(PI_BROWSER_CONTRACT, /Pi\.authenticate/);
  assert.match(PI_BROWSER_CONTRACT, /\/v2\/me/);
  assert.match(PI_BROWSER_CONTRACT, /PI_API_KEY/);
  assert.match(PI_BROWSER_CONTRACT, /Pi Sandbox/);
  assert.match(PI_BROWSER_CONTRACT, /developers\.minepi\.com\/mcp/);
});

test('Pi Browser system prompt identifies new product and forbids container Pi login claims', () => {
  assert.match(SYSTEM, /App Builder — Pi Browser/);
  assert.match(SYSTEM, /never simulate real Pi login inside a container/);
});

test('package identity targets Pi Browser 2.0', () => {
  assert.equal(pkg.name, 'app-builder-pi-browser');
  assert.equal(pkg.version, '2.0.0-pi-browser');
  assert.match(pkg.description, /Pi Browser apps with Authentication, Payments/);
});

test('knowledge distinguishes real Sandbox testing from local preview', () => {
  assert.match(BUILDER_KNOWLEDGE, /cannot be claimed passed by container preview/);
  assert.match(BUILDER_KNOWLEDGE, /PI_API_KEY/);
  assert.match(BUILDER_KNOWLEDGE, /MCP/);
});
