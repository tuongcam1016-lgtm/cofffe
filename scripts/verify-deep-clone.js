const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const LOCAL = "http://localhost:3001";
const ORIGIN = "https://taynguyensoul.vn";
const OUT_DIR = "C:/tmp/tng-deep-verify";

async function screenshot(page, name, fullPage = false) {
  await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage });
  return `${OUT_DIR}/${name}.png`;
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const context = await browser.newContext({ viewport: { width: 1365, height: 768 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  const screenshots = {};
  const routes = {
    home: "/",
    category: "/ca-phe/",
    product: "/san-pham/ca-phe-rang-xay-nguyen-chat-signature/",
    cart: "/gio-hang/",
    blog: "/blog-ca-phe/",
    contact: "/lien-he/"
  };

  for (const [name, route] of Object.entries(routes)) {
    await page.goto(`${LOCAL}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(name === "product" ? 3500 : 600);
    screenshots[`local_${name}`] = await screenshot(page, `local-${name}`, name !== "product");
  }

  const localChecks = {};
  await page.goto(`${LOCAL}${routes.product}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("[data-gallery-media]", { timeout: 10000 });
  localChecks.productThumbs = await page.locator("[data-gallery-media]").count();
  localChecks.productVideoThumbs = await page.locator("[data-gallery-media]").evaluateAll((nodes) => nodes.filter((node) => node.dataset.mediaType !== "image").length);
  await page.waitForSelector(".product-gallery.has-inline-video", { timeout: 6000 });
  localChecks.inlineVideo = await page.locator(".product-gallery.has-inline-video").count();
  await page.locator(".gallery-arrow.next").click();
  await page.waitForTimeout(300);
  localChecks.gallerySelectedAfterNext = await page.locator("[data-gallery-media].selected").getAttribute("data-gallery-index");
  await page.locator('[data-option-group="weight"] button').nth(1).click();
  localChecks.variantSelected = await page.locator('[data-option-group="weight"] .selected').innerText();
  await page.locator(".add-cart").click();
  await page.waitForSelector("#tngBridgeCart.is-open", { timeout: 5000 });
  localChecks.cartDrawerOpen = await page.locator("#tngBridgeCart.is-open").count();
  await page.locator(".tng-bridge-close").click();
  await page.goto(`${LOCAL}/gio-hang/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".checkout-item", { timeout: 5000 });
  localChecks.checkoutItems = await page.locator(".checkout-item").count();
  await page.fill('#checkoutPageForm input[name="phone"]', "0900000000");
  await page.fill('#checkoutPageForm input[name="name"]', "Khach verify");
  await page.fill('#checkoutPageForm input[name="address"]', "Dia chi verify");
  await page.locator("#checkoutPageSubmit").click();
  await page.waitForFunction(() => {
    const text = document.querySelector("#checkoutPageStatus")?.textContent || "";
    return text && !text.includes("Đang gửi");
  }, { timeout: 10000 });
  localChecks.checkoutStatus = await page.locator("#checkoutPageStatus").innerText();

  for (const [name, route] of Object.entries(routes)) {
    try {
      await page.goto(`${ORIGIN}${route}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(1200);
      screenshots[`origin_${name}`] = await screenshot(page, `origin-${name}`, false);
    } catch (error) {
      screenshots[`origin_${name}`] = `ERROR: ${error.message}`;
    }
  }

  await page.goto(`${LOCAL}/ca-phe/`, { waitUntil: "domcontentloaded" });
  const externalInternalLinks = await page.locator('a[href^="https://taynguyensoul.vn"]').evaluateAll((nodes) => nodes.map((node) => node.href));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  await mobile.goto(`${LOCAL}${routes.product}`, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(3500);
  screenshots.local_product_mobile = await mobile.screenshot({ path: `${OUT_DIR}/local-product-mobile.png`, fullPage: false }).then(() => `${OUT_DIR}/local-product-mobile.png`);
  await mobile.close();

  await browser.close();

  const report = {
    verifiedAt: new Date().toISOString(),
    screenshots,
    localChecks,
    externalInternalLinks,
    consoleErrors
  };
  fs.writeFileSync(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
