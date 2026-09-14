import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";

const root = resolve("out");
const port = Number(process.env.PORT ?? 4173);
const contentTypes = { ".html": "text/html; charset=utf-8", ".txt": "text/plain; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2" };

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const route = pathname === "/" ? "index.html" : extname(pathname) ? pathname.slice(1) : `${pathname.replace(/^\//, "").replace(/\/$/, "")}.html`;
    const file = resolve(root, route);
    if (!file.startsWith(`${root}${sep}`)) {
      response.writeHead(403).end();
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": contentTypes[extname(file)] ?? "application/octet-stream" });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    response.end(await readFile(resolve(root, "404.html")));
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Static export: http://127.0.0.1:${port}`);
});
