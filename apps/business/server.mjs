// Small static server for local use. In production, host this folder on any static host.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.argv[2] || process.env.PORT || 4100);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg" };

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^[\\/]+/, "");
  if (!path || path.endsWith("/")) path += "index.html";
  if (path.split(/[\\/]/).includes("..")) { res.writeHead(400).end(); return; }
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { "Content-Type": types[extname(path)] || "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}).listen(port, () => console.log(`Open http://localhost:${port}`));
