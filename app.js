import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ==================== DATA ==================== */
const PRODUCTS = [
  { id: '1', name: 'Almond Stick', price: 1, description: 'Crunchy sticks loaded with premium roasted almonds.', category: 'Sticks', color: '#D2B48C', modelType: 'stick' },
  { id: '2', name: 'Raisins & Oats', price: 1, description: 'Healthy oats blended with sweet sun-dried raisins.', category: 'Cookies', color: '#8B4513', modelType: 'cookie' },
  { id: '3', name: 'Walnut Cookies', price: 180, description: 'Rich buttery cookies with a generous walnut crunch.', category: 'Cookies', color: '#A0522D', modelType: 'cookie' },
  { id: '4', name: 'Muesli Cookies', price: 160, description: 'A power-packed blend of grains, seeds, and dried fruits.', category: 'Cookies', color: '#DEB887', modelType: 'cookie' },
  { id: '5', name: 'Choco chips Cookies', price: 140, description: 'Classic cookies loaded with melt-in-your-mouth chocolate chips.', category: 'Cookies', color: '#3D2B1F', modelType: 'cookie' },
  { id: '6', name: 'Shrewsbury cookies', price: 200, description: 'The legendary buttery delight from the heart of Pune.', category: 'Cookies', color: '#F5DEB3', modelType: 'cookie' },
];

/* ==================== CART ==================== */
const Cart = {
  items: JSON.parse(localStorage.getItem('bakery-cart') || '[]'),
  _save() {
    localStorage.setItem('bakery-cart', JSON.stringify(this.items));
    updateCartBadge();
  },
  addItem(product, qty = 1) {
    const ex = this.items.find(i => i.id === product.id);
    if (ex) ex.quantity += qty;
    else this.items.push({ ...product, quantity: qty });
    this._save();
  },
  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this._save();
  },
  updateQuantity(id, qty) {
    const item = this.items.find(i => i.id === id);
    if (item) { item.quantity = Math.max(1, qty); this._save(); }
  },
  clearCart() { this.items = []; this._save(); },
  getTotal() { return this.items.reduce((s, i) => s + i.price * i.quantity, 0); },
  getCount() { return this.items.reduce((s, i) => s + i.quantity, 0); },
};

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  const count = Cart.getCount();
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ==================== TOAST ==================== */
function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  document.getElementById('toast-container').appendChild(el);
  const remove = () => {
    el.classList.add('toast-exit');
    setTimeout(() => el.remove(), 300);
  };
  setTimeout(remove, 3500);
}

/* ==================== THREE.JS SCENE MANAGEMENT ==================== */
const _disposeList = [];

function trackDispose(fn) { _disposeList.push(fn); }

function disposeAllScenes() {
  _disposeList.forEach(fn => { try { fn(); } catch (e) { } });
  _disposeList.length = 0;
}

function setupLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffd4a0, 1.8);
  sun.position.set(10, 10, 10);
  sun.castShadow = true;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xff8c42, 0.6);
  fill.position.set(-8, 8, -4);
  scene.add(fill);
}

function makeCookie(color = '#8B4513', name = '') {
  const g = new THREE.Group();
  const n = name.toLowerCase();
  const isChoco = n.includes('choco');
  const isWalnut = n.includes('walnut');
  const isMuesli = n.includes('muesli');
  const isShrewsbury = n.includes('shrewsbury');

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1, 1, 0.22, 32),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 0.9, metalness: 0.05 })
  );
  body.castShadow = true; body.receiveShadow = true;
  g.add(body);

  const count = isShrewsbury ? 0 : isMuesli ? 15 : 8;
  const tc = isChoco ? '#1a0f0a' : isWalnut ? '#704214' : '#d2b48c';
  const tmat = new THREE.MeshStandardMaterial({ color: tc, roughness: 0.6 });

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r = 0.3 + Math.random() * 0.4;
    const tgeo = isWalnut
      ? new THREE.BoxGeometry(0.2, 0.1, 0.15)
      : new THREE.SphereGeometry(isMuesli ? 0.05 : 0.1, 8, 8);
    const t = new THREE.Mesh(tgeo, tmat);
    t.position.set(Math.cos(angle) * r, 0.12, Math.sin(angle) * r);
    t.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    g.add(t);
  }
  return g;
}

