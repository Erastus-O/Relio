import { test } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { createApp } from "./app";

test("health, auth required, validation errors", async () => {
  const server = createApp().listen(0);
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    assert.equal((await fetch(`${base}/health`)).status, 200);
    const me = await fetch(`${base}/me`);
    assert.equal(me.status, 401);
    assert.match((await me.json()).error, /sign in/i);
    const bad = await fetch(`${base}/auth/code`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "nope" }) });
    assert.equal(bad.status, 400);
  } finally {
    server.close();
  }
});
