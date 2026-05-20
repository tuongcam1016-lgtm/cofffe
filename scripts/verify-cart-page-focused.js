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
  await page.evaluate(() => localStorage.removeItem("tng-original-cart"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".buy-now").click();
  await page.waitForURL("**/gio-hang/**", { timeout: 10000 });
  await page.waitForSelector(".checkout-item", { timeout: 10000 });

  const drawerOpen = await page.locator("#tngBridgeCart.is-open").count();
  const cartWidth = await page.locator(".checkout-page").evaluate((node) => Math.round(node.getBoundingClientRect().width));
  const initialItems = await page.locator(".checkout-item").count();
  const initialQty = await page.locator(".checkout-qty span").first().innerText();

  await page.locator(".checkout-qty button").last().click();
  const plusQty = await page.locator(".checkout-qty span").first().innerText();
  await page.locator(".checkout-qty button").first().click();
  const minusQty = await page.locator(".checkout-qty span").first().innerText();
  await page.screenshot({ path: "C:/tmp/tng-gio-hang-with-cart.png", fullPage: true });

  const requiredInvalid = await page.locator("#checkoutPageForm").evaluate((form) => !form.checkValidity());
  await page.locator("#checkoutPageSubmit").click();
  const statusAfterEmptySubmit = await page.locator("#checkoutPageStatus").innerText();

  await page.fill('input[name="phone"]', "0912345678");
  await page.fill('input[name="name"]', "Khach Test Checkout");
  await page.fill('input[name="address"]', "20 Nguyen Trai, Quan 1");
  await page.locator("#checkoutPageSubmit").click();
  await page.waitForFunction(() => document.querySelector("#checkoutPageStatus")?.innerText.includes("Đã gửi đơn thành công"), null, { timeout: 10000 });
  const successText = await page.locator("#checkoutPageStatus").innerText();

  const response = await page.request.get("http://localhost:3001/api/orders", {
    headers: { authorization: "Bearer Jack@99" }
  });
  const payloadOrders = await response.json();
  const orders = Array.isArray(payloadOrders) ? payloadOrders : payloadOrders.orders;
  const lastOrder = Array.isArray(orders) ? orders.find((order) => successText.includes(order.id)) : null;

  const finalUrl = page.url();
  await page.screenshot({ path: "C:/tmp/tng-gio-hang-focused-final.png", fullPage: true });
  await browser.close();

  console.log(JSON.stringify({
    url: finalUrl,
    drawerOpen,
    cartWidth,
    initialItems,
    initialQty,
    plusQty,
    minusQty,
    requiredInvalid,
    statusAfterEmptySubmit,
    successText,
    backendOrder: lastOrder && {
      id: lastOrder.id,
      total: lastOrder.total,
      items: lastOrder.items?.length,
      source: lastOrder.customer?.source
    },
    consoleErrors,
    screenshotWithCart: "C:/tmp/tng-gio-hang-with-cart.png",
    screenshotAfterSubmit: "C:/tmp/tng-gio-hang-focused-final.png"
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