function makeStick(color = '#D2B48C') {
  const g = new THREE.Group();
  g.rotation.x = Math.PI / 4;
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 2.5, 16),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: 1, metalness: 0 })
  );
  body.castShadow = true;
  g.add(body);
  const crumbMat = new THREE.MeshStandardMaterial({ color: '#F5DEB3' });
  for (let i = 0; i < 12; i++) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.05), crumbMat);
    c.position.set((Math.random() - .5) * .2, (Math.random() - .5) * 2, (Math.random() - .5) * .2);
    c.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    g.add(c);
  }
  return g;
}

function makeStars(scene, count = 2500) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - .5) * 200;
    pos[i * 3 + 1] = (Math.random() - .5) * 200;
    pos[i * 3 + 2] = -(Math.random() * 120 + 40);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.7 }));
  scene.add(pts);
  return pts;
}

function makeSparkles(scene, count = 60) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - .5) * 22;
    pos[i * 3 + 1] = (Math.random() - .5) * 18;
    pos[i * 3 + 2] = (Math.random() - .5) * 10 - 5;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xF5DEB3, size: 0.15, transparent: true, opacity: 0.9 }));
  scene.add(pts);
}

/* ==================== SCENE: HERO ==================== */
function initHeroScene(canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 300);
  camera.position.set(0, 0, 8);

  setupLights(scene);
  makeStars(scene, 5000);
  makeSparkles(scene);

  const floaters = [];
  const cookieColors = ['#8B4513', '#DEB887', '#D2691E'];
  for (let i = 0; i < 3; i++) {
    const m = makeCookie(cookieColors[i]);
    m.position.set((Math.random() - .5) * 9, (Math.random() - .5) * 7, (Math.random() - .5) * 4 - 2);
    m.scale.setScalar(0.7 + Math.random() * 0.8);
    scene.add(m);
    floaters.push({ m, spd: 0.4 + Math.random() * 0.5, off: Math.random() * Math.PI * 2 });
  }
  for (let i = 0; i < 2; i++) {
    const m = makeStick('#D2B48C');
    m.position.set((Math.random() - .5) * 9, (Math.random() - .5) * 7, (Math.random() - .5) * 4);
    m.scale.setScalar(0.7 + Math.random() * 0.4);
    scene.add(m);
    floaters.push({ m, spd: 0.3 + Math.random() * 0.4, off: Math.random() * Math.PI * 2 });
  }
  for (let i = 0; i < 15; i++) {
    const chip = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshStandardMaterial({ color: '#1a0f0a' }));
    chip.position.set((Math.random() - .5) * 14, (Math.random() - .5) * 12, (Math.random() - .5) * 8);
    scene.add(chip);
    floaters.push({ m: chip, spd: 1 + Math.random(), off: Math.random() * Math.PI * 2, tiny: true });
  }

  const clock = new THREE.Clock();
  let raf;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    floaters.forEach(({ m, spd, off, tiny }) => {
      m.rotation.y += 0.005 * spd;
      if (!tiny) { m.rotation.x += 0.002 * spd; m.position.y += Math.sin(t * spd + off) * 0.003; }
    });
    renderer.render(scene, camera);
  };
  tick();

  const onResize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  const dispose = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); renderer.dispose(); };
  trackDispose(dispose);
  return dispose;
}

/* ==================== SCENE: PRODUCT CARD ==================== */
function initProductScene(canvas, product) {
  const w = canvas.clientWidth || 300;
  const h = canvas.clientHeight || 260;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0, 4);

  setupLights(scene);

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.ShadowMaterial({ opacity: 0.25 })
  );
  plane.rotation.x = -Math.PI / 2; plane.position.y = -1.8; plane.receiveShadow = true;
  scene.add(plane);

  const model = product.modelType === 'cookie'
    ? makeCookie(product.color, product.name)
    : makeStick(product.color);
  model.rotation.x = 0.2;
  model.scale.setScalar(product.modelType === 'cookie' ? 1.2 : 0.8);
  scene.add(model);

  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false; controls.enablePan = false;
  controls.autoRotate = true; controls.autoRotateSpeed = 1.5;
  controls.enableDamping = true; controls.dampingFactor = 0.06;

  let hovered = false;
  canvas.addEventListener('mouseenter', () => { hovered = true; controls.autoRotate = false; });
  canvas.addEventListener('mouseleave', () => { hovered = false; controls.autoRotate = true; });

  const clock = new THREE.Clock();
  let raf;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    if (!hovered) {
      const s = 1 + Math.sin(t * 2) * 0.018;
      model.scale.setScalar(s * (product.modelType === 'cookie' ? 1.2 : 0.8));
    }
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  const dispose = () => { cancelAnimationFrame(raf); controls.dispose(); renderer.dispose(); };
  trackDispose(dispose);
}

