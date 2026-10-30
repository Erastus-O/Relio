import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTaskList, catalogueTasks, SERVICE_CATALOGUES, TaskSelectionError } from "./tasks";
import { DEFAULT_PRICE_LIST, quote } from "./pricing";
import { documentState, isInactive } from "./documents";
import { marketplaceFee, monthlyCost } from "./plans";
import { reportRange } from "./payroll";

test("deep clean has over 20 tasks, all ticked by default", () => {
  const list = buildTaskList({ service: "deep", removed: [], custom: [] }, true);
  assert.equal(list.length, catalogueTasks("deep").length);
  assert.ok(list.length > 20);
});

test("customers can remove and add tasks, but not past the maximum", () => {
  const all = catalogueTasks("deep");
  const max = SERVICE_CATALOGUES.deep.maxTasks;
  const custom = Array.from({ length: max - all.length }, (_, i) => ({ room: "Kitchen", name: `Extra task ${i + 1}` }));
  assert.equal(buildTaskList({ service: "deep", removed: [], custom }, true).length, max);
  assert.throws(() => buildTaskList({ service: "deep", removed: [], custom: [...custom, { room: "Kitchen", name: "One too many" }] }, true), TaskSelectionError);
  assert.equal(buildTaskList({ service: "deep", removed: [all[0].key], custom: [] }, true).length, all.length - 1);
});

test("no photo requirements when the customer says no photos", () => {
  const list = buildTaskList({ service: "regular", removed: [], custom: [] }, false);
  assert.ok(list.every((t) => t.photo === null));
});

test("quote: weekly regular clean uses one-off price for the first visit", () => {
  const q = quote(DEFAULT_PRICE_LIST, { service: "regular", size: "3", bathrooms: 1, condition: "average", frequency: "weekly", addOns: [], ownSupplies: false, area: "main" });
  assert.equal(q.total, 11475);
  assert.equal(q.firstVisitTotal, 13500);
  assert.equal(q.status, "fixed");
});

test("quote: heavy condition needs a review", () => {
  const q = quote(DEFAULT_PRICE_LIST, { service: "deep", size: "2", bathrooms: 1, condition: "heavy", frequency: "once", addOns: [], ownSupplies: false, area: "main" });
  assert.equal(q.status, "review");
});

test("documents: 5-day grace, then inactive", () => {
  const today = new Date("2026-10-15");
  assert.equal(documentState({ expiresOn: "2026-10-13" }, today).state, "expired");
  assert.equal(documentState({ expiresOn: "2026-10-07" }, today).state, "lapsed");
  assert.equal(documentState({ expiresOn: "2026-10-07", renewalPending: true }, today).state, "renewal_pending");
  assert.equal(isInactive([{ expiresOn: "2026-10-07" }], today), true);
  assert.equal(isInactive([{ expiresOn: "2026-10-13" }], today), false);
});

test("plans: fees and seats", () => {
  assert.equal(marketplaceFee("starter", 10000, { fromMarketplace: true, customerBookedBefore: true }), 600);
  assert.equal(marketplaceFee("growth", 10000, { fromMarketplace: true, customerBookedBefore: true }), 0);
  assert.equal(marketplaceFee("team", 10000, { fromMarketplace: true, customerBookedBefore: false }), 250);
  assert.equal(marketplaceFee("team", 10000, { fromMarketplace: false, customerBookedBefore: false }), 0);
  assert.equal(monthlyCost("growth", 7), 2900 + 2 * 500);
});

test("payroll report ranges", () => {
  const w = reportRange("week", new Date("2026-10-15"));
  assert.equal(w.from.toISOString().slice(0, 10), "2026-10-12");
  const y = reportRange("year", new Date("2026-03-01"));
  assert.equal(y.from.toISOString().slice(0, 10), "2025-04-06");
});
