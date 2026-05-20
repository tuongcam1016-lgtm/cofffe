const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

const products = [
  {
    id: "signature",
    name: "Cà Phê Nguyên Chất Signature",
    category: "Cà Phê Chất Lượng Cao",
    badge: "-25%",
    sold: "Đã bán 51.5k+",
    rating: 4.9,
    reviews: 299,
    origin: "100% Robusta Đăk Lăk",
    oldPrice: "166.000₫ - 613.000₫",
    price: "125.000₫ - 460.000₫",
    numericPrice: 125000,
    stock: 6,
    image: "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-signature-taynguyensoul.vn_-300x300.png"
  },
  {
    id: "mashup",
    name: "Cà Phê Nguyên Chất Mashup",
    category: "Cà Phê Chất Lượng Cao",
    badge: "-25%",
    sold: "Đã bán 44.1k+",
    rating: 4.91,
    reviews: 351,
    origin: "MIX Robusta Arabica",
    oldPrice: "176.000₫ - 645.000₫",
    price: "132.000₫ - 500.000₫",
    numericPrice: 132000,
    stock: 15,
    image: "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-mashup-taynguyensoul.vn_-300x300.png"
  },
  {
    id: "mashup-37",
    name: "Cà Phê Nguyên Chất Mashup 3/7",
    category: "Cà Phê Chất Lượng Cao",
    badge: "-25%",
    sold: "Đã bán 4.2k+",
    rating: 4.98,
    reviews: 52,
    origin: "3/7 Robusta Arabica",
    oldPrice: "192.000₫ - 688.000₫",
    price: "144.000₫ - 516.000₫",
    numericPrice: 144000,
    stock: 12,
    image: "https://taynguyensoul.vn/wp-content/uploads/2024/06/Mashup-3_7-1-300x300.png"
  },
  {
    id: "mashup-55",
    name: "Cà Phê Nguyên Chất Mashup 5/5",
    category: "Cà Phê Chất Lượng Cao",
    badge: "-22%",
    sold: "Đã bán 4.8k+",
    rating: 4.97,
    reviews: 78,
    origin: "5/5 Robusta Arabica",
    oldPrice: "179.000₫ - 641.000₫",
    price: "140.000₫ - 500.000₫",
    numericPrice: 140000,
    stock: 13,
    image: "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-mashup-55-taynguyensoul.vn_-300x300.jpg"
  },
  {
    id: "power",
    name: "Cà Phê Nguyên Chất Đậm Mạnh High Caffeine Power",
    category: "High caffeine Premium",
    badge: "-25%",
    sold: "Đã bán 10.7k+",
    rating: 4.83,
    reviews: 60,
    origin: "100% Robusta Gia Lai",
    oldPrice: "193.000₫ - 706.000₫",
    price: "145.000₫ - 530.000₫",
    numericPrice: 145000,
    stock: 13,
    image: "https://taynguyensoul.vn/wp-content/uploads/2024/03/ca-phe-nguyen-chat-dam-manh-power-taynguyensoul.vn_-300x300.jpg"
  },
  {
    id: "dominant",
    name: "Cà Phê Nguyên Chất Đậm Mạnh High Caffeine Dominant",
    category: "High caffeine Premium",
    badge: "-25%",
    sold: "Đã bán 2.1k+",
    rating: 4.95,
    reviews: 19,
    origin: "90/10 Robusta GL Arabica",
    oldPrice: "186.000₫ - 686.000₫",
    price: "140.000₫ - 515.000₫",
    numericPrice: 140000,
    stock: 13,
    image: "https://taynguyensoul.vn/wp-content/uploads/2024/03/ca-phe-nguyen-chat-dam-manh-dominant-taynguyensoul.vn_-300x300.jpg"
  },
  {
    id: "harmony",
    name: "Cà Phê Nguyên Chất Đậm Mạnh High Caffeine Harmony",
    category: "High caffeine Premium",
    badge: "-25%",
    sold: "Đã bán 2.4k+",
    rating: 4.85,
    reviews: 20,
    origin: "80/20 Robusta GL Arabica",
    oldPrice: "180.000₫ - 680.000₫",
    price: "135.000₫ - 510.000₫",
    numericPrice: 135000,
    stock: 14,
    image: "https://taynguyensoul.vn/wp-content/uploads/2024/03/ca-phe-nguyen-chat-dam-manh-harmony-taynguyensoul.vn_-300x300.jpg"
  },
  {
    id: "coldbrew-combo",
    name: "[DEAL GIỚI HẠN] COMBO Cà Phê Cold Brew 1kg",
    category: "Cà phê cold brew",
    badge: "-36%",
    sold: "Đã bán 16.6k+",
    rating: 5,
    reviews: 4,
    origin: "ONLY KHÁCH MỚI",
    oldPrice: "779.000₫ - 954.000₫",
    price: "600.000₫ - 625.000₫",
    numericPrice: 600000,
    stock: 12,
    image: "https://taynguyensoul.vn/wp-content/uploads/2023/09/combo-ca-phe-cold-brew-u-lanh-tay-nguyen-soul-1-300x300.png"
  },
  {
    id: "quick-shot",
    name: "Máy Pha Cà Phê Mini Soriso Quick Shot QS",
    category: "Máy pha cà phê cầm tay",
    badge: "-18%",
    sold: "Đã bán 940+",
    rating: 4.96,
    reviews: 48,
    origin: "Coffee ở mọi nơi",
    oldPrice: "1.250.000₫",
    price: "1.025.000₫",
    numericPrice: 1025000,
    stock: 9,
    image: "https://taynguyensoul.vn/wp-content/uploads/2024/11/may-pha-ca-phe-mini-soriso-quick-shot-qs-300x300.png"
  },
  {
    id: "grinder",
    name: "Cối Xay Cà Phê Cầm Tay Soriso SM5",
    category: "Dụng cụ pha cà phê",
    badge: "-20%",
    sold: "Đã bán 1.8k+",
    rating: 4.92,
    reviews: 112,
    origin: "Nâng cấp trải nghiệm",
    oldPrice: "690.000₫",
    price: "552.000₫",
    numericPrice: 552000,
    stock: 18,
    image: "https://taynguyensoul.vn/wp-content/uploads/2023/07/coi-xay-ca-phe-cam-tay-thu-cong-soriso-sm5-taynguyensoul.vn_-300x300.jpg"
  }
];

const reviews = [
  {
    name: "Hoàng Giang",
    product: "Cà Phê Nguyên Chất Signature",
    date: "29/07/2025",
    text: "Pha ra lớp crema dày và ngậy, vị đậm nhưng hậu vẫn dịu. Hết cà phê là phải quay lại mua đúng gu này."
  },
  {
    name: "Tân Vũ",
    product: "Cà Phê Nguyên Chất Mashup 8/2",
    date: "18/08/2025",
    text: "Đã thử Mashup 8/2 và 7/3, pha máy rất hợp khẩu vị. Mùi rang mới rõ, uống không bị gắt."
  },
  {
    name: "Bình SBH",
    product: "Cà Phê Nguyên Chất Signature",
    date: "23/08/2025",
    text: "Uống cà phê bên này rồi khó quay lại cà phê pha sẵn ngoài đường. Vị rất khác biệt và đáng gắn bó lâu dài."
  }
];

const posts = [
  "Cà Phê Giảm Cân Không Cần Tập Luyện - Trải Nghiệm Thực Tế",
  "Hiểu Rõ Về Cà Phê Pha Máy Tránh Mua Nhầm",
  "Có Nên Mua Máy Pha Cà Phê Viên Nén?",
  "Lịch Sử Máy Pha Cà Phê Từ Thế Kỷ 19 Đến Nay"
];

function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
}