/* ==================== SCENE: FOOTER ==================== */
function initFooterScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(96, 96);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 3);
  setupLights(scene);

  const cookie = makeCookie('#8B4513');
  cookie.scale.setScalar(0.8);
  scene.add(cookie);

  const clock = new THREE.Clock();
  let raf;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    cookie.rotation.y += 0.012;
    cookie.position.y = Math.sin(t * 2) * 0.08;
    renderer.render(scene, camera);
  };
  tick();
  return () => { cancelAnimationFrame(raf); renderer.dispose(); };
}

/* ==================== SCENE: ABOUT ==================== */
function initAboutScene(canvas) {
  const w = canvas.clientWidth || 400, h = canvas.clientHeight || 400;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0, 5);
  setupLights(scene);

  const items = [];
  const c1 = makeCookie('#8B4513'); c1.position.set(0, .5, 0); c1.scale.setScalar(1.2); scene.add(c1);
  items.push({ m: c1, spd: 2, off: 0 });
  const st = makeStick('#D2B48C'); st.position.set(1, -1, .5); st.scale.setScalar(.8); scene.add(st);
  items.push({ m: st, spd: 1.5, off: 1 });
  const c2 = makeCookie('#DEB887'); c2.position.set(-1.2, -.5, -.5); c2.scale.setScalar(.7); scene.add(c2);
  items.push({ m: c2, spd: 2.5, off: 2 });

  const controls = new OrbitControls(camera, canvas);
  controls.enableZoom = false; controls.enableDamping = true; controls.dampingFactor = 0.05;

  const clock = new THREE.Clock();
  let raf;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    items.forEach(({ m, spd, off }) => {
      m.rotation.y += 0.01 * spd;
      m.position.y += Math.sin(t * spd + off) * 0.003;
    });
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  const dispose = () => { cancelAnimationFrame(raf); controls.dispose(); renderer.dispose(); };
  trackDispose(dispose);
}

/* ==================== SCENE: SUCCESS ==================== */
function initSuccessScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(280, 160);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 280 / 160, 0.1, 100);
  camera.position.set(0, 0, 5);
  setupLights(scene);

  const c = makeCookie('#8B4513'); c.position.set(-1.5, 0, 0); c.scale.setScalar(1.1); scene.add(c);
  const s = makeStick('#D2B48C'); s.position.set(1.5, 0, 0); scene.add(s);

  const clock = new THREE.Clock();
  let raf;
  const tick = () => {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    c.rotation.y += 0.02; s.rotation.y += 0.03;
    c.position.y = Math.sin(t * 4) * 0.12;
    s.position.y = Math.sin(t * 3 + 1) * 0.12;
    renderer.render(scene, camera);
  };
  tick();

  const dispose = () => { cancelAnimationFrame(raf); renderer.dispose(); };
  trackDispose(dispose);
}

/* ==================== CONFETTI ==================== */
function launchConfetti() {
  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998';
  cv.width = innerWidth; cv.height = innerHeight;
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const colors = ['#f59e0b', '#d97706', '#fde68a', '#ff6b6b', '#4ecdc4', '#a78bfa', '#34d399'];
  const particles = Array.from({ length: 160 }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * -300 - 20,
    vx: (Math.random() - .5) * 4,
    vy: Math.random() * 5 + 2,
    r: Math.random() * 8 + 4,
    rot: Math.random() * 360,
    rotSpd: (Math.random() - .5) * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  const end = Date.now() + 5000;
  const draw = () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.rot += p.rotSpd;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      ctx.restore();
    });
    if (Date.now() < end) requestAnimationFrame(draw);
    else cv.remove();
  };
  requestAnimationFrame(draw);
}

