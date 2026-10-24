import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('First Play release targets API 36 and advances the test package version', () => {
  const sdk = readFileSync(new URL('../android/variables.gradle', import.meta.url), 'utf8');
  const app = readFileSync(new URL('../android/app/build.gradle', import.meta.url), 'utf8');
  assert.equal(Number(sdk.match(/targetSdkVersion\s*=\s*(\d+)/)?.[1]), 36);
  assert.equal(Number(app.match(/versionCode\s+(\d+)/)?.[1]), 3);
  assert.equal(app.match(/versionName\s+"([^"]+)"/)?.[1], '1.0.2');
});