const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const LOCAL = "http://localhost:3001";
const OUT_DIR = "C:/tmp/tng-production-audit";
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const routes = [
  { name: "home", path: "/" },
  { name: "category", path: "/ca-phe/" },
  { name: "signature", path: "/san-pham/ca-phe-rang-xay-nguyen-chat-signature/" },
  { name: "soriso", path: "/san-pham/bo-may-pha-ca-phe-mini-soriso-quick-shot-qs-soriso-sg1/" },
  { name: "cart", path: "/gio-hang/" },
  { name: "admin", path: "/admin/orders" }
];

const viewports = [
  { name: "desktop", width: 1365, height: 768, isMobile: false },
  { name: "mobile390", width: 390, height: 844, isMobile: true },
  { name: "mobile414", width: 414, height: 896, isMobile: true },
  { name: "mobile360", width: 360, height: 800, isMobile: true }
];

const mojibakePattern = /(?:Ã[\u0080-\u00BF]|Ä[\u0080-\u00BF]|á[\u0080-\u00BF]|â[\u0080-\u00BF]|ï¿½|�)/;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function collectPageAudit(page, route, viewport) {
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(`${LOCAL}${route.path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(route.name.includes("signature") || route.name === "soriso" ? 3800 : 900);
  const screenshot = path.join(OUT_DIR, `${viewport.name}-${route.name}.png`).replace(/\\/g, "/");
  await page.screenshot({ path: screenshot, fullPage: viewport.name === "desktop" });

  const dom = await page.evaluate((patternSource) => {
    const mojibake = new RegExp(patternSource);
    const text = document.body.innerText || "";
    const textSamples = text.split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => mojibake.test(line))
      .slice(0, 20);
    const attrs = [];
    document.querySelectorAll("[alt], [title], [placeholder], [aria-label]").forEach((node) => {
      ["alt", "title", "placeholder", "aria-label"].forEach((attr) => {
        const value = node.getAttribute(attr);
        if (value && mojibake.test(value)) attrs.push({ tag: node.tagName.toLowerCase(), attr, value: value.slice(0, 120) });
      });
    });

    const anchorsToOrigin = [...document.querySelectorAll('a[href^="https://taynguyensoul.vn"]')]
      .map((node) => ({ text: (node.textContent || node.getAttribute("aria-label") || "").trim().slice(0, 80), href: node.href }))
      .filter((item) => {
        try {
          const url = new URL(item.href);
          return url.hostname === "taynguyensoul.vn" && !/\.(jpg|jpeg|png|webp|gif|svg|mp4|webm)$/i.test(url.pathname);
        } catch {
          return false;
        }
      })
      .slice(0, 30);

    const brokenImages = [...document.images]
      .filter((img) => img.getBoundingClientRect().width > 1 && img.complete && img.naturalWidth === 0)
      .map((img) => img.currentSrc || img.src)
      .slice(0, 20);

    const doc = document.documentElement;
    const body = document.body;
    const vw = window.innerWidth;
    const overflowX = Math.max(doc.scrollWidth, body.scrollWidth) - vw;
    const offenders = [...document.querySelectorAll("body *")]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          tag: node.tagName.toLowerCase(),
          cls: typeof node.className === "string" ? node.className : "",
          text: (node.textContent || node.getAttribute("aria-label") || "").trim().slice(0, 60),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter((item) => item.width > 0 && (item.left < -3 || item.right > vw + 3))
      .slice(0, 12);

    const smallTargets = [...document.querySelectorAll("a, button, input, select, textarea")]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          tag: node.tagName.toLowerCase(),
          cls: typeof node.className === "string" ? node.className : "",
          text: (node.textContent || node.getAttribute("aria-label") || node.getAttribute("placeholder") || "").trim().slice(0, 60),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          hidden: style.display === "none" || style.visibility === "hidden" || rect.width < 2 || rect.height < 2
        };
      })
      .filter((item) => !item.hidden && (item.w < 32 || item.h < 32))
      .slice(0, 12);

    const product = {
      media: document.querySelectorAll("[data-gallery-media]").length,
      videos: [...document.querySelectorAll("[data-gallery-media]")].filter((node) => node.dataset.mediaType !== "image").length,
      inlineVideo: document.querySelector(".product-gallery.has-inline-video") ? 1 : 0,
      miniVideoOpen: document.querySelector("[data-mini-video].is-open") ? 1 : 0
    };

    return { textSamples, attrs, anchorsToOrigin, brokenImages, overflowX, offenders, smallTargets, product };
  }, mojibakePattern.source);

  return { route: route.path, viewport: viewport.name, screenshot, consoleErrors, ...dom };
}

async function testFlow(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(`${LOCAL}/san-pham/ca-phe-rang-xay-nguyen-chat-signature/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.removeItem("tng-original-cart"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".mobile-menu-toggle").click();
  const menuOpened = await page.locator(".soul-header.menu-open").count();
  await page.locator(".mobile-menu-toggle").click();
  await page.locator('[data-option-group="weight"] button').nth(1).click();
  const selectedVariant = await page.locator('[data-option-group="weight"] .selected').innerText();
  const videoCount = await page.locator('[data-gallery-media]:not([data-media-type="image"])').count().catch(() => 0);
  if (videoCount > 0) {
    await page.locator('[data-gallery-media]:not([data-media-type="image"])').first().click();
    await page.waitForTimeout(500);
  }
  const inlineVideo = await page.locator(".product-gallery.has-inline-video").count();
  await page.locator(".buy-now").click();
  await page.waitForURL("**/gio-hang/**", { timeout: 10000 });
  await page.waitForSelector(".checkout-item", { timeout: 10000 });
  await page.locator(".checkout-qty button").last().click();
  const qtyAfterPlus = await page.locator(".checkout-qty span").first().innerText();
  await page.locator(".checkout-qty button").first().click();
  const qtyAfterMinus = await page.locator(".checkout-qty span").first().innerText();
  await page.fill('input[name="phone"]', "0912345678");
  await page.fill('input[name="name"]', "Khach Production Audit");
  const district = page.locator('select[name="district"]');
  if (await district.count()) await district.selectOption({ index: 1 }).catch(() => {});
  const ward = page.locator('select[name="ward"]');
  if (await ward.count()) await ward.selectOption({ index: 1 }).catch(() => {});
  await page.fill('input[name="address"]', "20 Nguyen Trai, Quan 1");
  await page.locator("#checkoutPageSubmit").click();
  await page.waitForURL("**/dat-hang-thanh-cong/**", { timeout: 10000 });
  await page.waitForSelector(".order-success-card", { timeout: 10000 });
  const successText = await page.locator(".order-success-card").innerText();
  const successUrl = page.url();
  const screenshot = path.join(OUT_DIR, "flow-mobile-success.png").replace(/\\/g, "/");
  await page.screenshot({ path: screenshot, fullPage: true });
  const api = await page.request.get(`${LOCAL}/api/orders`, {
    headers: { authorization: "Bearer Jack@99" }
  });
  const ordersPayload = await api.json();
  const orders = Array.isArray(ordersPayload) ? ordersPayload : ordersPayload.orders || [];
  await page.close();
  return {
    menuOpened,
    selectedVariant,
    inlineVideo,
    qtyAfterPlus,
    qtyAfterMinus,
    successText,
    successUrl,
    latestOrder: orders[orders.length - 1],
    screenshot,
    consoleErrors
  };
}

(async () => {
  ensureDir(OUT_DIR);
  const browser = await chromium.launch({ headless: true, executablePath: fs.existsSync(chromePath) ? chromePath : undefined });
  const pages = [];
  for (const viewport of viewports) {
    for (const route of routes) {
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        hasTouch: viewport.isMobile
      });
      pages.push(await collectPageAudit(page, route, viewport));
      await page.close();
    }
  }
  const flow = await testFlow(browser);
  await browser.close();

  const failures = [];
  for (const item of pages) {
    if (item.textSamples.length) failures.push(`${item.viewport} ${item.route}: mojibake text`);
    if (item.attrs.length) failures.push(`${item.viewport} ${item.route}: mojibake attrs`);
    if (item.consoleErrors.length) failures.push(`${item.viewport} ${item.route}: console errors`);
    if (item.anchorsToOrigin.length) failures.push(`${item.viewport} ${item.route}: internal links still point to origin`);
    if (item.brokenImages.length) failures.push(`${item.viewport} ${item.route}: broken images`);
    if (item.overflowX > 3) failures.push(`${item.viewport} ${item.route}: horizontal overflow ${item.overflowX}px`);
  }
  if (!flow.successText || !flow.latestOrder?.id) failures.push("checkout flow did not create order");
  if (!flow.inlineVideo) failures.push("product video did not play inline during mobile flow");

  const report = { generatedAt: new Date().toISOString(), failures, pages, flow };
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
