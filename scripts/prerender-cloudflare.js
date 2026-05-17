const fs = require("fs");
const path = require("path");

const BASE = process.env.PRERENDER_BASE || "http://localhost:3001";
const OUT = path.join(process.cwd(), "public");
const routes = [
  "/ca-phe/",
  "/san-pham/ca-phe-rang-xay-nguyen-chat-signature/",
  "/san-pham/bo-may-pha-ca-phe-mini-soriso-quick-shot-qs-soriso-sg1/",
  "/gio-hang/"
];

function outputPath(route) {
  const clean = route.replace(/^\/+|\/+$/g, "");
  return path.join(OUT, clean, "index.html");
}

async function prerender(route) {
  const response = await fetch(`${BASE}${route}`);
  if (!response.ok) throw new Error(`${route} returned ${response.status}`);
  const html = await response.text();
  const file = outputPath(route);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html, "utf8");
  return { route, file, bytes: Buffer.byteLength(html) };
}

(async () => {
  const results = [];
  for (const route of routes) results.push(await prerender(route));
  console.log(JSON.stringify({ base: BASE, results }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