/* ==================== PRODUCT CARD HTML ==================== */
function productCardHTML(p) {
  return `
  <div class="product-card fade-in-up" data-id="${p.id}">
    <div class="product-canvas-wrapper">
      <div class="orbit-hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10"/><polyline points="12,2 12,8 16,8"/>
        </svg>
      </div>
      <canvas class="product-canvas" id="cv-${p.id}"></canvas>
    </div>
    <div class="product-info">
      <div>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
      </div>
      <div class="product-footer">
        <span class="product-price">₹${p.price}</span>
        <div class="quantity-control">
          <button class="qty-btn" data-action="minus" data-pid="${p.id}">−</button>
          <span class="qty-value" id="qv-${p.id}">1</span>
          <button class="qty-btn" data-action="plus"  data-pid="${p.id}">+</button>
        </div>
      </div>
      <button class="btn-add-cart" data-add="${p.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Add to Cart
      </button>
    </div>
  </div>`;
}

function mountProductScenes(products) {
  const quantities = {};
  products.forEach(p => {
    quantities[p.id] = 1;
    const canvas = document.getElementById(`cv-${p.id}`);
    if (!canvas) return;
    const wrapper = canvas.parentElement;
    const w = wrapper.clientWidth || 300;
    canvas.width = w; canvas.height = 260;
    initProductScene(canvas, p);
  });

  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.pid;
      if (btn.dataset.action === 'plus') quantities[id] = (quantities[id] || 1) + 1;
      else quantities[id] = Math.max(1, (quantities[id] || 1) - 1);
      const el = document.getElementById(`qv-${id}`);
      if (el) el.textContent = quantities[id];
    });
  });

  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.add;
      const product = PRODUCTS.find(p => p.id === id);
      const qty = quantities[id] || 1;
      if (product) { Cart.addItem(product, qty); showToast(`Added ${qty}× ${product.name} to cart! 🍪`); }
    });
  });
}

/* ==================== PAGES ==================== */
function renderHome() {
  const featured = PRODUCTS.slice(0, 3);
  document.getElementById('app').innerHTML = `
    <section class="hero">
      <canvas id="hero-cv" class="hero-canvas"></canvas>
      <div class="hero-content">
        <div class="fade-in">
          <span class="badge">Artisanal &amp; Handcrafted</span>
          <h1 class="hero-title">The Art of<br><span class="gradient-text">Fine Baking</span></h1>
          <p class="hero-desc">Experience the luxury of premium cookies and sticks, crafted with the finest ingredients and a touch of magic.</p>
          <div class="hero-btns">
            <a href="#/products" class="btn-primary">Shop Collection <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
            <a href="#/about" class="btn-ghost">Our Story</a>
          </div>
        </div>
        <div class="scroll-indicator">
          <span>Scroll</span>
          <div class="scroll-line"></div>
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="container">
        <div class="features-grid">
          <div class="feature-item fade-in-up delay-1">
            <div class="feature-icon">⭐</div>
            <h3>Premium Quality</h3>
            <p>Only the finest organic ingredients sourced globally.</p>
          </div>
          <div class="feature-item fade-in-up delay-2">
            <div class="feature-icon">🛡️</div>
            <h3>Freshly Baked</h3>
            <p>Every order is baked fresh to ensure maximum flavor.</p>
          </div>
          <div class="feature-item fade-in-up delay-3">
            <div class="feature-icon">🚚</div>
            <h3>Express Delivery</h3>
            <p>Safe and fast delivery to your doorstep in 24 hours.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="featured-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title font-serif">Featured Delights</h2>
            <p class="section-subtitle">Our most loved artisanal creations.</p>
          </div>
          <a href="#/products" class="link-amber">View All <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
        <div class="products-grid">${featured.map(productCardHTML).join('')}</div>
      </div>
    </section>`;

  requestAnimationFrame(() => {
    const hcv = document.getElementById('hero-cv');
    if (hcv) { hcv.width = hcv.clientWidth; hcv.height = hcv.clientHeight; initHeroScene(hcv); }
    mountProductScenes(featured);
  });
}

