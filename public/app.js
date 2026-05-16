const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const state = {
  products: [],
  categories: [],
  selectedCategory: "all",
  cart: JSON.parse(localStorage.getItem("soul-cart") || "[]")
};

const productGrid = document.querySelector("#productGrid");
const categoryTabs = document.querySelector("#categoryTabs");
const quickCategories = document.querySelector("#quickCategories");
const searchInput = document.querySelector("#searchInput");
const cartDrawer = document.querySelector("#cartDrawer");
const cartItems = document.querySelector("#cartItems");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const orderStatus = document.querySelector("#orderStatus");
const checkoutForm = document.querySelector("#checkoutForm");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function saveCart() {
  localStorage.setItem("soul-cart", JSON.stringify(state.cart));
}

function formatCategory(category) {
  return category === "all" ? "Tất cả" : category;
}

async function fetchProducts() {
  const params = new URLSearchParams();
  params.set("category", state.selectedCategory);
  if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
  const response = await fetch(`/api/products?${params}`);
  const data = await response.json();
  state.products = data.products;
  state.categories = data.categories;
  renderCategories();
  renderProducts();
}

async function fetchContent() {
  const response = await fetch("/api/content");
  const data = await response.json();
  document.querySelector("#reviewGrid").innerHTML = data.reviews.map((review) => `
    <article class="review-card">
      <div class="stars">★★★★★</div>
      <strong>${escapeHtml(review.name)}</strong>
      <p>${escapeHtml(review.text)}</p>
      <span class="meta">${escapeHtml(review.product)} • ${escapeHtml(review.date)}</span>
    </article>
  `).join("");
  document.querySelector("#postList").innerHTML = data.posts.map((post, index) => `
    <article class="post-card">
      <span class="meta">${String(index + 1).padStart(2, "0")} / Kiến thức cà phê</span>
      <h3>${escapeHtml(post)}</h3>
      <a href="#blog">Đọc thêm</a>
    </article>
  `).join("");
}

function renderCategories() {
  const tabs = state.categories.map((category) => `
    <button class="tab ${category === state.selectedCategory ? "active" : ""}" type="button" data-category="${category}">
      ${escapeHtml(formatCategory(category))}
    </button>
  `).join("");
  categoryTabs.innerHTML = tabs;

  const popular = [
    { label: "Black Friday Sales", query: "" },
    { label: "Smooth Premium", query: "Signature" },
    { label: "High caffeine Premium", query: "", category: "High caffeine Premium" },
    { label: "Cà phê cold brew", query: "", category: "Cà phê cold brew" },
    { label: "Máy pha cà phê cầm tay", query: "", category: "Máy pha cà phê cầm tay" },
    { label: "Combo - Giftset", query: "combo" },
    { label: "Dụng cụ pha cà phê", query: "", category: "Dụng cụ pha cà phê" }
  ];
  quickCategories.innerHTML = popular.map((item) => `
    <button class="chip" type="button" data-chip-category="${escapeHtml(item.category || "all")}" data-chip-query="${escapeHtml(item.query)}">
      ${escapeHtml(item.label)}
    </button>
  `).join("");
}

function renderProducts() {
  if (!state.products.length) {
    productGrid.innerHTML = "<p>Không tìm thấy sản phẩm phù hợp.</p>";
    return;
  }

  productGrid.innerHTML = state.products.map((product) => `
    <article class="product-card">
      <span class="badge">${escapeHtml(product.badge)}</span>
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="eager">
      <div class="product-body">
        <span class="meta">${escapeHtml(product.sold)} • ${escapeHtml(product.origin)}</span>
        <div class="rating">★ ${product.rating.toFixed(2)} trên 5 dựa trên ${product.reviews} đánh giá</div>
        <span class="meta">${escapeHtml(product.category)}</span>
        <h3>${escapeHtml(product.name)}</h3>
        <span class="old-price">${escapeHtml(product.oldPrice)}</span>
        <span class="price">${escapeHtml(product.price)}</span>
        <span class="stock">Chỉ còn lại ${product.stock} deals, hãy nhanh tay!</span>
        <button type="button" data-add="${escapeHtml(product.id)}">Thêm vào giỏ hàng</button>
      </div>
    </article>
  `).join("");
}

function getProduct(id) {
  return state.products.find((product) => product.id === id) || null;
}

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;
  const current = state.cart.find((item) => item.id === id);
  if (current) {
    current.quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.numericPrice,
      image: product.image,
      quantity: 1
    });
  }
  saveCart();
  renderCart();
  openCart();
}

function updateQuantity(id, delta) {
  const item = state.cart.find((entry) => entry.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== id);
  }
  saveCart();
  renderCart();
}

function renderCart() {
  const totalQuantity = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
  cartCount.textContent = totalQuantity;
  cartTotal.textContent = currency.format(total);

  if (!state.cart.length) {
    cartItems.innerHTML = "<p>Chưa có sản phẩm trong giỏ hàng.</p>";
    return;
  }

  cartItems.innerHTML = state.cart.map((item) => `
    <div class="cart-item">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <div class="meta">${currency.format(item.price)}</div>
      </div>
      <div class="qty">
        <button type="button" data-qty="${escapeHtml(item.id)}" data-delta="-1">-</button>
        <span>${item.quantity}</span>
        <button type="button" data-qty="${escapeHtml(item.id)}" data-delta="1">+</button>
      </div>
    </div>
  `).join("");
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

async function checkout() {
  orderStatus.textContent = "";
  if (!state.cart.length) {
    orderStatus.textContent = "Giỏ hàng đang trống.";
    return;
  }

  if (!checkoutForm.reportValidity()) return;
  const formData = new FormData(checkoutForm);

  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        name: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        note: formData.get("note"),
        source: "website-clone"
      },
      items: state.cart.map(({ id, quantity }) => ({ id, quantity }))
    })
  });
  const order = await response.json();
  if (!response.ok) {
    orderStatus.textContent = order.message || "Không gửi được đơn.";
    return;
  }
  state.cart = [];
  saveCart();
  renderCart();
  checkoutForm.reset();
  orderStatus.textContent = `Đã tạo đơn demo ${order.id} - tổng ${currency.format(order.total)}.`;
}

categoryTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  state.selectedCategory = button.dataset.category;
  fetchProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-qty]");
  if (!button) return;
  updateQuantity(button.dataset.qty, Number(button.dataset.delta));
});

quickCategories.addEventListener("click", (event) => {
  const button = event.target.closest(".chip");
  if (!button) return;
  searchInput.value = button.dataset.chipQuery || "";
  state.selectedCategory = button.dataset.chipCategory || "all";
  fetchProducts();
  document.querySelector("#coffee").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", () => {
  window.clearTimeout(searchInput.searchTimer);
  searchInput.searchTimer = window.setTimeout(fetchProducts, 180);
});

document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
document.querySelector("#checkoutButton").addEventListener("click", checkout);
cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) closeCart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

document.querySelector("#leadForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customer: {
        name: formData.get("name"),
        phone: formData.get("phone"),
        source: "soulsub"
      }
    })
  });
  checkoutForm.elements.name.value = formData.get("name");
  checkoutForm.elements.phone.value = formData.get("phone");
  openCart();
  orderStatus.textContent = "Thông tin khách đã được ghi nhận. Hãy thêm sản phẩm và gửi đơn.";
});

fetchProducts();
fetchContent();
renderCart();
