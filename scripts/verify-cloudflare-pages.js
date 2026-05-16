const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const baseUrl = process.env.CF_BASE_URL || "http://127.0.0.1:8788";
const outDir = process.env.CF_VERIFY_DIR || "C:\\tmp\\tng-cloudflare-verify";

const routes = [
  { name: "home", path: "/" },
  { name: "category-ca-phe", path: "/ca-phe/" },
  { name: "product-signature", path: "/san-pham/ca-phe-rang-xay-nguyen-chat-signature/" },
  { name: "product-soriso", path: "/san-pham/bo-may-pha-ca-phe-mini-soriso-quick-shot-qs-soriso-sg1/" },
  { name: "cart", path: "/gio-hang/" },
  { name: "admin-orders", path: "/admin/orders" },
];

const viewports = [
  { label: "desktop", width: 1365, height: 900 },
  { label: "mobile390", width: 390, height: 844 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  const consoleErrors = [];

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      page.on("console", (message) => {
        if (message.type() === "error") {
          consoleErrors.push(`${viewport.label}: ${message.text()}`);
        }
      });

      for (const route of routes) {
        const response = await page.goto(`${baseUrl}${route.path}`, { waitUntil: "networkidle", timeout: 60000 });
        assert(response && response.ok(), `${route.path} returned ${response && response.status()}`);
        const screenshot = path.join(outDir, `${viewport.label}-${route.name}.png`);
        await page.screenshot({ path: screenshot, fullPage: true });
        const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 3);
        const badInternalLinks = await page.evaluate(() => {
          const origin = "https://taynguyensoul.vn";
          return [...document.querySelectorAll("a[href]")]
            .map((link) => link.href)
            .filter((href) => href.startsWith(origin))
            .filter((href) => {
              const url = new URL(href);
              return ["/", "/ca-phe/", "/gio-hang/", "/admin/orders"].includes(url.pathname) || url.pathname.startsWith("/san-pham/");
            });
        });
        assert(!hasHorizontalScroll, `${viewport.label} ${route.path} has horizontal scroll`);
        assert(badInternalLinks.length === 0, `${viewport.label} ${route.path} has original-domain internal links: ${badInternalLinks.join(", ")}`);
        results.push({ viewport: viewport.label, route: route.path, screenshot });
      }

      await context.close();
    }

    const apiContext = await browser.newContext();
    const apiPage = await apiContext.newPage();
    await apiPage.goto(`${baseUrl}/gio-hang/`, { waitUntil: "networkidle", timeout: 60000 });
    const postResult = await apiPage.evaluate(async (base) => {
      const response = await fetch(`${base}/api/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: "Browser Cloudflare",
            phone: "0911111111",
            email: "browser@example.com",
            city: "TP. Ho Chi Minh",
            district: "Quan 1",
            address: "2 Le Loi",
          },
          items: [{ name: "Ca Phe Nguyen Chat Signature", price: 460000, quantity: 1 }],
        }),
      });
      return { status: response.status, json: await response.json() };
    }, baseUrl);
    assert(postResult.status === 201, `Browser POST /api/orders returned ${postResult.status}`);
    const adminResponse = await apiPage.goto(`${baseUrl}/admin/orders`, { waitUntil: "networkidle", timeout: 60000 });
    assert(adminResponse && adminResponse.ok(), "Admin route failed after browser order POST");
    const adminText = await apiPage.textContent("body");
    assert(adminText.includes(postResult.json.id), "Admin page does not show browser-created order");
    await apiContext.close();

    const report = {
      ok: true,
      baseUrl,
      screenshots: outDir,
      routes: results.length,
      browserOrderId: postResult.json.id,
      consoleErrors,
    };
    fs.writeFileSync(path.join(outDir, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
