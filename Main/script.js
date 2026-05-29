// ==================== CURSOR ====================
const cursor = document.getElementById("cursor");
const cursorRing = document.getElementById("cursor-ring");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx + "px";
  cursor.style.top = my + "px";
});
function animRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursorRing.style.left = rx + "px";
  cursorRing.style.top = ry + "px";
  requestAnimationFrame(animRing);
}
animRing();
document
  .querySelectorAll("a,button,.project-card,.about-card,.stack-item")
  .forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.style.transform = "translate(-50%,-50%) scale(2.5)";
      cursorRing.style.transform = "translate(-50%,-50%) scale(1.5)";
    });
    el.addEventListener("mouseleave", () => {
      cursor.style.transform = "translate(-50%,-50%) scale(1)";
      cursorRing.style.transform = "translate(-50%,-50%) scale(1)";
    });
  });

// ==================== 3D BG (Three.js) ====================
(function () {
  const canvas = document.getElementById("bg-canvas");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;

  // Rounded-square star texture
  const starTexCanvas = document.createElement("canvas");
  starTexCanvas.width = 32;
  starTexCanvas.height = 32;
  const stx = starTexCanvas.getContext("2d");
  const r = 6; // corner radius
  const s = 28; // square size
  const o = 2; // offset
  stx.clearRect(0, 0, 32, 32);
  stx.fillStyle = "#ffffff";
  stx.beginPath();
  stx.moveTo(o + r, o);
  stx.lineTo(o + s - r, o);
  stx.quadraticCurveTo(o + s, o, o + s, o + r);
  stx.lineTo(o + s, o + s - r);
  stx.quadraticCurveTo(o + s, o + s, o + s - r, o + s);
  stx.lineTo(o + r, o + s);
  stx.quadraticCurveTo(o, o + s, o, o + s - r);
  stx.lineTo(o, o + r);
  stx.quadraticCurveTo(o, o, o + r, o);
  stx.closePath();
  stx.fill();
  const starTexture = new THREE.CanvasTexture(starTexCanvas);

  // Star field
  const starGeo = new THREE.BufferGeometry();
  const starCount = 8000;
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    sizes[i] = Math.random() * 2 + 0.5;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    map: starTexture,
    alphaTest: 0.1,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Colored nebula particles
  const nebulaColors = [0xe040fb, 0x29b6f6, 0x00e5ff, 0xffd54f];
  nebulaColors.forEach((color, ci) => {
    const geo = new THREE.BufferGeometry();
    const cnt = 800;
    const pos = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: 0.3,
      transparent: true,
      opacity: 0.25,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(geo, mat));
  });

  // Floating asteroid-like geometry
  const ringGeo = new THREE.TorusGeometry(8, 0.05, 8, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.08,
    wireframe: true,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 3;
  scene.add(ring);

  const ring2Geo = new THREE.TorusGeometry(12, 0.03, 8, 100);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xe040fb,
    transparent: true,
    opacity: 0.05,
    wireframe: true,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 5;
  ring2.rotation.y = Math.PI / 4;
  scene.add(ring2);

  let scrollY = 0;
  window.addEventListener("scroll", () => (scrollY = window.scrollY));

  let mouseX = 0,
    mouseY = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 0.5;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    stars.rotation.y = t * 0.015;
    stars.rotation.x = t * 0.005;
    ring.rotation.z = t * 0.08;
    ring2.rotation.z = -t * 0.05;
    camera.position.x += (mouseX - camera.position.x) * 0.02;
    camera.position.y += (-mouseY - camera.position.y) * 0.02;
    camera.position.y -= scrollY * 0.002;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
})();

// ==================== TECH STACK ====================
const techStack = [
  { icon: "🌐", name: "HTML5" },
  { icon: "🎨", name: "CSS3" },
  { icon: "🧠", name: "JavaScript" },
  { icon: "⚛️", name: "React.js" },
  { icon: "🎞️", name: "Framer Motion" },
  { icon: "⚡", name: "Vite" },
  { icon: "🅱️", name: "Bootstrap" },
  { icon: "🌿", name: "Git" },
  { icon: "🐙", name: "GitHub" },
  { icon: "🗄️", name: "Supabase" },
  { icon: "▲", name: "Vercel" },
  { icon: "🐬", name: "MySQL" },
];
const grid = document.getElementById("stackGrid");
techStack.forEach((t, i) => {
  const el = document.createElement("div");
  el.className = "stack-item reveal";
  el.style.transitionDelay = i * 0.2 + "s";
  el.innerHTML = `<span class="stack-icon">${t.icon}</span><div class="stack-name">${t.name}</div>`;
  grid.appendChild(el);
});

// ==================== SCROLL REVEALS ====================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
);

document
  .querySelectorAll(".reveal,.reveal-left,.reveal-right,.timeline-item")
  .forEach((el) => observer.observe(el));

// ==================== EMAILJS ====================
emailjs.init("UYPqQ0cmCyLXKi0yL");
document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const btn = document.getElementById("sendBtn");
  const msg = document.getElementById("formMsg");
  btn.textContent = "TRANSMITTING...";
  btn.disabled = true;

  emailjs
    .send("service_c5xaocn", "template_h5jde9m", {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
      to_name: "Yogesh S",
    })
    .then(() => {
      msg.className = "form-msg success";
      msg.textContent =
        "✓ Message transmitted successfully! I'll respond soon.";
      btn.textContent = "⟡ TRANSMIT MESSAGE ⟡";
      btn.disabled = false;
      document.getElementById("contactForm").reset();
    })
    .catch((err) => {
      msg.className = "form-msg error";
      msg.textContent = "⚠ Transmission failed. Please try emailing directly.";
      btn.textContent = "⟡ TRANSMIT MESSAGE ⟡";
      btn.disabled = false;
      console.error(err);
    });
});

// ==================== HAMBURGER MENU ====================
(function () {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  function toggleMenu() {
    const isOpen = hamburger.classList.toggle("open");
    mobileMenu.classList.toggle("open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  function closeMenu() {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", toggleMenu);

  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      closeMenu();
      setTimeout(() => {
        target?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    });
  });

  // Close on outside click
  mobileMenu.addEventListener("click", (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close on resize back to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) closeMenu();
  });
})();

// ==================== SMOOTH NAV ====================
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    document
      .querySelector(a.getAttribute("href"))
      ?.scrollIntoView({ behavior: "smooth" });
  });
});

// ==================== NAV SCROLL ====================
window.addEventListener("scroll", () => {
  document.getElementById("navbar").style.background =
    window.scrollY > 80
      ? "rgba(0,0,5,0.95)"
      : "linear-gradient(180deg,rgba(0,0,5,0.9) 0%,transparent 100%)";
});
