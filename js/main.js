// Catalina Vega Arte — interacciones de mockup (sin backend)

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

  /* ---------- Agregar al carrito (mockup) ---------- */
  document.querySelectorAll('.js-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.closest('.product-card')?.querySelector('h3')?.textContent || 'Producto';
      showToast(`✓ "${title}" agregado al carrito (mockup)`);
    });
  });

  /* ---------- Formulario de encargos (mockup) ---------- */
  document.getElementById('encargoForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✓ Solicitud enviada (mockup) — sin envío real de datos');
    e.target.reset();
  });

  /* ---------- Newsletter (mockup) ---------- */
  document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('✓ Suscripción registrada (mockup)');
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
