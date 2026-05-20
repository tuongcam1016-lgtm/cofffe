const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
  const browser = await chromium.launch({
    headless: true,
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined
  });
  const page = await browser.newPage({ viewport: { width: 1365, height: 768 } });
  const consoleErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto("http://localhost:3001/san-pham/deal-gioi-han-3-vi-ca-phe-chat-luong-cao/", {
    waitUntil: "domcontentloaded"
  });
  await page.locator(".add-cart").click();
  await page.fill('input[name="name"]', "Khach UI");
  await page.fill('input[name="phone"]', "0911111111");
  await page.fill('input[name="address"]', "Dia chi UI");
  await page.locator("#tngBridgeCheckout").click();
  await page.waitForURL("**/dat-hang-thanh-cong/**", { timeout: 10000 });
  await page.waitForSelector(".order-success-card", { timeout: 10000 });
  const successText = await page.locator(".order-success-card").innerText();
  await page.screenshot({ path: "C:/tmp/tng-checkout-success.png", fullPage: false });
  await browser.close();

  console.log(JSON.stringify({
    successText,
    hasOrderId: /SOUL-[A-F0-9]+/.test(successText),
    successUrl: page.url(),
    consoleErrors,
    screenshot: "C:/tmp/tng-checkout-success.png"
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
