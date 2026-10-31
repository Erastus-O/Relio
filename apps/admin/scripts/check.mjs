// Syntax-checks every script in the order index.html loads them.
import { readFileSync } from "node:fs";
import vm from "node:vm";
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const files = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
let ok = true;
for (const f of files) {
  try { new vm.Script(readFileSync(new URL("../" + f, import.meta.url), "utf8"), { filename: f }); }
  catch (e) { ok = false; console.error(f, e.message); }
}
console.log(ok ? `All ${files.length} scripts parse.` : "Some scripts failed.");
process.exit(ok ? 0 : 1);
