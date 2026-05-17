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