function renderProducts(search = '', category = 'All') {
  const filtered = PRODUCTS.filter(p =>
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  document.getElementById('app').innerHTML = `
    <div class="page-products">
      <div class="container">
        <div class="page-header">
          <div>
            <h1 class="page-title font-serif">Our Collection</h1>
            <p class="section-subtitle">Explore our handcrafted artisanal treats.</p>
          </div>
          <div class="products-controls">
            <div class="search-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input id="ps-input" class="search-input" placeholder="Search products…" value="${search}">
            </div>
            <div class="cat-tabs">
              ${['All', 'Cookies', 'Sticks'].map(c => `<button class="cat-tab${category === c ? ' active' : ''}" data-cat="${c}">${c}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="products-grid" id="pgrid">
          ${filtered.length ? filtered.map(productCardHTML).join('') : '<p class="empty-msg">No products found matching your search.</p>'}
        </div>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    mountProductScenes(filtered);

    let st;
    document.getElementById('ps-input')?.addEventListener('input', e => {
      clearTimeout(st);
      st = setTimeout(() => {
        const cat = document.querySelector('.cat-tab.active')?.dataset.cat || 'All';
        disposeAllScenes();
        renderProducts(e.target.value, cat);
      }, 280);
    });

    document.querySelectorAll('.cat-tab').forEach(btn => btn.addEventListener('click', () => {
      const s = document.getElementById('ps-input')?.value || '';
      disposeAllScenes();
      renderProducts(s, btn.dataset.cat);
    }));
  });
}

function renderAbout() {
  document.getElementById('app').innerHTML = `
    <div class="page-about">
      <div class="container">
        <div class="about-hero fade-in">
          <h1 class="page-title font-serif">Our Story</h1>
          <p class="about-desc">From a small kitchen in Pune to a premium artisanal bakery, our journey has been fueled by a passion for perfection and the love for traditional baking.</p>
        </div>

        <div class="about-grid">
          <div class="about-text fade-in-left">
            <h2 class="section-title font-serif">The Artisanal Touch</h2>
            <p>We believe that baking is an art form. Every cookie and stick we create is handcrafted with precision, using recipes passed down through generations, enhanced with modern culinary techniques.</p>
            <p>Our ingredients are sourced from the finest producers around the world — from premium Belgian chocolate to hand-picked California walnuts. No preservatives, no artificial flavors — just pure, honest goodness.</p>
            <div class="about-stats">
              <div class="stat"><span class="stat-num">15+</span><span class="stat-label">Years of Craft</span></div>
              <div class="stat"><span class="stat-num">50k+</span><span class="stat-label">Happy Customers</span></div>
            </div>
          </div>

          <div class="about-scene-wrap fade-in-right">
            <div class="about-canvas-container">
              <canvas id="about-cv" class="about-canvas"></canvas>
            </div>
            <div class="about-badge about-badge-heart">❤️</div>
            <div class="about-badge about-badge-users">👥</div>
          </div>
        </div>

        <div class="values-grid">
          <div class="value-card fade-in-up delay-1">
            <div class="value-icon">☕</div>
            <h3>Perfect Pairing</h3>
            <p>Our treats are designed to be the perfect companion to your morning coffee or evening tea.</p>
          </div>
          <div class="value-card fade-in-up delay-2">
            <div class="value-icon">🍪</div>
            <h3>Traditional Roots</h3>
            <p>We stay true to the authentic flavors that made us famous, while innovating for the modern palate.</p>
          </div>
          <div class="value-card fade-in-up delay-3">
            <div class="value-icon">❤️</div>
            <h3>Baked with Love</h3>
            <p>Every batch is made with the same care and attention as if it were for our own family.</p>
          </div>
        </div>
      </div>
    </div>`;

  requestAnimationFrame(() => {
    const cv = document.getElementById('about-cv');
    if (cv) { cv.width = cv.clientWidth || 400; cv.height = cv.clientHeight || 400; initAboutScene(cv); }
  });
}

