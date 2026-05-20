const fs = require("fs");
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

const root = path.resolve(__dirname, "..");
const workerSource = path.join(root, "public", "_worker.js");
const tempModule = path.join(os.tmpdir(), `tng-worker-${Date.now()}.mjs`);

class MemoryKV {
  constructor() {
    this.store = new Map();
  }

  async get(key, type) {
    const value = this.store.get(key);
    if (value == null) return null;
    return type === "json" ? JSON.parse(value) : value;
  }

  async put(key, value) {
    this.store.set(key, value);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  fs.copyFileSync(workerSource, tempModule);
  const worker = (await import(`${pathToFileURL(tempModule).href}?v=${Date.now()}`)).default;
  const env = {
    ADMIN_TOKEN: "test-admin-token",
    ORDERS_KV: new MemoryKV(),
    ASSETS: {
      fetch: async (request) => new Response(`asset:${new URL(request.url).pathname}`, {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }),
    },
  };

  const orderPayload = {
    customer: {
      name: "Khach test",
      phone: "0900000000",
      address: "1 Nguyen Hue, TP. Ho Chi Minh",
    },
    items: [
      {
        title: "Ca Phe Nguyen Chat Signature",
        price: 460000,
        quantity: 1,
        options: ["1kg(2 goi 500g)", "Xay san", "Pha phin"],
      },
    ],
    total: 460000,
  };

  const postResponse = await worker.fetch(new Request("https://local.test/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(orderPayload),
  }), env, {});
  assert(postResponse.status === 201, `POST /api/orders expected 201, got ${postResponse.status}`);
  const postJson = await postResponse.json();
  assert(postJson.ok === true, "POST /api/orders did not return ok=true");
  assert(postJson.id && postJson.order && postJson.order.id === postJson.id, "POST /api/orders did not return saved order id");

  const publicGetResponse = await worker.fetch(new Request("https://local.test/api/orders"), env, {});
  assert(publicGetResponse.status === 401, `Public GET /api/orders expected 401, got ${publicGetResponse.status}`);

  const getResponse = await worker.fetch(new Request("https://local.test/api/orders", {
    headers: { authorization: "Bearer test-admin-token" },
  }), env, {});
  assert(getResponse.status === 200, `GET /api/orders expected 200, got ${getResponse.status}`);
  const getJson = await getResponse.json();
  assert(Array.isArray(getJson.orders), "GET /api/orders did not return orders array");
  assert(getJson.orders.length === 1, `GET /api/orders expected 1 order, got ${getJson.orders.length}`);

  const publicAdminResponse = await worker.fetch(new Request("https://local.test/admin/orders"), env, {});
  assert(publicAdminResponse.status === 401, `Public GET /admin/orders expected 401, got ${publicAdminResponse.status}`);

  const adminResponse = await worker.fetch(new Request("https://local.test/admin/orders", {
    headers: { cookie: "admin_session=test-admin-token" },
  }), env, {});
  assert(adminResponse.status === 200, `GET /admin/orders expected 200, got ${adminResponse.status}`);
  const adminHtml = await adminResponse.text();
  assert(adminHtml.includes(postJson.id), "Admin page does not include saved order id");
  assert(adminHtml.includes("Seller Center"), "Admin page missing seller center UI");

  const csvResponse = await worker.fetch(new Request("https://local.test/api/orders.csv", {
    headers: { authorization: "Bearer test-admin-token" },
  }), env, {});
  assert(csvResponse.status === 200, `GET /api/orders.csv expected 200, got ${csvResponse.status}`);
  const csvText = await csvResponse.text();
  assert(csvText.includes(postJson.id), "CSV export does not include saved order id");

  const statusForm = new FormData();
  statusForm.set("id", postJson.id);
  statusForm.set("status", "processing");
  const statusResponse = await worker.fetch(new Request("https://local.test/api/orders/status", {
    method: "POST",
    headers: { cookie: "admin_session=test-admin-token" },
    body: statusForm,
  }), env, {});
  assert(statusResponse.status === 302, `POST /api/orders/status expected 302, got ${statusResponse.status}`);

  const assetResponse = await worker.fetch(new Request("https://local.test/ca-phe/"), env, {});
  assert(assetResponse.status === 200, `Static fallback expected 200, got ${assetResponse.status}`);

  const fallbackEnv = {
    ADMIN_TOKEN: "test-admin-token",
    ASSETS: env.ASSETS,
  };
  const fallbackPostResponse = await worker.fetch(new Request("https://fallback.test/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(orderPayload),
  }), fallbackEnv, {});
  assert(fallbackPostResponse.status === 201, `Fallback POST /api/orders expected 201, got ${fallbackPostResponse.status}`);
  const fallbackPostJson = await fallbackPostResponse.json();
  assert(/memory fallback/i.test(fallbackPostJson.savedTo || ""), "Fallback POST did not report memory fallback storage");

  const fallbackHealthResponse = await worker.fetch(new Request("https://fallback.test/api/health"), fallbackEnv, {});
  assert(fallbackHealthResponse.status === 200, `Fallback health expected 200, got ${fallbackHealthResponse.status}`);
  const fallbackHealthJson = await fallbackHealthResponse.json();
  assert(fallbackHealthJson.bindings?.ORDERS_KV === false, "Fallback health did not report ORDERS_KV=false");

  console.log(JSON.stringify({
    ok: true,
    tested: ["POST /api/orders", "public admin denied", "authorized GET /api/orders", "authorized GET /admin/orders", "CSV export", "status update", "static asset fallback", "missing KV fallback"],
    orderId: postJson.id,
    storage: postJson.savedTo,
    fallbackOrderId: fallbackPostJson.id,
    fallbackStorage: fallbackPostJson.savedTo,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
}).finally(() => {
  try {
    fs.unlinkSync(tempModule);
  } catch (_) {
    // Temp cleanup is best-effort only.
  }
});
