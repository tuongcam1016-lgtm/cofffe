const fs = require("fs");
const path = "C:/Users/Admin/Downloads/Giỏ Hàng - TaynguyenSoul (5_15_2026 7：14：41 PM).html";
const html = fs.readFileSync(path, "utf8");

function stripTags(input) {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function snippets(pattern, radius = 500) {
  const out = [];
  const re = new RegExp(pattern, "gi");
  let match;
  while ((match = re.exec(html)) && out.length < 12) {
    const start = Math.max(0, match.index - radius);
    const end = Math.min(html.length, match.index + radius);
    out.push(stripTags(html.slice(start, end)).slice(0, 900));
  }
  return out;
}

const labels = [...html.matchAll(/<(?:label|th|h[1-4]|strong|span|p|button)[^>]*>([\s\S]{0,250}?)<\/(?:label|th|h[1-4]|strong|span|p|button)>/gi)]
  .map((match) => stripTags(match[1]))
  .filter(Boolean)
  .filter((text, index, arr) => arr.indexOf(text) === index)
  .filter((text) => /giỏ|hàng|mã|giảm|thanh toán|đơn|ship|shipping|phone|email|tên|quận|xã|địa|COD|chuyển|zip|quà|áp dụng|tạm|tổng/i.test(text))
  .slice(0, 120);

const inputs = [...html.matchAll(/<(input|select|textarea|button)[^>]*>/gi)].map((match) => {
  const attrs = match[0];
  const pick = (name) => attrs.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1] || "";
  return {
    tag: match[1].toLowerCase(),
    type: pick("type"),
    name: pick("name"),
    id: pick("id"),
    placeholder: pick("placeholder"),
    value: pick("value"),
    class: pick("class")
  };
}).filter((item) => Object.values(item).some(Boolean));

console.log(JSON.stringify({
  length: html.length,
  hasCheckoutForm: /checkout/i.test(html),
  hasCoupon: /coupon|mã giảm|apply_coupon|coupon_code/i.test(html),
  labels,
  inputs: inputs.slice(0, 160),
  cartSnippets: snippets("Giỏ hàng|gio-hang|cart_item|woocommerce-checkout-review-order|checkout_coupon|billing_phone|payment_method|shipping_method|coupon_code|Zip", 650)
}, null, 2));
