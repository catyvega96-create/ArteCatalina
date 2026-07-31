// Catalina Vega Arte — interacciones de la tienda (carrito + WhatsApp)

const WHATSAPP_NUMBER = '525643637527'; // +52, Querétaro, sin espacios ni signos

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Menú móvil ---------- */
  const navToggle = document.getElementById('navToggle');
  navToggle?.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => document.body.classList.remove('nav-open'));
  });

  /* ---------- Tabs de catálogo ---------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab)?.classList.add('active');
    });
  });

  /* ---------- Toast helper ---------- */
  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  /* ---------- Carrito ---------- */
  const CART_KEY = 'catalinaVegaCart';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { cart = []; }

  const cartToggle = document.getElementById('cartToggle');
  const cartFab = document.getElementById('cartFab');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartCountEl = document.getElementById('cartCount');
  const cartCountFabEl = document.getElementById('cartCountFab');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCheckoutBtn = document.getElementById('cartCheckout');
  const isDesktop = () => window.matchMedia('(min-width: 761px)').matches;

  const money = n => '$' + n.toLocaleString('es-MX', { maximumFractionDigits: 0 });

  function saveCart() { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

  function cartCount() { return cart.reduce((sum, i) => sum + i.qty, 0); }
  function cartTotal() { return cart.reduce((sum, i) => sum + i.qty * i.price, 0); }

  function renderCart() {
    const count = cartCount();
    [cartCountEl, cartCountFabEl].forEach(el => {
      if (!el) return;
      el.textContent = count;
      el.dataset.empty = count === 0 ? 'true' : 'false';
    });
    cartTotalEl.innerHTML = money(cartTotal()) + ' <small>MXN</small>';
    cartCheckoutBtn.disabled = cart.length === 0;

    cartItemsEl.innerHTML = '';
    if (cart.length === 0) {
      cartEmptyEl && (cartEmptyEl.style.display = '');
      const p = document.createElement('p');
      p.className = 'cart-empty';
      p.textContent = 'Tu carrito está vacío. Agrega stickers o cuadros del catálogo.';
      cartItemsEl.appendChild(p);
      return;
    }

    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-subtotal">${money(item.qty * item.price)}</div>
        <div class="cart-item-price">${money(item.price)} c/u</div>
        <div class="cart-item-qty">
          <button class="qty-btn" data-action="dec" data-id="${item.id}" aria-label="Quitar uno">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="inc" data-id="${item.id}" aria-label="Agregar uno">+</button>
          <button class="cart-item-remove" data-action="remove" data-id="${item.id}">Quitar</button>
        </div>`;
      cartItemsEl.appendChild(row);
    });
  }

  function addToCart(id, name, price) {
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, name, price, qty: 1 });
    saveCart();
    renderCart();
    // En escritorio el ribbon se muestra solo al agregar algo (persiste hasta vaciarse)
    if (isDesktop()) openCart();
  }

  function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    if (cart.length === 0) closeCart();
  }

  function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
    if (cart.length === 0) closeCart();
  }

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('show');
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('show');
  }

  cartToggle?.addEventListener('click', openCart);
  cartFab?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  cartItemsEl?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === 'inc') changeQty(id, 1);
    if (btn.dataset.action === 'dec') changeQty(id, -1);
    if (btn.dataset.action === 'remove') removeItem(id);
  });

  document.querySelectorAll('.js-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const id = card?.dataset.id;
      const name = card?.dataset.name || card?.querySelector('h3')?.textContent || 'Producto';
      const price = parseFloat(card?.dataset.price || '0');
      if (!id) return;
      addToCart(id, name, price);
      showToast(`✓ "${name}" agregado al carrito`);
    });
  });

  cartCheckoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) return;
    const lines = cart.map(i => `• ${i.name} x${i.qty} — ${money(i.price)} c/u — ${money(i.qty * i.price)}`);
    const message =
      `¡Hola Catalina! Quiero hacer este pedido 🛍️\n\n` +
      lines.join('\n') +
      `\n\nTotal: ${money(cartTotal())} MXN\n\n` +
      `Quedo al pendiente para confirmar disponibilidad, pago y envío. ¡Gracias!`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  });

  renderCart();
  if (isDesktop() && cart.length > 0) openCart();

  /* ---------- Formulario de encargos → WhatsApp ---------- */
  document.getElementById('encargoForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre')?.value.trim();
    const correo = document.getElementById('correo')?.value.trim();
    const tipo = document.getElementById('tipo')?.value;
    const tamano = document.getElementById('tamano')?.value;
    const referencia = document.getElementById('referencia')?.value.trim();
    const mensaje = document.getElementById('mensaje')?.value.trim();

    const message =
      `¡Hola Catalina! Quiero hacer un encargo 🎨\n\n` +
      `Nombre: ${nombre}\n` +
      `Correo: ${correo}\n` +
      `Tipo de encargo: ${tipo}\n` +
      `Tamaño aproximado: ${tamano}\n` +
      `Referencia: ${referencia || 'No especificada'}\n` +
      `Detalles: ${mensaje || 'Sin detalles adicionales'}`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    showToast('✓ Abriendo WhatsApp con tu solicitud…');
    e.target.reset();
  });

  /* ---------- Lightbox de galería ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-overlay span')?.textContent || '';
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = caption;
      lightbox.classList.add('active');
    });
  });

  function closeLightbox() { lightbox?.classList.remove('active'); }
  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Header: sombra al hacer scroll ---------- */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 10 ? '0 2px 18px rgba(20,72,140,0.08)' : 'none';
  });
});