function renderCart() {
  const app = document.getElementById('app');
  if (Cart.items.length === 0) {
    app.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛍️</div>
        <h1>Your cart is empty</h1>
        <p>Looks like you haven't added any of our artisanal treats yet. Explore our collection!</p>
        <a href="#/products" class="btn-primary">Browse Products</a>
      </div>`;
    return;
  }

  const total = Cart.getTotal();
  app.innerHTML = `
    <div class="page-cart">
      <div class="container">
        <h1 class="page-title font-serif">Shopping Cart</h1>
        <div class="cart-grid">
          <div class="cart-items">
            ${Cart.items.map(item => `
              <div class="cart-item fade-in-up" id="ci-${item.id}">
                <div class="cart-item-emoji">🍪</div>
                <div class="cart-item-info">
                  <h3>${item.name}</h3>
                  <p>${item.category}</p>
                  <span class="item-price">₹${item.price}</span>
                </div>
                <div class="cart-item-controls">
                  <div class="quantity-control">
                    <button class="qty-btn" onclick="_cartQty('${item.id}',${item.quantity - 1})">−</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="_cartQty('${item.id}',${item.quantity + 1})">+</button>
                  </div>
                  <button class="remove-btn" onclick="_cartRm('${item.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>`).join('')}
          </div>

          <div class="cart-summary">
            <div class="summary-card">
              <h2>Order Summary</h2>
              <div class="summary-row"><span>Subtotal</span><span>₹${total}</span></div>
              <div class="summary-row"><span>Shipping</span><span class="free">FREE</span></div>
              <div class="summary-divider"></div>
              <div class="summary-row summary-total"><span>Total</span><span class="text-amber">₹${total}</span></div>
              <a href="#/checkout" class="btn-primary" style="display:flex;justify-content:center;gap:8px;margin-top:1.25rem">
                Proceed to Checkout
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <p class="secure-text">Secure Payment Powered by Razorpay</p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

window._cartQty = (id, qty) => { Cart.updateQuantity(id, qty); renderCart(); };
window._cartRm = (id) => { Cart.removeItem(id); renderCart(); };

function renderCheckout() {
  const total = Cart.getTotal();
  document.getElementById('app').innerHTML = `
    <div class="page-checkout">
      <div class="container">
        <div class="checkout-grid">
          <div class="checkout-form-wrap fade-in-left">
            <h1 class="page-title font-serif">Checkout</h1>
            <p>Please provide your delivery details.</p>
            <form id="co-form" class="checkout-form">
              <div class="form-row">
                <div class="form-group"><label>Full Name</label><input name="name" required placeholder="Your full name"></div>
                <div class="form-group"><label>Email Address</label><input type="email" name="email" required placeholder="you@example.com"></div>
              </div>
              <div class="form-group"><label>Phone Number</label><input name="phone" required placeholder="+91 00000 00000"></div>
              <div class="form-group"><label>Delivery Address</label><textarea name="address" rows="3" required placeholder="Full delivery address…"></textarea></div>
              <div class="form-row">
                <div class="form-group"><label>City</label><input name="city" required placeholder="Mumbai"></div>
                <div class="form-group"><label>Pincode</label><input name="pincode" required placeholder="400001"></div>
              </div>
              <button type="submit" class="btn-primary btn-pay" id="pay-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                Pay ₹${total} Now
              </button>
            </form>
          </div>

          <div class="checkout-summary fade-in-right">
            <div class="summary-card">
              <h2>Order Summary</h2>
              <div class="order-items-list">
                ${Cart.items.map(item => `
                  <div class="checkout-item">
                    <div class="checkout-item-left">
                      <span class="checkout-item-emoji">🍪</span>
                      <div>
                        <p class="checkout-item-name">${item.name}</p>
                        <p class="checkout-item-qty">Qty: ${item.quantity}</p>
                      </div>
                    </div>
                    <span class="item-price">₹${item.price * item.quantity}</span>
                  </div>`).join('')}
              </div>
              <div class="summary-divider"></div>
              <div class="summary-row summary-total"><span>Total</span><span class="text-amber">₹${total}</span></div>
            </div>
            <div class="security-cards">
              <div class="security-card"><span>🛡️</span><div><h4>Secure Payment</h4><p>SSL encrypted</p></div></div>
              <div class="security-card"><span>🔒</span><div><h4>Privacy Protected</h4><p>Data stays safe</p></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  document.getElementById('co-form')?.addEventListener('submit', handlePayment);
}

/* ==================== RAZORPAY LOADER ==================== */
function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    // Already loaded
    if (window.Razorpay) {
      console.log('[Payment] Razorpay SDK already loaded');
      return resolve();
    }
    console.log('[Payment] Loading Razorpay SDK...');
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('[Payment] Razorpay SDK loaded successfully');
      resolve();
    };
    script.onerror = () => {
      console.error('[Payment] Failed to load Razorpay SDK');
      reject(new Error('Failed to load Razorpay SDK. Check your internet connection.'));
    };
    document.head.appendChild(script);
  });
}

/* ==================== PAYMENT VERIFICATION ==================== */
async function verifyAndRedirect(paymentResponse) {
  console.log('[Payment] Starting verification...', {
    order_id: paymentResponse.razorpay_order_id,
    payment_id: paymentResponse.razorpay_payment_id,
  });

  try {
    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentResponse),
    });

    console.log('[Payment] Verify response status:', res.status);

    let result;
    try {
      result = await res.json();
    } catch (parseErr) {
      console.error('[Payment] Failed to parse verify response:', parseErr);
      throw new Error('Invalid response from payment server');
    }

    console.log('[Payment] Verify result:', result);

    if (res.ok && result.success) {
      console.log('[Payment] ✅ Verification successful — clearing cart and redirecting');
      Cart.clearCart();
      showToast('Payment successful! Redirecting...', 'success');

      // Use direct hash assignment to guarantee navigation
      // This bypasses any router state issues
      setTimeout(() => {
        console.log('[Payment] Navigating to success page...');
        // Dispose scenes first, then navigate
        disposeAllScenes();
        // Force hash change to trigger router
        if (window.location.hash === '#/success') {
          // Hash is already correct — manually render
          renderSuccess();
          updateCartBadge();
        } else {
          window.location.hash = '#/success';
        }
      }, 800);
    } else {
      const errMsg = result.message || result.error || 'Payment verification failed';
      console.error('[Payment] ❌ Verification failed:', errMsg);
      throw new Error(errMsg);
    }
  } catch (err) {
    console.error('[Payment] Verification error:', err);
    showToast(`Verification failed: ${err.message}. Please contact support.`, 'error');
  }
}

/* ==================== HANDLE PAYMENT ==================== */
async function handlePayment(e) {
  e.preventDefault();
  console.log('[Payment] Form submitted');

  const btn = document.getElementById('pay-btn');
  const total = Cart.getTotal();

  if (total === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }

  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<div class="spinner"></div> Processing...';

  try {
    // Step 1: Load Razorpay SDK
    await loadRazorpayScript();

    // Step 2: Fetch Razorpay public key from backend
    console.log('[Payment] Fetching config from /api/config...');
    const configRes = await fetch('/api/config');
    if (!configRes.ok) {
      const errData = await configRes.json().catch(() => ({}));
      throw new Error(errData.error || `Config endpoint returned ${configRes.status}`);
    }
    const { razorpayKeyId } = await configRes.json();
    console.log('[Payment] Got razorpayKeyId:', razorpayKeyId ? '✅ present' : '❌ missing');

    if (!razorpayKeyId) {
      throw new Error('Razorpay key not returned from server');
    }

    // Step 3: Create Razorpay order on backend
    console.log('[Payment] Creating order for amount:', total);
    const orderRes = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total }),
    });

    if (!orderRes.ok) {
      const errData = await orderRes.json().catch(() => ({}));
      throw new Error(errData.error || `Order creation failed with status ${orderRes.status}`);
    }

    const order = await orderRes.json();
    console.log('[Payment] Order created:', { id: order.id, amount: order.amount, currency: order.currency });

    // Step 4: Get customer info from form
    const formData = new FormData(e.target);
    const customerInfo = {
      name: formData.get('name') || '',
      email: formData.get('email') || '',
      contact: formData.get('phone') || '',
    };
    console.log('[Payment] Customer info collected:', { name: customerInfo.name, email: customerInfo.email });

    // Step 5: Re-enable button before opening Razorpay popup
    // (user may need to interact if popup is blocked)
    btn.disabled = false;
    btn.innerHTML = originalHTML;

    // Step 6: Open Razorpay checkout
    const razorpayOptions = {
      key: razorpayKeyId,
      amount: order.amount,         // in paise, as returned by backend
      currency: order.currency || 'INR',
      name: 'Premium 3D Bakery',
      description: `Order #${order.receipt}`,
      order_id: order.id,           // CRITICAL: must match order created on server
      prefill: customerInfo,
      theme: { color: '#d97706' },

      // ✅ FIX: handler must be a plain (non-async) function.
      // We kick off an async flow inside but don't await at the top level,
      // preventing Razorpay from receiving an unresolved Promise.
      handler: function(response) {
        console.log('[Payment] Razorpay handler called with response:', {
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature ? '✅ present' : '❌ missing',
        });

        // Show immediate feedback so user knows something is happening
        showToast('Payment received! Verifying...', 'success');

        // Disable pay button to prevent double-submit if user goes back
        const payBtn = document.getElementById('pay-btn');
        if (payBtn) {
          payBtn.disabled = true;
          payBtn.innerHTML = '<div class="spinner"></div> Verifying...';
        }

        // ✅ Fire async verification — NOT awaited at handler level
        verifyAndRedirect(response);
      },

      modal: {
        ondismiss: function() {
          console.log('[Payment] Razorpay modal dismissed by user');
          showToast('Payment cancelled', 'info');
          // Re-enable pay button if modal is dismissed
          const payBtn = document.getElementById('pay-btn');
          if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerHTML = originalHTML;
          }
        },
        // Escape key should not close modal accidentally
        escape: false,
        // Prevent backdrop click from closing
        backdropclose: false,
      },

      // Retry config — allow user to retry on payment failure
      retry: {
        enabled: true,
        max_count: 3,
      },
    };

    console.log('[Payment] Opening Razorpay checkout...');
    const rzpInstance = new window.Razorpay(razorpayOptions);

    // Handle payment failure from Razorpay side (card declined, etc.)
    rzpInstance.on('payment.failed', function(failureResponse) {
      console.error('[Payment] ❌ Payment failed:', failureResponse.error);
      showToast(
        `Payment failed: ${failureResponse.error.description || 'Unknown error'}`,
        'error'
      );
      const payBtn = document.getElementById('pay-btn');
      if (payBtn) {
        payBtn.disabled = false;
        payBtn.innerHTML = originalHTML;
      }
    });

    rzpInstance.open();

  } catch (err) {
    console.error('[Payment] handlePayment error:', err);

    let userMessage = 'Something went wrong. Please try again.';
    if (err.message.includes('config') || err.message.includes('key')) {
      userMessage = 'Payment gateway not configured. Please contact support.';
    } else if (err.message.includes('network') || err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
      userMessage = 'Network error. Please check your connection and try again.';
    } else if (err.message.includes('SDK') || err.message.includes('load')) {
      userMessage = 'Could not load payment gateway. Please refresh the page.';
    } else if (err.message) {
      userMessage = err.message;
    }

    showToast(userMessage, 'error');
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}

