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
  await page.waitForSelector("[data-video-open]", { timeout: 10000 });

  const videoButtons = await page.locator("[data-video-open]").count();
  await page.locator(".video-play-button").click();
  await page.waitForSelector('.product-video-modal.is-open iframe[src*="youtube"]', { timeout: 10000 });
  const iframeSrc = await page.locator("[data-video-frame]").getAttribute("src");
  await page.screenshot({ path: "C:/tmp/tng-video-product.png", fullPage: false });

  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  const closedAfterEscape = (await page.locator(".product-video-modal.is-open").count()) === 0;
  await browser.close();

  console.log(JSON.stringify({
    videoButtons,
    iframeSrc,
    closedAfterEscape,
    consoleErrors,
    screenshot: "C:/tmp/tng-video-product.png"
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
