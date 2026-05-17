const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const required = [
  "public/index.html",
  "public/_worker.js",
  "public/ca-phe/index.html",
  "public/gio-hang/index.html",
  "public/san-pham/ca-phe-rang-xay-nguyen-chat-signature/index.html",
  "public/san-pham/bo-may-pha-ca-phe-mini-soriso-quick-shot-qs-soriso-sg1/index.html",
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));

if (missing.length) {
  console.error("Cloudflare build is missing required files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("Cloudflare Pages build check passed. Output directory: public");