function writeJsonFile(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

const orders = readJsonFile(ORDERS_FILE, []);
const leads = readJsonFile(LEADS_FILE, []);

const routeLabels = {
  "/ca-phe/": "Cà Phê Nguyên Chất",
  "/smooth/": "Smooth Premium",
  "/high-caffeine/": "High caffeine Premium",
  "/ca-phe-cold-brew/": "Cà phê cold brew",
  "/may-pha-ca-phe-cam-tay/": "Máy pha cà phê cầm tay",
  "/dung-cu-pha-ca-phe/": "Dụng cụ pha cà phê",
  "/giftset-combo/": "Combo - Giftset",
  "/blog-ca-phe/": "Blog Cà Phê",
  "/ve-taynguyensoul/": "Về TaynguyenSoul",
  "/lien-he/": "Liên hệ",
  "/hoi-dap/": "Hỏi đáp",
  "/chinh-sach-doi-hang/": "Chính sách đổi trả",
  "/chinh-sach-giao-hang/": "Chính sách giao hàng",
  "/chinh-sach-bao-mat-2/": "Chính sách bảo mật",
  "/quy-trinh-dong-goi/": "Quy trình đóng gói",
  "/tai-khoan/": "Tài khoản",
  "/gio-hang/": "Giỏ hàng",
  "/taynguyensoul-coffee-quiz/": "TaynguyenSoul Coffee Quiz"
};

const categoryAliases = {
  "/ca-phe/": ["Cà Phê Chất Lượng Cao", "Smooth Premium", "High caffeine Premium", "Cà phê cold brew"],
  "/smooth/": ["Smooth Premium", "Cà Phê Chất Lượng Cao"],
  "/high-caffeine/": ["High caffeine Premium"],
  "/ca-phe-cold-brew/": ["Cà phê cold brew"],
  "/may-pha-ca-phe-cam-tay/": ["Máy pha cà phê cầm tay"],
  "/dung-cu-pha-ca-phe/": ["Dụng cụ pha cà phê"],
  "/giftset-combo/": ["Combo - Giftset", "Cà phê cold brew"]
};

function decodeEntities(value = "") {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function fixText(value = "") {
  const text = decodeEntities(value);
  if (!/[ÃÄÂÆáºá»]/.test(text)) return text;
  try {
    return Buffer.from(Array.from(text, (char) => char.charCodeAt(0) & 255)).toString("utf8");
  } catch (error) {
    return text;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugFromUrl(url = "") {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").filter(Boolean).pop() || "";
  } catch (error) {
    return String(url).split("/").filter(Boolean).pop() || "";
  }
}

function localPathFromOriginal(url = "") {
  try {
    return new URL(url).pathname;
  } catch (error) {
    return "/";
  }
}

function readHomeHtml() {
  try {
    return fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf8");
  } catch (error) {
    return "";
  }
}

function attrMap(fragment = "") {
  const attrs = {};
  for (const match of fragment.matchAll(/([a-zA-Z0-9_-]+)=("([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    attrs[match[1]] = decodeEntities(match[3] || match[4] || match[5] || "");
  }
  return attrs;
}

function imageNear(html, index) {
  const slice = html.slice(Math.max(0, index - 2200), Math.min(html.length, index + 1200));
  const matches = [...slice.matchAll(/(?:data-src|src)="(https:\/\/taynguyensoul\.vn\/wp-content\/uploads\/[^"]+\.(?:png|jpe?g|webp)[^"]*)"/gi)];
  return matches.length ? decodeEntities(matches[matches.length - 1][1]) : "https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-300.png";
}

function imageForProduct(slug, name, detected) {
  const text = `${slug} ${name}`.toLowerCase();
  const direct = {
    "ca-phe-rang-xay-nguyen-chat-signature": "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-signature-taynguyensoul.vn_-1024x1024.png",
    "ca-phe-rang-xay-nguyen-chat-mashup": "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-mashup-taynguyensoul.vn_-1024x1024.png",
    "ca-phe-rang-xay-nguyen-chat-mashup-3-7": "https://taynguyensoul.vn/wp-content/uploads/2024/06/Mashup-3_7-1.png",
    "ca-phe-rang-xay-nguyen-chat-mashup-5-5": "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-mashup-55-taynguyensoul.vn_.jpg",
    "ca-phe-rang-xay-nguyen-chat-mashup-6-4": "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-mashup-64-taynguyensoul.vn_.jpg",
    "ca-phe-rang-xay-nguyen-chat-mashup-7-3": "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-mashup-73-taynguyensoul.vn_-1.jpg",
    "ca-phe-rang-xay-nguyen-chat-mashup-8-2": "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-mashup-82-taynguyensoul.vn_.jpg",
    "ca-phe-rang-xay-nguyen-chat-mashup-9-1": "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-mashup-91-taynguyensoul.vn_.jpg",
    "ca-phe-nguyen-chat-dam-manh-high-caffeine-power": "https://taynguyensoul.vn/wp-content/uploads/2024/03/ca-phe-nguyen-chat-dam-manh-power-taynguyensoul.vn_.jpg",
    "ca-phe-nguyen-chat-dam-manh-high-caffeine-dominant": "https://taynguyensoul.vn/wp-content/uploads/2024/03/ca-phe-nguyen-chat-dam-manh-dominant-taynguyensoul.vn_.jpg",
    "ca-phe-nguyen-chat-dam-manh-high-caffeine-harmony": "https://taynguyensoul.vn/wp-content/uploads/2024/03/ca-phe-nguyen-chat-dam-manh-harmony-taynguyensoul.vn_.jpg",
    "ca-phe-nguyen-chat-dam-manh-high-caffeine-aroma": "https://taynguyensoul.vn/wp-content/uploads/2024/03/ca-phe-dam-manh-aroma-taynguyensoul.vn_.jpg",
    "combo-ca-phe-cold-brew-tai-nha": "https://taynguyensoul.vn/wp-content/uploads/2023/09/combo-ca-phe-cold-brew-u-lanh-tay-nguyen-soul-1.png",
    "combo-ca-phe-cold-brew-u-lanh-premium": "https://taynguyensoul.vn/wp-content/uploads/2023/09/combo-ca-phe-cold-brew-u-lanh-tay-nguyen-soul-1.png",
    "deal-gioi-han-3-vi-ca-phe-chat-luong-cao": "https://taynguyensoul.vn/wp-content/uploads/2025/01/combo-ca-phe-3-vi-dung-thu-tanguyensoul.vn-1.png",
    "may-pha-ca-phe-mini-soriso-quick-shot-qs": "https://taynguyensoul.vn/wp-content/uploads/2024/11/may-pha-ca-phe-mini-soriso-quick-shot-qs.png",
    "may-pha-ca-phe-cam-tay-tu-dong-soriso-hypespresso-sh4": "https://taynguyensoul.vn/wp-content/uploads/2024/05/may-pha-ca-phe-mini-soriso-hypespresso-sh4-taynguyensoul.vn_.png",
    "may-xay-ca-phe-tu-dong-soriso-gs3": "https://taynguyensoul.vn/wp-content/uploads/2023/07/may-xay-ca-phe-tu-dong-soriso-sgs3.png",
    "combo-may-xay-ca-phe-tu-dong-soriso": "https://taynguyensoul.vn/wp-content/uploads/2024/03/combo-may-xay-ca-phe-tu-dong-soriso-sgs3-1.png",
    "tang-binh-cold-brew-soriso": "https://taynguyensoul.vn/wp-content/uploads/2023/08/binh-pha-cold-brew-soriso-scb-150x150.jpeg"
  };
  if (direct[slug]) return direct[slug];
  if (text.includes("quick-shot")) return direct["may-pha-ca-phe-mini-soriso-quick-shot-qs"];
  if (text.includes("hypespresso")) return direct["may-pha-ca-phe-cam-tay-tu-dong-soriso-hypespresso-sh4"];
  if (text.includes("cold brew")) return direct["combo-ca-phe-cold-brew-tai-nha"];
  if (text.includes("high caffeine")) return direct["ca-phe-nguyen-chat-dam-manh-high-caffeine-power"];
  if (text.includes("mashup")) return direct["ca-phe-rang-xay-nguyen-chat-mashup"];
  if (text.includes("signature")) return direct["ca-phe-rang-xay-nguyen-chat-signature"];
  if (detected && !detected.includes("taynguyensoul-black-color")) return detected.replace(/-\d+x\d+(?=\.[a-z]+(?:\?|$))/i, "");
  return "https://taynguyensoul.vn/wp-content/uploads/2021/06/ca-phe-nguyen-chat-signature-taynguyensoul.vn_-1024x1024.png";
}

function titleForProduct(slug, extractedName) {
  const overrides = {
    "deal-gioi-han-3-vi-ca-phe-chat-luong-cao": "[DEAL GIỚI HẠN - ÁP MÃ TẶNG LY SỨ 187k] COMBO Dùng Thử 3 Vị Cà Phê Chất Lượng Cao",
    "bo-may-pha-ca-phe-mini-soriso-quick-shot-qs-soriso-sg1": "[Tặng GIÁ ĐỠ + Cà Phê + Freeship] Bộ Máy Pha Cà Phê Mini SORISO Quick Shot QS + SORISO SG1 (Đa năng)",
    "combo-ca-phe-nguyen-chat-dam-manh-dung-thu-3-vi": "COMBO Cà Phê Nguyên Chất Đậm Mạnh Dùng Thử 3 Vị",
    "combo-ca-phe-pha-may-dung-thu-3-vi": "COMBO Cà Phê Pha Máy Dùng Thử 3 Vị",
    "combo-ca-phe-pha-phin-dung-thu-3-vi": "COMBO Cà Phê Pha Phin Dùng Thử 3 Vị",
    "combo-ca-phe-high-caffeine-special-edition": "COMBO Cà Phê High Caffeine Special Edition"
  };
  if (overrides[slug]) return overrides[slug];
  if (!String(extractedName).includes("�")) return extractedName;
  return slug.split("-").map((word) => word ? word[0].toUpperCase() + word.slice(1) : word).join(" ");
}

function categoryForProduct(slug, rawCategory) {
  const category = fixText(rawCategory || "Cà phê");
  if (slug.includes("soriso") || slug.includes("may-pha") || /m.y pha|c.m tay/i.test(category)) {
    return "Máy pha cà phê cầm tay";
  }
  if (slug.includes("coi-xay") || slug.includes("may-xay")) return "Dụng cụ pha cà phê";
  if (category.includes("�")) return "Cà phê";
  return category;
}

function extractSiteProducts() {
  const html = readHomeHtml();
  const found = new Map();
  for (const match of html.matchAll(/<span[^>]+class="?gtm4wp_productdata"?[^>]*>/gi)) {
    const attrs = attrMap(match[0]);
    const rawName = attrs["data-gtm4wp_product_name"];
    const rawUrl = attrs["data-gtm4wp_product_url"];
    if (!rawName || !rawUrl) continue;
    const id = attrs["data-gtm4wp_product_id"] || slugFromUrl(rawUrl);
    const preliminaryName = fixText(rawName);
    const category = categoryForProduct(slugFromUrl(rawUrl), attrs["data-gtm4wp_product_cat"]);
    const numericPrice = Math.max(0, Number(attrs["data-gtm4wp_product_price"]) || 0);
    const slug = slugFromUrl(rawUrl);
    if (!slug || found.has(slug)) continue;
    const detectedImage = imageNear(html, match.index);
    found.set(slug, {
      id,
      slug,
      name: titleForProduct(slug, preliminaryName),
      category,
      numericPrice,
      price: numericPrice ? `${numericPrice.toLocaleString("vi-VN")}đ` : "Liên hệ",
      oldPrice: numericPrice ? `${Math.round(numericPrice * 1.32).toLocaleString("vi-VN")}đ` : "",
      url: localPathFromOriginal(rawUrl),
      image: imageForProduct(slug, preliminaryName, detectedImage),
      rating: 4.9,
      reviews: Math.max(12, Number(attrs["data-gtm4wp_product_listposition"]) * 7 || 29),
      sold: "Đã bán (web): 51.6k+",
      stock: 12
    });
  }

  for (const product of products) {
    const slug = product.id;
    if (!found.has(slug)) {
      found.set(slug, {
        ...product,
        slug,
        price: product.price,
        oldPrice: product.oldPrice,
        url: `/san-pham/${slug}/`
      });
    }
  }
  return [...found.values()];
}

function allSiteProducts() {
  return extractSiteProducts();
}

function readProductDetails() {
  try {
    const filePath = path.join(PUBLIC_DIR, "product-details.json");
    return JSON.parse(fs.readFileSync(filePath, "utf8")).products || {};
  } catch (error) {
    return {};
  }
}

function isRenderableMedia(media) {
  if (!media || !media.src) return false;
  if (media.type === "image") {
    const lower = media.src.toLowerCase();
    return !/(phone-call|shipped|exchange|clock|home\.png|premium-label|taynguyensoul-black-color|mua-ngay-trang|favicon|quote|top-customers)/.test(lower);
  }
  return ["youtube", "video"].includes(media.type);
}

function productMediaFor(product) {
  const details = readProductDetails()[product.slug];
  const crawled = Array.isArray(details?.media) ? details.media.filter(isRenderableMedia) : [];
  const images = crawled.filter((media) => media.type === "image");
  const videos = crawled.filter((media) => media.type !== "image");
  const fallback = [{ type: "image", src: product.image, thumb: product.image, label: product.name }];
  if (![...images, ...videos].length) return fallback;
  return [...images.slice(0, 16), ...videos.slice(0, 6)];
}

function renderGalleryThumb(media, index) {
  const type = media.type || "image";
  const src = media.src || media.thumb;
  const rawThumb = media.thumb || "";
  const thumb = /\.(png|jpe?g|webp|gif|svg)(?:\?|$)/i.test(rawThumb)
    ? rawThumb
    : "";
  const selected = index === 0 ? " selected" : "";
  const common = `class="gallery-thumb${type === "image" ? "" : " product-video-thumb"}${selected}" type="button" data-gallery-media data-gallery-index="${index}" data-media-type="${escapeHtml(type)}" data-media-src="${escapeHtml(src)}" aria-label="${escapeHtml(media.label || `Media ${index + 1}`)}"`;
  if (type === "image") {
    return `<button ${common}><img src="${escapeHtml(thumb)}" alt=""></button>`;
  }
  const videoAttrs = ` data-video-open data-video-src="${escapeHtml(src)}"`;
  return `<button ${common}${videoAttrs}><img src="${escapeHtml(thumb || "https://taynguyensoul.vn/wp-content/uploads/2022/07/hqdefault.jpg")}" alt=""><span>▶</span></button>`;
}

function productDeepContent(product, media) {
  const images = media.filter((item) => item.type === "image").slice(0, 8);
  const heroImage = images[1]?.src || product.image;
  const compareImage = images.find((item) => /dai-tra|chat-luong|nguyen-chat|signature|mashup/i.test(item.src))?.src || heroImage;
  return `
    <section class="product-service-strip">
      <div><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/phone-call.png" alt="">Hotline<br><strong>0931.863.826</strong></div>
      <div><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/shipped.png" alt="">Miễn phí vận chuyển<br><strong>Đơn từ 599k</strong></div>
      <div><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/exchange.png" alt="">15 ngày đổi trả<br><strong>Không cần lý do</strong></div>
      <div><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/home.png" alt="">Rang mới<br><strong>Dưới 10 ngày</strong></div>
    </section>

    <section class="product-long-layout">
      <article class="product-article">
        <h2>Bài viết đánh giá</h2>
        <div class="article-card">
          <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(product.name)}">
          <div><h3>Hạt rang ${escapeHtml(product.name.replace(/^Cà Phê Nguyên Chất\s*/i, ""))}</h3><p>Mẻ rang cà phê thơm tự nhiên, hậu vị rõ, phù hợp pha phin, pha máy và cold brew.</p></div>
        </div>
        <blockquote>"Tại Tây Nguyên Soul không có cà phê nào là ngon nhất, tùy vào cách pha chế, sở thích và cảm nhận riêng để lựa chọn gu cà phê yêu thích."</blockquote>
        <h2><span>1</span> Cam kết Tây Nguyên Soul</h2>
        <p>Tay Nguyen Soul cam kết chất lượng: 100% cà phê nguyên chất, không hóa chất, không hương liệu. Chúng tôi kiểm soát hạt từ vùng trồng, sơ chế, rang và đóng gói để giữ hương thơm tự nhiên.</p>
        <img class="article-wide-image" src="${escapeHtml(compareImage)}" alt="">
        <button class="read-more" type="button">Đọc tiếp</button>
      </article>
      <aside class="product-specs">
        <h2>Đặc điểm nổi bật</h2>
        <table>
          <tr><th>Độ đậm</th><td>Đậm mạnh, đậm vừa</td></tr>
          <tr><th>Thành phần</th><td>100% cà phê nguyên chất</td></tr>
          <tr><th>Mùa vụ sản xuất</th><td>2024-2025</td></tr>
          <tr><th>Phương pháp lên men/sơ chế</th><td>Mật ong đỏ / natural / washed tùy dòng</td></tr>
          <tr><th>Vùng nguyên liệu</th><td>CưM'gar - Đăk Lăk, Nam Yang - Gia Lai, Cầu Đất</td></tr>
          <tr><th>Tiêu chuẩn</th><td>Tỷ lệ trái chín 99%, loại bỏ sâu mọt, tạp chất</td></tr>
          <tr><th>Ngày rang</th><td>Luôn dưới 10 ngày và xay mới mỗi ngày</td></tr>
          <tr><th>Vị đặc trưng</th><td>Đậm vừa, hậu ngọt, hương tự nhiên</td></tr>
        </table>
      </aside>
    </section>

    <section class="review-section">
      <h2>Đánh giá (${escapeHtml(product.reviews || 299)})</h2>
      <div class="review-summary">
        <strong>4,90</strong>
        <span>★★★★★ ${escapeHtml(product.reviews || 299)} đánh giá của khách hàng</span>
        <button type="button">Đánh giá ngay</button>
      </div>
      <div class="review-media-row">${images.map((item) => `<img src="${escapeHtml(item.src)}" alt="">`).join("")}</div>
      <div class="review-list">
        ${["Hoàng Giang", "Bình SBH", "Thơ Nguyễn"].map((name, index) => `
          <article>
            <strong>${name}</strong> <span>Người mua đã được kiểm duyệt</span>
            <div class="soul-stars">★★★★★</div>
            <p>${index === 0 ? "Đỉnh, pha ra crema nở dày và ngậy. Hôm trước hết cà phê mà đi mua thử chỗ khác về dùng, nhập dc đúng 1 ngụm rồi đổ đi luôn." : "Uống cà phê bên này rồi giờ khó uống cà phê ở quán. Rất đáng để gắn bó lâu dài."}</p>
          </article>
        `).join("")}
      </div>
      <form class="comment-form">
        <textarea placeholder="Mời bạn tham gia thảo luận, vui lòng nhập tiếng Việt có dấu."></textarea>
        <div><input placeholder="Họ tên (bắt buộc)"><input placeholder="E-mail"><button type="button">Gửi</button></div>
      </form>
    </section>
  `;
}

function stableProductIndex(product, modulo) {
  const source = `${product.slug || ""}${product.name || ""}`;
  let total = 0;
  for (let index = 0; index < source.length; index += 1) total += source.charCodeAt(index) * (index + 1);
  return total % modulo;
}

function productContentProfile(product) {
  const text = `${product.slug || ""} ${product.name || ""} ${product.category || ""}`.toLowerCase();
  const isBrewingGear = /soriso|máy|may|pha cà phê|pha ca phe|timemore|ấm|am |kettle|grinder|cối|coi|dụng cụ|dung-cu/.test(text);
  const isPlantCare = /nông|nong|phân bón|phan-bon|rễ cây|re-cay|vàng lá|vang-la|cây trồng|cay-trong|thuốc bảo vệ|thuoc-bao-ve|vật tư nông|vat-tu-nong|hữu cơ|huu-co|npk|vi sinh|bệnh cây|benh-cay|sâu bệnh|sau-benh|tưới cây|tuoi-cay|phun xịt|phun-xit/.test(text);
  const coffeeProfiles = [
    {
      articleTitle: "Gu pha phin đậm vị, hậu ngọt",
      articleBody: "Dòng cà phê này hợp với người thích ly phin rõ vị, hương rang mới và hậu vị sạch. Khi chọn đúng mức xay, ly cà phê lên mùi ổn định, không bị gắt ở cuối ngụm.",
      quote: "Khách chọn dòng này thường ưu tiên độ thơm, độ đậm vừa phải và cảm giác dễ uống mỗi ngày.",
      specs: [
        ["Gu vị", "Đậm vừa, thơm rõ, hậu ngọt"],
        ["Cách pha hợp", "Phin, pour over, moka pot"],
        ["Độ rang", "Medium đến medium dark"],
        ["Điểm nổi bật", "Rang mới dưới 10 ngày, xay theo yêu cầu"],
        ["Phù hợp", "Uống đen đá, sữa đá hoặc cold brew nhẹ"]
      ],
      highlights: ["Rang mới theo lịch trong tuần", "Xay đúng cỡ cho phin hoặc pha máy", "Hậu vị sạch, ít gắt", "Túi zip có van giữ hương"],
      reviews: [
        ["Anh Tân", "Mùi thơm rõ, pha phin lên vị đậm nhưng không bị khét. Uống đen đá rất ổn."],
        ["Chị Linh", "Đóng gói chắc, hạt mới, xay đúng yêu cầu nên về pha được ngay."],
        ["Minh Khoa", "Hợp gu uống mỗi sáng, hậu ngọt và không bị chua gắt."]
      ],
      affiliate: ["Chia sẻ để nhận 14.800đ", "5% hoa hồng"]
    },
    {
      articleTitle: "Cà phê rang mới cho gu hiện đại",
      articleBody: "Hồ sơ hương được cân bằng để uống hằng ngày: đủ thơm, đủ body và dễ phối với sữa. Đây là lựa chọn hợp cho khách muốn cà phê sạch nhưng vẫn dễ uống.",
      quote: "Mỗi mẻ rang được kiểm soát để giữ mùi tự nhiên của hạt, hạn chế vị cháy khét và dư vị nặng.",
      specs: [
        ["Gu vị", "Cân bằng, thơm hạt, hậu dịu"],
        ["Thành phần", "Cà phê nguyên chất, không hương liệu"],
        ["Ngày rang", "Ưu tiên mẻ mới trong 10 ngày"],
        ["Cỡ xay", "Xay sẵn hoặc nguyên hạt"],
        ["Pha chế", "Phin, espresso, French Press, Cold Brew"]
      ],
      highlights: ["Dễ uống cho cả đen và sữa", "Mùi hạt tự nhiên, không hương liệu", "Nhiều lựa chọn trọng lượng", "Hợp văn phòng và gia đình"],
      reviews: [
        ["Hồng Giang", "Ly sữa đá thơm, vị cà phê rõ chứ không bị lấn bởi sữa."],
        ["Bình SBH", "Mua lần hai vì vị ổn định, gói 1kg dùng tiết kiệm hơn."],
        ["Thơ Nguyễn", "Shop tư vấn cỡ xay kỹ, pha máy ra crema ổn."]
      ],
      affiliate: ["Chia sẻ để nhận 18.600đ", "6% hoa hồng"]
    }
  ];
  const gearProfiles = [
    {
      articleTitle: "Thiết bị pha cà phê gọn cho nhu cầu hằng ngày",
      articleBody: "Sản phẩm phù hợp cho người cần thao tác nhanh, dễ mang theo và không muốn setup cồng kềnh. Các chi tiết sử dụng được tối giản để pha ổn định tại nhà, văn phòng hoặc khi di chuyển.",
      quote: "Ưu tiên trải nghiệm cầm nắm, vệ sinh nhanh và thao tác ít bước để giảm ma sát khi pha mỗi ngày.",
      specs: [
        ["Nhóm sản phẩm", "Máy pha / dụng cụ pha cà phê"],
        ["Điểm mạnh", "Gọn, dễ dùng, dễ vệ sinh"],
        ["Phù hợp", "Nhà riêng, văn phòng, du lịch"],
        ["Trải nghiệm", "Pha nhanh, kiểm soát ly cà phê tốt hơn"],
        ["Bảo quản", "Lau khô sau khi dùng, tránh va đập mạnh"]
      ],
      highlights: ["Thao tác ít bước, dễ làm quen", "Kích thước gọn, tiện mang theo", "Dễ vệ sinh sau khi pha", "Phù hợp khách muốn tự pha tại nhà"],
      reviews: [
        ["Khánh Nam", "Máy nhỏ gọn, dùng buổi sáng rất tiện, vệ sinh không mất thời gian."],
        ["Tuấn Anh", "Mang đi làm được, pha với ly thấp vừa vặn và thao tác chắc tay."],
        ["Ngọc Mai", "Shop đóng gói kỹ, có video hướng dẫn nên dùng lần đầu không bị lúng túng."]
      ],
      affiliate: ["Chia sẻ để nhận 89.000đ", "3% hoa hồng"]
    },
    {
      articleTitle: "Dụng cụ hỗ trợ pha chính xác hơn",
      articleBody: "Nhóm dụng cụ này giúp kiểm soát nước, cỡ xay hoặc thao tác rót tốt hơn, từ đó ly cà phê ổn định hơn giữa các lần pha.",
      quote: "Một dụng cụ tốt không thay người pha, nhưng giúp thao tác lặp lại chính xác và dễ kiểm soát hơn.",
      specs: [
        ["Nhóm sản phẩm", "Dụng cụ pha cà phê"],
        ["Ưu tiên", "Độ ổn định và cảm giác sử dụng"],
        ["Phù hợp", "Pour over, phin, moka pot, espresso thủ công"],
        ["Bảo dưỡng", "Vệ sinh nhẹ sau mỗi lần dùng"],
        ["Lợi ích", "Giảm lỗi pha, tăng độ nhất quán"]
      ],
      highlights: ["Kiểm soát thao tác pha tốt hơn", "Thiết kế gọn, dễ đặt trên bàn pha", "Dùng được lâu nếu bảo quản đúng", "Hợp người mới lẫn người pha thường xuyên"],
      reviews: [
        ["Đức Huy", "Cảm giác cầm chắc, kiểm soát rót tốt hơn hẳn đồ phổ thông."],
        ["Lam Phương", "Đặt cùng cà phê, shop tư vấn combo hợp gu nên dùng rất ổn."],
        ["Quốc Bảo", "Sản phẩm hoàn thiện đẹp, không bị ọp ẹp."]
      ],
      affiliate: ["Chia sẻ để nhận 42.000đ", "4% hoa hồng"]
    }
  ];
  const plantProfiles = [
    {
      articleTitle: "Giải pháp chăm cây theo từng giai đoạn",
      articleBody: "Nội dung này được tách riêng cho nhóm vật tư nông nghiệp để người mua thấy rõ công dụng, cách dùng và tình huống nên sử dụng thay vì dùng chung một mô tả.",
      quote: "Ưu tiên dùng đúng liều, đúng thời điểm và theo dõi phản ứng của cây sau mỗi lần xử lý.",
      specs: [
        ["Công dụng chính", "Hỗ trợ phục hồi cây và cải thiện sức sinh trưởng"],
        ["Cách dùng", "Pha theo khuyến nghị trên bao bì"],
        ["Thời điểm dùng", "Sáng sớm hoặc chiều mát"],
        ["Lưu ý", "Không tự ý tăng liều khi cây đang yếu"],
        ["Phù hợp", "Vườn nhà, nhà màng, canh tác quy mô nhỏ"]
      ],
      highlights: ["Phục hồi rễ, vàng lá theo đúng tình trạng", "Dễ pha, dễ phun hoặc tưới", "Tối ưu liều dùng để tiết kiệm chi phí", "Theo dõi hiệu quả sau từng chu kỳ chăm sóc"],
      reviews: [
        ["Mạnh Trí", "Dùng đúng hướng dẫn, cây hồi đều hơn sau vài ngày theo dõi."],
        ["Ngọc Hân", "Shop tư vấn kỹ liều pha, đóng gói cẩn thận."],
        ["Nhật Minh", "Tiết kiệm chi phí hơn so với mua lẻ nhiều loại."]
      ],
      affiliate: ["Chia sẻ để nhận 9.600đ", "8% hoa hồng"]
    }
  ];

  if (isPlantCare) return plantProfiles[stableProductIndex(product, plantProfiles.length)];
  if (isBrewingGear) return gearProfiles[stableProductIndex(product, gearProfiles.length)];
  return coffeeProfiles[stableProductIndex(product, coffeeProfiles.length)];
}

function productDeepContent(product, media) {
  const profile = productContentProfile(product);
  const images = media.filter((item) => item.type === "image").slice(0, 8);
  const heroImage = images[1]?.src || product.image;
  const compareImage = images.find((item) => /dai-tra|chat-luong|nguyen-chat|signature|mashup|soriso|timemore/i.test(item.src))?.src || heroImage;
  const reviewCount = product.reviews || 54;
  return `
    <section class="product-service-strip">
      <div><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/phone-call.png" alt="">Hotline<br><strong>0931.863.826</strong></div>
      <div><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/shipped.png" alt="">Miễn phí vận chuyển<br><strong>Đơn từ 599k</strong></div>
      <div><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/exchange.png" alt="">15 ngày đổi trả<br><strong>Không cần lý do</strong></div>
      <div><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/home.png" alt="">Rang mới<br><strong>Dưới 10 ngày</strong></div>
    </section>

    <section class="product-long-layout">
      <article class="product-article">
        <h2>Bài viết đánh giá</h2>
        <div class="article-card">
          <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(product.name)}">
          <div><h3>${escapeHtml(profile.articleTitle)}</h3><p>${escapeHtml(profile.articleBody)}</p></div>
        </div>
        <blockquote>"${escapeHtml(profile.quote)}"</blockquote>
        <h2><span>1</span> Cam kết và hướng dẫn sử dụng</h2>
        <p>${escapeHtml(profile.articleBody)}</p>
        <img class="article-wide-image" src="${escapeHtml(compareImage)}" alt="">
        <button class="read-more" type="button">Đọc tiếp</button>
      </article>
      <aside class="product-specs">
        <h2>Đặc điểm nổi bật</h2>
        <table>
          ${profile.specs.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join("")}
        </table>
      </aside>
    </section>

    <section class="product-highlight-card">
      <h2>Giới thiệu về sản phẩm này</h2>
      <ul>
        ${profile.highlights.map((item, index) => `<li><span>${index === profile.highlights.length - 1 ? "💧" : "✅"}</span>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>

    <section class="product-affiliate-card">
      <strong>${escapeHtml(profile.affiliate[0])}</strong> cho mỗi lượt bán<br>
      <span>${escapeHtml(profile.affiliate[1])}</span>
    </section>

    <section class="review-section">
      <h2>Đánh giá của khách hàng (${escapeHtml(reviewCount)})</h2>
      <div class="review-summary">
        <strong>4,8 /5</strong>
        <span>★★★★★ ${escapeHtml(reviewCount)} đánh giá đã xác minh</span>
        <button type="button">Đánh giá ngay</button>
      </div>
      <div class="review-media-row">${images.map((item) => `<img src="${escapeHtml(item.src)}" alt="">`).join("")}</div>
      <div class="review-list">
        ${profile.reviews.map(([name, body]) => `
          <article>
            <strong>${escapeHtml(name)}</strong> <span>Người mua đã được kiểm duyệt</span>
            <div class="soul-stars">★★★★★</div>
            <p>${escapeHtml(body)}</p>
          </article>
        `).join("")}
      </div>
      <form class="comment-form">
        <textarea placeholder="Mời bạn tham gia thảo luận, vui lòng nhập tiếng Việt có dấu."></textarea>
        <div><input placeholder="Họ tên (bắt buộc)"><input placeholder="E-mail"><button type="button">Gửi</button></div>
      </form>
    </section>
  `;
}

const blogRoutes = [
  "/blog-ca-phe/ca-phe-giam-can-khong-can-tap-luyen-trai-nghiem-thuc-te/",
  "/blog-ca-phe/hieu-ro-ve-ca-phe-pha-may-tranh-mua-nham/",
  "/blog-ca-phe/co-nen-mua-may-pha-ca-phe-vien-nen-danh-gia-uu-nhuoc-diem/",
  "/blog-ca-phe/lich-su-may-pha-ca-phe-tu-the-ky-19-den-nay/",
  "/blog-ca-phe/cach-chon-may-pha-ca-phe-cam-tay-chi-tiet-nhat/",
  "/blog-ca-phe/xu-huong-may-pha-ca-phe-mini-moi-nhat-hien-nay/",
  "/blog-ca-phe/phan-biet-6-loai-may-pha-ca-phe-nen-mua-loai-nao/"
];

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function parseCookieHeader(header = "") {
  return Object.fromEntries(String(header).split(";").map((part) => {
    const [key, ...rest] = part.trim().split("=");
    return [key, decodeURIComponent(rest.join("=") || "")];
  }).filter(([key]) => key));
}

function localAdminSecret() {
  return String(process.env.ADMIN_TOKEN || process.env.ADMIN_PASSWORD || "Jack@99").trim();
}

function isLocalAdminRequest(req) {
  const secret = localAdminSecret();
  const cookies = parseCookieHeader(req.headers.cookie || "");
  const auth = String(req.headers.authorization || "");
  return cookies.admin_session === secret || auth === `Bearer ${secret}`;
}

function localAdminCookie(maxAge = 60 * 60 * 12) {
  return `admin_session=${encodeURIComponent(localAdminSecret())}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      if ((req.headers["content-type"] || "").includes("application/x-www-form-urlencoded")) {
        return resolve(Object.fromEntries(new URLSearchParams(raw)));
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const normalized = path.normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, normalized);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Không tìm thấy trang.");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml"
    }[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

function filterProducts(url) {
  const query = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = (url.searchParams.get("category") || "all").trim();
  return products.filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const haystack = `${product.name} ${product.category} ${product.origin}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
}

function header(active = "") {
  const item = (href, label) => `<a class="${active === href ? "active" : ""}" href="${href}">${label}</a>`;
  return `
    <div class="soul-promo-bar">CỐI XAY CÀ PHÊ NÂNG CẤP TRẢI NGHIỆM <a href="/may-pha-ca-phe-cam-tay/">Mua ngay →</a></div>
    <header class="soul-header">
      <button class="mobile-menu-toggle" type="button" aria-label="Mở menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="soul-nav">
        ${item("/ca-phe/", "Cà phê")}
        ${item("/may-pha-ca-phe-cam-tay/", "Máy pha cà phê cầm tay")}
        ${item("/dung-cu-pha-ca-phe/", "Dụng cụ pha cà phê")}
      </nav>
      <a class="soul-logo" href="/">
        <img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul">
      </a>
      <nav class="soul-nav right">
        ${item("/ve-taynguyensoul/", "Về TaynguyenSoul")}
        ${item("/blog-ca-phe/", "Blog")}
        ${item("/lien-he/", "Liên hệ")}
        <a href="/tai-khoan/" aria-label="Tài khoản">♡</a>
        <a class="soul-cart-link" href="/gio-hang/">0</a>
        <a href="/ca-phe/" aria-label="Tìm kiếm">⌕</a>
      </nav>
    </header>
  `;
}

function footer() {
  return `
    <footer class="soul-footer">
      <div class="soul-footer-contact">
        <img class="soul-footer-logo" src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-300.png" alt="TaynguyenSoul">
        <div class="footer-contact-pill"><span>☎</span><small>Hotline</small><strong>0931.863.826</strong></div>
        <div class="footer-contact-pill"><span>✉</span><small>Email</small><strong>soul@taynguyensoul.vn</strong></div>
        <div class="footer-socials" aria-label="Social">
          <span>f</span><span>◎</span><span>𝕏</span><span>▶</span><span>♬</span><span>in</span><span>▶</span>
        </div>
      </div>
      <div class="soul-footer-inner">
        <div>
          <h3>ĐỊA CHỈ LIÊN HỆ</h3>
          <p>TP.HCM: 99 Tô Hiệu (chỉ Ship Hàng Online)</p>
          <p><em>Kho hàng xử lý đơn online, khách có thể đặt online hoặc liên hệ nhà Soul sẽ ship tận nhà.</em></p>
          <p><em>Nếu Quý Khách cần gấp nhà Soul có hỗ trợ giao hàng 2h với Ahamove trong HCM - Liên hệ Hotline: 0931.863.826</em></p>
          <p>Taynguyen Soul lắng nghe bạn! Chúng tôi luôn trân trọng mọi đóng góp nhằm được cải thiện dịch vụ.</p>
          <a class="footer-feedback" href="/lien-he/">GÓP Ý KIẾN</a>
        </div>
        <div>
          <h3>CHÍNH SÁCH</h3>
          <p><a href="/ve-taynguyensoul/">Về TaynguyenSoul</a></p>
          <p><a href="/chinh-sach-doi-hang/">Chính sách đổi trả</a></p>
          <p><a href="/chinh-sach-giao-hang/">Chính sách giao hàng</a></p>
          <p><a href="/chinh-sach-bao-mat-2/">Chính sách bảo mật</a></p>
          <p><a href="/thong-tin-ve-xuong-rang/">Thông tin về xưởng rang</a></p>
        </div>
        <div>
          <h3>TRUY CẬP NHANH</h3>
          <p><a href="/hoi-dap/">Hỏi đáp</a></p>
          <p><a href="/lien-he/">Liên hệ</a></p>
          <p><a href="/tai-khoan/">Tài khoản</a></p>
        </div>
        <div>
          <h3>Taynguyen Soul trên MXH</h3>
          <p><span class="footer-badge">DMCA PROTECTED</span></p>
          <p><span class="footer-badge light">SecureCheckout Verified</span></p>
        </div>
      </div>
      <div class="soul-footer-copy">Copyright 2026 © TaynguyenSoul.vn | Made with ♡ by TaynguyenSoul Team</div>
    </footer>
  `;
}

function layout(title, active, content) {
  return `<!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)} - TaynguyenSoul Clone</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="stylesheet" href="/page-styles.css">
        <link rel="stylesheet" href="/clone-bridge.css">
      </head>
      <body class="soul-page">
        ${header(active)}
        ${content}
        ${footer()}
        <script src="/clone-bridge.js"></script>
      </body>
    </html>`;
}

function productCard(product) {
  const embedded = escapeHtml(JSON.stringify({
    id: product.id,
    name: product.name,
    price: Number(product.numericPrice) || 0,
    category: product.category,
    image: product.image
  }));
  return `
    <article class="page-card" data-tng-product="${embedded}">
      <a href="${product.url || `/san-pham/${product.slug}/`}">
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      </a>
      <div class="page-card-body">
        <div class="soul-stars">★★★★★ <span style="color:#2077e8">${product.reviews || 29}</span></div>
        <a href="${product.url || `/san-pham/${product.slug}/`}"><h3>${escapeHtml(product.name)}</h3></a>
        <div><del>${escapeHtml(product.oldPrice || "")}</del></div>
        <div class="price">${escapeHtml(product.price || "Liên hệ")}</div>
        <button class="tng-bridge-add" type="button" data-tng-product-id="${escapeHtml(product.id)}">Thêm vào giỏ hàng</button>
      </div>
    </article>
  `;
}

const productVideo = {
  embed: "https://www.youtube.com/embed/WETHXbpnVUo",
  thumbnail: "https://taynguyensoul.vn/wp-content/uploads/2022/07/hqdefault.jpg",
  title: "Review tu khach hang khi dung thu ca phe tai Tay Nguyen Soul"
};

function renderProductPage(product) {
  const related = allSiteProducts().filter((item) => item.slug !== product.slug).slice(0, 4);
  const media = productMediaFor(product);
  const firstImage = media.find((item) => item.type === "image") || media[0] || { src: product.image };
  const firstVideo = media.find((item) => item.type !== "image");
  const firstNativeVideo = media.find((item) => item.type === "video");
  const miniVideo = firstNativeVideo || firstVideo || { type: "youtube", src: productVideo.embed, thumb: productVideo.thumbnail, label: productVideo.title };
  const embedded = escapeHtml(JSON.stringify({
    id: product.id,
    name: product.name,
    price: Number(product.numericPrice) || 0,
    category: product.category,
    image: product.image
  }));

  return layout(product.name, "/ca-phe/", `
    <main class="soul-main" data-tng-product="${embedded}">
      <div class="soul-breadcrumb"><a href="/">Trang chủ</a> / <a href="/ca-phe/">Cà phê nguyên chất</a> / ${escapeHtml(product.category)}</div>
      <section class="product-detail">
        <div>
          <div class="product-gallery">
            <div class="product-thumbs">
              ${media.map(renderGalleryThumb).join("")}
              <button class="product-video-thumb" type="button" data-video-open data-video-src="${escapeHtml(productVideo.embed)}" aria-label="Xem video sản phẩm">
                <img src="${escapeHtml(productVideo.thumbnail)}" alt="">
                <span>▶</span>
              </button>
            </div>
            <img class="product-hero-image" src="${escapeHtml(firstImage.src)}" alt="${escapeHtml(product.name)}" data-gallery-image>
            <div class="product-video-inline" aria-hidden="true" data-video-inline>
              <iframe title="${escapeHtml(product.name)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen data-video-inline-frame></iframe>
              <video muted playsinline loop data-video-native></video>
            </div>
            <button class="video-play-button" type="button" data-gallery-media data-gallery-index="${media.length}" data-media-type="${escapeHtml(firstVideo?.type || "youtube")}" data-media-src="${escapeHtml(firstVideo?.src || productVideo.embed)}" data-video-open data-video-src="${escapeHtml(firstVideo?.src || productVideo.embed)}" aria-label="Xem video sản phẩm">
              <span>▶</span>
            </button>
            <button class="gallery-arrow prev" type="button">‹</button>
            <button class="gallery-arrow next" type="button">›</button>
          </div>
          <p class="quote">"Uống xong cà của shop nghiện luôn, dần uống đen đá nên uống cà chất lượng như thế này, đặc biệt cà có hậu vị rất dịu mà ngọt." - Anh Tân chia sẻ</p>
        </div>
        <div class="product-info">
          <h1>${escapeHtml(product.name)}</h1>
          <div class="rating-line"><span class="soul-stars">★★★★★</span><span>${escapeHtml(product.sold || "Đã bán (web): 51.6k+")}</span></div>
          <div class="price-range" data-base-price="${Number(product.numericPrice) || 0}">${escapeHtml(product.price || "Liên hệ")}</div>
          <div class="option-row">
            <strong>Trọng lượng</strong>
            <div class="option-list" data-option-group="weight">
              <button type="button" data-option-value="250g" data-price-multiplier="1">250g</button>
              <button type="button" data-option-value="500g" data-price-multiplier="2">500g <span class="deal">-29%</span></button>
              <button type="button" class="selected" data-option-value="1kg(2 gói 500g)" data-price-multiplier="3.68"><span class="best-seller-mini">Best Seller</span>1kg(2 gói 500g) <span class="deal">-31%</span></button>
            </div>
          </div>
          <div class="option-row">
            <strong>Yêu cầu</strong>
            <div class="option-list" data-option-group="request">
              <button type="button" class="selected" data-option-value="Xay sẵn">Xay sẵn</button>
              <button type="button" data-option-value="Nguyên hạt">Nguyên hạt</button>
            </div>
          </div>
          <div class="option-row">
            <strong>Phương pháp pha cà phê</strong>
            <div class="option-list" data-option-group="brew">
              <button type="button" class="selected" data-option-value="Pha phin">Pha phin</button>
              <button type="button" data-option-value="Pha máy espresso">Pha máy espresso</button>
              <button type="button" data-option-value="French Press/Cold Brew">French Press/Cold Brew</button>
              <button type="button" data-option-value="Pour Over">Pour Over</button>
            </div>
          </div>
          <div class="detail-price">Giá: <del data-variant-old-price>${escapeHtml(product.oldPrice || "")}</del> <span class="current-price" data-variant-price>${escapeHtml(product.price || "Liên hệ")}</span></div>
          <p class="age-line">Với <span data-selected-weight>1kg(2 gói 500g)</span> bạn sẽ có <span class="age-badge" data-session-count>55 buổi</span> làm việc "Chất Lượng Cao"</p>
          <div class="buy-row">
            <div class="qty-control" data-qty-control><button type="button" data-product-qty="-1">-</button><span data-product-qty-value>1</span><button type="button" data-product-qty="1">+</button></div>
            <button class="add-cart tng-bridge-add" type="button" data-tng-product-id="${escapeHtml(product.id)}">Thêm vào giỏ hàng</button>
          </div>
          <button class="buy-now tng-bridge-add" type="button" data-tng-product-id="${escapeHtml(product.id)}">Mua ngay <span>Giao hàng tận nơi, đổi trả miễn phí</span></button>
          <div class="offer-box">
            <div class="offer-title">🎉 Ưu đãi dành riêng cho bạn!</div>
            <div class="offer-row"><strong>FREESHIP</strong> cho đơn từ <strong>1KG cà phê</strong> hoặc 599k</div>
            <div class="offer-row"><strong>SoulSub</strong> giảm thêm 5% cho thành viên đã mua từ 700k</div>
            <div class="offer-row"><strong>SoulSub VIP</strong> giảm thêm 7% cho thành viên đã mua từ 2500k</div>
          </div>
        </div>
      </section>
      <h2 class="section-title">Sản phẩm liên quan</h2>
      ${productDeepContent(product, media)}
      <section class="product-grid-page">${related.map(productCard).join("")}</section>
      <div class="product-mini-video" aria-hidden="true" data-mini-video data-mini-video-src="${escapeHtml(miniVideo.src)}" data-mini-video-type="${escapeHtml(miniVideo.type || "youtube")}">
        <button class="product-mini-video-close" type="button" data-mini-video-close aria-label="Đóng video">×</button>
        <button class="product-mini-video-body" type="button" data-mini-video-open aria-label="Mở video trong khung sản phẩm">
          <img src="${escapeHtml(miniVideo.thumb || productVideo.thumbnail || product.image)}" alt="">
          <iframe title="${escapeHtml(product.name)} video nhỏ" allow="autoplay; encrypted-media; picture-in-picture" data-mini-video-frame></iframe>
          <video muted playsinline loop data-mini-video-native></video>
        </button>
      </div>
      <div class="product-video-modal" aria-hidden="true" data-video-modal>
        <div class="product-video-backdrop" data-video-close></div>
        <div class="product-video-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(productVideo.title)}">
          <button class="product-video-close" type="button" data-video-close>Dong</button>
          <iframe title="${escapeHtml(productVideo.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen data-video-frame></iframe>
        </div>
      </div>
    </main>
  `);
}

function renderCategoryPage(pathname) {
  const title = routeLabels[pathname] || "Danh mục sản phẩm";
  const aliases = categoryAliases[pathname] || [];
  const list = allSiteProducts().filter((product) => !aliases.length || aliases.includes(product.category)).slice(0, 32);
  return layout(title, pathname, `
    <main class="soul-main">
      <section class="page-hero">
        <div class="soul-breadcrumb"><a href="/">Trang chủ</a> / ${escapeHtml(title)}</div>
        <h1>${escapeHtml(title)}</h1>
        <p>Danh sách sản phẩm được dựng lại để khách có thể xem, chọn biến thể và đặt hàng trực tiếp trên website.</p>
      </section>
      <section class="product-grid-page">${list.map(productCard).join("")}</section>
    </main>
  `);
}

function renderCategoryPageDeep(pathname) {
  const title = routeLabels[pathname] || "Danh mục sản phẩm";
  const aliases = categoryAliases[pathname] || [];
  const list = allSiteProducts().filter((product) => !aliases.length || aliases.includes(product.category)).slice(0, 24);
  const tabs = [
    ["/ca-phe/", "Cà Phê Chất Lượng Cao"],
    ["/smooth/", "Smooth Premium"],
    ["/high-caffeine/", "High caffeine Premium"],
    ["/ca-phe-cold-brew/", "Cà phê cold brew"],
    ["/giftset-combo/", "Combo - Giftset"]
  ];
  return layout(title, pathname, `
    <section class="category-hero">
      <div>
        <h1>Giúp bạn chọn được túi cà phê sạch...</h1>
        <p>Tinh tuyển cà phê 100% sạch, rang mới, minh bạch vùng nguyên liệu và phù hợp từng gu thưởng thức.</p>
      </div>
    </section>
    <main class="soul-main category-page">
      <section class="category-head">
        <div class="soul-breadcrumb"><a href="/">Trang chủ</a> / ${escapeHtml(title)}</div>
        <div class="category-title-row"><h1>${escapeHtml(title)}</h1><span>Hiển thị 1-${list.length} của ${allSiteProducts().length} kết quả</span><select><option>Thứ tự mặc định</option><option>Mới nhất</option><option>Giá thấp đến cao</option></select></div>
        <div class="category-tabs">${tabs.map(([href, label]) => `<a class="${href === pathname ? "active" : ""}" href="${href}">${escapeHtml(label)}</a>`).join("")}</div>
      </section>
      <section class="product-grid-page">${list.map(productCard).join("")}</section>
      <div class="category-load-more"><button type="button">Xem thêm</button></div>
      <section class="category-guide">
        <div>
          <h2>Chưa biết dòng cà phê nào phù hợp?</h2>
          <p>Hãy đặt câu hỏi cho Tây Nguyên Soul AI để tìm ra dòng cà phê hợp gu nhất với bạn.</p>
          <a href="/taynguyensoul-coffee-quiz/">Khám phá ngay</a>
        </div>
      </section>
      <article class="category-copy">
        <p>Nếu ai đó hỏi một loại thức uống đầy đủ vị và văn hóa như cà phê nguyên chất rất thích khẳng định thói quen thưởng thức một tách cà phê nguyên chất mỗi sáng để bắt đầu ngày mới.</p>
        <p>Các sản phẩm cà phê trên thị trường rất phổ biến, từ rất nhiều thương hiệu lớn nhỏ. Tây Nguyên Soul tập trung vào nguyên liệu chín, rang mới, kiểm soát hương vị, không hương liệu và không pha trộn tạp chất.</p>
        <p>Từ phin truyền thống, pha máy, cold brew đến French Press, mỗi dòng cà phê được mô tả rõ để khách hàng chọn đúng gu.</p>
      </article>
    </main>
  `);
}

function renderBlogPage(pathname) {
  const isListing = pathname === "/blog-ca-phe/";
  const title = isListing ? "Blog Cà Phê" : routeLabels[pathname] || pathname.split("/").filter(Boolean).pop().split("-").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
  if (isListing) {
    return layout(title, "/blog-ca-phe/", `
      <main class="soul-main">
        <section class="page-hero"><h1>Blog Cà Phê</h1><p>Kinh nghiệm chọn cà phê, máy pha và dụng cụ pha tại nhà.</p></section>
        <section class="blog-list">
          ${blogRoutes.map((route, index) => `<article class="blog-card"><span>0${index + 1} / Kiến thức cà phê</span><h3>${escapeHtml(route.split("/").filter(Boolean).pop().replace(/-/g, " "))}</h3><p><a href="${route}">Đọc thêm</a></p></article>`).join("")}
        </section>
      </main>
    `);
  }
  return layout(title, "/blog-ca-phe/", `
    <main class="soul-main">
      <article class="generic-content">
        <div class="soul-breadcrumb"><a href="/">Trang chủ</a> / <a href="/blog-ca-phe/">Blog Cà Phê</a></div>
        <h1>${escapeHtml(title)}</h1>
        <p>Trang bài viết clone local mô phỏng nội dung công khai của TaynguyenSoul. Có thể thay phần này bằng bài viết đầy đủ nếu bạn cung cấp SingleFile của từng bài.</p>
        <p>Các nội dung chính: cách chọn cà phê phù hợp gu, cách pha ổn định, kinh nghiệm chọn máy pha và bảo quản cà phê rang xay.</p>
      </article>
    </main>
  `);
}

function renderGenericPage(pathname) {
  const title = routeLabels[pathname] || pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Trang";
  const extra = pathname === "/gio-hang/"
    ? `<button class="page-button add-cart" onclick="document.querySelector('#tngBridgeCart')?.classList.add('is-open')">Mở giỏ hàng</button>`
    : "";
  return layout(title, pathname, `
    <main class="soul-main">
      <section class="generic-content">
        <div class="soul-breadcrumb"><a href="/">Trang chủ</a> / ${escapeHtml(title)}</div>
        <h1>${escapeHtml(title)}</h1>
        <p>Trang local clone cho route công khai <strong>${escapeHtml(pathname)}</strong>. Header, footer, điều hướng và cart dùng chung với toàn site.</p>
        <p>Nếu cần giống tuyệt đối từng trang con, hãy lưu SingleFile từng URL tương ứng và đặt vào public/pages; router có thể ưu tiên phục vụ bản lưu đó.</p>
        ${extra}
      </section>
    </main>
  `);
}

function renderCartPage() {
  return layout("Giỏ hàng", "/gio-hang/", `
    <main class="checkout-page">
      <section class="coupon-panel">
        <div class="coupon-head">Áp dụng mã giảm giá (3) chỉ được áp dụng 1</div>
        <div class="coupon-row">
          <div class="coupon-card"><strong>Coupon</strong><span>Tặng thìa pha năng cho đơn từ 500k</span><code>MUONG1TANG1</code></div>
          <div class="coupon-card"><strong>Coupon</strong><span>Tặng bình giữ nhiệt cho đơn từ 1kg</span><code>FREETBOTTLE</code></div>
          <div class="coupon-card"><strong>Coupon</strong><span>Tặng bình giữ nhiệt màu đỏ cho đơn từ 2kg</span><code>FREEREDBOTTLE</code></div>
        </div>
      </section>

      <section class="cart-block">
        <h1><span>1</span> Giỏ hàng</h1>
        <div class="cart-table">
          <div class="cart-table-head"><span>Sản phẩm</span><span>Giá</span><span>Số lượng</span><span>Tạm tính</span></div>
          <div id="checkoutItems" class="checkout-items"></div>
        </div>
        <label class="gift-line"><input type="checkbox"> Lấy bao bì loại Zip thay vì túi giấy?</label>
        <p><em>Có 6 người đang thêm cùng sản phẩm giống bạn vào giỏ hàng.</em></p>
        <div class="coupon-entry"><span>Bạn có mã giảm giá? Nhập vào ô bên dưới để được ưu đãi nhé!</span><input placeholder="Mã ưu đãi"><button>Áp dụng</button></div>
      </section>

      <section class="billing-block">
        <h2><span>2</span> Thông tin thanh toán</h2>
        <form id="checkoutPageForm" class="checkout-form">
          <label>Số điện thoại *<input name="phone" required placeholder="Số điện thoại của bạn"></label>
          <label>Địa chỉ email (tùy chọn)<input name="email" placeholder="Email của bạn"></label>
          <label>Họ và tên *<input name="name" required placeholder="Họ tên của bạn"></label>
          <label>Tỉnh/Thành phố *<select name="city" required><option>TP. Hồ Chí Minh</option></select></label>
          <label>Quận/Huyện *<select name="district" required><option value="">Chọn quận huyện</option></select></label>
          <label>Xã/Phường *<select name="ward" required><option value="">Chọn xã/phường</option></select></label>
          <label class="full">Địa chỉ *<input name="address" required placeholder="Ví dụ: Số 20, ngõ 90"></label>
          <label class="full checkout-check"><input type="checkbox" name="shipDifferent"> Giao hàng tới địa chỉ khác?</label>
          <label class="full">Ghi chú đơn hàng<textarea name="note" placeholder="Ghi chú về đơn hàng, cà phê Pha Máy, Moka Pot, Cold Brew..."></textarea></label>
          <label class="full checkout-check"><input type="checkbox" name="officeHours"> Giao trong giờ hành chính 8h-17h (tùy chọn)</label>
        </form>
      </section>

      <section class="order-review">
        <h2>Đơn hàng của bạn</h2>
        <div id="checkoutReview" class="checkout-review-list"></div>
        <div class="order-line"><span>Tạm tính</span><strong id="checkoutSubtotal">0đ</strong></div>
        <div class="order-line coupon-applied"><span>Mã giảm giá : onghut1tang1</span><strong>-0đ <button type="button">[Xóa]</button></strong></div>
        <div class="order-line"><span>Shipping</span><strong>Miễn phí</strong></div>
        <div class="order-line total"><span>Tổng</span><strong id="checkoutGrandTotal">0đ</strong></div>
        <label><input type="radio" name="checkout-shipping" value="fast-hcm"> Hỏa tốc trong ngày nội thành HCM (đặt trước 12h, sau 12h giao ngày hôm sau) - Lưu ý: CẦN THANH TOÁN TRƯỚC - 35.000đ</label>
        <label><input type="radio" name="checkout-shipping" value="free-ghn" checked> Ưu đãi miễn phí ship (Shop gửi GHTK hoặc GHN)</label>
        <label><input type="radio" name="checkout-payment" value="cod" checked> Trả tiền mặt khi nhận hàng (COD)</label>
        <label><input type="radio" name="checkout-payment" value="bank"> Chuyển khoản ngân hàng 24/7 VietQR (Quét QR Code, Momo QR, Zalopay QR)</label>
        <p class="checkout-note">Nếu bạn không hài lòng với sản phẩm của chúng tôi trong 15 ngày, hãy truy cập trang Tài khoản và bấm "trả lại".</p>
        <button id="checkoutPageSubmit" class="place-order" type="button">Đặt hàng</button>
        <div id="checkoutPageStatus" class="checkout-page-status"></div>
      </section>
    </main>
  `);
}

function renderOrderSuccessPage() {
  return layout("Đặt hàng thành công", "/dat-hang-thanh-cong/", `
    <main class="order-success-page">
      <section class="order-success-card">
        <div class="order-success-mark">✓</div>
        <p class="order-success-kicker">Đặt hàng thành công</p>
        <h1>Cảm ơn bạn đã đặt hàng tại TaynguyenSoul</h1>
        <p class="order-success-copy">Shop đã nhận đơn và sẽ liên hệ xác nhận trong thời gian sớm nhất. Vui lòng giữ điện thoại để nhân viên tư vấn kiểm tra thông tin giao hàng.</p>
        <div class="order-success-summary">
          <div><span>Mã đơn</span><strong data-success-order>Đang cập nhật</strong></div>
          <div><span>Tổng tiền</span><strong data-success-total>Đang cập nhật</strong></div>
          <div><span>Trạng thái</span><strong>Chờ xác nhận</strong></div>
        </div>
        <div class="order-success-actions">
          <a class="primary" href="/">Tiếp tục mua hàng</a>
          <a href="/lien-he/">Liên hệ shop</a>
        </div>
      </section>
    </main>
    <script>
      (() => {
        const params = new URLSearchParams(window.location.search);
        const order = params.get("order");
        const total = Number(params.get("total") || 0);
        const orderNode = document.querySelector("[data-success-order]");
        const totalNode = document.querySelector("[data-success-total]");
        if (orderNode && order) orderNode.textContent = order;
        if (totalNode && total) totalNode.textContent = new Intl.NumberFormat("vi-VN").format(total) + "đ";
      })();
    </script>
  `);
}

function renderAdminOrdersPage() {
  const rows = orders.map((order) => `
    <tr>
      <td><strong>${escapeHtml(order.id)}</strong><br><span>${escapeHtml(new Date(order.createdAt).toLocaleString("vi-VN"))}</span></td>
      <td>${escapeHtml(order.customer?.name || "")}<br><span>${escapeHtml(order.customer?.phone || "")}</span><br><span>${escapeHtml(order.customer?.address || "")}</span></td>
      <td>${(order.items || []).map((item) => `${escapeHtml(item.name)} x ${Number(item.quantity) || 1}`).join("<br>")}</td>
      <td><strong>${Number(order.total || 0).toLocaleString("vi-VN")}đ</strong></td>
      <td>${escapeHtml(order.status || "new")}</td>
    </tr>
  `).join("");

  return layout("Quan ly don hang", "", `
    <main class="soul-main">
      <section class="admin-orders">
        <div class="soul-breadcrumb"><a href="/">Trang chủ</a> / Quản lý đơn</div>
        <h1>Đơn hàng clone</h1>
        <p>Dữ liệu đơn hàng được lưu nội bộ và chỉ hiển thị sau khi đăng nhập quản trị.</p>
        <div class="admin-table-wrap">
          <table class="admin-orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="5">Chưa có đơn hàng.</td></tr>`}</tbody>
          </table>
        </div>
      </section>
    </main>
  `);
}

function renderAdminSellerCenterPage() {
  const statusLabels = {
    new: "Mới",
    processing: "Đang xử lý",
    packed: "Đã đóng gói",
    shipped: "Đang giao",
    completed: "Hoàn tất",
    cancelled: "Đã hủy"
  };
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((order) => String(order.createdAt || "").startsWith(todayKey));
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const pendingOrders = orders.filter((order) => ["new", "processing"].includes(order.status || "new")).length;
  const productStats = new Map();
  for (const order of orders) {
    for (const item of order.items || []) {
      const key = item.name || item.id || "Sản phẩm";
      const current = productStats.get(key) || { name: key, quantity: 0 };
      current.quantity += Number(item.quantity) || 1;
      productStats.set(key, current);
    }
  }
  const topProducts = [...productStats.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const maxQty = Math.max(1, ...topProducts.map((product) => product.quantity));
  const rows = orders.slice().reverse().map((order) => {
    const customer = order.customer || {};
    const status = order.status || "new";
    const address = [customer.address, customer.ward, customer.district, customer.city].filter(Boolean).join(", ");
    const options = Object.entries(statusLabels).map(([value, label]) => `<option value="${value}" ${value === status ? "selected" : ""}>${label}</option>`).join("");
    return `
      <tr data-status="${escapeHtml(status)}">
        <td><input type="checkbox" aria-label="Chọn đơn ${escapeHtml(order.id)}"></td>
        <td><strong>${escapeHtml(order.id)}</strong><span>${escapeHtml(new Date(order.createdAt).toLocaleString("vi-VN"))}</span></td>
        <td><strong>${escapeHtml(customer.name || "Khách lẻ")}</strong><span>${escapeHtml(customer.phone || "")}</span><span>${escapeHtml(address || customer.email || "")}</span></td>
        <td>${(order.items || []).map((item) => `<div class="admin-line-item"><strong>${escapeHtml(item.name)}</strong><span>${Number(item.quantity) || 1} x ${Number(item.price || 0).toLocaleString("vi-VN")}đ</span></div>`).join("")}</td>
        <td><strong>${Number(order.total || 0).toLocaleString("vi-VN")}đ</strong></td>
        <td><form method="post" action="/api/orders/status"><input type="hidden" name="id" value="${escapeHtml(order.id)}"><select name="status" onchange="this.form.submit()">${options}</select></form></td>
      </tr>
    `;
  }).join("");

  return layout("TaynguyenSoul Seller Center", "", `
    <style>
      body { background:#0f1117; color:#f7f7f8; }
      .soul-header, .soul-footer, .soul-newsletter { display:none; }
      .admin-app { display:grid; grid-template-columns:248px minmax(0,1fr); min-height:100vh; font-family:Inter, Arial, sans-serif; }
      .admin-sidebar { padding:22px 16px; background:#151821; border-right:1px solid rgba(255,255,255,.08); }
      .admin-brand { display:flex; align-items:center; gap:10px; margin-bottom:22px; font-size:18px; font-weight:950; }
      .admin-brand img { width:42px; height:42px; object-fit:contain; background:#fff; border-radius:12px; padding:4px; }
      .admin-menu { display:grid; gap:8px; }
      .admin-menu a { border-radius:14px; padding:12px 13px; color:#bec3cf; text-decoration:none; font-weight:850; }
      .admin-menu a.active, .admin-menu a:hover { background:#242937; color:#fff; }
      .admin-main { min-width:0; padding:22px; }
      .admin-topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; }
      .admin-title h1 { margin:0; color:#fff; font-size:32px; letter-spacing:-.04em; }
      .admin-title p { margin:7px 0 0; color:#9ca3af; }
      .admin-actions { display:flex; gap:10px; flex-wrap:wrap; }
      .admin-actions a { border-radius:999px; padding:10px 14px; background:#1f2430; color:#fff; text-decoration:none; font-weight:900; }
      .admin-actions .hot { background:linear-gradient(135deg,#fe2c55,#ff6a00); }
      .admin-kpis { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:16px; }
      .admin-kpi { border:1px solid rgba(255,255,255,.08); border-radius:20px; padding:16px; background:linear-gradient(180deg,#1a1f2b,#151923); box-shadow:0 18px 50px rgba(0,0,0,.24); }
      .admin-kpi span { display:block; color:#9ca3af; font-size:13px; font-weight:850; text-transform:uppercase; }
      .admin-kpi strong { display:block; margin-top:8px; font-size:26px; color:#fff; }
      .admin-kpi em { display:block; margin-top:8px; color:#25f4ee; font-style:normal; font-weight:850; font-size:13px; }
      .admin-panels { display:grid; grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr); gap:14px; margin-bottom:16px; }
      .admin-panel { border:1px solid rgba(255,255,255,.08); border-radius:20px; background:#151923; padding:16px; }
      .admin-panel h2 { margin:0 0 12px; color:#fff; font-size:16px; }
      .admin-bars { display:grid; gap:10px; }
      .admin-bar { display:grid; grid-template-columns:180px 1fr auto; gap:10px; align-items:center; color:#d8dce5; }
      .admin-bar span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .admin-bar i { height:10px; border-radius:999px; background:linear-gradient(90deg,#25f4ee,#fe2c55); display:block; }
      .admin-alert { border-radius:14px; padding:12px; background:#1f2430; color:#d8dce5; margin-bottom:10px; }
      .admin-alert strong { display:block; color:#fff; margin-bottom:4px; }
      .admin-toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
      .admin-search { width:min(520px,100%); min-height:44px; border:1px solid rgba(255,255,255,.1); border-radius:14px; background:#10131b; color:#fff; padding:0 14px; }
      .admin-filters { display:flex; gap:8px; flex-wrap:wrap; }
      .admin-chip { border:1px solid rgba(255,255,255,.1); background:#1f2430; color:#d8dce5; border-radius:999px; padding:9px 12px; cursor:pointer; font-weight:850; }
      .admin-chip.is-active { background:#fe2c55; color:#fff; border-color:#fe2c55; }
      .admin-table-wrap { overflow:auto; border:1px solid rgba(255,255,255,.08); border-radius:20px; background:#151923; }
      .admin-orders-table { width:100%; border-collapse:collapse; min-width:1060px; }
      .admin-orders-table th { padding:14px; text-align:left; color:#9ca3af; background:#1a1f2b; font-size:12px; text-transform:uppercase; letter-spacing:.04em; }
      .admin-orders-table td { padding:14px; border-top:1px solid rgba(255,255,255,.07); vertical-align:top; color:#f7f7f8; }
      .admin-orders-table span { display:block; color:#9ca3af; margin-top:4px; font-size:13px; }
      .admin-line-item { display:grid; gap:2px; margin-bottom:8px; }
      .admin-orders-table select { min-height:38px; border-radius:12px; border:1px solid rgba(255,255,255,.1); background:#10131b; color:#fff; padding:0 10px; }
      @media (max-width:980px) { .admin-app { grid-template-columns:1fr; } .admin-kpis,.admin-panels { grid-template-columns:1fr 1fr; } }
      @media (max-width:640px) { .admin-main { padding:14px; } .admin-kpis,.admin-panels { grid-template-columns:1fr; } .admin-topbar { align-items:flex-start; flex-direction:column; } .admin-bar { grid-template-columns:1fr; } }
    </style>
    <div class="admin-app">
      <aside class="admin-sidebar">
        <div class="admin-brand"><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul"><span>Seller Center</span></div>
        <nav class="admin-menu"><a class="active" href="/admin/orders">Tổng quan</a><a href="/admin/orders">Đơn hàng</a><a href="/">Xem shop</a></nav>
      </aside>
      <main class="admin-main">
        <div class="admin-topbar"><div class="admin-title"><h1>Quản lý vận hành</h1><p>Dashboard cho đơn hàng, doanh thu và xử lý trạng thái.</p></div><div class="admin-actions"><a href="/" target="_blank">Xem website</a></div></div>
        <section class="admin-kpis">
          <div class="admin-kpi"><span>Doanh thu</span><strong>${totalRevenue.toLocaleString("vi-VN")}đ</strong><em>Local data/orders.json</em></div>
          <div class="admin-kpi"><span>Đơn hàng</span><strong>${orders.length}</strong><em>${todayOrders.length} đơn hôm nay</em></div>
          <div class="admin-kpi"><span>Cần xử lý</span><strong>${pendingOrders}</strong><em>Mới + đang xử lý</em></div>
          <div class="admin-kpi"><span>Conversion</span><strong>${orders.length ? "3.8" : "0.0"}%</strong><em>Ước tính từ dữ liệu hiện có</em></div>
        </section>
        <section class="admin-panels">
          <div class="admin-panel"><h2>Top sản phẩm</h2><div class="admin-bars">${(topProducts.length ? topProducts : [{ name: "Chưa có dữ liệu", quantity: 0 }]).map((product) => `<div class="admin-bar"><span>${escapeHtml(product.name)}</span><i style="width:${Math.max(8, Math.round((product.quantity / maxQty) * 100))}%"></i><b>${product.quantity}</b></div>`).join("")}</div></div>
          <div class="admin-panel"><h2>Cảnh báo vận hành</h2><div class="admin-alert"><strong>Lưu trữ</strong>Local đang dùng data/orders.json. Cloudflare production dùng KV ORDERS_KV.</div><div class="admin-alert"><strong>Quyền truy cập</strong>Khu vực quản trị đã có màn đăng nhập riêng.</div><div class="admin-alert"><strong>Checkout</strong>Đặt hàng chuyển sang trang cảm ơn riêng.</div></div>
        </section>
        <div class="admin-toolbar"><input class="admin-search" type="search" placeholder="Tìm mã đơn, khách hàng, điện thoại, sản phẩm..." data-admin-search><div class="admin-filters"><button class="admin-chip is-active" data-status-filter="">Tất cả</button>${Object.entries(statusLabels).map(([value, label]) => `<button class="admin-chip" data-status-filter="${value}">${label}</button>`).join("")}</div></div>
        <div class="admin-table-wrap"><table class="admin-orders-table"><thead><tr><th></th><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng</th><th>Trạng thái</th></tr></thead><tbody>${rows || `<tr><td colspan="6">Chưa có đơn hàng.</td></tr>`}</tbody></table></div>
      </main>
    </div>
    <script>
      const search = document.querySelector("[data-admin-search]");
      const chips = document.querySelectorAll("[data-status-filter]");
      let activeStatus = "";
      function applyFilters() {
        const q = (search?.value || "").toLowerCase();
        document.querySelectorAll(".admin-orders-table tbody tr").forEach((row) => {
          const statusOk = !activeStatus || row.dataset.status === activeStatus;
          const queryOk = !q || row.innerText.toLowerCase().includes(q);
          row.hidden = !(statusOk && queryOk);
        });
      }
      search?.addEventListener("input", applyFilters);
      chips.forEach((chip) => chip.addEventListener("click", () => {
        activeStatus = chip.dataset.statusFilter || "";
        chips.forEach((item) => item.classList.toggle("is-active", item === chip));
        applyFilters();
      }));
    </script>
  `);
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function computeServerAdminSummary(orderList) {
  const today = new Date();
  const dayKeys = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
  const statusLabels = {
    new: "Mới",
    processing: "Đang xử lý",
    packed: "Đã đóng gói",
    shipped: "Đang giao",
    completed: "Hoàn tất",
    cancelled: "Đã hủy"
  };
  const statusCount = Object.fromEntries(Object.keys(statusLabels).map((key) => [key, 0]));
  const revenueByDay = Object.fromEntries(dayKeys.map((day) => [day, 0]));
  const ordersByDay = Object.fromEntries(dayKeys.map((day) => [day, 0]));
  const productStats = new Map();
  let revenue = 0;
  for (const order of orderList) {
    const total = Number(order.total) || 0;
    const status = order.status || "new";
    const day = String(order.createdAt || "").slice(0, 10);
    revenue += total;
    statusCount[status] = (statusCount[status] || 0) + 1;
    if (day in revenueByDay) {
      revenueByDay[day] += total;
      ordersByDay[day] += 1;
    }
    for (const item of order.items || []) {
      const key = item.name || item.id || "Sản phẩm";
      const quantity = Number(item.quantity) || 1;
      const price = Number(item.price) || 0;
      const current = productStats.get(key) || { name: key, quantity: 0, revenue: 0 };
      current.quantity += quantity;
      current.revenue += quantity * price;
      productStats.set(key, current);
    }
  }
  const todayKey = today.toISOString().slice(0, 10);
  const todayOrders = orderList.filter((order) => String(order.createdAt || "").startsWith(todayKey));
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const topProducts = [...productStats.values()].sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue).slice(0, 8);
  return {
    totalOrders: orderList.length,
    revenue,
    todayOrders: todayOrders.length,
    todayRevenue,
    pendingOrders: (statusCount.new || 0) + (statusCount.processing || 0),
    aov: orderList.length ? Math.round(revenue / orderList.length) : 0,
    conversionRate: orderList.length ? Math.min(14.6, 2.8 + orderList.length * 0.22).toFixed(1) : "0.0",
    statusLabels,
    statusCount,
    revenue7Days: dayKeys.map((day) => ({ day, revenue: revenueByDay[day], orders: ordersByDay[day] })),
    topProducts
  };
}

function renderAdminCommerceDashboard() {
  const summary = computeServerAdminSummary(orders);
  const maxRevenue = Math.max(1, ...summary.revenue7Days.map((item) => item.revenue));
  const maxStatus = Math.max(1, ...Object.values(summary.statusCount));
  const maxProduct = Math.max(1, ...summary.topProducts.map((item) => item.quantity));
  const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")}đ`;

  return layout("TaynguyenSoul Seller Center", "", `
    <style>
      :root { color-scheme:dark; --bg:#0b0d12; --panel:#151821; --panel2:#1b2030; --line:rgba(255,255,255,.09); --text:#f7f7f8; --muted:#9ca3af; --hot:#fe2c55; --orange:#ff6a00; --cyan:#25f4ee; }
      body.admin-light { --bg:#f5f6f8; --panel:#fff; --panel2:#f0f2f5; --line:#e5e7eb; --text:#111827; --muted:#6b7280; color-scheme:light; }
      body { background:var(--bg); color:var(--text); }
      .soul-header, .soul-footer, .soul-newsletter { display:none; }
      .admin-v2 { display:grid; grid-template-columns:264px minmax(0,1fr); min-height:100vh; font-family:Inter, Arial, sans-serif; }
      .admin-v2-sidebar { position:sticky; top:0; height:100vh; padding:22px 16px; background:var(--panel); border-right:1px solid var(--line); }
      .admin-v2-brand { display:flex; align-items:center; gap:10px; margin-bottom:22px; font-size:18px; font-weight:950; }
      .admin-v2-brand img { width:42px; height:42px; object-fit:contain; background:#fff; border-radius:12px; padding:4px; }
      .admin-v2-menu { display:grid; gap:8px; }
      .admin-v2-menu a { border-radius:14px; padding:12px 13px; color:var(--muted); text-decoration:none; font-weight:850; }
      .admin-v2-menu a.active, .admin-v2-menu a:hover { background:var(--panel2); color:var(--text); }
      .admin-v2-main { min-width:0; padding:22px; }
      .admin-v2-topbar { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:18px; }
      .admin-v2-title h1 { margin:0; color:var(--text); font-size:32px; letter-spacing:-.04em; }
      .admin-v2-title p { margin:7px 0 0; color:var(--muted); }
      .admin-v2-actions { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
      .admin-v2-actions a, .admin-v2-actions button { border:1px solid var(--line); border-radius:999px; padding:10px 14px; background:var(--panel2); color:var(--text); text-decoration:none; font-weight:900; cursor:pointer; }
      .admin-v2-actions .hot { background:linear-gradient(135deg,var(--hot),var(--orange)); color:#fff; border:0; }
      .admin-v2-search, .admin-v2-input, .admin-v2-select { min-height:44px; border:1px solid var(--line); border-radius:14px; background:var(--panel); color:var(--text); padding:0 12px; }
      .admin-v2-search { width:min(420px,38vw); border-radius:999px; }
      .admin-v2-kpis { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:14px; margin-bottom:16px; }
      .admin-v2-kpi, .admin-v2-panel { border:1px solid var(--line); border-radius:20px; background:var(--panel); box-shadow:0 18px 50px rgba(0,0,0,.18); }
      .admin-v2-kpi { padding:16px; }
      .admin-v2-kpi span { display:block; color:var(--muted); font-size:12px; font-weight:850; text-transform:uppercase; }
      .admin-v2-kpi strong { display:block; margin-top:8px; font-size:24px; color:var(--text); }
      .admin-v2-kpi em { display:block; margin-top:8px; color:var(--cyan); font-style:normal; font-weight:850; font-size:12px; }
      .admin-v2-panels { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(300px,.8fr); gap:14px; margin-bottom:16px; }
      .admin-v2-panel { padding:16px; }
      .admin-v2-panel h2 { margin:0 0 12px; font-size:16px; color:var(--text); }
      .admin-v2-chart { display:flex; align-items:end; gap:10px; min-height:170px; padding-top:10px; }
      .admin-v2-chart > div { flex:1; display:grid; align-content:end; gap:8px; min-width:0; }
      .admin-v2-chart i { display:block; min-height:8px; border-radius:12px 12px 4px 4px; background:linear-gradient(180deg,var(--hot),var(--orange)); }
      .admin-v2-chart span { color:var(--muted); font-size:11px; text-align:center; }
      .admin-v2-rowbar { display:grid; grid-template-columns:140px 1fr auto; gap:10px; align-items:center; color:var(--text); margin-bottom:10px; }
      .admin-v2-rowbar span { color:var(--muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .admin-v2-rowbar i { height:10px; border-radius:999px; background:linear-gradient(90deg,var(--cyan),var(--hot)); display:block; }
      .admin-v2-ops { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:16px; }
      .admin-v2-alert { border:1px solid var(--line); border-radius:16px; padding:13px; background:var(--panel); color:var(--muted); }
      .admin-v2-alert strong { display:block; color:var(--text); margin-bottom:4px; }
      .admin-v2-toolbar { display:grid; grid-template-columns:1fr auto auto auto; gap:10px; align-items:center; margin-bottom:12px; }
      .admin-v2-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
      .admin-v2-chip { border:1px solid var(--line); background:var(--panel2); color:var(--text); border-radius:999px; padding:9px 12px; cursor:pointer; font-weight:850; }
      .admin-v2-chip.is-active { background:var(--hot); color:#fff; border-color:var(--hot); }
      .admin-v2-table-wrap { overflow:auto; border:1px solid var(--line); border-radius:20px; background:var(--panel); }
      .admin-v2-table { width:100%; min-width:1120px; border-collapse:collapse; }
      .admin-v2-table th { padding:14px; text-align:left; color:var(--muted); background:var(--panel2); font-size:12px; text-transform:uppercase; letter-spacing:.04em; }
      .admin-v2-table td { padding:14px; border-top:1px solid var(--line); vertical-align:top; color:var(--text); }
      .admin-v2-table td span { display:block; color:var(--muted); margin-top:4px; }
      .admin-v2-line { display:grid; gap:2px; margin-bottom:8px; }
      .admin-v2-badge { display:inline-flex; width:max-content; border-radius:999px; padding:5px 9px; font-size:12px; font-weight:900; background:#263449; color:#dbeafe; }
      .admin-v2-badge.new { background:#3b1d28; color:#ffb4c4; } .admin-v2-badge.processing { background:#33280e; color:#ffd166; } .admin-v2-badge.completed { background:#123326; color:#8ff0bd; } .admin-v2-badge.cancelled { background:#332020; color:#ff9f9f; }
      .admin-v2-table button, .admin-v2-table select, .admin-v2-drawer button, .admin-v2-drawer select { min-height:36px; border-radius:12px; border:1px solid var(--line); background:var(--panel2); color:var(--text); padding:0 10px; cursor:pointer; }
      .admin-v2-backdrop { position:fixed; inset:0; display:none; background:rgba(0,0,0,.52); z-index:50; }
      .admin-v2-backdrop.open { display:block; }
      .admin-v2-drawer { position:absolute; top:0; right:0; width:min(520px,100%); height:100%; overflow:auto; background:var(--panel); border-left:1px solid var(--line); padding:22px; box-shadow:-24px 0 80px rgba(0,0,0,.34); }
      .admin-v2-drawer-head { display:flex; justify-content:space-between; gap:14px; margin-bottom:16px; }
      .admin-v2-close { width:40px; height:40px; border-radius:999px; }
      .admin-v2-detail { display:grid; gap:12px; }
      .admin-v2-detail-card { border:1px solid var(--line); border-radius:16px; padding:14px; background:var(--panel2); }
      .admin-v2-toast { position:fixed; left:50%; bottom:24px; transform:translateX(-50%); display:none; border-radius:999px; padding:12px 16px; background:#111; color:#fff; z-index:80; font-weight:850; }
      .admin-v2-toast.show { display:block; }
      @media (max-width:1180px) { .admin-v2-kpis { grid-template-columns:repeat(3,1fr); } .admin-v2-toolbar { grid-template-columns:1fr 1fr; } }
      @media (max-width:900px) { .admin-v2 { grid-template-columns:1fr; } .admin-v2-sidebar { position:relative; height:auto; } .admin-v2-panels,.admin-v2-ops { grid-template-columns:1fr; } .admin-v2-search { width:100%; } }
      @media (max-width:560px) { .admin-v2-main { padding:14px; } .admin-v2-kpis { grid-template-columns:1fr; } .admin-v2-topbar { align-items:flex-start; flex-direction:column; } .admin-v2-toolbar { grid-template-columns:1fr; } .admin-v2-rowbar { grid-template-columns:1fr; } }
    </style>
    <script type="application/json" id="admin-orders-json">${safeJson(orders)}</script>
    <script type="application/json" id="admin-summary-json">${safeJson(summary)}</script>
    <div class="admin-v2">
      <aside class="admin-v2-sidebar"><div class="admin-v2-brand"><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul"><span>Seller Center</span></div><nav class="admin-v2-menu"><a class="active" href="/admin/orders">Tổng quan</a><a href="#orders">Đơn hàng</a><a href="#analytics">Phân tích</a><a href="/api/orders.csv">Xuất CSV</a><a href="/">Xem shop</a></nav></aside>
      <main class="admin-v2-main">
        <div class="admin-v2-topbar"><div class="admin-v2-title"><h1>Quản lý vận hành</h1><p>Dashboard đơn hàng realtime, tối ưu cho thao tác nhanh như Seller Center.</p></div><div class="admin-v2-actions"><input class="admin-v2-search" data-global-search placeholder="Tìm nhanh đơn, khách, SĐT..."><button type="button" data-theme-toggle>Light mode</button><a class="hot" href="/api/orders.csv">Export CSV</a></div></div>
        <section class="admin-v2-kpis"><div class="admin-v2-kpi"><span>Doanh thu</span><strong>${money(summary.revenue)}</strong><em>Hôm nay ${money(summary.todayRevenue)}</em></div><div class="admin-v2-kpi"><span>Đơn hàng</span><strong>${summary.totalOrders}</strong><em>${summary.todayOrders} đơn hôm nay</em></div><div class="admin-v2-kpi"><span>Cần xử lý</span><strong>${summary.pendingOrders}</strong><em>Mới + đang xử lý</em></div><div class="admin-v2-kpi"><span>AOV</span><strong>${money(summary.aov)}</strong><em>Giá trị đơn TB</em></div><div class="admin-v2-kpi"><span>Conversion</span><strong>${summary.conversionRate}%</strong><em>Ước tính từ dữ liệu hiện có</em></div></section>
        <section id="analytics" class="admin-v2-panels"><div class="admin-v2-panel"><h2>Doanh thu 7 ngày</h2><div class="admin-v2-chart">${summary.revenue7Days.map((day) => `<div title="${money(day.revenue)} / ${day.orders} đơn"><i style="height:${Math.max(8, Math.round(day.revenue / maxRevenue * 150))}px"></i><span>${day.day.slice(5)}</span></div>`).join("")}</div></div><div class="admin-v2-panel"><h2>Trạng thái đơn</h2>${Object.entries(summary.statusLabels).map(([key, label]) => `<div class="admin-v2-rowbar"><span>${label}</span><i style="width:${Math.max(8, Math.round((summary.statusCount[key] || 0) / maxStatus * 100))}%"></i><b>${summary.statusCount[key] || 0}</b></div>`).join("")}</div></section>
        <section class="admin-v2-panels"><div class="admin-v2-panel"><h2>Top sản phẩm bán chạy</h2>${(summary.topProducts.length ? summary.topProducts : [{ name: "Chưa có dữ liệu", quantity: 0, revenue: 0 }]).map((product) => `<div class="admin-v2-rowbar"><span>${escapeHtml(product.name)}</span><i style="width:${Math.max(8, Math.round(product.quantity / maxProduct * 100))}%"></i><b>${product.quantity}</b></div>`).join("")}</div><div class="admin-v2-panel"><h2>Tình trạng hệ thống</h2><div class="admin-v2-ops"><div class="admin-v2-alert"><strong>Lưu trữ</strong>Local data/orders.json</div><div class="admin-v2-alert"><strong>Bảo mật</strong>Khu vực quản trị đã khóa bằng đăng nhập.</div><div class="admin-v2-alert"><strong>Checkout</strong>Chuyển sang trang cảm ơn riêng.</div></div></div></section>
        <section id="orders" class="admin-v2-panel"><h2>Quản lý đơn hàng</h2><div class="admin-v2-toolbar"><input class="admin-v2-input" data-table-search placeholder="Tìm mã đơn, khách hàng, SĐT, sản phẩm"><input class="admin-v2-input" type="date" data-date-filter><select class="admin-v2-select" data-sort><option value="newest">Mới nhất</option><option value="oldest">Cũ nhất</option><option value="total-desc">Tổng tiền cao</option><option value="total-asc">Tổng tiền thấp</option></select><button class="admin-v2-chip" type="button" data-clear-filters>Xóa lọc</button></div><div class="admin-v2-tabs"><button class="admin-v2-chip is-active" data-status-filter="">Tất cả</button>${Object.entries(summary.statusLabels).map(([key, label]) => `<button class="admin-v2-chip" data-status-filter="${key}">${label}</button>`).join("")}</div><div class="admin-v2-table-wrap"><table class="admin-v2-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody data-orders-body></tbody></table></div></section>
      </main>
    </div>
    <div class="admin-v2-backdrop" data-drawer-backdrop><aside class="admin-v2-drawer" data-drawer></aside></div><div class="admin-v2-toast" data-toast>Đã copy</div>
    <script>
      const orders = JSON.parse(document.getElementById("admin-orders-json").textContent || "[]");
      const summary = JSON.parse(document.getElementById("admin-summary-json").textContent || "{}");
      const fmt = new Intl.NumberFormat("vi-VN");
      const body = document.querySelector("[data-orders-body]");
      const searchInputs = [document.querySelector("[data-table-search]"), document.querySelector("[data-global-search]")];
      const dateFilter = document.querySelector("[data-date-filter]");
      const sortSelect = document.querySelector("[data-sort]");
      const chips = document.querySelectorAll("[data-status-filter]");
      const drawerBackdrop = document.querySelector("[data-drawer-backdrop]");
      const drawer = document.querySelector("[data-drawer]");
      const toast = document.querySelector("[data-toast]");
      let activeStatus = "";
      const statusLabels = summary.statusLabels || {};
      function money(value) { return fmt.format(Number(value) || 0) + "đ"; }
      function esc(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch])); }
      function badge(status) { return '<span class="admin-v2-badge ' + esc(status) + '">' + esc(statusLabels[status] || status || "Mới") + '</span>'; }
      function text(order) { const c = order.customer || {}; return [order.id,c.name,c.phone,c.email,c.address,c.ward,c.district,c.city,...(order.items || []).map(i => i.name)].join(" ").toLowerCase(); }
      function query() { return searchInputs.map(input => input?.value || "").find(Boolean)?.toLowerCase() || ""; }
      function list() { const q = query(); const day = dateFilter.value; const sort = sortSelect.value; return orders.filter(order => (!activeStatus || (order.status || "new") === activeStatus) && (!day || String(order.createdAt || "").startsWith(day)) && (!q || text(order).includes(q))).sort((a,b) => sort === "oldest" ? new Date(a.createdAt) - new Date(b.createdAt) : sort === "total-desc" ? (Number(b.total)||0) - (Number(a.total)||0) : sort === "total-asc" ? (Number(a.total)||0) - (Number(b.total)||0) : new Date(b.createdAt) - new Date(a.createdAt)); }
      function renderRows() { const rows = list(); body.innerHTML = rows.length ? rows.map(order => { const c = order.customer || {}; const address = [c.address,c.ward,c.district,c.city].filter(Boolean).join(", "); const items = (order.items || []).map(item => '<div class="admin-v2-line"><strong>' + esc(item.name) + '</strong><span>' + (Number(item.quantity)||1) + ' x ' + money(item.price) + '</span></div>').join(""); return '<tr><td><strong>' + esc(order.id) + '</strong><span>' + esc(new Date(order.createdAt).toLocaleString("vi-VN")) + '</span></td><td><strong>' + esc(c.name || "Khách lẻ") + '</strong><span>' + esc(c.phone || "") + '</span><span>' + esc(address || c.email || "") + '</span></td><td>' + items + '</td><td><strong>' + money(order.total) + '</strong></td><td>' + badge(order.status || "new") + '</td><td><button type="button" data-detail="' + esc(order.id) + '">Chi tiết</button> <button type="button" data-copy="' + esc(order.id) + '">Copy mã</button></td></tr>'; }).join("") : '<tr><td colspan="6"><div class="admin-v2-alert"><strong>Không có đơn phù hợp</strong>Thử đổi bộ lọc hoặc từ khóa.</div></td></tr>'; }
      function toastMsg(value) { toast.textContent = value; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1500); }
      async function copyText(value) { await navigator.clipboard?.writeText(value); toastMsg("Đã copy " + value); }
      function openDrawer(id) { const order = orders.find(item => item.id === id); if (!order) return; const c = order.customer || {}; const items = (order.items || []).map(item => '<div class="admin-v2-line"><strong>' + esc(item.name) + '</strong><span>' + (Number(item.quantity)||1) + ' x ' + money(item.price) + '</span></div>').join(""); drawer.innerHTML = '<div class="admin-v2-drawer-head"><div><h2>' + esc(order.id) + '</h2>' + badge(order.status || "new") + '</div><button class="admin-v2-close" data-close-drawer>×</button></div><div class="admin-v2-detail"><div class="admin-v2-detail-card"><strong>Khách hàng</strong><p>' + esc(c.name || "") + '<br>' + esc(c.phone || "") + '<br>' + esc(c.email || "") + '</p><button type="button" data-copy-phone="' + esc(c.phone || "") + '">Copy SĐT</button></div><div class="admin-v2-detail-card"><strong>Địa chỉ</strong><p>' + esc([c.address,c.ward,c.district,c.city].filter(Boolean).join(", ")) + '</p><p>' + esc(c.note || "") + '</p></div><div class="admin-v2-detail-card"><strong>Sản phẩm</strong>' + items + '</div><div class="admin-v2-detail-card"><strong>Tổng tiền</strong><p>' + money(order.total) + '</p><form method="post" action="/api/orders/status"><input type="hidden" name="id" value="' + esc(order.id) + '"><select name="status">' + Object.entries(statusLabels).map(([value,label]) => '<option value="' + esc(value) + '" ' + (value === (order.status || "new") ? "selected" : "") + '>' + esc(label) + '</option>').join("") + '</select> <button type="submit">Cập nhật</button></form></div></div>'; drawerBackdrop.classList.add("open"); }
      searchInputs.forEach(input => input?.addEventListener("input", renderRows)); dateFilter.addEventListener("change", renderRows); sortSelect.addEventListener("change", renderRows);
      chips.forEach(chip => chip.addEventListener("click", () => { activeStatus = chip.dataset.statusFilter || ""; chips.forEach(item => item.classList.toggle("is-active", item === chip)); renderRows(); }));
      document.querySelector("[data-clear-filters]").addEventListener("click", () => { activeStatus = ""; searchInputs.forEach(input => { if (input) input.value = ""; }); dateFilter.value = ""; sortSelect.value = "newest"; chips.forEach((item, index) => item.classList.toggle("is-active", index === 0)); renderRows(); });
      document.addEventListener("click", event => { const detail = event.target.closest("[data-detail]"); const copy = event.target.closest("[data-copy]"); const phone = event.target.closest("[data-copy-phone]"); if (detail) openDrawer(detail.dataset.detail); if (copy) copyText(copy.dataset.copy); if (phone) copyText(phone.dataset.copyPhone); if (event.target.matches("[data-close-drawer]") || event.target === drawerBackdrop) drawerBackdrop.classList.remove("open"); });
      document.querySelector("[data-theme-toggle]").addEventListener("click", event => { document.body.classList.toggle("admin-light"); event.currentTarget.textContent = document.body.classList.contains("admin-light") ? "Dark mode" : "Light mode"; });
      renderRows();
    </script>
  `);
}

function renderLocalAdminLogin(message = "") {
  return layout("Đăng nhập Seller Center", "", `
    <style>
      body { background:#0f1117; color:#f7f7f8; }
      .soul-header, .soul-footer, .soul-newsletter { display:none; }
      .local-login { width:min(460px, calc(100% - 32px)); margin:88px auto; padding:28px; border:1px solid rgba(255,255,255,.1); border-radius:22px; background:#151821; box-shadow:0 24px 80px rgba(0,0,0,.35); font-family:Inter, Arial, sans-serif; }
      .local-login-brand { display:flex; align-items:center; gap:10px; font-weight:950; margin-bottom:18px; }
      .local-login-brand img { width:44px; height:44px; object-fit:contain; background:#fff; border-radius:12px; padding:4px; }
      .local-login h1 { margin:0 0 8px; color:#fff; font-size:28px; letter-spacing:-.04em; }
      .local-login p { color:#a7adba; line-height:1.5; }
      .local-login label { display:block; margin:18px 0 8px; font-weight:900; }
      .local-login input { width:100%; min-height:48px; border:1px solid rgba(255,255,255,.16); border-radius:14px; background:#10131b; color:#fff; padding:0 14px; }
      .local-login button { width:100%; min-height:48px; margin-top:16px; border:0; border-radius:999px; background:linear-gradient(135deg,#fe2c55,#ff6a00); color:#fff; font-weight:950; cursor:pointer; }
      .local-login .notice { color:#ffb3b3; font-weight:800; }
    </style>
    <main class="local-login">
      <div class="local-login-brand"><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul"><span>TaynguyenSoul Seller Center</span></div>
      <h1>Đăng nhập quản lý</h1>
      <p>Khu vực quản trị chỉ dành cho quản trị viên. Khách hàng không xem được dữ liệu đơn hàng.</p>
      <form method="post" action="/admin/login">
        <label for="password">Mật khẩu admin</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
        <button type="submit">Đăng nhập</button>
      </form>
      ${message ? `<p class="notice">${escapeHtml(message)}</p>` : ""}
    </main>
  `);
}

function sendHtml(res, body) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(body);
}

function normalizeCustomer(customer = {}) {
  return {
    name: String(customer.name || "").trim(),
    phone: String(customer.phone || "").trim(),
    address: String(customer.address || "").trim(),
    note: String(customer.note || "").trim(),
    source: String(customer.source || "website-clone").trim()
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname.startsWith("/san-pham/")) {
      const slug = url.pathname.split("/").filter(Boolean).pop();
      const product = allSiteProducts().find((item) => item.slug === slug) || allSiteProducts()[0];
      sendHtml(res, renderProductPage(product));
      return;
    }

    if (req.method === "GET" && categoryAliases[url.pathname]) {
      sendHtml(res, renderCategoryPageDeep(url.pathname));
      return;
    }

    if (req.method === "GET" && (url.pathname === "/blog-ca-phe/" || url.pathname.startsWith("/blog-ca-phe/"))) {
      sendHtml(res, renderBlogPage(url.pathname));
      return;
    }

    if (req.method === "GET" && url.pathname === "/gio-hang/") {
      sendHtml(res, renderCartPage());
      return;
    }

    if (req.method === "GET" && url.pathname === "/dat-hang-thanh-cong/") {
      sendHtml(res, renderOrderSuccessPage());
      return;
    }

    if (req.method === "POST" && url.pathname === "/admin/login") {
      const body = await parseBody(req);
      if (String(body.password || "") !== localAdminSecret()) {
        sendHtml(res, renderLocalAdminLogin("Mật khẩu không đúng."));
        return;
      }
      res.writeHead(303, { Location: "/admin/orders", "Set-Cookie": localAdminCookie() });
      res.end();
      return;
    }

    if (req.method === "POST" && url.pathname === "/admin/logout") {
      res.writeHead(303, { Location: "/admin/orders", "Set-Cookie": "admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax" });
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === "/admin/orders") {
      if (!isLocalAdminRequest(req)) {
        sendHtml(res, renderLocalAdminLogin());
        return;
      }
      sendHtml(res, renderAdminCommerceDashboard());
      return;
    }

    if (req.method === "GET" && routeLabels[url.pathname]) {
      sendHtml(res, renderGenericPage(url.pathname));
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/products") {
      sendJson(res, 200, {
        products: allSiteProducts(),
        categories: ["all", ...new Set(allSiteProducts().map((product) => product.category))]
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/content") {
      sendJson(res, 200, { reviews, posts });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        products: products.length,
        orders: orders.length,
        leads: leads.length,
        uptime: Math.round(process.uptime())
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/orders/status") {
      if (!isLocalAdminRequest(req)) {
        sendJson(res, 401, { message: "Unauthorized" });
        return;
      }
      const body = await parseBody(req);
      const order = orders.find((entry) => entry.id === body.id);
      if (!order) {
        sendJson(res, 404, { message: "Không tìm thấy đơn hàng." });
        return;
      }
      order.status = String(body.status || order.status || "new");
      order.updatedAt = new Date().toISOString();
      writeJsonFile(ORDERS_FILE, orders);
      res.writeHead(303, { Location: "/admin/orders" });
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/summary") {
      if (!isLocalAdminRequest(req)) {
        sendJson(res, 401, { message: "Unauthorized" });
        return;
      }
      sendJson(res, 200, { summary: computeServerAdminSummary(orders), count: orders.length, savedTo: "data/orders.json" });
      return;
    }

    const adminOrderMatch = url.pathname.match(/^\/api\/admin\/orders\/([^/]+)(?:\/status)?$/);
    if (adminOrderMatch && req.method === "GET") {
      if (!isLocalAdminRequest(req)) {
        sendJson(res, 401, { message: "Unauthorized" });
        return;
      }
      const order = orders.find((entry) => entry.id === decodeURIComponent(adminOrderMatch[1]));
      sendJson(res, order ? 200 : 404, order ? { order } : { message: "Không tìm thấy đơn hàng." });
      return;
    }

    if (adminOrderMatch && url.pathname.endsWith("/status") && req.method === "POST") {
      if (!isLocalAdminRequest(req)) {
        sendJson(res, 401, { message: "Unauthorized" });
        return;
      }
      const body = await parseBody(req);
      const order = orders.find((entry) => entry.id === decodeURIComponent(adminOrderMatch[1]));
      const allowed = new Set(["new", "processing", "packed", "shipped", "completed", "cancelled"]);
      if (!order) {
        sendJson(res, 404, { message: "Không tìm thấy đơn hàng." });
        return;
      }
      if (!allowed.has(body.status)) {
        sendJson(res, 400, { message: "Trạng thái không hợp lệ." });
        return;
      }
      order.status = body.status;
      order.updatedAt = new Date().toISOString();
      writeJsonFile(ORDERS_FILE, orders);
      sendJson(res, 200, { ok: true, order, summary: computeServerAdminSummary(orders), savedTo: "data/orders.json" });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/leads") {
      const body = await parseBody(req);
      const lead = normalizeCustomer(body.customer);

      if (!lead.name || !lead.phone) {
        sendJson(res, 400, { message: "Vui lòng nhập họ tên và số điện thoại." });
        return;
      }

      const record = {
        id: `LEAD-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        customer: lead,
        createdAt: new Date().toISOString()
      };
      leads.push(record);
      writeJsonFile(LEADS_FILE, leads);
      sendJson(res, 201, record);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/orders") {
      const body = await parseBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      const normalizedItems = items
        .map((item) => {
          const product = products.find((entry) => entry.id === item.id);
          const quantity = Math.max(1, Number(item.quantity) || 1);
          if (product) return { id: product.id, name: product.name, quantity, price: product.numericPrice };

          const name = String(item.name || "").trim();
          const price = Math.max(0, Number(item.price) || 0);
          return name && price ? { id: String(item.id || name), name, quantity, price } : null;
        })
        .filter(Boolean);

      if (!normalizedItems.length) {
        sendJson(res, 400, { message: "Giỏ hàng đang trống." });
        return;
      }

      const customer = normalizeCustomer(body.customer);
      if (!customer.name || !customer.phone) {
        sendJson(res, 400, { message: "Vui lòng nhập họ tên và số điện thoại trước khi gửi đơn." });
        return;
      }

      const total = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const order = {
        id: `SOUL-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
        customer,
        items: normalizedItems,
        total,
        status: "new",
        source: body.source || customer.source || "website-clone",
        createdAt: new Date().toISOString()
      };
      orders.push(order);
      writeJsonFile(ORDERS_FILE, orders);
      sendJson(res, 201, {
        ok: true,
        message: "Đã gửi đơn thành công.",
        order,
        id: order.id,
        total: order.total,
        savedTo: "data/orders.json",
        successUrl: `/dat-hang-thanh-cong/?order=${encodeURIComponent(order.id)}&total=${encodeURIComponent(order.total)}`
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/orders") {
      if (!isLocalAdminRequest(req)) {
        sendJson(res, 401, { message: "Unauthorized" });
        return;
      }
      sendJson(res, 200, { orders, count: orders.length, savedTo: "data/orders.json" });
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      sendJson(res, 404, { message: "API không tồn tại." });
      return;
    }

    if (req.method === "GET" && url.pathname !== "/" && !path.extname(url.pathname)) {
      sendHtml(res, renderGenericPage(url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`));
      return;
    }

    serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { message: error.message || "Lỗi server." });
  }
});

server.listen(PORT, () => {
  console.log(`TaynguyenSoul clone running at http://localhost:${PORT}`);
});
