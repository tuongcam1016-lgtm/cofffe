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

  await page.goto("http://localhost:3001/san-pham/ca-phe-rang-xay-nguyen-chat-signature/", {
    waitUntil: "domcontentloaded"
  });
  await page.waitForSelector("[data-gallery-media]", { timeout: 10000 });
  const thumbCount = await page.locator("[data-gallery-media]").count();
  const videoThumbCount = await page.locator("[data-gallery-media]").evaluateAll((nodes) =>
    nodes.filter((node) => node.dataset.mediaType !== "image").length
  );
  const firstImage = await page.locator("[data-gallery-image]").getAttribute("src");

  await page.locator(".gallery-arrow.next").click();
  await page.waitForTimeout(250);
  const secondImage = await page.locator("[data-gallery-image]").getAttribute("src");

  await page.waitForSelector('.product-gallery.has-inline-video [data-video-inline-frame][src*="youtube"]', {
    timeout: 5000
  });
  const autoplaySrc = await page.locator("[data-video-inline-frame]").getAttribute("src");
  await page.screenshot({ path: "C:/tmp/tng-product-gallery.png", fullPage: false });
  await browser.close();

  console.log(JSON.stringify({
    thumbCount,
    videoThumbCount,
    slideChanged: firstImage !== secondImage,
    autoplaySrc,
    usesSignatureVideo: /7Zp9Q1fdCBQ|8MFI-Uh_njU/.test(autoplaySrc),
    consoleErrors,
    screenshot: "C:/tmp/tng-product-gallery.png"
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
