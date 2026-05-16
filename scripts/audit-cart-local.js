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
  await page.goto("http://localhost:3001/gio-hang/", { waitUntil: "domcontentloaded" });
  const text = await page.locator("body").innerText();
  const required = [
    "Áp dụng mã giảm giá (3)",
    "MUONG1TANG1",
    "FREETBOTTLE",
    "FREEREDBOTTLE",
    "Lấy bao bì loại Zip",
    "Giao hàng tới địa chỉ khác",
    "Giao trong giờ hành chính",
    "Mã giảm giá : onghut1tang1",
    "Hỏa tốc trong ngày",
    "Ưu đãi miễn phí ship",
    "Trả tiền mặt khi nhận hàng",
    "Chuyển khoản ngân hàng 24/7 VietQR",
    "Đặt hàng"
  ];
  const missing = required.filter((item) => !text.toLowerCase().includes(item.toLowerCase()));
  const metrics = await page.evaluate(() => ({
    overflowX: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
    couponCards: document.querySelectorAll(".coupon-card").length,
    checkoutChecks: document.querySelectorAll(".checkout-check input").length,
    shippingRadios: document.querySelectorAll("input[name='checkout-shipping']").length,
    paymentRadios: document.querySelectorAll("input[name='checkout-payment']").length
  }));
  await page.screenshot({ path: "C:/tmp/tng-cart-audit-local.png", fullPage: true });
  await browser.close();
  console.log(JSON.stringify({ missing, metrics, consoleErrors, screenshot: "C:/tmp/tng-cart-audit-local.png" }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
