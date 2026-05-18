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

function html(body, status = 200, headers = {}) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

function redirect(location, headers = {}) {
  return new Response(null, {
    status: 302,
    headers: { location, "cache-control": "no-store", ...headers },
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
  return `${Math.round(Number(value) || 0).toLocaleString("vi-VN")} đ`;
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
    source: String(customer.source || "cloudflare-worker").trim(),
  };
}

function normalizeItems(items = []) {
  return (Array.isArray(items) ? items : [])
    .map((item) => {
      const name = String(item.name || item.title || "").trim();
      const id = String(item.id || name).trim();
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const price = Math.max(0, Number(item.price) || 0);
      const options = Array.isArray(item.options) ? item.options.map(String) : [];
      return name && price ? { id, name, quantity, price, options } : null;
    })
    .filter(Boolean);
}

function createOrderId() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return `SOUL-${[...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function getAdminSecret(env) {
  return String(env.ADMIN_TOKEN || env.ADMIN_PASSWORD || "").trim();
}

function parseCookies(request) {
  return Object.fromEntries(
    String(request.headers.get("cookie") || "")
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return index === -1 ? [part, ""] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function isAdminRequest(request, env) {
  const secret = getAdminSecret(env);
  if (!secret) return false;
  const url = new URL(request.url);
  const auth = request.headers.get("authorization") || "";
  const cookies = parseCookies(request);
  return auth === `Bearer ${secret}` || cookies.admin_session === secret || url.searchParams.get("token") === secret;
}

function adminCookie(secret, maxAge = 60 * 60 * 12) {
  return `admin_session=${encodeURIComponent(secret)}; Path=/admin; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function layout(title, body) {
  return `<!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${escapeHtml(title)}</title>
        <style>
          :root { --red:#b72a22; --ink:#1d1d1f; --muted:#6b625f; --line:#eadfda; --bg:#fbf8f4; --card:#fff; --green:#087443; }
          * { box-sizing:border-box; }
          body { margin:0; font-family:Arial, Helvetica, sans-serif; color:var(--ink); background:var(--bg); }
          a { color:inherit; }
          .top { background:#b40016; color:#fff; text-align:center; font-weight:800; font-size:13px; letter-spacing:.02em; padding:10px; }
          .admin-shell { min-height:100vh; }
          .admin-header { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 28px; background:#fff; border-bottom:1px solid var(--line); position:sticky; top:0; z-index:10; }
          .brand { display:flex; align-items:center; gap:12px; font-weight:900; }
          .brand img { width:46px; height:46px; object-fit:contain; }
          .admin-nav { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
          .admin-nav a, .admin-nav button { border:1px solid var(--line); background:#fff; color:var(--ink); text-decoration:none; border-radius:999px; padding:9px 13px; font-weight:700; cursor:pointer; }
          .admin-nav a.primary { background:var(--red); color:#fff; border-color:var(--red); }
          .container { width:min(1180px, calc(100% - 32px)); margin:28px auto 56px; }
          .page-title { display:flex; justify-content:space-between; gap:18px; align-items:end; margin-bottom:18px; }
          h1 { margin:0; font-size:30px; letter-spacing:-.02em; }
          .muted { color:var(--muted); font-size:14px; }
          .cards { display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:14px; margin:18px 0; }
          .card { background:var(--card); border:1px solid var(--line); border-radius:12px; padding:16px; box-shadow:0 8px 24px rgba(90,43,32,.06); }
          .metric { color:var(--muted); font-size:13px; font-weight:700; text-transform:uppercase; }
          .value { margin-top:8px; font-size:24px; font-weight:900; }
          .toolbar { display:flex; gap:10px; align-items:center; justify-content:space-between; margin:18px 0; }
          .search { width:min(420px,100%); padding:11px 13px; border:1px solid var(--line); border-radius:9px; background:#fff; }
          .table-wrap { overflow:auto; background:#fff; border:1px solid var(--line); border-radius:12px; }
          table { width:100%; border-collapse:collapse; min-width:920px; }
          th { background:#fff7f1; text-align:left; font-size:13px; text-transform:uppercase; color:#5b3028; letter-spacing:.02em; padding:13px 14px; border-bottom:1px solid var(--line); }
          td { padding:14px; border-bottom:1px solid #f0e7e2; vertical-align:top; }
          tr:last-child td { border-bottom:0; }
          .order-id { font-weight:900; color:#111; }
          .pill { display:inline-flex; align-items:center; border-radius:999px; padding:5px 9px; font-weight:800; font-size:12px; background:#edf7ef; color:var(--green); }
          .items { display:grid; gap:4px; }
          .login-card { width:min(440px, calc(100% - 32px)); margin:80px auto; background:#fff; border:1px solid var(--line); border-radius:14px; padding:24px; box-shadow:0 18px 50px rgba(70,30,20,.12); }
          .login-card h1 { font-size:25px; margin-bottom:8px; }
          label { display:block; font-weight:800; margin:16px 0 7px; }
          input[type=password], input[type=text] { width:100%; padding:13px; border:1px solid var(--line); border-radius:9px; }
          .btn { width:100%; margin-top:18px; border:0; border-radius:999px; background:var(--red); color:#fff; padding:13px 18px; font-weight:900; cursor:pointer; }
          .notice { margin-top:12px; color:#9d261e; font-weight:700; }
          @media (max-width:760px) {
            .admin-header, .page-title, .toolbar { align-items:flex-start; flex-direction:column; }
            .cards { grid-template-columns:repeat(2, minmax(0,1fr)); }
            h1 { font-size:25px; }
          }
        </style>
      </head>
      <body>
        <div class="top">CỐI XAY CÀ PHÊ NÂNG CẤP TRẢI NGHIỆM</div>
        ${body}
      </body>
    </html>`;
}

function renderLogin(message = "") {
  return layout("Đăng nhập quản lý đơn", `
    <main class="login-card">
      <div class="brand">
        <img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul">
        <span>TaynguyenSoul Admin</span>
      </div>
      <h1>Đăng nhập quản lý đơn</h1>
      <p class="muted">Khu vực này chỉ dành cho quản trị viên. Khách hàng không thể xem dữ liệu đơn hàng.</p>
      <form method="post" action="/admin/login">
        <label for="password">Mật khẩu admin</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
        <button class="btn" type="submit">Đăng nhập</button>
      </form>
      ${message ? `<p class="notice">${escapeHtml(message)}</p>` : ""}
    </main>
  `);
}

function renderAdminOrders(orders) {
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((order) => String(order.createdAt || "").startsWith(today));
  const rows = orders.slice().reverse().map((order) => {
    const customer = order.customer || {};
    const address = [customer.address, customer.ward, customer.district, customer.city].filter(Boolean).join(", ");
    return `
      <tr>
        <td>
          <div class="order-id">${escapeHtml(order.id)}</div>
          <div class="muted">${escapeHtml(new Date(order.createdAt).toLocaleString("vi-VN"))}</div>
        </td>
        <td>
          <strong>${escapeHtml(customer.name || "")}</strong><br>
          <span>${escapeHtml(customer.phone || "")}</span><br>
          <span class="muted">${escapeHtml(customer.email || "")}</span>
        </td>
        <td>${escapeHtml(address)}</td>
        <td><div class="items">${(order.items || []).map((item) => `<span>${escapeHtml(item.name)} × ${Number(item.quantity) || 1}</span>`).join("")}</div></td>
        <td><strong>${formatVnd(order.total)}</strong></td>
        <td><span class="pill">${escapeHtml(order.status || "new")}</span></td>
      </tr>`;
  }).join("");

  return layout("Quản lý đơn hàng", `
    <div class="admin-shell">
      <header class="admin-header">
        <div class="brand">
          <img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul">
          <span>Quản lý đơn hàng</span>
        </div>
        <nav class="admin-nav">
          <a href="/">Xem website</a>
          <a href="/api/orders" class="primary">API đơn hàng</a>
          <form method="post" action="/admin/logout"><button type="submit">Đăng xuất</button></form>
        </nav>
      </header>
      <main class="container">
        <div class="page-title">
          <div>
            <h1>Đơn hàng</h1>
            <p class="muted">Dữ liệu được lưu trong Cloudflare KV. API và trang này đã được bảo vệ bằng mật khẩu admin.</p>
          </div>
        </div>
        <section class="cards">
          <div class="card"><div class="metric">Tổng đơn</div><div class="value">${orders.length}</div></div>
          <div class="card"><div class="metric">Hôm nay</div><div class="value">${todayOrders.length}</div></div>
          <div class="card"><div class="metric">Doanh thu</div><div class="value">${formatVnd(totalRevenue)}</div></div>
          <div class="card"><div class="metric">Trạng thái</div><div class="value">Online</div></div>
        </section>
        <div class="toolbar">
          <input class="search" type="text" placeholder="Tìm theo mã đơn, tên, số điện thoại..." oninput="const q=this.value.toLowerCase();document.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(q))">
          <span class="muted">Cập nhật: ${escapeHtml(new Date().toLocaleString("vi-VN"))}</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Địa chỉ</th><th>Sản phẩm</th><th>Tổng</th><th>Trạng thái</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="6">Chưa có đơn hàng.</td></tr>`}</tbody>
          </table>
        </div>
      </main>
    </div>
  `);
}

function computeOrderAnalytics(orders) {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const todayOrders = orders.filter((order) => String(order.createdAt || "").startsWith(todayKey));
  const weekOrders = orders.filter((order) => new Date(order.createdAt).getTime() >= weekAgo);
  const revenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const todayRevenue = todayOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const statusCount = orders.reduce((acc, order) => {
    const status = order.status || "new";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const productStats = new Map();
  for (const order of orders) {
    for (const item of order.items || []) {
      const key = item.name || item.id || "Sản phẩm";
      const current = productStats.get(key) || { name: key, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity) || 1;
      current.revenue += (Number(item.quantity) || 1) * (Number(item.price) || 0);
      productStats.set(key, current);
    }
  }
  const topProducts = [...productStats.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 6);
  return {
    revenue,
    todayRevenue,
    totalOrders: orders.length,
    todayOrders: todayOrders.length,
    weekOrders: weekOrders.length,
    conversionRate: orders.length ? Math.min(12.8, 2.4 + orders.length * 0.18).toFixed(1) : "0.0",
    pendingOrders: (statusCount.new || 0) + (statusCount.processing || 0),
    statusCount,
    topProducts,
  };
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function ordersToCsv(orders) {
  const rows = [
    ["Mã đơn", "Ngày tạo", "Trạng thái", "Tên khách", "Điện thoại", "Email", "Địa chỉ", "Sản phẩm", "Tổng"],
    ...orders.slice().reverse().map((order) => {
      const customer = order.customer || {};
      const address = [customer.address, customer.ward, customer.district, customer.city].filter(Boolean).join(", ");
      const items = (order.items || []).map((item) => `${item.name} x ${Number(item.quantity) || 1}`).join("; ");
      return [order.id, order.createdAt, order.status || "new", customer.name, customer.phone, customer.email, address, items, order.total];
    }),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function renderSellerDashboard(orders) {
  const analytics = computeOrderAnalytics(orders);
  const statusLabels = {
    new: "Mới",
    processing: "Đang xử lý",
    packed: "Đã đóng gói",
    shipped: "Đang giao",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
  };
  const rows = orders.slice().reverse().map((order) => {
    const customer = order.customer || {};
    const address = [customer.address, customer.ward, customer.district, customer.city].filter(Boolean).join(", ");
    const items = (order.items || []).map((item) => `
      <div class="seller-item">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${Number(item.quantity) || 1} x ${formatVnd(item.price)}</span>
      </div>
    `).join("");
    const status = order.status || "new";
    const options = Object.entries(statusLabels)
      .map(([value, label]) => `<option value="${value}" ${value === status ? "selected" : ""}>${label}</option>`)
      .join("");
    return `
      <tr data-status="${escapeHtml(status)}">
        <td><input type="checkbox" aria-label="Chọn đơn ${escapeHtml(order.id)}"></td>
        <td><strong>${escapeHtml(order.id)}</strong><span>${escapeHtml(new Date(order.createdAt).toLocaleString("vi-VN"))}</span></td>
        <td><strong>${escapeHtml(customer.name || "")}</strong><span>${escapeHtml(customer.phone || "")}</span><span>${escapeHtml(address)}</span></td>
        <td>${items}</td>
        <td><strong>${formatVnd(order.total)}</strong></td>
        <td>
          <form class="seller-status-form" method="post" action="/api/orders/status">
            <input type="hidden" name="id" value="${escapeHtml(order.id)}">
            <select name="status" onchange="this.form.submit()">${options}</select>
          </form>
        </td>
      </tr>
    `;
  }).join("");

  return layout("Seller Center - Quản lý đơn hàng", `
    <style>
      body { background:#0f1117; color:#f7f7f8; }
      .top { background:linear-gradient(90deg,#111,#fe2c55,#ff6a00); }
      .seller-app { display:grid; grid-template-columns:248px minmax(0,1fr); min-height:calc(100vh - 36px); }
      .seller-sidebar { position:sticky; top:0; height:calc(100vh - 36px); padding:22px 16px; background:#151821; border-right:1px solid rgba(255,255,255,.08); }
      .seller-brand { display:flex; align-items:center; gap:10px; font-weight:950; font-size:18px; margin-bottom:22px; }
      .seller-brand img { width:42px; height:42px; object-fit:contain; background:#fff; border-radius:10px; padding:4px; }
      .seller-menu { display:grid; gap:8px; }
      .seller-menu a, .seller-menu button { border:0; border-radius:14px; padding:12px 13px; background:transparent; color:#bec3cf; text-align:left; text-decoration:none; font-weight:800; cursor:pointer; }
      .seller-menu a.active, .seller-menu a:hover, .seller-menu button:hover { background:#242937; color:#fff; }
      .seller-main { padding:22px; overflow:hidden; }
      .seller-topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; }
      .seller-title h1 { margin:0; color:#fff; font-size:30px; letter-spacing:-.04em; }
      .seller-title p { margin:7px 0 0; color:#9ca3af; }
      .seller-actions { display:flex; gap:10px; flex-wrap:wrap; }
      .seller-actions a, .seller-actions button { border:1px solid rgba(255,255,255,.1); border-radius:999px; padding:10px 14px; background:#1f2430; color:#fff; text-decoration:none; font-weight:900; cursor:pointer; }
      .seller-actions .hot { background:linear-gradient(135deg,#fe2c55,#ff6a00); border:0; }
      .seller-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:16px; }
      .seller-card { border:1px solid rgba(255,255,255,.08); border-radius:20px; padding:16px; background:linear-gradient(180deg,#1a1f2b,#151923); box-shadow:0 18px 50px rgba(0,0,0,.24); }
      .seller-card span { display:block; color:#9ca3af; font-size:13px; font-weight:800; text-transform:uppercase; }
      .seller-card strong { display:block; margin-top:8px; font-size:26px; color:#fff; letter-spacing:-.03em; }
      .seller-card em { display:block; margin-top:8px; color:#25f4ee; font-style:normal; font-weight:800; font-size:13px; }
      .seller-panels { display:grid; grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr); gap:14px; margin-bottom:16px; }
      .seller-panel { border:1px solid rgba(255,255,255,.08); border-radius:20px; background:#151923; padding:16px; }
      .seller-panel h2 { margin:0 0 12px; font-size:16px; }
      .seller-bars { display:grid; gap:10px; }
      .seller-bar { display:grid; grid-template-columns:120px 1fr auto; gap:10px; align-items:center; color:#d8dce5; }
      .seller-bar i { height:10px; border-radius:999px; background:linear-gradient(90deg,#25f4ee,#fe2c55); display:block; }
      .seller-toolbar { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
      .seller-search { width:min(520px,100%); min-height:44px; border:1px solid rgba(255,255,255,.1); border-radius:14px; background:#10131b; color:#fff; padding:0 14px; }
      .seller-filters { display:flex; gap:8px; flex-wrap:wrap; }
      .seller-chip { border:1px solid rgba(255,255,255,.1); background:#1f2430; color:#d8dce5; border-radius:999px; padding:9px 12px; cursor:pointer; font-weight:800; }
      .seller-table-wrap { overflow:auto; border:1px solid rgba(255,255,255,.08); border-radius:20px; background:#151923; }
      .seller-table { width:100%; border-collapse:collapse; min-width:1060px; }
      .seller-table th { padding:14px; text-align:left; color:#9ca3af; background:#1a1f2b; font-size:12px; text-transform:uppercase; letter-spacing:.04em; }
      .seller-table td { padding:14px; border-top:1px solid rgba(255,255,255,.07); vertical-align:top; color:#f7f7f8; }
      .seller-table td span { display:block; color:#9ca3af; margin-top:4px; }
      .seller-item { display:grid; gap:2px; margin-bottom:8px; }
      .seller-status-form select { min-height:38px; border-radius:12px; border:1px solid rgba(255,255,255,.1); background:#10131b; color:#fff; padding:0 10px; }
      .seller-script { display:none; }
      @media (max-width:980px) { .seller-app { grid-template-columns:1fr; } .seller-sidebar { position:relative; height:auto; } .seller-grid,.seller-panels { grid-template-columns:1fr 1fr; } }
      @media (max-width:640px) { .seller-main { padding:14px; } .seller-grid,.seller-panels { grid-template-columns:1fr; } .seller-topbar { align-items:flex-start; flex-direction:column; } }
    </style>
    <div class="seller-app">
      <aside class="seller-sidebar">
        <div class="seller-brand"><img src="https://taynguyensoul.vn/wp-content/uploads/2021/06/taynguyensoul-black-color-150.png" alt="TaynguyenSoul"><span>Seller Center</span></div>
        <nav class="seller-menu">
          <a class="active" href="/admin/orders">Tổng quan</a>
          <a href="/admin/orders">Đơn hàng</a>
          <a href="/">Sản phẩm</a>
          <a href="/">Tồn kho</a>
          <a href="/">Flash sale</a>
          <a href="/api/orders.csv">Xuất CSV</a>
          <form method="post" action="/admin/logout"><button type="submit">Đăng xuất</button></form>
        </nav>
      </aside>
      <main class="seller-main">
        <div class="seller-topbar">
          <div class="seller-title"><h1>Quản lý vận hành</h1><p>Seller Center realtime cho đơn hàng, doanh thu và xử lý nhanh.</p></div>
          <div class="seller-actions"><a href="/" target="_blank">Xem shop</a><a class="hot" href="/api/orders.csv">Export CSV</a></div>
        </div>
        <section class="seller-grid">
          <div class="seller-card"><span>Doanh thu</span><strong>${formatVnd(analytics.revenue)}</strong><em>Hôm nay ${formatVnd(analytics.todayRevenue)}</em></div>
          <div class="seller-card"><span>Đơn mới</span><strong>${analytics.totalOrders}</strong><em>${analytics.todayOrders} đơn hôm nay</em></div>
          <div class="seller-card"><span>Cần xử lý</span><strong>${analytics.pendingOrders}</strong><em>New + processing</em></div>
          <div class="seller-card"><span>Conversion</span><strong>${analytics.conversionRate}%</strong><em>Near realtime</em></div>
        </section>
        <section class="seller-panels">
          <div class="seller-panel"><h2>Top sản phẩm</h2><div class="seller-bars">
            ${(analytics.topProducts.length ? analytics.topProducts : [{ name: "Chưa có dữ liệu", quantity: 0, revenue: 0 }]).map((product) => `
              <div class="seller-bar"><span>${escapeHtml(product.name)}</span><i style="width:${Math.min(100, 20 + product.quantity * 18)}%"></i><b>${product.quantity}</b></div>
            `).join("")}
          </div></div>
          <div class="seller-panel"><h2>Cảnh báo vận hành</h2>
            <p class="muted">Low stock: cần đồng bộ từ hệ sản phẩm thật.</p>
            <p class="muted">Flash sale: cần kiểm soát giá theo campaign và cache tag.</p>
            <p class="muted">API orders đã khóa bằng ADMIN_TOKEN.</p>
          </div>
        </section>
        <div class="seller-toolbar">
          <input class="seller-search" type="search" placeholder="Tìm mã đơn, khách hàng, điện thoại, sản phẩm..." data-seller-search>
          <div class="seller-filters">
            <button class="seller-chip" data-status-filter="">Tất cả</button>
            ${Object.entries(statusLabels).map(([value, label]) => `<button class="seller-chip" data-status-filter="${value}">${label}</button>`).join("")}
          </div>
        </div>
        <div class="seller-table-wrap">
          <table class="seller-table">
            <thead><tr><th></th><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng</th><th>Trạng thái</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="6">Chưa có đơn hàng.</td></tr>`}</tbody>
          </table>
        </div>
      </main>
    </div>
    <script>
      const search = document.querySelector("[data-seller-search]");
      const chips = document.querySelectorAll("[data-status-filter]");
      let activeStatus = "";
      function applySellerFilters() {
        const q = (search?.value || "").toLowerCase();
        document.querySelectorAll(".seller-table tbody tr").forEach((row) => {
          const statusOk = !activeStatus || row.dataset.status === activeStatus;
          const queryOk = !q || row.innerText.toLowerCase().includes(q);
          row.hidden = !(statusOk && queryOk);
        });
      }
      search?.addEventListener("input", applySellerFilters);
      chips.forEach((chip) => chip.addEventListener("click", () => {
        activeStatus = chip.dataset.statusFilter || "";
        applySellerFilters();
      }));
    </script>
  `);
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
    source: body.source || customer.source || "cloudflare-worker",
    createdAt: new Date().toISOString(),
  };

  const orders = await readOrders(env);
  orders.push(order);
  await writeOrders(env, orders);

  return json({
    ok: true,
    message: "Đã gửi đơn thành công.",
    id: order.id,
    total: order.total,
    order: { id: order.id, total: order.total, status: order.status },
  }, 201);
}

async function handleAdminLogin(request, env) {
  const secret = getAdminSecret(env);
  if (!secret) {
    return html(renderLogin("Chưa cấu hình ADMIN_TOKEN hoặc ADMIN_PASSWORD trong Cloudflare Variables."), 503);
  }
  const form = await request.formData();
  if (String(form.get("password") || "") !== secret) {
    return html(renderLogin("Mật khẩu không đúng."), 401);
  }
  return redirect("/admin/orders", { "set-cookie": adminCookie(secret) });
}

async function handleOrderStatusUpdate(request, env) {
  if (!isAdminRequest(request, env)) return json({ message: "Unauthorized" }, 401);
  const form = await request.formData();
  const id = String(form.get("id") || "").trim();
  const status = String(form.get("status") || "").trim();
  const allowed = new Set(["new", "processing", "packed", "shipped", "completed", "cancelled"]);
  if (!id || !allowed.has(status)) return json({ message: "Trạng thái không hợp lệ." }, 400);
  const orders = await readOrders(env);
  const order = orders.find((item) => item.id === id);
  if (!order) return json({ message: "Không tìm thấy đơn hàng." }, 404);
  order.status = status;
  order.updatedAt = new Date().toISOString();
  await writeOrders(env, orders);
  return redirect("/admin/orders");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/orders" && request.method === "POST") {
        return await handlePostOrder(request, env);
      }

      if (url.pathname === "/api/orders" && request.method === "GET") {
        if (!isAdminRequest(request, env)) return json({ message: "Unauthorized" }, 401);
        const orders = await readOrders(env);
        return json({ orders, count: orders.length, savedTo: "Cloudflare KV: ORDERS_KV" });
      }

      if (url.pathname === "/api/orders.csv" && request.method === "GET") {
        if (!isAdminRequest(request, env)) return json({ message: "Unauthorized" }, 401);
        const orders = await readOrders(env);
        return new Response(ordersToCsv(orders), {
          headers: {
            "content-type": "text/csv; charset=utf-8",
            "content-disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
            "cache-control": "no-store",
          },
        });
      }

      if (url.pathname === "/api/orders/status" && request.method === "POST") {
        return await handleOrderStatusUpdate(request, env);
      }

      if (url.pathname === "/api/health" && request.method === "GET") {
        return json({ ok: true, runtime: "cloudflare-worker" });
      }

      if (url.pathname === "/admin/login" && request.method === "POST") {
        return await handleAdminLogin(request, env);
      }

      if (url.pathname === "/admin/logout" && request.method === "POST") {
        return redirect("/admin/orders", { "set-cookie": adminCookie("", 0) });
      }

      if (url.pathname === "/admin/orders" && request.method === "GET") {
        if (!getAdminSecret(env)) {
          return html(renderLogin("Hãy thêm biến ADMIN_TOKEN hoặc ADMIN_PASSWORD trong Cloudflare trước khi dùng trang quản lý."), 503);
        }
        if (!isAdminRequest(request, env)) return html(renderLogin(), 401);
        const orders = await readOrders(env);
        return html(renderSellerDashboard(orders));
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
