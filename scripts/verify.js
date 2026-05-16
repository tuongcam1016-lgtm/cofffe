const path = require("path");
const fs = require("fs");
const { chromium } = require("C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const target = process.env.VERIFY_URL || "http://localhost:3001";
const browserPath = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
].find((candidate) => fs.existsSync(candidate));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(browserPath ? { executablePath: browserPath } : {})
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto(target, { waitUntil: "networkidle" });
  await page.waitForSelector("#productGrid .product-card", { timeout: 10000 });
  await page.click("[data-add]");
  await page.waitForSelector(".cart-drawer.open", { timeout: 5000 });
  await page.fill('#checkoutForm input[name="name"]', "Nguyen Van A");
  await page.fill('#checkoutForm input[name="phone"]', "0900000000");
  await page.click("#checkoutButton");
  await page.waitForSelector("#orderStatus", { timeout: 5000 });

  const productCount = await page.locator("#productGrid .product-card").count();
  const orderStatus = await page.locator("#orderStatus").innerText();
  const hasContent = (await page.locator("body").innerText()).trim().length > 200;
  const screenshotPath = path.join("C:/tmp", "taynguyensoul-clone-check.png");
  await page.screenshot({ path: screenshotPath, fullPage: true });
  await browser.close();

  if (!hasContent) throw new Error("Page rendered without meaningful content.");
  if (productCount < 1) throw new Error("No products rendered.");
  if (!orderStatus.includes("Đã tạo đơn demo")) throw new Error(`Checkout failed: ${orderStatus}`);
  if (consoleErrors.length) throw new Error(`Console errors: ${consoleErrors.join(" | ")}`);

  console.log(JSON.stringify({ target, productCount, orderStatus, screenshotPath }, null, 2));
})();
