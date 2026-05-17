const fs = require("fs");
const path = require("path");
const https = require("https");

const ORIGIN = "https://taynguyensoul.vn";
const OUT_FILE = path.join(__dirname, "..", "public", "product-details.json");
const REPORT_FILE = path.join(__dirname, "..", "data", "crawl-report.json");
const MAX_PRODUCTS = Number(process.env.MAX_PRODUCTS || 0);

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 TaynguyenSoul local clone auditor",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      timeout: 25000
    }, (response) => {
      if ([301, 302, 307, 308].includes(response.statusCode)) {
        response.resume();
        resolve(fetchText(new URL(response.headers.location, url).toString()));
        return;
      }
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => raw += chunk);
      response.on("end", () => {
        if (response.statusCode >= 400) {
          reject(new Error(`${response.statusCode} ${url}`));
          return;
        }
        resolve(raw);
      });
    });
    request.on("timeout", () => request.destroy(new Error(`Timeout ${url}`)));
    request.on("error", reject);
  });
}

function decode(value = "") {
  return String(value)
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .replace(/&#038;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\\u0026/g, "&");
}

function stripTags(value = "") {
  return decode(value.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function slugFromUrl(url) {
  return new URL(url).pathname.split("/").filter(Boolean).pop();
}

function normalizeImage(url) {
  const clean = decode(url).split("?")[0];
  return clean.replace(/-\d+x\d+(?=\.(?:png|jpe?g|webp)$)/i, "");
}

function mediaLabel(url, fallback) {
  const base = decodeURIComponent(url.split("/").pop().split("?")[0]).replace(/\.[a-z0-9]+$/i, "");
  return stripTags(base.replace(/[-_]+/g, " ")) || fallback;
}

function isUsefulImage(url) {
  const lower = url.toLowerCase();
  if (!/\/wp-content\/uploads\//.test(lower)) return false;
  if (/(favicon|logo|quote|icon|dmca|payment|top-customers|avatar|banner-giao-hang|facebook|youtube|zalo)/.test(lower)) return false;
  if (/-(50|64|80|96|100|120|150)x(50|64|80|96|100|120|150)\./.test(lower)) return false;
  return /\.(png|jpe?g|webp)$/i.test(lower);
}

function extractImages(html) {
  const urls = [];
  const imageRegex = /https:\/\/taynguyensoul\.vn\/wp-content\/uploads\/[^"'\s<>)\\]+?\.(?:png|jpe?g|webp)(?:\?[^"'\s<>)\\]*)?/gi;
  for (const match of html.matchAll(imageRegex)) {
    const image = normalizeImage(match[0]);
    if (isUsefulImage(image)) urls.push(image);
  }

  const seen = new Set();
  return urls
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .slice(0, 24)
    .map((url, index) => ({
      type: "image",
      src: url,
      thumb: url,
      label: mediaLabel(url, `Ảnh ${index + 1}`)
    }));
}

function youtubeEmbed(id) {
  return `https://www.youtube.com/embed/${id}`;
}

function extractVideos(html) {
  const decoded = decode(html);
  const videos = [];
  for (const match of decoded.matchAll(/youtube\.com\/(?:embed\/|watch\?v=|shorts\/)([A-Za-z0-9_-]{8,})/g)) {
    videos.push({
      type: "youtube",
      src: youtubeEmbed(match[1]),
      thumb: `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`,
      label: "Video sản phẩm"
    });
  }
  for (const match of decoded.matchAll(/https:\/\/[^"'\s<>)\\]+?\.(?:mp4|webm|mov)(?:\?[^"'\s<>)\\]*)?/gi)) {
    videos.push({
      type: "video",
      src: decode(match[0]),
      thumb: "",
      label: "Video sản phẩm"
    });
  }

  const seen = new Set();
  return videos.filter((video) => {
    if (seen.has(video.src)) return false;
    seen.add(video.src);
    return true;
  }).slice(0, 8);
}

function extractTitle(html, fallback) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return stripTags(h1[1]);
  const og = html.match(/property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  return og ? stripTags(og[1]) : fallback;
}

function productUrlsFromXml(xml) {
  return [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)]
    .map((match) => decode(match[1].trim()))
    .filter((url) => url.startsWith(`${ORIGIN}/san-pham/`));
}

async function sitemapProductUrls() {
  const candidates = [
    `${ORIGIN}/product-sitemap.xml`,
    `${ORIGIN}/product-sitemap1.xml`,
    `${ORIGIN}/sitemap_index.xml`,
    `${ORIGIN}/sitemap.xml`,
    `${ORIGIN}/wp-sitemap-posts-product-1.xml`
  ];
  const urls = new Set();
  const nested = new Set();

  for (const sitemap of candidates) {
    try {
      const xml = await fetchText(sitemap);
      productUrlsFromXml(xml).forEach((url) => urls.add(url));
      for (const match of xml.matchAll(/<loc>\s*([^<]+product[^<]+\.xml)\s*<\/loc>/gi)) {
        nested.add(decode(match[1].trim()));
      }
    } catch (error) {
      // Some sitemap names are optional.
    }
  }

  for (const sitemap of nested) {
    try {
      productUrlsFromXml(await fetchText(sitemap)).forEach((url) => urls.add(url));
    } catch (error) {
      // Keep crawling what we already found.
    }
  }

  if (!urls.size) {
    const home = await fetchText(ORIGIN);
    for (const match of home.matchAll(/https:\/\/taynguyensoul\.vn\/san-pham\/[^"'<>\s]+\/?/gi)) {
      urls.add(match[0].replace(/[?#].*$/, "").replace(/\/?$/, "/"));
    }
  }

  try {
    const inventoryPath = path.join(__dirname, "..", "data", "site-inventory.json");
    const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
    for (const url of inventory.byType?.product || []) urls.add(url);
  } catch (error) {
    // Inventory is optional; sitemap crawling is enough for standalone use.
  }

  return [...urls].sort();
}

async function main() {
  const productUrls = await sitemapProductUrls();
  const selectedUrls = MAX_PRODUCTS ? productUrls.slice(0, MAX_PRODUCTS) : productUrls;
  const products = {};
  const errors = [];

  for (let index = 0; index < selectedUrls.length; index += 1) {
    const url = selectedUrls[index];
    try {
      const html = await fetchText(url);
      const slug = slugFromUrl(url);
      const images = extractImages(html);
      const videos = extractVideos(html);
      const media = [...videos, ...images];
      products[slug] = {
        slug,
        url,
        title: extractTitle(html, slug),
        media,
        imageCount: images.length,
        videoCount: videos.length
      };
      process.stdout.write(`${index + 1}/${selectedUrls.length} ${slug} media=${media.length} videos=${videos.length}\n`);
    } catch (error) {
      errors.push({ url, error: error.message });
      process.stdout.write(`${index + 1}/${selectedUrls.length} ERROR ${url} ${error.message}\n`);
    }
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify({
    crawledAt: new Date().toISOString(),
    source: ORIGIN,
    productCount: Object.keys(products).length,
    products
  }, null, 2), "utf8");
  fs.writeFileSync(REPORT_FILE, JSON.stringify({
    crawledAt: new Date().toISOString(),
    attempted: selectedUrls.length,
    captured: Object.keys(products).length,
    errors
  }, null, 2), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
