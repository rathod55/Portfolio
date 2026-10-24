const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
const revealObserver = new IntersectionObserver((entries, observer) => { entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in-view'); observer.unobserve(entry.target); } }); }, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));
const cursor = document.querySelector('.cursor-orb');
if (!reduceMotion && cursor) window.addEventListener('pointermove', (event) => { cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`; });
document.querySelectorAll('.magnetic').forEach((button) => { if (reduceMotion) return; button.addEventListener('pointermove', (event) => { const box = button.getBoundingClientRect(); const x = event.clientX - box.left - box.width / 2; const y = event.clientY - box.top - box.height / 2; button.style.transform = `translate(${x * .13}px, ${y * .16}px)`; }); button.addEventListener('pointerleave', () => { button.style.transform = ''; }); });
document.querySelectorAll('.tilt').forEach((card) => { if (reduceMotion) return; card.addEventListener('pointermove', (event) => { const box = card.getBoundingClientRect(); const x = (event.clientX - box.left) / box.width - .5; const y = (event.clientY - box.top) / box.height - .5; card.style.transform = `rotateY(${x * 3.2}deg) rotateX(${y * -3.2}deg) translateY(-4px)`; }); card.addEventListener('pointerleave', () => { card.style.transform = ''; }); });
const form = document.querySelector('[data-mail-form]');
if (form) form.addEventListener('submit', (event) => { event.preventDefault(); const data = new FormData(form); const subject = encodeURIComponent(`Portfolio enquiry from ${data.get('name') || 'a new contact'}`); const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`); window.location.href = `mailto:hello@abhijeetrathore.com?subject=${subject}&body=${body}`; });
const canvas = document.querySelector('#starfield');
if (canvas && !reduceMotion) {
  const context = canvas.getContext('2d');
  let stars = [];
  let pointer = { x: innerWidth * .5, y: innerHeight * .5 };
  let lastScroll = scrollY;
  let flight = 0;
  let lastFrame = performance.now();

  const resetStar = (star, far = true) => {
    star.x = (Math.random() - .5) * 2.5;
    star.y = (Math.random() - .5) * 2.1;
    star.z = far ? .72 + Math.random() * 1.25 : 1.65;
    star.size = .28 + Math.random() * 1.25;
    star.tint = Math.random() > .87 ? '190,157,255' : Math.random() > .44 ? '255,222,174' : '255,183,103';
    star.phase = Math.random() * Math.PI * 2;
  };

  const fit = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(390, Math.max(215, Math.floor(innerWidth / 3.6)));
    stars = Array.from({ length: count }, () => {
      const star = {};
      resetStar(star);
      return star;
    });
  };

  const draw = (now) => {
    const delta = Math.min(32, now - lastFrame);
    lastFrame = now;
    const w = innerWidth;
    const h = innerHeight;
    const cx = w * .5;
    const cy = h * .5;
    const focal = Math.max(w, h) * .6;
    const movement = .00028 + flight * .0044;
    flight *= .956;
    context.clearRect(0, 0, w, h);

    const haze = context.createRadialGradient(w * .7, h * .25, 0, w * .7, h * .25, Math.max(w, h) * .74);
    haze.addColorStop(0, 'rgba(106,42,22,.055)');
    haze.addColorStop(.4, 'rgba(47,31,82,.026)');
    haze.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = haze;
    context.fillRect(0, 0, w, h);

    stars.forEach((star) => {
      const previousZ = star.z;
      star.z -= movement * delta * (star.size * .65 + .5);
      if (star.z < .075 || star.z > 2) resetStar(star, false);

      const px = cx + (star.x / star.z) * focal + (pointer.x - cx) * (1 - Math.min(star.z, 1)) * .045;
      const py = cy + (star.y / star.z) * focal + (pointer.y - cy) * (1 - Math.min(star.z, 1)) * .032;
      const lastX = cx + (star.x / previousZ) * focal;
      const lastY = cy + (star.y / previousZ) * focal;
      if (px < -80 || px > w + 80 || py < -80 || py > h + 80) {
        resetStar(star, false);
        return;
      }

      const brightness = Math.min(.94, .12 + (1 / star.z) * .19 + (Math.sin(now * .0016 + star.phase) + 1) * .07);
      const radius = Math.min(2.3, star.size / star.z);
      const streak = Math.min(22, Math.hypot(px - lastX, py - lastY) * 5.4);
      if (streak > 1.5) {
        context.strokeStyle = `rgba(${star.tint},${brightness * .5})`;
        context.lineWidth = Math.max(.35, radius * .38);
        context.beginPath();
        context.moveTo(px, py);
        context.lineTo(px + (px - cx) / Math.max(1, Math.hypot(px - cx, py - cy)) * streak, py + (py - cy) / Math.max(1, Math.hypot(px - cx, py - cy)) * streak);
        context.stroke();
      }
      context.fillStyle = `rgba(${star.tint},${brightness})`;
      context.beginPath();
      context.arc(px, py, radius, 0, Math.PI * 2);
      context.fill();
    });

    document.documentElement.style.setProperty('--space-drift', String(Math.min(1, flight * 5)));
    requestAnimationFrame(draw);
  };

  fit();
  requestAnimationFrame(draw);
  addEventListener('resize', fit);
  addEventListener('scroll', () => {
    const shift = Math.abs(scrollY - lastScroll);
    flight = Math.min(.95, flight + shift * .006);
    lastScroll = scrollY;
  }, { passive: true });
  addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    document.documentElement.style.setProperty('--mx', String(event.clientX / innerWidth));
    document.documentElement.style.setProperty('--my', String(event.clientY / innerHeight));
  });
}

