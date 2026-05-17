const fs = require("fs");
const path = require("path");
const https = require("https");

const ORIGIN = "https://taynguyensoul.vn";
const OUT = path.join(__dirname, "..", "data", "site-inventory.json");

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, { headers: { "User-Agent": "Mozilla/5.0 clone inventory" }, timeout: 25000 }, (response) => {
      if ([301, 302, 307, 308].includes(response.statusCode)) {
        response.resume();
        resolve(fetchText(new URL(response.headers.location, url).toString()));
        return;
      }
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => body += chunk);
      response.on("end", () => resolve(body));
    });
    request.on("timeout", () => request.destroy(new Error(`Timeout ${url}`)));
    request.on("error", reject);
  });
}

function decode(value = "") {
  return String(value).replace(/&amp;/g, "&").replace(/&#038;/g, "&").replace(/\\\//g, "/");
}

function classify(url) {
  const pathname = new URL(url).pathname;
  if (pathname.startsWith("/san-pham/")) return "product";
  if (pathname.startsWith("/blog-ca-phe/")) return "blog";
  if (pathname.includes("chinh-sach") || pathname.includes("quy-trinh") || pathname.includes("thong-tin")) return "policy";
  if (pathname === "/gio-hang/" || pathname === "/tai-khoan/" || pathname === "/lien-he/" || pathname === "/hoi-dap/") return "commerce";
  if (pathname === "/ca-phe/" || pathname === "/smooth/" || pathname === "/high-caffeine/" || pathname === "/ca-phe-cold-brew/" || pathname === "/may-pha-ca-phe-cam-tay/" || pathname === "/dung-cu-pha-ca-phe/" || pathname === "/giftset-combo/") return "category";
  return "page";
}

async function main() {
  const sitemapCandidates = [
    `${ORIGIN}/sitemap_index.xml`,
    `${ORIGIN}/sitemap.xml`,
    `${ORIGIN}/page-sitemap.xml`,
    `${ORIGIN}/product-sitemap.xml`,
    `${ORIGIN}/product_cat-sitemap.xml`,
    `${ORIGIN}/category-sitemap.xml`,
    `${ORIGIN}/post-sitemap.xml`
  ];
  const urls = new Set([`${ORIGIN}/`]);
  const sitemapUrls = new Set();

  for (const sitemap of sitemapCandidates) {
    try {
      const xml = await fetchText(sitemap);
      for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
        const loc = decode(match[1].trim());
        if (loc.endsWith(".xml")) sitemapUrls.add(loc);
        else if (loc.startsWith(ORIGIN)) urls.add(loc);
      }
    } catch {}
  }

  for (const sitemap of sitemapUrls) {
    try {
      const xml = await fetchText(sitemap);
      for (const match of xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
        const loc = decode(match[1].trim());
        if (loc.startsWith(ORIGIN) && !loc.endsWith(".xml")) urls.add(loc);
      }
    } catch {}
  }

  const home = await fetchText(ORIGIN);
  for (const match of home.matchAll(/href=["'](https:\/\/taynguyensoul\.vn\/[^"']+|\/[^"']+)["']/gi)) {
    const href = decode(match[1]);
    const absolute = href.startsWith("http") ? href : new URL(href, ORIGIN).toString();
    if (absolute.startsWith(ORIGIN) && !/\.(jpg|png|webp|gif|svg|css|js|pdf)(\?|$)/i.test(absolute)) {
      urls.add(absolute.split("#")[0]);
    }
  }

  const all = [...urls].sort();
  const byType = {};
  for (const url of all) {
    const type = classify(url);
    byType[type] = byType[type] || [];
    byType[type].push(url);
  }

  const assetMatches = [...home.matchAll(/https:\/\/taynguyensoul\.vn\/wp-content\/uploads\/[^"'\s<>)]+/gi)].map((match) => decode(match[0]));
  const assets = [...new Set(assetMatches)];
  const components = [
    "top promo bar",
    "sticky centered-logo header",
    "dropdown/mega menu",
    "search icon and account/cart icons",
    "product cards with badges/rating/sold labels",
    "floating support buttons",
    "newsletter discount band",
    "footer contact/policy/social",
    "cart/checkout form",
    "product gallery with image/video thumbnails",
    "reviews/comments/related products"
  ];

  const report = {
    crawledAt: new Date().toISOString(),
    totalUrls: all.length,
    counts: Object.fromEntries(Object.entries(byType).map(([key, value]) => [key, value.length])),
    byType,
    homeAssets: {
      total: assets.length,
      images: assets.filter((url) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url)).length,
      videos: assets.filter((url) => /\.(mp4|webm|mov)(\?|$)/i.test(url)).length
    },
    components
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify({ totalUrls: report.totalUrls, counts: report.counts, homeAssets: report.homeAssets }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
