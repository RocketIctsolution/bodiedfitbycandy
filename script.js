document.getElementById('year').textContent = new Date().getFullYear();

/* -------------------------------------------------------------- */
/* Data                                                             */
/* -------------------------------------------------------------- */
const PRODUCTS = [
  { id: 'p1', name: 'Obsidian Sculpt Leggings', category: 'Leggings', price: 68, rating: 5, tone: 0 },
  { id: 'p2', name: 'Candy Curve Sports Bra', category: 'Tops', price: 42, rating: 5, tone: 1 },
  { id: 'p3', name: 'Gold-Line Track Set', category: 'Leggings', price: 96, rating: 4, tone: 2 },
  { id: 'p4', name: 'Bare Waist Crop Top', category: 'Tops', price: 38, rating: 5, tone: 0 },
  { id: 'p5', name: 'Cocoa Seamless Set', category: 'Leggings', price: 88, rating: 5, tone: 1 },
  { id: 'p6', name: 'Mist Zip Performance Jacket', category: 'Accessories', price: 74, rating: 4, tone: 2 },
];

let activeTab = 'All';
let cart = [];        // { id, name, price, tone, qty }
let wishlist = new Set();

/* -------------------------------------------------------------- */
/* Rendering                                                        */
/* -------------------------------------------------------------- */
function toneClass(tone) {
  return tone === 1 ? 'tone-1' : tone === 2 ? 'tone-2' : '';
}

function starsHtml(rating) {
  let html = '';
  for (let i = 0; i < 5; i++) {
    const filled = i < rating;
    html += `<i data-lucide="star" class="w-3 h-3" style="color:${filled ? '#FFD700' : '#3a3a3a'}; ${filled ? 'fill:#FFD700;' : ''}"></i>`;
  }
  return html;
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const list = activeTab === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeTab);
  grid.innerHTML = list.map(p => `
    <div class="product-card group" data-id="${p.id}">
      <div class="relative">
        <div class="plate ${toneClass(p.tone)} aspect-[3/4] rounded-xl border border-[#D4AF37]/15 overflow-hidden"></div>
        <button class="wishlist-btn absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:bg-black/70 transition-colors" data-id="${p.id}" aria-label="Add to wishlist">
          <i data-lucide="heart" class="w-4 h-4 wishlist-icon" style="color:${wishlist.has(p.id) ? '#FFD700' : '#fff'}; ${wishlist.has(p.id) ? 'fill:#FFD700;' : ''}"></i>
        </button>
        <button class="quick-add absolute bottom-3 left-3 right-3 py-2 rounded-full text-xs font-semibold gold-bg text-black" data-id="${p.id}">Quick Add</button>
      </div>
      <div class="mt-3">
        <p class="text-sm md:text-base font-medium">${p.name}</p>
        <div class="flex items-center gap-1 my-1">${starsHtml(p.rating)}</div>
        <div class="flex items-center justify-between">
          <p class="text-[#FFD700] font-semibold text-sm md:text-base">$${p.price}</p>
          <button class="add-btn-mobile sm:hidden text-[10px] md:text-xs text-[#9CA3AF] hover:text-[#FFD700] border border-[#9CA3AF]/30 hover:border-[#FFD700]/60 rounded-full px-3 py-1 transition-colors" data-id="${p.id}">Add</button>
        </div>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
  attachProductEvents();
}

function attachProductEvents() {
  document.querySelectorAll('.quick-add, .add-btn-mobile').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.id));
  });
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleWishlist(btn.dataset.id));
  });
}

function renderCart() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = `<p class="text-[#9CA3AF] text-sm text-center mt-10">Your bag is empty.</p>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="flex gap-3">
        <div class="plate ${toneClass(item.tone)} w-16 h-20 rounded-lg flex-shrink-0"></div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate">${item.name}</p>
          <p class="text-[#FFD700] text-sm mb-2">$${item.price}</p>
          <div class="flex items-center gap-3">
            <button class="qty-btn w-6 h-6 rounded-full border border-[#9CA3AF]/40 flex items-center justify-center hover:border-[#FFD700]" data-id="${item.id}" data-delta="-1">
              <i data-lucide="minus" class="w-3 h-3"></i>
            </button>
            <span class="text-sm w-4 text-center">${item.qty}</span>
            <button class="qty-btn w-6 h-6 rounded-full border border-[#9CA3AF]/40 flex items-center justify-center hover:border-[#FFD700]" data-id="${item.id}" data-delta="1">
              <i data-lucide="plus" class="w-3 h-3"></i>
            </button>
            <button class="remove-btn ml-auto text-[#9CA3AF] hover:text-red-400" data-id="${item.id}" aria-label="Remove item">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  lucide.createIcons();

  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, parseInt(btn.dataset.delta, 10)));
  });
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeItem(btn.dataset.id));
  });

  const subtotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cartBadge');
  if (cartCount > 0) {
    badge.classList.remove('hidden');
    badge.textContent = cartCount;
  } else {
    badge.classList.add('hidden');
  }

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (cart.length === 0) {
    checkoutBtn.disabled = true;
    checkoutBtn.className = 'w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-opacity bg-[#2a2a2a] text-[#6b6b6b] cursor-not-allowed';
  } else {
    checkoutBtn.disabled = false;
    checkoutBtn.className = 'w-full py-3.5 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-opacity gold-bg text-black hover:opacity-90';
  }
}

