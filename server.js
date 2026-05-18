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

function catalogImage(title, subtitle, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>
    <rect width="900" height="900" rx="64" fill="#f8fafc"/>
    <rect x="56" y="56" width="788" height="788" rx="48" fill="url(#g)" opacity=".12"/>
    <circle cx="700" cy="180" r="92" fill="${color}" opacity=".16"/>
    <path d="M452 178c-98 58-154 150-154 252 0 122 72 207 154 246 82-39 154-124 154-246 0-102-56-194-154-252Z" fill="${color}" opacity=".86"/>
    <path d="M452 248v330M452 410c-66-74-140-110-222-108M452 480c70-64 142-96 216-94" stroke="#fff" stroke-width="28" stroke-linecap="round" fill="none"/>
    <rect x="112" y="640" width="676" height="148" rx="28" fill="#fff"/>
    <text x="450" y="705" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#111827">${title}</text>
    <text x="450" y="755" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#64748b">${subtitle}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const activeCatalog = "vtnn";

const vtnnProducts = [
  {
    id: "phan-bon-trichotec-phuc-hoi-dat-thoai-hoa-thoi-re-vang-la",
    slug: "phan-bon-trichotec-phuc-hoi-dat-thoai-hoa-thoi-re-vang-la",
    name: "Phân bón TRICHOTEC phục hồi đất thoái hoá, thối rễ, vàng lá",
    category: "Kích rễ - phục hồi đất",
    badge: "-18%",
    sold: "Đã bán 1.2k+",
    rating: 4.8,
    reviews: 86,
    origin: "Phục hồi rễ, cải tạo đất",
    oldPrice: "185.000đ",
    price: "152.000đ",
    numericPrice: 152000,
    stock: 34,
    image: catalogImage("TRICHOTEC", "Thối rễ - vàng lá", "#16a34a"),
    url: "/san-pham/phan-bon-trichotec-phuc-hoi-dat-thoai-hoa-thoi-re-vang-la/"
  },
  {
    id: "phan-bon-1-80-1-tao-mam-hoa-chong-nghen-hoa",
    slug: "phan-bon-1-80-1-tao-mam-hoa-chong-nghen-hoa",
    name: "Phân bón 1-80-1 tạo mầm hoa, chống nghẹn hoa, bung hoa mạnh",
    category: "Tạo mầm hoa",
    badge: "-22%",
    sold: "Đã bán 960+",
    rating: 4.9,
    reviews: 74,
    origin: "Ra hoa đồng loạt",
    oldPrice: "120.000đ",
    price: "94.000đ",
    numericPrice: 94000,
    stock: 48,
    image: catalogImage("1-80-1", "Tạo mầm hoa", "#dc2626"),
    url: "/san-pham/phan-bon-1-80-1-tao-mam-hoa-chong-nghen-hoa/"
  },
  {
    id: "phan-bon-chong-be-gai-nut-trai-canxi-bo",
    slug: "phan-bon-chong-be-gai-nut-trai-canxi-bo",
    name: "Phân bón chống bể gai nứt trái, cuống dẻo dai, xanh trái",
    category: "Dưỡng trái - chống nứt",
    badge: "-15%",
    sold: "Đã bán 2.4k+",
    rating: 4.85,
    reviews: 121,
    origin: "Dưỡng trái sầu riêng",
    oldPrice: "165.000đ",
    price: "140.000đ",
    numericPrice: 140000,
    stock: 39,
    image: catalogImage("CANXI BO", "Dưỡng trái - xanh gai", "#f59e0b"),
    url: "/san-pham/phan-bon-chong-be-gai-nut-trai-canxi-bo/"
  },
  {
    id: "sun-mite43sc-sach-nhen-mat-cay",
    slug: "sun-mite43sc-sach-nhen-mat-cay",
    name: "SUN-MITE43SC sạch nhện, mát cây, an toàn cho bông",
    category: "Trừ sâu - rầy - nhện",
    badge: "-12%",
    sold: "Đã bán 780+",
    rating: 4.76,
    reviews: 52,
    origin: "Quản lý nhện đỏ",
    oldPrice: "98.000đ",
    price: "86.000đ",
    numericPrice: 86000,
    stock: 45,
    image: catalogImage("SUN-MITE", "Sạch nhện - mát cây", "#7c3aed"),
    url: "/san-pham/sun-mite43sc-sach-nhen-mat-cay/"
  },
  {
    id: "sun-azocy-50wg-tru-benh-noi-hap-luu-dan",
    slug: "sun-azocy-50wg-tru-benh-noi-hap-luu-dan",
    name: "SUN AZOCY 50WG trừ bệnh nội hấp, lưu dẫn mạnh, phổ rộng",
    category: "Thuốc bệnh cây",
    badge: "-20%",
    sold: "Đã bán 1k+",
    rating: 4.88,
    reviews: 69,
    origin: "Nội hấp, lưu dẫn",
    oldPrice: "210.000đ",
    price: "168.000đ",
    numericPrice: 168000,
    stock: 22,
    image: catalogImage("AZOCY", "Thuốc bệnh nội hấp", "#0f766e"),
    url: "/san-pham/sun-azocy-50wg-tru-benh-noi-hap-luu-dan/"
  },
  {
    id: "phan-bon-vi-luong-combi-gold-chelate",
    slug: "phan-bon-vi-luong-combi-gold-chelate",
    name: "Phân bón vi lượng COMBI GOLD dạng chelate giúp phục hồi bộ rễ",
    category: "Vi lượng - chelate",
    badge: "-17%",
    sold: "Đã bán 650+",
    rating: 4.83,
    reviews: 44,
    origin: "Bổ sung vi lượng thiết yếu",
    oldPrice: "620.000đ",
    price: "515.000đ",
    numericPrice: 515000,
    stock: 18,
    image: catalogImage("COMBI GOLD", "Vi lượng chelate", "#ca8a04"),
    url: "/san-pham/phan-bon-vi-luong-combi-gold-chelate/"
  },
  {
    id: "phan-bon-huu-co-nutri-green-dam-trung-sua",
    slug: "phan-bon-huu-co-nutri-green-dam-trung-sua",
    name: "Phân bón hữu cơ NUTRI GREEN dịch trái cây ủ, đạm trứng sữa",
    category: "Hữu cơ - cải tạo đất",
    badge: "-19%",
    sold: "Đã bán 1.5k+",
    rating: 4.91,
    reviews: 98,
    origin: "Hữu cơ, amino, cải tạo đất",
    oldPrice: "135.000đ",
    price: "109.000đ",
    numericPrice: 109000,
    stock: 56,
    image: catalogImage("NUTRI GREEN", "Hữu cơ - amino", "#059669"),
    url: "/san-pham/phan-bon-huu-co-nutri-green-dam-trung-sua/"
  },
  {
    id: "phan-bon-sieu-kich-dot-super-growth",
    slug: "phan-bon-sieu-kich-dot-super-growth",
    name: "Phân bón SUPER GROWTH siêu đâm chồi, bung tược, lá xanh dày",
    category: "Kích đọt - sinh trưởng",
    badge: "-16%",
    sold: "Đã bán 890+",
    rating: 4.82,
    reviews: 63,
    origin: "Kích đọt, phục hồi sau thu hoạch",
    oldPrice: "145.000đ",
    price: "122.000đ",
    numericPrice: 122000,
    stock: 41,
    image: catalogImage("SUPER GROWTH", "Bung đọt - xanh lá", "#22c55e"),
    url: "/san-pham/phan-bon-sieu-kich-dot-super-growth/"
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
  "/ca-phe/": "Tất cả vật tư nông nghiệp",
  "/smooth/": "Phân bón phục hồi",
  "/high-caffeine/": "Thuốc sâu bệnh",
  "/ca-phe-cold-brew/": "Dưỡng hoa - dưỡng trái",
  "/may-pha-ca-phe-cam-tay/": "Thiết bị tưới phun",
  "/dung-cu-pha-ca-phe/": "Dụng cụ nông nghiệp",
  "/giftset-combo/": "Combo chăm vườn",
  "/blog-ca-phe/": "Kỹ thuật canh tác",
  "/ve-taynguyensoul/": "Về VTNN Green Farming Dream",
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
  "/ca-phe/": [],
  "/smooth/": ["Kích rễ - phục hồi đất", "Hữu cơ - cải tạo đất", "Vi lượng - chelate", "Kích đọt - sinh trưởng"],
  "/high-caffeine/": ["Trừ sâu - rầy - nhện", "Thuốc bệnh cây"],
  "/ca-phe-cold-brew/": ["Tạo mầm hoa", "Dưỡng trái - chống nứt"],
  "/may-pha-ca-phe-cam-tay/": ["Thiết bị tưới phun"],
  "/dung-cu-pha-ca-phe/": ["Dụng cụ nông nghiệp"],
  "/giftset-combo/": ["Kích rễ - phục hồi đất", "Dưỡng trái - chống nứt", "Vi lượng - chelate"]
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
  if (activeCatalog === "vtnn") return vtnnProducts;
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
  const isPlantCare = /nông|nong|phân|phan|bón|bon|rễ|re |rễ-|re-|vàng lá|vang-la|cây trồng|cay-trong|thuốc|thuoc|vật tư|vat-tu|hữu cơ|huu-co|npk|vi sinh|bệnh|benh|sâu|sau|rầy|ray|nhện|nhen|tưới|tuoi|phun|xịt|xit|kẽm|kem|canxi|bo|humic|fulvic|amino|trái|trai|hoa|đọt|dot|sầu riêng|sau-rieng/.test(text);
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
  const plantProfiles = {
    root: {
      articleTitle: "Phục hồi rễ, cải tạo đất và giảm vàng lá",
      articleBody: "Nhóm sản phẩm này phù hợp cho vườn sau thu hoạch, cây suy yếu, rễ kém hấp thu hoặc có dấu hiệu vàng lá. Nội dung được cấu hình theo nguồn VTNN Đạ Tẻh với trọng tâm là phục hồi bộ rễ, giải độc đất và tăng khả năng hút dinh dưỡng.",
      quote: "Ưu tiên xử lý nền rễ trước, sau đó mới đẩy đọt, kéo hoa hoặc dưỡng trái để cây đi bền hơn.",
      specs: [
        ["Nhóm công dụng", "Kích rễ, phục hồi đất, hỗ trợ cây suy yếu"],
        ["Dấu hiệu phù hợp", "Rễ yếu, vàng lá, cây chậm phát, sau thu hoạch"],
        ["Cách dùng", "Pha tưới gốc hoặc phun theo hướng dẫn trên bao bì"],
        ["Thời điểm", "Sáng sớm hoặc chiều mát, tránh nắng gắt"],
        ["Lưu ý", "Không tăng liều khi cây đang sốc nước hoặc suy nặng"]
      ],
      highlights: ["Hỗ trợ bung rễ mới và tăng hấp thu", "Giảm vàng lá do rễ hoạt động kém", "Phù hợp giai đoạn phục hồi sau thu hoạch", "Tối ưu khi kết hợp quản lý ẩm độ đất"],
      reviews: [
        ["Anh Trí", "Tưới đúng liều, cây sầu riêng ra rễ cám lại và lá đứng hơn."],
        ["Chị Hân", "Shop tư vấn kỹ giai đoạn phục hồi, đóng hàng chắc chắn."],
        ["Minh Vườn", "Dễ pha, dùng tiết kiệm hơn mua lẻ nhiều loại."]
      ],
      affiliate: ["Chia sẻ để nhận 9.600đ", "8% hoa hồng"]
    },
    flower: {
      articleTitle: "Tạo mầm hoa, kéo hoa và chống nghẹn bông",
      articleBody: "Nhóm sản phẩm ra hoa được cấu hình từ các dòng như TRIMETHYL, 1-80-1, CALAMIN BOS, Kích Phát Tố và C800 GOLD trên nguồn Lazada. Nội dung tập trung vào xử lý mầm hoa, kéo bông, chống nghẹn hoa và tăng tỷ lệ đậu trái non.",
      quote: "Giai đoạn hoa cần đi đúng nhịp: tạo mầm, kéo hoa, dưỡng bông và giữ trái non.",
      specs: [
        ["Nhóm công dụng", "Tạo mầm hoa, kéo hoa, chống nghẹn bông"],
        ["Dấu hiệu phù hợp", "Hoa lọt sọt, nghẹn hoa, bông yếu, cần ra hoa đồng loạt"],
        ["Cách dùng", "Phun lá theo lịch xử lý ra hoa của từng cây trồng"],
        ["Thời điểm", "Trước và trong giai đoạn phân hóa mầm hoa"],
        ["Lưu ý", "Không phối trộn tùy tiện với thuốc có tính nóng"]
      ],
      highlights: ["Hỗ trợ ra hoa đồng loạt", "Giảm nghẹn hoa và khô đen bông", "Tăng sức bông, sáng mắt cua", "Phù hợp cây ăn trái cần xử lý mùa vụ"],
      reviews: [
        ["Nhà vườn Lâm Đồng", "Dùng đúng lịch, bông ra đều hơn và dễ quản lý đợt hoa."],
        ["Anh Phúc", "Hàng đúng mô tả, shop nhắc kỹ không lạm liều."],
        ["Cô Mai", "Phù hợp giai đoạn kéo bông, cây không bị nóng lá."]
      ],
      affiliate: ["Chia sẻ để nhận 12.500đ", "8% hoa hồng"]
    },
    fruit: {
      articleTitle: "Dưỡng trái, chống nứt và cải thiện mẫu mã",
      articleBody: "Nhóm dưỡng trái lấy cảm hứng từ các dòng chống bể gai nứt trái, sửa tướng trái, canxi-bo, phân sầu riêng và dưỡng trái trên nguồn VTNN Đạ Tẻh. Mục tiêu là giúp trái lớn đều, vỏ chắc, xanh gai và hạn chế rụng/nứt trái.",
      quote: "Dưỡng trái tốt không chỉ làm trái lớn mà còn giữ cuống, giữ vỏ và ổn định mẫu mã.",
      specs: [
        ["Nhóm công dụng", "Dưỡng trái, chống nứt, giữ cuống, xanh gai"],
        ["Dấu hiệu phù hợp", "Trái chậm lớn, dễ nứt, cuống yếu, mẫu mã không đều"],
        ["Dinh dưỡng trọng tâm", "Canxi, bo, vi lượng, amino, hữu cơ"],
        ["Cách dùng", "Phun hoặc tưới theo từng giai đoạn nuôi trái"],
        ["Lưu ý", "Theo dõi ẩm độ để hạn chế nứt trái do sốc nước"]
      ],
      highlights: ["Hỗ trợ trái tròn đều và chắc vỏ", "Giảm rụng trái non, nứt trái", "Cải thiện xanh gai, sáng trái, đẹp mã", "Phù hợp sầu riêng và cây ăn trái"],
      reviews: [
        ["Vườn Đạ Tẻh", "Trái đều hơn, cuống chắc và mẫu mã nhìn sáng hơn."],
        ["Anh Quốc", "Shop gợi ý đúng giai đoạn nuôi trái, không bán lan man."],
        ["Chị Dung", "Hàng đóng kỹ, dùng cho sầu riêng thấy dễ theo dõi."]
      ],
      affiliate: ["Chia sẻ để nhận 15.000đ", "8% hoa hồng"]
    },
    pest: {
      articleTitle: "Quản lý sâu, rầy, nhện và côn trùng gây hại",
      articleBody: "Nhóm này dựa trên các sản phẩm như ZHEOS 555WG và SUN-MITE43SC trong nguồn Lazada. Nội dung tập trung vào xử lý sâu, rầy, nhện với yêu cầu phun đúng thời điểm, đúng liều và luân phiên hoạt chất để hạn chế kháng thuốc.",
      quote: "Xử lý sâu rầy hiệu quả phải đúng đối tượng, đúng tuổi sâu và không phun lặp một hoạt chất quá nhiều lần.",
      specs: [
        ["Nhóm công dụng", "Trừ sâu, rầy, nhện và côn trùng chích hút"],
        ["Dấu hiệu phù hợp", "Lá xoăn, chồi non hư, nhện đỏ, rầy xuất hiện mật số cao"],
        ["Cách dùng", "Phun ướt đều tán lá, mặt dưới lá và vùng non"],
        ["Thời điểm", "Chiều mát, tránh mưa ngay sau phun"],
        ["Lưu ý", "Mang bảo hộ và tuân thủ thời gian cách ly"]
      ],
      highlights: ["Tác động nhanh lên nhóm sâu rầy nhện", "Phù hợp xử lý khi mật số tăng", "Cần luân phiên hoạt chất để bền hiệu quả", "Tư vấn kỹ trước khi phối trộn"],
      reviews: [
        ["Anh Sơn", "Shop hỏi đúng tình trạng vườn rồi mới tư vấn thuốc."],
        ["Cô Hạnh", "Phun theo hướng dẫn, nhện giảm rõ sau khi theo dõi lại."],
        ["Nhà vườn Đức", "Đóng gói cẩn thận, có nhắc bảo hộ và cách ly."]
      ],
      affiliate: ["Chia sẻ để nhận 11.000đ", "7% hoa hồng"]
    },
    disease: {
      articleTitle: "Phòng trừ bệnh nội hấp, thối rễ và xì mủ",
      articleBody: "Nhóm thuốc bệnh được cấu hình theo các dòng SUN METAZO, SUN AZOCY, DONA FOSK và TRICHOTEC trong nguồn Lazada. Nội dung hướng đến bệnh do nấm/khuẩn, thối rễ, vàng lá, xì mủ và các tình trạng cần hoạt chất nội hấp/lưu dẫn.",
      quote: "Với bệnh cây, cần xác định đúng triệu chứng trước khi phun để tránh tốn thuốc mà không trúng nguyên nhân.",
      specs: [
        ["Nhóm công dụng", "Phòng trừ nấm bệnh, thối rễ, vàng lá, xì mủ"],
        ["Dấu hiệu phù hợp", "Lá vàng, rễ thối, xì mủ, cháy lá, bệnh lan sau mưa"],
        ["Cơ chế ưu tiên", "Nội hấp, lưu dẫn hoặc hỗ trợ tăng kháng thể cây"],
        ["Cách dùng", "Phun/tưới theo đúng bệnh và hướng dẫn bao bì"],
        ["Lưu ý", "Không phối trộn khi chưa kiểm tra tương thích"]
      ],
      highlights: ["Hỗ trợ xử lý bệnh sau mưa ẩm", "Tập trung thối rễ, vàng lá, xì mủ", "Ưu tiên hoạt chất nội hấp/lưu dẫn", "Cần chẩn đoán đúng trước khi dùng"],
      reviews: [
        ["Anh Lợi", "Gửi hình cây bệnh, shop tư vấn đúng hướng xử lý hơn."],
        ["Chị Thảo", "Dùng theo liều nhắc trên đơn, cây giảm lan bệnh."],
        ["Vườn Gia Lai", "Hàng mới, nhãn rõ, tư vấn không phối bừa."]
      ],
      affiliate: ["Chia sẻ để nhận 13.500đ", "7% hoa hồng"]
    },
    micronutrient: {
      articleTitle: "Bổ sung vi lượng, kẽm, canxi-bo cho cây khỏe",
      articleBody: "Nhóm này dựa trên COMBI GOLD, SIÊU KẼM, ÁO GIÁP KẼM, YMC1, CANXI-BO và các dòng vi lượng trong nguồn Lazada. Nội dung tập trung vào bổ sung thiếu hụt dinh dưỡng, cứng mô, xanh lá, chống rụng và cải thiện đề kháng.",
      quote: "Vi lượng đúng lúc giúp cây khỏe mô, xanh lá, giảm rụng và hấp thu phân chính tốt hơn.",
      specs: [
        ["Nhóm công dụng", "Vi lượng, kẽm, canxi-bo, chelate"],
        ["Dấu hiệu phù hợp", "Lá nhạt, xoăn ngọn, rụng hoa/trái non, mô yếu"],
        ["Dạng dinh dưỡng", "Chelate, trung vi lượng, canxi-bo"],
        ["Cách dùng", "Phun lá hoặc tưới tùy sản phẩm"],
        ["Lưu ý", "Không thay thế hoàn toàn phân nền NPK"]
      ],
      highlights: ["Bổ sung vi lượng thiết yếu dạng dễ hấp thu", "Hỗ trợ xanh lá, dày lá, cứng mô", "Giảm rụng hoa và trái non", "Tốt cho giai đoạn nuôi đọt, hoa, trái"],
      reviews: [
        ["Cô Lan", "Lá xanh và dày hơn, cây nhìn khỏe sau vài lần chăm."],
        ["Anh Tâm", "Dùng kèm phân nền thấy cây hấp thu tốt hơn."],
        ["Nhà vườn Bảo Lộc", "Shop phân biệt rõ kẽm, canxi-bo và vi lượng tổng."]
      ],
      affiliate: ["Chia sẻ để nhận 10.800đ", "8% hoa hồng"]
    },
    organic: {
      articleTitle: "Hữu cơ, humic, amino và cải tạo nền đất",
      articleBody: "Nhóm hữu cơ được cấu hình theo NUTRI GREEN, XANH HOÁ, NITROPOTAS, ĐẠM CÁ - RONG BIỂN và các dòng humic/fulvic/amino trong nguồn Lazada. Mục tiêu là nuôi đất, mát cây, tăng lực và giúp cây phục hồi bền hơn.",
      quote: "Muốn cây đi dài vụ, nền hữu cơ và vi sinh trong đất cần được chăm song song với phân khoáng.",
      specs: [
        ["Nhóm công dụng", "Hữu cơ, humic, fulvic, amino, rong biển"],
        ["Dấu hiệu phù hợp", "Đất chai, cây stress, cây sau thu hoạch, cần tăng lực"],
        ["Lợi ích chính", "Cải tạo đất, mát cây, xanh lá, tăng hấp thu"],
        ["Cách dùng", "Tưới gốc hoặc phun theo khuyến nghị"],
        ["Lưu ý", "Hiệu quả bền cần dùng theo chu kỳ, không nóng vội"]
      ],
      highlights: ["Cải tạo đất và phục hồi hệ rễ", "Bổ sung amino, humic, hữu cơ dễ hấp thu", "Giúp cây mát và giảm stress", "Phù hợp chăm nền dài hạn"],
      reviews: [
        ["Anh Khoa", "Đất tơi hơn, cây sau thu hoạch hồi nhẹ nhàng hơn."],
        ["Chị Vy", "Dòng hữu cơ dễ dùng, không bị sốc cây."],
        ["Vườn Đức Trọng", "Shop tư vấn dùng theo chu kỳ nên dễ kiểm soát chi phí."]
      ],
      affiliate: ["Chia sẻ để nhận 12.000đ", "8% hoa hồng"]
    },
    growth: {
      articleTitle: "Kích đọt, bung chồi và phục hồi sinh trưởng",
      articleBody: "Nhóm sinh trưởng lấy từ các dòng TEEN, SIÊU KÍCH ĐỌT, SUPER GROWTH, MAX DINH DƯỠNG và GONIK trong nguồn Lazada. Nội dung tập trung vào bung đọt, xanh lá, mập cành và phục hồi sau thu hoạch.",
      quote: "Kích đọt nên đi sau khi rễ đủ khỏe, nếu không cây dễ ra đọt yếu và khó nuôi trái về sau.",
      specs: [
        ["Nhóm công dụng", "Bung chồi, kích đọt, xanh lá, phục hồi"],
        ["Dấu hiệu phù hợp", "Cây chậm ra đọt, lá mỏng, cành yếu, sau thu hoạch"],
        ["Cách dùng", "Phun lá hoặc tưới theo lịch ra đọt"],
        ["Thời điểm", "Sau khi cây đã ổn rễ và đủ ẩm"],
        ["Lưu ý", "Không ép đọt khi cây đang thiếu nước hoặc bệnh nặng"]
      ],
      highlights: ["Hỗ trợ bung chồi và đâm đọt mạnh", "Giúp lá xanh, dày và cành mập hơn", "Phù hợp phục hồi sau thu hoạch", "Nên kết hợp chăm rễ để cây đi bền"],
      reviews: [
        ["Anh Hải", "Đọt lên đều hơn, lá non mập và xanh hơn đợt trước."],
        ["Chị Nhung", "Shop dặn xử lý rễ trước nên cây không bị đuối."],
        ["Vườn Cát Tiên", "Hàng đúng loại, dùng theo lịch thấy dễ kiểm soát."]
      ],
      affiliate: ["Chia sẻ để nhận 10.500đ", "8% hoa hồng"]
    }
  };

  function selectPlantProfile() {
    if (/sâu|sau |sâu-|rầy|ray|nhện|nhen|mite|zheos|côn trùng|con-trung/.test(text)) return plantProfiles.pest;
    if (/bệnh|benh|nấm|nam|thối|thoi|xì mủ|xi-mu|metazo|azocy|fosk|trichotec|phytophthora|fusarium|oidium/.test(text)) return plantProfiles.disease;
    if (/hoa|bông|bong|mầm|mam|nghẹn|nghen|trimethyl|1-80-1|calamin|c800|kéo vọt|keo-vot|sóc nâu|soc-nau/.test(text)) return plantProfiles.flower;
    if (/kẽm|kem|vi lượng|vi-luong|combi|chelate|ymc|áo giáp|ao-giap|đồng thau|dong-thau/.test(text)) return plantProfiles.micronutrient;
    if (/hữu cơ|huu-co|humic|fulvic|amino|rong biển|rong-bien|đạm cá|dam-ca|nutri|xanh hoá|xanh-hoa|nitropotas/.test(text)) return plantProfiles.organic;
    if (/đọt|dot|chồi|choi|teen|super growth|siêu kích|sieu-kich|max dinh dưỡng|max-dinh-duong|gonik/.test(text)) return plantProfiles.growth;
    if (/rễ|re |rễ-|re-|roots|root|vàng lá|vang-la|giải độc|giai-doc|cải tạo đất|cai-tao-dat/.test(text)) return plantProfiles.root;
    if (/trái|trai|gai|nứt|nut|bể|be|cuống|cuong|sầu riêng|sau-rieng|sửa tướng|sua-tuong|canxi|bo/.test(text)) return plantProfiles.fruit;
    return Object.values(plantProfiles)[stableProductIndex(product, Object.keys(plantProfiles).length)];
  }

  if (isPlantCare) return selectPlantProfile();
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
  return allSiteProducts().filter((product) => {
    const matchesCategory = category === "all" || product.category === category;
    const haystack = `${product.name} ${product.category} ${product.origin}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });
}

function header(active = "") {
  const item = (href, label) => `<a class="${active === href ? "active" : ""}" href="${href}">${label}</a>`;
  return `
    <div class="soul-promo-bar">VTNN ĐẠ TẺH - GIẢI PHÁP CHĂM VƯỜN THEO TỪNG GIAI ĐOẠN <a href="/ca-phe/">Mua ngay →</a></div>
    <header class="soul-header">
      <button class="mobile-menu-toggle" type="button" aria-label="Mở menu" aria-expanded="false"><span></span><span></span><span></span></button>
      <nav class="soul-nav">
        ${item("/ca-phe/", "Vật tư nông nghiệp")}
        ${item("/smooth/", "Phân bón")}
        ${item("/high-caffeine/", "Thuốc sâu bệnh")}
      </nav>
      <a class="soul-logo" href="/">
        <img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul">
      </a>
      <nav class="soul-nav right">
        ${item("/ca-phe-cold-brew/", "Hoa & trái")}
        ${item("/blog-ca-phe/", "Kỹ thuật")}
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
      <div class="soul-breadcrumb"><a href="/">Trang chủ</a> / <a href="/ca-phe/">Vật tư nông nghiệp</a> / ${escapeHtml(product.category)}</div>
      <section class="product-detail">
        <div>
          <div class="product-gallery">
            <div class="product-thumbs">
              ${media.map(renderGalleryThumb).join("")}
              <button class="product-video-thumb" type="button" data-video-open data-video-src="${escapeHtml(productVideo.embed)}" aria-label="Xem video san pham">
                <img src="${escapeHtml(productVideo.thumbnail)}" alt="">
                <span>▶</span>
              </button>
            </div>
            <img class="product-hero-image" src="${escapeHtml(firstImage.src)}" alt="${escapeHtml(product.name)}" data-gallery-image>
            <div class="product-video-inline" aria-hidden="true" data-video-inline>
              <iframe title="${escapeHtml(product.name)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen data-video-inline-frame></iframe>
              <video muted playsinline loop data-video-native></video>
            </div>
            <button class="video-play-button${firstVideo ? "" : " is-hidden"}" type="button" ${firstVideo ? `data-video-open data-video-src="${escapeHtml(firstVideo.src)}"` : `aria-hidden="true"`} aria-label="Xem video san pham">
              <span>▶</span>
            </button>
            <button class="gallery-arrow prev" type="button">‹</button>
            <button class="gallery-arrow next" type="button">›</button>
          </div>
          <p class="quote">"Shop tư vấn đúng tình trạng vườn, hàng đóng kỹ, dùng theo hướng dẫn dễ theo dõi hiệu quả." - Khách hàng Đạ Tẻh chia sẻ</p>
        </div>
        <div class="product-info">
          <h1>${escapeHtml(product.name)}</h1>
          <div class="rating-line"><span class="soul-stars">★★★★★</span><span>${escapeHtml(product.sold || "Đã bán (web): 51.6k+")}</span></div>
          <div class="price-range" data-base-price="${Number(product.numericPrice) || 0}">${escapeHtml(product.price || "Liên hệ")}</div>
          <div class="option-row">
            <strong>Quy cách</strong>
            <div class="option-list" data-option-group="weight">
              <button type="button" data-option-value="Gói lẻ" data-price-multiplier="1">Gói lẻ</button>
              <button type="button" data-option-value="Combo 3" data-price-multiplier="2.85">Combo 3 <span class="deal">-5%</span></button>
              <button type="button" class="selected" data-option-value="Combo vườn" data-price-multiplier="5.4">Combo vườn <span class="deal">-10%</span></button>
            </div>
          </div>
          <div class="option-row">
            <strong>Nhu cầu</strong>
            <div class="option-list" data-option-group="request">
              <button type="button" class="selected" data-option-value="Tưới gốc">Tưới gốc</button>
              <button type="button" data-option-value="Phun lá">Phun lá</button>
            </div>
          </div>
          <div class="option-row">
            <strong>Giai đoạn cây</strong>
            <div class="option-list" data-option-group="brew">
              <button type="button" class="selected" data-option-value="Phục hồi">Phục hồi</button>
              <button type="button" data-option-value="Ra hoa">Ra hoa</button>
              <button type="button" data-option-value="Nuôi trái">Nuôi trái</button>
              <button type="button" data-option-value="Phòng bệnh">Phòng bệnh</button>
            </div>
          </div>
          <div class="detail-price">Giá: <del data-variant-old-price>${escapeHtml(product.oldPrice || "")}</del> <span class="current-price" data-variant-price>${escapeHtml(product.price || "Liên hệ")}</span></div>
          <p class="age-line">Với <span data-selected-weight>Combo vườn</span> bạn có đủ vật tư cho <span class="age-badge" data-session-count>1 chu kỳ</span> chăm sóc đúng giai đoạn.</p>
          <div class="buy-row">
            <div class="qty-control" data-qty-control><button type="button" data-product-qty="-1">-</button><span data-product-qty-value>1</span><button type="button" data-product-qty="1">+</button></div>
            <button class="add-cart tng-bridge-add" type="button" data-tng-product-id="${escapeHtml(product.id)}">Thêm vào giỏ hàng</button>
          </div>
          <button class="buy-now tng-bridge-add" type="button" data-tng-product-id="${escapeHtml(product.id)}">Mua ngay <span>Giao hàng tận nơi, đổi trả miễn phí</span></button>
          <div class="offer-box">
            <div class="offer-title">🎉 Ưu đãi dành riêng cho bạn!</div>
            <div class="offer-row"><strong>FREESHIP</strong> cho đơn từ <strong>599k</strong> hoặc combo vật tư</div>
            <div class="offer-row"><strong>Tư vấn vườn</strong> gợi ý cách dùng theo tình trạng cây</div>
            <div class="offer-row"><strong>Combo tiết kiệm</strong> giảm thêm cho đơn nhiều sản phẩm</div>
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
        <p>Danh sách sản phẩm được dựng local từ các dữ liệu công khai trên bản TaynguyenSoul đã lưu. Các nút mua hàng kết nối về backend clone.</p>
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
    ["/ca-phe/", "Tất cả"],
    ["/smooth/", "Phân bón phục hồi"],
    ["/high-caffeine/", "Thuốc sâu bệnh"],
    ["/ca-phe-cold-brew/", "Hoa & trái"],
    ["/giftset-combo/", "Combo chăm vườn"]
  ];
  return layout(title, pathname, `
    <section class="category-hero">
      <div>
        <h1>Chọn đúng vật tư cho từng giai đoạn cây trồng</h1>
        <p>Nguồn nội dung cấu hình theo VTNN GREEN FARMING DREAM trên Lazada: kích rễ, tạo mầm hoa, dưỡng trái, vi lượng, hữu cơ và thuốc sâu bệnh.</p>
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
          <h2>Chưa biết cây đang cần nhóm vật tư nào?</h2>
          <p>Chọn theo triệu chứng: rễ yếu, vàng lá, nghẹn hoa, nứt trái, sâu rầy nhện hoặc bệnh sau mưa.</p>
          <a href="/taynguyensoul-coffee-quiz/">Khám phá ngay</a>
        </div>
      </section>
      <article class="category-copy">
        <p>Danh mục được chia theo nhu cầu canh tác thực tế thay vì gom chung một mô tả. Mỗi nhóm sản phẩm có nội dung riêng về công dụng, dấu hiệu phù hợp, cách dùng và lưu ý an toàn.</p>
        <p>Nội dung tham chiếu từ cửa hàng VTNN GREEN FARMING DREAM trên Lazada, gồm các nhóm phân bón vi lượng, hữu cơ, NPK, kích rễ, tạo mầm hoa, dưỡng trái và thuốc sâu bệnh.</p>
        <p>Khi lên sản phẩm thật, chỉ cần đặt tên sản phẩm đúng nhóm, hệ thống sẽ tự chọn profile nội dung phù hợp.</p>
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
        <p>Dữ liệu đang được lưu tại <code>data/orders.json</code>. API JSON: <a href="/api/orders">/api/orders</a>.</p>
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
    if (req.method === "GET" && url.pathname === "/") {
      sendHtml(res, renderCategoryPageDeep("/ca-phe/"));
      return;
    }

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

    if (req.method === "GET" && url.pathname === "/admin/orders") {
      sendHtml(res, renderAdminOrdersPage());
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
        products: allSiteProducts().length,
        orders: orders.length,
        leads: leads.length,
        uptime: Math.round(process.uptime())
      });
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
          const product = allSiteProducts().find((entry) => entry.id === item.id);
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
        viewUrl: "/admin/orders"
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/orders") {
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
