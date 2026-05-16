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
  await page.waitForSelector(".product-gallery.has-inline-video [data-video-inline]", { timeout: 5000 });

  const result = await page.evaluate(() => {
    const image = document.querySelector("[data-gallery-image]").getBoundingClientRect();
    const video = document.querySelector("[data-video-inline]").getBoundingClientRect();
    const thumbs = document.querySelector(".product-thumbs").getBoundingClientRect();
    return {
      image: { x: image.x, y: image.y, width: image.width, height: image.height },
      video: { x: video.x, y: video.y, width: video.width, height: video.height },
      thumbs: { x: thumbs.x, y: thumbs.y, width: thumbs.width, height: thumbs.height },
      sameFrame: Math.abs(image.x - video.x) < 1 &&
        Math.abs(image.y - video.y) < 1 &&
        Math.abs(image.width - video.width) < 1 &&
        Math.abs(image.height - video.height) < 1,
      doesNotCoverThumbs: video.x >= thumbs.right
    };
  });
  await page.screenshot({ path: "C:/tmp/tng-video-frame.png", fullPage: false });
  await browser.close();

  console.log(JSON.stringify({
    ...result,
    consoleErrors,
    screenshot: "C:/tmp/tng-video-frame.png"
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