function renderWishlistBadge() {
  const badge = document.getElementById('wishlistBadge');
  if (wishlist.size > 0) {
    badge.classList.remove('hidden');
    badge.textContent = wishlist.size;
  } else {
    badge.classList.add('hidden');
  }
}

/* -------------------------------------------------------------- */
/* Actions                                                          */
/* -------------------------------------------------------------- */
function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
  showToast(`${product.name} added to bag`);
}

function changeQty(id, delta) {
  cart = cart
    .map(i => (i.id === id ? { ...i, qty: i.qty + delta } : i))
    .filter(i => i.qty > 0);
  renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

function toggleWishlist(id) {
  wishlist.has(id) ? wishlist.delete(id) : wishlist.add(id);
  renderWishlistBadge();
  renderProducts();
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 1800);
}

/* -------------------------------------------------------------- */
/* Wiring                                                           */
/* -------------------------------------------------------------- */
document.getElementById('menuToggle').addEventListener('click', () => {
  const menu = document.getElementById('mobileMenu');
  const isHidden = menu.classList.contains('hidden');
  menu.classList.toggle('hidden');
  menu.classList.toggle('flex');
  document.getElementById('menuToggle').innerHTML = isHidden
    ? '<i data-lucide="x" class="w-6 h-6"></i>'
    : '<i data-lucide="menu" class="w-6 h-6"></i>';
  lucide.createIcons();
});

document.querySelectorAll('#mobileMenu a').forEach(a => {
  a.addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.add('hidden');
    document.getElementById('mobileMenu').classList.remove('flex');
    document.getElementById('menuToggle').innerHTML = '<i data-lucide="menu" class="w-6 h-6"></i>';
    lucide.createIcons();
  });
});

document.getElementById('cartToggle').addEventListener('click', () => {
  document.getElementById('cartOverlay').classList.remove('hidden');
  requestAnimationFrame(() => document.getElementById('cartDrawer').classList.add('open'));
});

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('open');
  setTimeout(() => document.getElementById('cartOverlay').classList.add('hidden'), 250);
}
document.getElementById('closeCart').addEventListener('click', closeCartDrawer);
document.getElementById('cartBackdrop').addEventListener('click', closeCartDrawer);

document.getElementById('tabBar').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab-btn');
  if (!btn) return;
  activeTab = btn.dataset.tab;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.classList.add('border-[#9CA3AF]/30', 'text-[#9CA3AF]');
  });
  btn.classList.add('active');
  btn.classList.remove('border-[#9CA3AF]/30', 'text-[#9CA3AF]');
  renderProducts();
});

document.getElementById('newsletterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  showToast("You're on the VIP list — check your inbox!");
  e.target.reset();
});

document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (cart.length === 0) return;
  showToast('Checkout coming soon!');
});

/* -------------------------------------------------------------- */
/* Init                                                             */
/* -------------------------------------------------------------- */
renderProducts();
renderCart();
lucide.createIcons();
