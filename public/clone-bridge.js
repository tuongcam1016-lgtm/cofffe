(function () {
  const currency = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  });

  const state = {
    products: new Map(),
    cart: JSON.parse(localStorage.getItem("tng-original-cart") || "[]")
  };

  const provinces = [
    "TP. Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ",
    "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa",
    "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
    "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi",
    "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
    "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];

  const districtMap = {
    "TP. Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12", "Bình Thạnh", "Gò Vấp", "Phú Nhuận", "Tân Bình", "Tân Phú", "Bình Tân", "Thủ Đức", "Bình Chánh", "Cần Giờ", "Củ Chi", "Hóc Môn", "Nhà Bè"],
    "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Tây Hồ", "Long Biên", "Cầu Giấy", "Đống Đa", "Hai Bà Trưng", "Hoàng Mai", "Thanh Xuân", "Hà Đông", "Nam Từ Liêm", "Bắc Từ Liêm", "Sơn Tây", "Ba Vì", "Chương Mỹ", "Đan Phượng", "Đông Anh", "Gia Lâm", "Hoài Đức", "Mê Linh", "Mỹ Đức", "Phú Xuyên", "Phúc Thọ", "Quốc Oai", "Sóc Sơn", "Thạch Thất", "Thanh Oai", "Thanh Trì", "Thường Tín", "Ứng Hòa"],
    "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ", "Hòa Vang", "Hoàng Sa"],
    "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt", "Phong Điền", "Cờ Đỏ", "Thới Lai", "Vĩnh Thạnh"],
    "Hải Phòng": ["Hồng Bàng", "Ngô Quyền", "Lê Chân", "Hải An", "Kiến An", "Đồ Sơn", "Dương Kinh", "An Dương", "An Lão", "Cát Hải", "Kiến Thụy", "Thủy Nguyên", "Tiên Lãng", "Vĩnh Bảo"],
    "Đồng Nai": ["Biên Hòa", "Long Khánh", "Nhơn Trạch", "Long Thành", "Trảng Bom", "Thống Nhất", "Vĩnh Cửu", "Xuân Lộc", "Cẩm Mỹ", "Định Quán", "Tân Phú"],
    "Bình Dương": ["Thủ Dầu Một", "Thuận An", "Dĩ An", "Tân Uyên", "Bến Cát", "Bắc Tân Uyên", "Bàu Bàng", "Dầu Tiếng", "Phú Giáo"],
    "Đắk Lắk": ["Buôn Ma Thuột", "Buôn Hồ", "Ea H'leo", "Ea Súp", "Buôn Đôn", "Cư M'gar", "Krông Búk", "Krông Năng", "Ea Kar", "M'Đrắk", "Krông Bông", "Krông Pắc", "Krông Ana", "Lắk", "Cư Kuin"],
    "Lâm Đồng": ["Đà Lạt", "Bảo Lộc", "Đam Rông", "Lạc Dương", "Lâm Hà", "Đơn Dương", "Đức Trọng", "Di Linh", "Bảo Lâm", "Đạ Huoai", "Đạ Tẻh", "Cát Tiên"]
  };

  const wardMap = {
    "Quận 1": ["Bến Nghé", "Bến Thành", "Cầu Kho", "Cầu Ông Lãnh", "Cô Giang", "Đa Kao", "Nguyễn Cư Trinh", "Nguyễn Thái Bình", "Phạm Ngũ Lão", "Tân Định"],
    "Quận 3": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Võ Thị Sáu"],
    "Bình Thạnh": ["Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"],
    "Tân Bình": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"],
    "Thủ Đức": ["An Khánh", "An Lợi Đông", "An Phú", "Bình Chiểu", "Bình Thọ", "Bình Trưng Đông", "Bình Trưng Tây", "Cát Lái", "Hiệp Bình Chánh", "Hiệp Bình Phước", "Hiệp Phú", "Linh Chiểu", "Linh Đông", "Linh Tây", "Linh Trung", "Linh Xuân", "Long Bình", "Long Phước", "Long Thạnh Mỹ", "Long Trường", "Phú Hữu", "Phước Bình", "Phước Long A", "Phước Long B", "Tam Bình", "Tam Phú", "Tăng Nhơn Phú A", "Tăng Nhơn Phú B", "Thảo Điền", "Thạnh Mỹ Lợi", "Thủ Thiêm", "Trường Thạnh", "Trường Thọ"],
    "Ba Đình": ["Cống Vị", "Điện Biên", "Đội Cấn", "Giảng Võ", "Kim Mã", "Liễu Giai", "Ngọc Hà", "Ngọc Khánh", "Nguyễn Trung Trực", "Phúc Xá", "Quán Thánh", "Thành Công", "Trúc Bạch", "Vĩnh Phúc"],
    "Hoàn Kiếm": ["Chương Dương", "Cửa Đông", "Cửa Nam", "Đồng Xuân", "Hàng Bạc", "Hàng Bài", "Hàng Bồ", "Hàng Bông", "Hàng Buồm", "Hàng Đào", "Hàng Gai", "Hàng Mã", "Hàng Trống", "Lý Thái Tổ", "Phan Chu Trinh", "Phúc Tân", "Trần Hưng Đạo", "Tràng Tiền"],
    "Hải Châu": ["Bình Hiên", "Bình Thuận", "Hải Châu I", "Hải Châu II", "Hòa Cường Bắc", "Hòa Cường Nam", "Hòa Thuận Đông", "Hòa Thuận Tây", "Nam Dương", "Phước Ninh", "Thạch Thang", "Thanh Bình", "Thuận Phước"],
    "Buôn Ma Thuột": ["Ea Tam", "Khánh Xuân", "Tân An", "Tân Hòa", "Tân Lập", "Tân Lợi", "Tân Thành", "Thành Công", "Thành Nhất", "Thắng Lợi", "Thống Nhất", "Tự An"]
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function parsePrice(value) {
    const number = Number(String(value || "").replace(/[^\d]/g, ""));
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function formatVnd(value) {
    return `${Math.round(Number(value) || 0).toLocaleString("vi-VN")}đ`;
  }

  function fixText(value) {
    const text = String(value || "");
    if (!/[ÃÄÂÆáºá»]/.test(text)) return text;
    try {
      const bytes = Uint8Array.from(Array.from(text, (char) => char.charCodeAt(0) & 255));
      return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch (error) {
      return text;
    }
  }

  function fixMojibake(value) {
    const text = String(value || "");
    if (!/(?:Ã[\u0080-\u00BF]|Ä[\u0080-\u00BF]|á[\u0080-\u00BF]|â[\u0080-\u00BF]|ï¿½)/.test(text)) return text;
    try {
      const bytes = Uint8Array.from(Array.from(text, (char) => char.charCodeAt(0) & 255));
      return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    } catch {
      return text;
    }
  }

  function normalizeVisibleText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const fixed = fixMojibake(node.nodeValue);
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    });
    document.querySelectorAll("[alt], [title], [placeholder], [aria-label], option").forEach((node) => {
      ["alt", "title", "placeholder", "aria-label", "value"].forEach((attr) => {
        const value = node.getAttribute(attr);
        if (!value) return;
        const fixed = fixMojibake(value);
        if (fixed !== value) node.setAttribute(attr, fixed);
      });
      if (node.tagName === "OPTION") {
        const fixed = fixMojibake(node.textContent);
        if (fixed !== node.textContent) node.textContent = fixed;
      }
    });
  }

  function rewriteOriginLinks() {
    document.querySelectorAll('a[href^="https://taynguyensoul.vn"]').forEach((link) => {
      try {
        const url = new URL(link.href);
        if (url.hostname === "taynguyensoul.vn") link.href = `${url.pathname}${url.search}${url.hash}`;
      } catch {
        // Ignore malformed links.
      }
    });
  }

  function saveCart() {
    localStorage.setItem("tng-original-cart", JSON.stringify(state.cart));
  }

  function productFromNode(node) {
    const name = fixText(node.dataset.gtm4wp_product_name || node.getAttribute("data-gtm4wp_product_name") || "");
    const price = parsePrice(node.dataset.gtm4wp_product_price || node.getAttribute("data-gtm4wp_product_price"));
    const id = node.dataset.gtm4wp_product_id || node.getAttribute("data-gtm4wp_product_id") || name;
    const category = fixText(node.dataset.gtm4wp_product_cat || node.getAttribute("data-gtm4wp_product_cat") || "");
    const card = node.closest(".product-small, .product, .col");
    const image = card?.querySelector("img[data-src], img[src]")?.getAttribute("data-src") ||
      card?.querySelector("img[src]")?.getAttribute("src") ||
      "";
    return name ? { id, name, price, category, image } : null;
  }

  function collectProducts() {
    document.querySelectorAll("[data-tng-product]").forEach((node) => {
      try {
        const product = JSON.parse(node.dataset.tngProduct);
        if (product && product.id && product.name) state.products.set(String(product.id), product);
      } catch {
        // Ignore malformed embedded data.
      }
    });

    document.querySelectorAll(".gtm4wp_productdata, [data-gtm4wp_product_name]").forEach((node) => {
      const product = productFromNode(node);
      if (product && !state.products.has(product.id)) state.products.set(product.id, product);
    });
  }

  function attachStylesheet() {
    if (document.querySelector('link[href="/clone-bridge.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/clone-bridge.css";
    document.head.appendChild(link);
  }

  function fillSelect(select, values, placeholder) {
    if (!select) return;
    const current = select.value;
    select.innerHTML = "";
    if (placeholder) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = placeholder;
      select.appendChild(option);
    }
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
    if (current && values.includes(current)) select.value = current;
  }

  function genericDistricts(city) {
    if (!city) return [];
    return [`${city} - Quận/Huyện trung tâm`, `${city} - Khu vực 1`, `${city} - Khu vực 2`, `${city} - Khu vực 3`];
  }

  function hydrateAddressSelects() {
    const form = document.querySelector("#checkoutPageForm");
    if (!form) return;
    const city = form.querySelector('select[name="city"]');
    const district = form.querySelector('select[name="district"]');
    const ward = form.querySelector('select[name="ward"]');
    if (!city || !district || !ward) return;
    fillSelect(city, provinces, "");
    if (city && !city.value) city.value = "TP. Hồ Chí Minh";

    const updateDistricts = () => {
      const values = districtMap[city.value] || genericDistricts(city.value);
      fillSelect(district, values, "Chọn quận huyện");
      fillSelect(ward, [], "Chọn xã/phường");
    };

    const updateWards = () => {
      const values = wardMap[district.value] || ["Phường/Xã trung tâm", "Phường/Xã 1", "Phường/Xã 2", "Phường/Xã 3"];
      fillSelect(ward, values, "Chọn xã/phường");
    };

    updateDistricts();
    city.addEventListener("change", updateDistricts);
    district.addEventListener("change", updateWards);
  }

  function addButtons() {
    state.products.forEach((product) => {
      const dataNode = document.querySelector(`[data-gtm4wp_product_id="${CSS.escape(product.id)}"]`);
      const card = dataNode?.closest(".product-small, .product, .col");
      const target = card?.querySelector(".box-text, .box-text-products, .price-wrapper") || card;
      if (!target || target.querySelector(".tng-bridge-add")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "tng-bridge-add";
      button.dataset.tngProductId = product.id;
      button.textContent = "Thêm vào giỏ hàng";
      target.appendChild(button);
    });
  }

  function selectedVariant() {
    const active = {};
    document.querySelectorAll("[data-option-group]").forEach((group) => {
      const selected = group.querySelector(".selected") || group.querySelector("button");
      active[group.dataset.optionGroup] = selected?.dataset.optionValue || selected?.textContent.trim() || "";
    });
    const multiplier = Number(document.querySelector('[data-option-group="weight"] .selected')?.dataset.priceMultiplier || 1);
    const basePrice = Number(document.querySelector(".price-range")?.dataset.basePrice || 0);
    const quantity = Math.max(1, Number(document.querySelector("[data-product-qty-value]")?.textContent || 1));
    return { active, multiplier, basePrice, quantity };
  }

  function refreshVariantPrice() {
    const { active, multiplier, basePrice } = selectedVariant();
    if (!basePrice) return;
    const price = Math.round(basePrice * multiplier);
    const oldPrice = Math.round(price * 1.32);
    const priceNode = document.querySelector("[data-variant-price]");
    const oldPriceNode = document.querySelector("[data-variant-old-price]");
    const weightNode = document.querySelector("[data-selected-weight]");
    const sessionNode = document.querySelector("[data-session-count]");
    if (priceNode) priceNode.textContent = formatVnd(price);
    if (oldPriceNode) oldPriceNode.textContent = formatVnd(oldPrice);
    if (weightNode) weightNode.textContent = active.weight || "";
    if (sessionNode) {
      const sessions = active.weight?.includes("1kg") ? 55 : active.weight?.includes("500g") ? 28 : 14;
      sessionNode.textContent = `${sessions} buổi`;
    }
  }

  function productForAdd(productId) {
    const product = state.products.get(productId);
    if (!product) return null;
    if (!document.querySelector(".product-detail")) return { product, quantity: 1 };

    const { active, multiplier, basePrice, quantity } = selectedVariant();
    const price = basePrice ? Math.round(basePrice * multiplier) : product.price;
    const suffix = [active.weight, active.request, active.brew].filter(Boolean).join(" / ");
    return {
      product: {
        ...product,
        id: `${product.id}:${suffix}`,
        baseId: product.id,
        name: suffix ? `${product.name} - ${suffix}` : product.name,
        price
      },
      quantity
    };
  }

  function updateHeaderCount() {
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-icon strong, .soul-cart-link").forEach((node) => {
      node.textContent = String(count);
    });
  }

  function clearCartStatus() {
    const success = document.querySelector("#tngBridgeSuccess");
    const status = document.querySelector("#tngBridgeStatus");
    if (success) {
      success.hidden = true;
      success.innerHTML = "";
    }
    if (status) status.textContent = "";
  }

  function addToCart(productId, options = {}) {
    const resolved = productForAdd(productId);
    if (!resolved) return;
    const { product, quantity } = resolved;
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += quantity;
    else state.cart.push({ ...product, quantity });
    saveCart();
    renderCart();
    renderCheckoutPage();
    updateHeaderCount();
    if (options.toast !== false) showToast(`Đã thêm ${product.name}`);
    clearCartStatus();
    if (options.redirectTo) {
      window.location.href = options.redirectTo;
      return;
    }
    if (options.openCart !== false) openCart();
  }

  function updateQuantity(productId, delta) {
    const item = state.cart.find((entry) => entry.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) state.cart = state.cart.filter((entry) => entry.id !== productId);
    saveCart();
    renderCart();
    renderCheckoutPage();
    updateHeaderCount();
  }

  function renderCart() {
    const list = document.querySelector("#tngBridgeList");
    const totalNode = document.querySelector("#tngBridgeTotal");
    if (!list || !totalNode) return;

    const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalNode.textContent = currency.format(total);

    if (!state.cart.length) {
      list.innerHTML = '<p class="tng-bridge-muted">Chưa có sản phẩm trong giỏ hàng.</p>';
      return;
    }

    list.innerHTML = state.cart.map((item) => `
      <div class="tng-bridge-item">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <span class="tng-bridge-muted">${escapeHtml(item.category)} · ${currency.format(item.price)}</span>
        </div>
        <div class="tng-bridge-qty">
          <button type="button" data-tng-qty="${escapeHtml(item.id)}" data-delta="-1">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-tng-qty="${escapeHtml(item.id)}" data-delta="1">+</button>
        </div>
      </div>
    `).join("");
  }

  function renderCheckoutPage() {
    const list = document.querySelector("#checkoutItems");
    const review = document.querySelector("#checkoutReview");
    const subtotal = document.querySelector("#checkoutSubtotal");
    const grandTotal = document.querySelector("#checkoutGrandTotal");
    if (!list || !review || !subtotal || !grandTotal) return;
    const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    subtotal.textContent = currency.format(total);
    grandTotal.textContent = currency.format(total);
    if (!state.cart.length) {
      list.innerHTML = '<p class="tng-bridge-muted">Chưa có sản phẩm trong giỏ hàng.</p>';
      review.innerHTML = '<p class="tng-bridge-muted">Đơn hàng đang trống.</p>';
      return;
    }
    list.innerHTML = state.cart.map((item) => `
      <div class="checkout-item">
        <div class="checkout-item-main">
          <button type="button" data-tng-qty="${escapeHtml(item.id)}" data-delta="${-item.quantity}">×</button>
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
          <div><strong>${escapeHtml(item.name)}</strong><br><small>${escapeHtml(item.category || "")}</small></div>
        </div>
        <strong>${currency.format(item.price)}</strong>
        <div class="checkout-qty"><button type="button" data-tng-qty="${escapeHtml(item.id)}" data-delta="-1">-</button><span>${item.quantity}</span><button type="button" data-tng-qty="${escapeHtml(item.id)}" data-delta="1">+</button></div>
        <strong>${currency.format(item.price * item.quantity)}</strong>
      </div>
    `).join("");
    review.innerHTML = state.cart.map((item) => `
      <div class="checkout-review-row"><span>${escapeHtml(item.name)} × ${item.quantity}</span><strong>${currency.format(item.price * item.quantity)}</strong></div>
    `).join("");
  }

  function buildCart() {
    if (document.querySelector("#tngBridgeCart")) return;
    const cart = document.createElement("aside");
    cart.id = "tngBridgeCart";
    cart.className = "tng-bridge-cart";
    cart.innerHTML = `
      <div class="tng-bridge-panel" role="dialog" aria-modal="true" aria-label="Giỏ hàng">
        <div class="tng-bridge-head">
          <h2>Giỏ hàng</h2>
          <button class="tng-bridge-close" type="button">Đóng</button>
        </div>
        <p class="tng-bridge-muted">Đơn hàng trên 599.000₫ hoặc từ đủ 1kg cà phê sẽ được FREESHIP.</p>
        <div id="tngBridgeList" class="tng-bridge-list"></div>
        <form id="tngBridgeForm" class="tng-bridge-form">
          <input name="name" placeholder="Họ tên" required>
          <input name="phone" placeholder="Số điện thoại" required>
          <input name="address" placeholder="Địa chỉ giao hàng">
          <textarea name="note" placeholder="Ghi chú rang xay / kiểu pha"></textarea>
        </form>
        <div class="tng-bridge-total">
          <span>Tạm tính</span>
          <strong id="tngBridgeTotal">0₫</strong>
        </div>
        <button id="tngBridgeCheckout" class="tng-bridge-checkout" type="button">Gửi đơn demo</button>
        <div id="tngBridgeSuccess" class="tng-bridge-success" hidden></div>
        <p id="tngBridgeStatus" class="tng-bridge-status"></p>
      </div>
    `;
    document.body.appendChild(cart);
    renderCart();
  }

  function openCart() {
    clearCartStatus();
    document.querySelector("#tngBridgeCart")?.classList.add("is-open");
  }

  function closeCart() {
    document.querySelector("#tngBridgeCart")?.classList.remove("is-open");
  }

  function withVideoParams(src, muted) {
    const url = new URL(src, window.location.href);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("rel", "0");
    url.searchParams.set("controls", "0");
    url.searchParams.set("modestbranding", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("disablekb", "1");
    url.searchParams.set("fs", "0");
    url.searchParams.set("iv_load_policy", "3");
    url.searchParams.set("cc_load_policy", "0");
    if (muted) url.searchParams.set("mute", "1");
    return url.toString();
  }

  function openVideo(src, options = {}) {
    closeMiniVideo();
    const inline = document.querySelector("[data-video-inline]");
    const inlineFrame = document.querySelector("[data-video-inline-frame]");
    const nativeVideo = document.querySelector("[data-video-native]");
    if (inline && inlineFrame && src) {
      const isNative = /\.(mp4|webm|mov)(?:\?|$)/i.test(src);
      if (nativeVideo) {
        nativeVideo.pause();
        nativeVideo.removeAttribute("src");
        nativeVideo.style.display = isNative ? "block" : "none";
      }
      inlineFrame.style.display = isNative ? "none" : "block";
      if (isNative && nativeVideo) {
        nativeVideo.src = src;
        nativeVideo.muted = Boolean(options.muted);
        nativeVideo.play().catch(() => {});
      } else {
        inlineFrame.src = withVideoParams(src, Boolean(options.muted));
      }
      inline.classList.add("is-playing");
      inline.setAttribute("aria-hidden", "false");
      inline.closest(".product-gallery")?.classList.add("has-inline-video");
      return;
    }

    const modal = document.querySelector("[data-video-modal]");
    const frame = document.querySelector("[data-video-frame]");
    if (!modal || !frame || !src) return;
    frame.src = withVideoParams(src, Boolean(options.muted));
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("has-video-modal");
  }

  function playMiniVideo() {
    const mini = document.querySelector("[data-mini-video]");
    if (!mini || mini.classList.contains("is-open")) return;
    const src = mini.dataset.miniVideoSrc;
    if (!src) return;
    const frame = mini.querySelector("[data-mini-video-frame]");
    const nativeVideo = mini.querySelector("[data-mini-video-native]");
    const poster = mini.querySelector("img");
    const isNative = /\.(mp4|webm|mov)(?:\?|$)/i.test(src);
    if (nativeVideo) {
      nativeVideo.pause();
      nativeVideo.removeAttribute("src");
      nativeVideo.style.display = isNative ? "block" : "none";
    }
    if (frame) frame.style.display = isNative ? "none" : "block";
    if (poster) poster.style.display = "none";
    if (isNative && nativeVideo) {
      nativeVideo.src = src;
      nativeVideo.muted = true;
      nativeVideo.play().catch(() => {});
    } else if (frame) {
      frame.src = withVideoParams(src, true);
    }
    mini.classList.add("is-open");
    mini.setAttribute("aria-hidden", "false");
  }

  function closeMiniVideo() {
    const mini = document.querySelector("[data-mini-video]");
    if (!mini) return;
    const frame = mini.querySelector("[data-mini-video-frame]");
    const nativeVideo = mini.querySelector("[data-mini-video-native]");
    const poster = mini.querySelector("img");
    if (frame) frame.removeAttribute("src");
    if (nativeVideo) {
      nativeVideo.pause();
      nativeVideo.removeAttribute("src");
    }
    if (poster) poster.style.display = "";
    mini.classList.remove("is-open");
    mini.setAttribute("aria-hidden", "true");
  }

  function closeVideo() {
    const inline = document.querySelector("[data-video-inline]");
    const inlineFrame = document.querySelector("[data-video-inline-frame]");
    const nativeVideo = document.querySelector("[data-video-native]");
    if (inlineFrame) inlineFrame.src = "";
    if (nativeVideo) {
      nativeVideo.pause();
      nativeVideo.removeAttribute("src");
    }
    if (inline) {
      inline.classList.remove("is-playing");
      inline.setAttribute("aria-hidden", "true");
      inline.closest(".product-gallery")?.classList.remove("has-inline-video");
    }

    const modal = document.querySelector("[data-video-modal]");
    const frame = document.querySelector("[data-video-frame]");
    if (frame) frame.src = "";
    if (modal) {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("has-video-modal");
  }

  function markGallerySelected(button) {
    const gallery = button.closest(".product-gallery");
    if (!gallery) return;
    gallery.querySelectorAll("[data-gallery-media]").forEach((node) => node.classList.remove("selected"));
    button.classList.add("selected");
  }

  function selectGalleryMedia(button, options = {}) {
    const type = button.dataset.mediaType || "image";
    const src = button.dataset.mediaSrc || button.dataset.videoSrc;
    const gallery = button.closest(".product-gallery");
    const image = gallery?.querySelector("[data-gallery-image]");
    if (!gallery || !src) return;
    markGallerySelected(button);
    if (type === "image") {
      closeVideo();
      if (image) image.src = src;
      return;
    }
    openVideo(src, { muted: Boolean(options.muted) });
  }

  function stepGallery(button) {
    const gallery = button.closest(".product-gallery");
    const thumbs = [...(gallery?.querySelectorAll("[data-gallery-media]") || [])];
    if (!thumbs.length) return;
    const selected = Math.max(0, thumbs.findIndex((thumb) => thumb.classList.contains("selected")));
    const delta = Number(button.dataset.galleryStep || (button.classList.contains("next") ? 1 : -1));
    const next = (selected + delta + thumbs.length) % thumbs.length;
    selectGalleryMedia(thumbs[next], { muted: thumbs[next].dataset.mediaType !== "image" });
  }

  function showToast(message) {
    let toast = document.querySelector("#tngBridgeToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "tngBridgeToast";
      toast.className = "tng-bridge-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  function scheduleProductVideoAutoplay() {
    const opener = document.querySelector(".product-detail [data-video-open]");
    if (!opener) return;
    if (window.matchMedia("(max-width: 768px)").matches) return;
    window.clearTimeout(scheduleProductVideoAutoplay.timer);
    scheduleProductVideoAutoplay.timer = window.setTimeout(() => {
      const modal = document.querySelector("[data-video-modal]");
      const inline = document.querySelector("[data-video-inline]");
      const cart = document.querySelector("#tngBridgeCart");
      if (inline?.classList.contains("is-playing") || modal?.classList.contains("is-open") || cart?.classList.contains("is-open")) return;
      if (opener.matches("[data-gallery-media]")) selectGalleryMedia(opener, { muted: true });
      else openVideo(opener.dataset.videoSrc, { muted: true });
    }, 3000);
  }

  function scheduleMiniVideoPopup() {
    const mini = document.querySelector("[data-mini-video]");
    if (!mini) return;
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    window.clearTimeout(scheduleMiniVideoPopup.timer);
    scheduleMiniVideoPopup.timer = window.setTimeout(() => {
      const modal = document.querySelector("[data-video-modal]");
      const cart = document.querySelector("#tngBridgeCart");
      if (modal?.classList.contains("is-open") || cart?.classList.contains("is-open")) return;
      playMiniVideo();
    }, 3200);
  }

  async function checkout() {
    const status = document.querySelector("#tngBridgeStatus");
    const form = document.querySelector("#tngBridgeForm");
    const success = document.querySelector("#tngBridgeSuccess");
    const checkoutButton = document.querySelector("#tngBridgeCheckout");
    if (success) {
      success.hidden = true;
      success.innerHTML = "";
    }
    if (!state.cart.length) {
      status.textContent = "Giỏ hàng đang trống.";
      return;
    }
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    status.textContent = "Đang gửi đơn...";
    if (checkoutButton) checkoutButton.disabled = true;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.get("name"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            note: formData.get("note"),
            source: "singlefile-clone"
          },
          items: state.cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        status.textContent = payload.message || "Không gửi được đơn.";
        return;
      }

      const order = payload.order || payload;
      state.cart = [];
      saveCart();
      renderCart();
      renderCheckoutPage();
      updateHeaderCount();
      form.reset();
      status.textContent = "";
      if (success) {
        success.hidden = false;
        success.innerHTML = `
          <strong>Đã gửi đơn thành công</strong>
          <span>Mã đơn: ${escapeHtml(order.id || payload.id)}</span>
          <span>Tổng tiền: ${currency.format(order.total || payload.total || 0)}</span>
          <a href="${escapeHtml(payload.viewUrl || "/admin/orders")}" target="_blank" rel="noopener">Xem đơn trong backend</a>
        `;
      }
      showToast(`Đã gửi đơn ${order.id || payload.id}`);
    } catch (error) {
      status.textContent = "Không gửi được đơn. Vui lòng thử lại.";
    } finally {
      if (checkoutButton) checkoutButton.disabled = false;
    }
  }

  async function checkoutFromPage() {
    const form = document.querySelector("#checkoutPageForm");
    const status = document.querySelector("#checkoutPageStatus");
    if (!form || !status) return;
    if (!state.cart.length) {
      status.textContent = "Giỏ hàng đang trống.";
      return;
    }
    if (!form.reportValidity()) return;
    const formData = new FormData(form);
    status.textContent = "Đang gửi đơn...";
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: formData.get("name"),
            phone: formData.get("phone"),
            email: formData.get("email"),
            city: formData.get("city"),
            district: formData.get("district"),
            ward: formData.get("ward"),
            address: formData.get("address"),
            note: formData.get("note"),
            source: "checkout-page"
          },
          options: {
            zipBag: Boolean(document.querySelector(".gift-line input")?.checked),
            shipDifferent: formData.get("shipDifferent") === "on",
            officeHours: formData.get("officeHours") === "on",
            shipping: document.querySelector("input[name='checkout-shipping']:checked")?.value || "free-ghn",
            payment: document.querySelector("input[name='checkout-payment']:checked")?.value || "cod"
          },
          items: state.cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        status.textContent = payload.message || "Không gửi được đơn.";
        return;
      }
      const order = payload.order || payload;
      state.cart = [];
      saveCart();
      renderCart();
      renderCheckoutPage();
      updateHeaderCount();
      form.reset();
      status.innerHTML = `
        <strong>Đã gửi đơn thành công</strong>
        <span>Mã đơn: ${escapeHtml(order.id || payload.id)}</span>
        <span>Tổng tiền: ${currency.format(order.total || payload.total || 0)}</span>
        <a href="${escapeHtml(payload.viewUrl || "/admin/orders")}" target="_blank" rel="noopener">Xem đơn trong backend</a>
      `;
      showToast(`Đã gửi đơn ${order.id || payload.id}`);
    } catch (error) {
      status.textContent = "Không gửi được đơn. Vui lòng thử lại.";
    }
  }

  function wireEvents() {
    document.addEventListener("click", (event) => {
      const mobileToggle = event.target.closest(".mobile-menu-toggle");
      if (mobileToggle) {
        event.preventDefault();
        event.stopPropagation();
        const header = mobileToggle.closest(".soul-header");
        const isOpen = header?.classList.toggle("menu-open");
        mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        return;
      }

      const galleryStep = event.target.closest(".gallery-arrow, [data-gallery-step]");
      if (galleryStep) {
        event.preventDefault();
        event.stopPropagation();
        stepGallery(galleryStep);
        return;
      }

      const galleryMedia = event.target.closest("[data-gallery-media]");
      if (galleryMedia) {
        event.preventDefault();
        event.stopPropagation();
        selectGalleryMedia(galleryMedia);
        return;
      }

      const videoOpen = event.target.closest("[data-video-open]");
      if (videoOpen) {
        event.preventDefault();
        event.stopPropagation();
        openVideo(videoOpen.dataset.videoSrc);
        return;
      }

      const miniVideoOpen = event.target.closest("[data-mini-video-open]");
      if (miniVideoOpen) {
        event.preventDefault();
        event.stopPropagation();
        const mini = miniVideoOpen.closest("[data-mini-video]");
        const src = mini?.dataset.miniVideoSrc;
        const match = src ? document.querySelector(`[data-gallery-media][data-media-src="${CSS.escape(src)}"]`) : null;
        if (match) selectGalleryMedia(match);
        else if (src) openVideo(src);
        return;
      }

      if (event.target.closest("[data-mini-video-close]")) {
        event.preventDefault();
        event.stopPropagation();
        closeMiniVideo();
        return;
      }

      if (event.target.closest("[data-video-close]")) {
        event.preventDefault();
        event.stopPropagation();
        closeVideo();
        return;
      }

      const optionButton = event.target.closest("[data-option-group] button");
      if (optionButton) {
        event.preventDefault();
        event.stopPropagation();
        const group = optionButton.closest("[data-option-group]");
        group.querySelectorAll("button").forEach((button) => button.classList.remove("selected"));
        optionButton.classList.add("selected");
        refreshVariantPrice();
        return;
      }

      const productQty = event.target.closest("[data-product-qty]");
      if (productQty) {
        event.preventDefault();
        event.stopPropagation();
        const valueNode = document.querySelector("[data-product-qty-value]");
        const next = Math.max(1, Number(valueNode.textContent || 1) + Number(productQty.dataset.productQty));
        valueNode.textContent = String(next);
        return;
      }

      const addButton = event.target.closest("[data-tng-product-id]");
      if (addButton) {
        event.preventDefault();
        event.stopPropagation();
        const isBuyNow = addButton.classList.contains("buy-now") || addButton.closest(".buy-now");
        addToCart(addButton.dataset.tngProductId, isBuyNow ? {
          openCart: false,
          toast: false,
          redirectTo: "/gio-hang/"
        } : {});
        return;
      }

      const qtyButton = event.target.closest("[data-tng-qty]");
      if (qtyButton) {
        event.preventDefault();
        event.stopPropagation();
        updateQuantity(qtyButton.dataset.tngQty, Number(qtyButton.dataset.delta));
        return;
      }

      if (event.target.closest(".tng-bridge-close") || event.target.id === "tngBridgeCart") {
        closeCart();
        return;
      }

      if (event.target.closest("#tngBridgeCheckout")) {
        checkout();
        return;
      }

      if (event.target.closest("#checkoutPageSubmit")) {
        checkoutFromPage();
        return;
      }

      const cartLink = event.target.closest(".header-cart-link, .cart-item a, a[href*='gio-hang']");
      if (cartLink) {
        if (cartLink.matches("a[href*='gio-hang']")) return;
        event.preventDefault();
        event.stopPropagation();
        openCart();
        return;
      }

      const originalLink = event.target.closest("a[href^='https://taynguyensoul.vn']");
      if (originalLink) {
        const url = new URL(originalLink.href);
        if (url.hostname === "taynguyensoul.vn") {
          event.preventDefault();
          event.stopPropagation();
          window.location.href = `${url.pathname}${url.search}${url.hash}`;
        }
      }
    }, true);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeCart();
        closeVideo();
      }
    });
  }

  function init() {
    attachStylesheet();
    collectProducts();
    buildCart();
    addButtons();
    updateHeaderCount();
    refreshVariantPrice();
    hydrateAddressSelects();
    renderCheckoutPage();
    normalizeVisibleText();
    rewriteOriginLinks();
    wireEvents();
    scheduleProductVideoAutoplay();
    scheduleMiniVideoPopup();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
