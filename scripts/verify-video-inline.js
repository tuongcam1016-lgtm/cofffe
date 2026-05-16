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
  await page.waitForSelector('.product-gallery.has-inline-video [data-video-inline-frame][src*="youtube"]', {
    timeout: 5000
  });

  const iframeSrc = await page.locator("[data-video-inline-frame]").getAttribute("src");
  const modalOpen = await page.locator(".product-video-modal.is-open").count();
  const inlineBox = await page.locator("[data-video-inline]").boundingBox();
  const imageBox = await page.locator(".product-hero-image").boundingBox();
  await page.screenshot({ path: "C:/tmp/tng-video-inline.png", fullPage: false });
  await browser.close();

  console.log(JSON.stringify({
    iframeSrc,
    hasAutoplay: iframeSrc.includes("autoplay=1"),
    isMuted: iframeSrc.includes("mute=1"),
    modalOpen,
    inlineCoversImageFrame: Boolean(inlineBox && imageBox && Math.abs(inlineBox.width - imageBox.width) < 2),
    consoleErrors,
    screenshot: "C:/tmp/tng-video-inline.png"
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
