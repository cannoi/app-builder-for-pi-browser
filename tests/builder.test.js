import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const expectedBrowserImage = new RegExp('ghcr\\.io/cannoi/app-builder-pi-browser:' + pkg.version.replace(/\./g, '\\.'));

test('Pi Browser compose uses the public release image and has no Docker socket mount', () => {
  for (const filename of ['../docker-compose.yml', '../BROWSER-docker-compose.yml']) {
    const compose = fs.readFileSync(new URL(filename, import.meta.url), 'utf8');
    assert.match(compose, expectedBrowserImage, filename);
    assert.doesNotMatch(compose, /docker\.sock/i, filename);
    assert.doesNotMatch(compose, /build:\s*\./i, filename);
    assert.doesNotMatch(compose, /privileged:\s*true/i, filename);
  }
});

test('legacy SoloHost compose is isolated and pinned to its historical image', () => {
  const compose = fs.readFileSync(new URL('../solohost/docker-compose.yml', import.meta.url), 'utf8');
  assert.match(compose, /ghcr\.io\/cannoi\/app-builder-pi-solohost:1\.8\.42/);
  assert.doesNotMatch(compose, expectedBrowserImage);
  assert.doesNotMatch(compose, /docker\.sock/i);
});