function renderSuccess() {
  document.getElementById('app').innerHTML = `
    <div class="page-success">
      <div class="success-card fade-in-scale">
        <canvas id="sc-cv" width="280" height="160" style="display:block;margin:0 auto 1.5rem"></canvas>
        <span class="success-icon">✅</span>
        <h1 class="font-serif">Order Success!</h1>
        <p>Thank you for choosing Premium Bakery. Your artisanal treats are being prepared and will be with you shortly.</p>
        <div class="success-btns">
          <a href="#/" class="btn-primary">Back to Home</a>
          <a href="#/products" class="btn-ghost">Continue Shopping <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
        <p class="success-note">A confirmation email has been sent to your inbox.</p>
      </div>
    </div>`;

  launchConfetti();
  requestAnimationFrame(() => {
    const cv = document.getElementById('sc-cv');
    if (cv) initSuccessScene(cv);
  });
}

/* ==================== ROUTER ==================== */
const Router = {
  navigate(hash) {
    disposeAllScenes();
    const path = hash.replace('#', '') || '/';
    window.scrollTo(0, 0);

    document.querySelectorAll('.nav-link, .mobile-link').forEach(a => {
      const h = a.getAttribute('href');
      a.classList.toggle('active', h === hash || (hash === '' && h === '#/'));
    });

    switch (path) {
      case '/': renderHome(); break;
      case '/products': renderProducts(); break;
      case '/about': renderAbout(); break;
      case '/cart': renderCart(); break;
      case '/checkout': renderCheckout(); break;
      case '/success': renderSuccess(); break;
      default: renderHome();
    }

    updateCartBadge();
    document.getElementById('mobile-nav')?.classList.remove('open');
    document.getElementById('mobile-menu-btn')?.classList.remove('open');
  },

  init() {
    window.addEventListener('hashchange', () => {
      console.log('[Router] Hash changed to:', location.hash);
      this.navigate(location.hash);
    });
    this.navigate(location.hash || '#/');
  }
};

/* ==================== MOBILE MENU ==================== */
const mBtn = document.getElementById('mobile-menu-btn');
mBtn?.addEventListener('click', () => {
  mBtn.classList.toggle('open');
  document.getElementById('mobile-nav')?.classList.toggle('open');
});

/* ==================== FOOTER SCENE (persistent) ==================== */
const footerCanvas = document.getElementById('footer-canvas');
if (footerCanvas) initFooterScene(footerCanvas);

/* ==================== BOOT ==================== */
Router.init();
