const ORDER_KEY = "orders";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatVnd(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("vi-VN")}đ`;
}

function orderStore(env) {
  if (!env.ORDERS_KV) {
    throw new Error("Missing ORDERS_KV binding. Create a Cloudflare KV namespace and bind it as ORDERS_KV.");
  }
  return env.ORDERS_KV;
}

async function readOrders(env) {
  const raw = await orderStore(env).get(ORDER_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeOrders(env, orders) {
  await orderStore(env).put(ORDER_KEY, JSON.stringify(orders, null, 2));
}

function normalizeCustomer(customer = {}) {
  return {
    name: String(customer.name || "").trim(),
    phone: String(customer.phone || "").trim(),
    email: String(customer.email || "").trim(),
    city: String(customer.city || "").trim(),
    district: String(customer.district || "").trim(),
    ward: String(customer.ward || "").trim(),
    address: String(customer.address || "").trim(),
    note: String(customer.note || "").trim(),
    source: String(customer.source || "cloudflare-pages").trim(),
  };
}

function normalizeItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const name = String(item.name || item.title || "").trim();
      const id = String(item.id || name).trim();
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.price) || 0);
      return name && price ? { id, name, quantity, price } : null;
    })
    .filter(Boolean);
}

function createOrderId() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return `SOUL-${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

async function handlePostOrder(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: "Payload không hợp lệ." }, 400);
  }

  const customer = normalizeCustomer(body.customer);
  if (!customer.name || !customer.phone) {
    return json({ message: "Vui lòng nhập họ tên và số điện thoại trước khi gửi đơn." }, 400);
  }

  const items = normalizeItems(body.items);
  if (!items.length) {
    return json({ message: "Giỏ hàng đang trống." }, 400);
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: createOrderId(),
    customer,
    items,
    options: body.options || {},
    total,
    status: "new",
    source: body.source || customer.source || "cloudflare-pages",
    createdAt: new Date().toISOString(),
  };

  const orders = await readOrders(env);
  orders.push(order);
  await writeOrders(env, orders);

  return json({
    ok: true,
    message: "Đã gửi đơn thành công.",
    order,
    id: order.id,
    total: order.total,
    savedTo: "Cloudflare KV: ORDERS_KV",
    viewUrl: "/admin/orders",
  }, 201);
}

function renderAdminOrders(orders) {
  const rows = orders.slice().reverse().map((order) => `
    <tr>
      <td><strong>${escapeHtml(order.id)}</strong><br><span>${escapeHtml(new Date(order.createdAt).toLocaleString("vi-VN"))}</span></td>
      <td>${escapeHtml(order.customer?.name || "")}<br><span>${escapeHtml(order.customer?.phone || "")}</span><br><span>${escapeHtml(order.customer?.address || "")}</span></td>
      <td>${(order.items || []).map((item) => `${escapeHtml(item.name)} x ${Number(item.quantity) || 1}`).join("<br>")}</td>
      <td><strong>${formatVnd(order.total)}</strong></td>
      <td>${escapeHtml(order.status || "new")}</td>
    </tr>
  `).join("");

  return `<!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Quản lý đơn hàng - TaynguyenSoul Clone</title>
        <link rel="stylesheet" href="/page-styles.css">
        <link rel="stylesheet" href="/clone-bridge.css">
      </head>
      <body class="soul-page">
        <div class="soul-promo-bar">CỐI XAY CÀ PHÊ NÂNG CẤP TRẢI NGHIỆM</div>
        <header class="soul-header">
          <button class="mobile-menu-toggle" type="button" aria-label="Mở menu" aria-expanded="false"><span></span><span></span><span></span></button>
          <nav class="soul-nav">
            <a href="/ca-phe/">Cà phê</a>
            <a href="/may-pha-ca-phe-cam-tay/">Máy pha cà phê cầm tay</a>
            <a href="/dung-cu-pha-ca-phe/">Dụng cụ pha cà phê</a>
          </nav>
          <a class="soul-logo" href="/">
            <img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul">
          </a>
          <nav class="soul-nav right">
            <a href="/ve-taynguyensoul/">Về TaynguyenSoul</a>
            <a href="/blog-ca-phe/">Blog</a>
            <a href="/lien-he/">Liên hệ</a>
            <a class="soul-cart-link" href="/gio-hang/">0</a>
          </nav>
        </header>
        <main class="soul-main">
          <section class="admin-orders">
            <div class="soul-breadcrumb"><a href="/">Trang chủ</a> / Quản lý đơn</div>
            <h1>Đơn hàng Cloudflare</h1>
            <p>Dữ liệu đang lưu trong Cloudflare KV binding <code>ORDERS_KV</code>. API JSON: <a href="/api/orders">/api/orders</a>.</p>
            <div class="admin-table-wrap">
              <table class="admin-orders-table">
                <thead>
                  <tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng</th><th>Trạng thái</th></tr>
                </thead>
                <tbody>${rows || `<tr><td colspan="5">Chưa có đơn hàng.</td></tr>`}</tbody>
              </table>
            </div>
          </section>
        </main>
        <script src="/clone-bridge.js"></script>
      </body>
    </html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/orders" && request.method === "POST") {
        return await handlePostOrder(request, env);
      }

      if (url.pathname === "/api/orders" && request.method === "GET") {
        const orders = await readOrders(env);
        return json({ orders, count: orders.length, savedTo: "Cloudflare KV: ORDERS_KV" });
      }

      if (url.pathname === "/api/health" && request.method === "GET") {
        const orders = await readOrders(env);
        return json({ ok: true, runtime: "cloudflare-pages", orders: orders.length });
      }

      if (url.pathname === "/admin/orders" && request.method === "GET") {
        const orders = await readOrders(env);
        return html(renderAdminOrders(orders));
      }

      if (url.pathname.startsWith("/api/")) {
        return json({ message: "API không tồn tại." }, 404);
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      return json({ message: error.message || "Cloudflare backend error." }, 500);
    }
  },
};
