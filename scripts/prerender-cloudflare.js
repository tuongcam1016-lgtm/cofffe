const fs = require("fs");
const path = require("path");

const BASE = process.env.PRERENDER_BASE || "http://localhost:3001";
const OUT = path.join(process.cwd(), "public");
const routes = [
  "/",
  "/ca-phe/",
  "/smooth/",
  "/high-caffeine/",
  "/ca-phe-cold-brew/",
  "/san-pham/phan-bon-trichotec-phuc-hoi-dat-thoai-hoa-thoi-re-vang-la/",
  "/san-pham/phan-bon-1-80-1-tao-mam-hoa-chong-nghen-hoa/",
  "/san-pham/phan-bon-chong-be-gai-nut-trai-canxi-bo/",
  "/san-pham/sun-mite43sc-sach-nhen-mat-cay/",
  "/san-pham/sun-azocy-50wg-tru-benh-noi-hap-luu-dan/",
  "/san-pham/phan-bon-vi-luong-combi-gold-chelate/",
  "/san-pham/phan-bon-huu-co-nutri-green-dam-trung-sua/",
  "/san-pham/phan-bon-sieu-kich-dot-super-growth/",
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