const blackholeCanvas = document.querySelector('#blackhole');
if (blackholeCanvas && !reduceMotion) {
  const context = blackholeCanvas.getContext('2d');
  const particles = Array.from({ length: 880 }, (_, index) => {
    const radius = .19 + Math.pow(Math.random(), .6) * 1.14;
    return {
      radius,
      angle: Math.random() * Math.PI * 2,
      speed: (.28 + Math.random() * .72) / Math.pow(radius + .12, 1.28),
      size: .34 + Math.random() * 1.22,
      glow: .25 + Math.random() * .75,
      offset: index % 2 ? 1 : -1
    };
  });

  const fitBlackhole = () => {
    const bounds = blackholeCanvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    blackholeCanvas.width = bounds.width * dpr;
    blackholeCanvas.height = bounds.height * dpr;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const particle = (x, y, size, color) => {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  };

  const paintBlackhole = (time) => {
    const bounds = blackholeCanvas.getBoundingClientRect();
    const w = bounds.width;
    const h = bounds.height;
    if (!w || !h) {
      requestAnimationFrame(paintBlackhole);
      return;
    }
    const cx = w * .5;
    const cy = h * .51;
    const scale = Math.min(w, h) * .39;
    context.clearRect(0, 0, w, h);

    const atmosphere = context.createRadialGradient(cx, cy, scale * .05, cx, cy, scale * 1.58);
    atmosphere.addColorStop(0, 'rgba(0,0,0,0)');
    atmosphere.addColorStop(.38, 'rgba(255,111,24,.09)');
    atmosphere.addColorStop(.63, 'rgba(129,35,14,.045)');
    atmosphere.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = atmosphere;
    context.fillRect(0, 0, w, h);

    context.save();
    context.globalCompositeOperation = 'lighter';
    particles.forEach((dot) => {
      const spin = dot.angle + time * .00022 * dot.speed;
      const ripple = Math.sin(spin * 5 + time * .0015) * .018;
      const r = dot.radius + ripple;
      const rawX = Math.cos(spin) * r;
      const rawY = Math.sin(spin) * r;
      const x = cx + rawX * scale;
      const y = cy + rawY * scale * .265;
      const heat = Math.max(0, 1 - (r - .2) / 1.16);
      const alpha = (.08 + heat * .56) * dot.glow;
      const warmth = heat > .68 ? `255,${Math.round(175 + heat * 65)},${Math.round(88 + heat * 82)}` : `221,${Math.round(74 + heat * 73)},${Math.round(30 + heat * 60)}`;
      const size = dot.size * (.32 + heat * .88);

      if (rawY < 0 && r > .27 && r < .9) {
        const lensY = cy - scale * (.19 + Math.abs(rawY) * .17);
        particle(x, lensY, size * .72, `rgba(${warmth},${alpha * .33})`);
      }
      particle(x, y, size, `rgba(${warmth},${alpha})`);
    });
    context.restore();

    const ring = context.createRadialGradient(cx, cy, scale * .19, cx, cy, scale * .42);
    ring.addColorStop(0, 'rgba(0,0,0,0)');
    ring.addColorStop(.57, 'rgba(255,237,193,.24)');
    ring.addColorStop(.72, 'rgba(255,157,54,.14)');
    ring.addColorStop(1, 'rgba(71,16,6,0)');
    context.fillStyle = ring;
    context.beginPath();
    context.ellipse(cx, cy, scale * .5, scale * .33, -.13, 0, Math.PI * 2);
    context.fill();

    const horizon = context.createRadialGradient(cx - scale * .08, cy - scale * .1, scale * .03, cx, cy, scale * .39);
    horizon.addColorStop(0, '#000000');
    horizon.addColorStop(.62, '#000001');
    horizon.addColorStop(.86, 'rgba(5,3,7,.96)');
    horizon.addColorStop(1, 'rgba(42,10,6,.1)');
    context.fillStyle = horizon;
    context.beginPath();
    context.ellipse(cx, cy, scale * .37, scale * .31, -.13, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = 'rgba(255,213,153,.22)';
    context.lineWidth = 1;
    context.beginPath();
    context.ellipse(cx, cy, scale * .39, scale * .325, -.13, .22, Math.PI * .88);
    context.stroke();
    requestAnimationFrame(paintBlackhole);
  };

  fitBlackhole();
  requestAnimationFrame(paintBlackhole);
  addEventListener('resize', fitBlackhole);
}
