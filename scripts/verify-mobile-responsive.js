const { chromium } = require("playwright");
const fs = require("fs");

const phase = process.argv[2] || "check";
const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const localBase = "http://localhost:3001";
const originalBase = "https://taynguyensoul.vn";
const viewports = [
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 360, height: 800 }
];
const pages = [
  { path: "/", name: "home" },
  { path: "/ca-phe/", name: "category" },
  { path: "/san-pham/ca-phe-rang-xay-nguyen-chat-signature/", name: "product" },
  { path: "/gio-hang/", name: "cart" }
];

function fileName(prefix, viewport, page) {
  return `C:/tmp/tng-mobile-${phase}-${prefix}-${viewport.width}x${viewport.height}-${page.name}.png`;
}

async function metrics(page) {
  return page.evaluate(() => {
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
          text: (node.textContent || "").trim().slice(0, 60),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width)
        };
      })
      .filter((item) => item.width > 0 && (item.left < -2 || item.right > vw + 2))
      .slice(0, 8);
    const tapTooSmall = [...document.querySelectorAll("a, button, input, select, textarea")]
      .map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          tag: node.tagName.toLowerCase(),
          cls: typeof node.className === "string" ? node.className : "",
          text: (node.textContent || node.getAttribute("aria-label") || node.getAttribute("placeholder") || "").trim().slice(0, 40),
          w: Math.round(rect.width),
          h: Math.round(rect.height)
        };
      })
      .filter((item) => item.w > 0 && item.h > 0 && (item.w < 32 || item.h < 32))
      .slice(0, 10);
    return { overflowX, offenders, tapTooSmall };
  });
}

async function capture(browser, base, prefix) {
  const results = [];
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    for (const item of pages) {
      await page.goto(`${base}${item.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(500);
      const path = fileName(prefix, viewport, item);
      await page.screenshot({ path, fullPage: true });
      results.push({
        prefix,
        viewport: `${viewport.width}x${viewport.height}`,
        page: item.path,
        screenshot: path,
        metrics: await metrics(page),
        consoleErrors: consoleErrors.splice(0)
      });
    }
    await page.close();
  }
  return results;
}

async function testMobileFlow(browser) {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2
  });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(`${localBase}/san-pham/ca-phe-rang-xay-nguyen-chat-signature/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.removeItem("tng-original-cart"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".mobile-menu-toggle").click();
  const menuOpened = await page.locator(".soul-header.menu-open").count();
  await page.locator(".mobile-menu-toggle").click();
  await page.locator("[data-option-group]").first().locator("button").nth(1).click();
  const thumbs = await page.locator("[data-gallery-media]").count();
  if (thumbs > 1) await page.locator("[data-gallery-media]").nth(1).click();
  const videoButtonCount = await page.locator("[data-video-open]").count();
  if (videoButtonCount) {
    await page.locator("[data-video-open]").first().click();
    await page.waitForTimeout(400);
  }
  await page.locator(".buy-now").click();
  await page.waitForURL("**/gio-hang/**", { timeout: 10000 });
  await page.waitForSelector(".checkout-item", { timeout: 10000 });
  await page.locator(".checkout-qty button").last().click();
  const qtyAfterPlus = await page.locator(".checkout-qty span").first().innerText();
  await page.locator(".checkout-qty button").first().click();
  const qtyAfterMinus = await page.locator(".checkout-qty span").first().innerText();
  const cartWithItemScreenshot = `C:/tmp/tng-mobile-${phase}-cart-with-item.png`;
  await page.screenshot({ path: cartWithItemScreenshot, fullPage: true });
  await page.fill('input[name="phone"]', "0912345678");
  await page.fill('input[name="name"]', "Khach Mobile");
  await page.fill('input[name="address"]', "20 Nguyen Trai, Quan 1");
  await page.locator("#checkoutPageSubmit").click();
  await page.waitForFunction(() => document.querySelector("#checkoutPageStatus")?.innerText.includes("Đã gửi đơn thành công"), null, { timeout: 10000 });
  const successText = await page.locator("#checkoutPageStatus").innerText();
  const screenshot = `C:/tmp/tng-mobile-${phase}-flow-success.png`;
  await page.screenshot({ path: screenshot, fullPage: true });
  const flowMetrics = await metrics(page);
  await page.close();
  return { menuOpened, qtyAfterPlus, qtyAfterMinus, successText, cartWithItemScreenshot, screenshot, metrics: flowMetrics, consoleErrors };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const local = await capture(browser, localBase, "local");
  let original = [];
  if (process.env.CAPTURE_ORIGINAL === "1") {
    try {
      original = await capture(browser, originalBase, "original");
    } catch (error) {
      original = [{ error: error.message }];
    }
  }
  const flow = await testMobileFlow(browser);
  await browser.close();
  console.log(JSON.stringify({ phase, local, original, flow }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
