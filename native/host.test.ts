import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("Android loads the current medieval web deployment over HTTPS", () => {
  const config = JSON.parse(readFileSync(new URL("../capacitor.config.json", import.meta.url), "utf8"));
  assert.equal(config.server.url, "https://devopsquests.pages.dev");
  assert.equal(config.server.cleartext, false);
  assert.equal(config.webDir, "native/web");
});