(() => {
/* ---------------- Portfolio data + masonry ---------------- */
const portfolioItems = window.FotoStar.data.portfolioItems;

const grid = document.getElementById('masonryGrid');
function renderGrid(filter){
  grid.innerHTML = '';
  const filtered = portfolioItems.filter(it => filter==='all' || it.cat===filter);
  filtered.forEach((it, idx) => {
    const div = document.createElement('div');
    div.className = 'mason-item pre-reveal';
    div.style.transitionDelay = (idx % 6) * 70 + 'ms';
    div.dataset.cursor = 'view';
    div.dataset.lbIndex = idx;
    div.tabIndex = 0;
    div.setAttribute('role', 'button');
    div.setAttribute('aria-label', `View ${it.title}`);
    div.innerHTML = `
      <div class="tilt-inner">
        <img src="${it.img}" style="--image-height:${it.h}px; object-fit:cover;" alt="${it.title}, ${it.cat} photography by Foto Star Nepal" loading="lazy">
        <div class="mason-cap">
          <div><span class="cat">${it.cat}</span><span class="title">${it.title}</span></div>
          <span class="arrow">↗</span>
        </div>
      </div>`;
    div.addEventListener('click', () => openLightbox(filtered, idx));
    div.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        openLightbox(filtered, idx);
      }
    });
    grid.appendChild(div);
  });
  observeMasonItems();
}
renderGrid('Events');

/* reveal + settle observer for masonry items */
function observeMasonItems(){
  const items = document.querySelectorAll('.mason-item.pre-reveal');
  const io2 = new IntersectionObserver((entries)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('in-view');
        setTimeout(()=> en.target.classList.add('settled'), 60);
        io2.unobserve(en.target);
      }
    });
  }, {threshold:.12});
  items.forEach(el => io2.observe(el));
}

/* subtle tilt on featured (first) masonry item per row-ish: apply to all via pointer move, capped */
grid.addEventListener('mousemove', (e) => {
  const item = e.target.closest('.mason-item');
  if(!item) return;
  const inner = item.querySelector('.tilt-inner');
  const r = item.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - .5;
  const py = (e.clientY - r.top) / r.height - .5;
  inner.style.transform = `rotateY(${px*3}deg) rotateX(${-py*3}deg)`;
});
grid.addEventListener('mouseleave', (e)=>{
  document.querySelectorAll('.tilt-inner').forEach(el => el.style.transform = '');
}, true);
document.getElementById('filterRow').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if(!btn) return;
  document.querySelectorAll('#filterRow .filter-btn').forEach(b=>{
    b.classList.toggle('active', b===btn);
    b.setAttribute('aria-pressed', String(b===btn));
  });
  renderGrid(btn.dataset.filter);
});

/* ---------------- Lightbox ---------------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxImgWrap = lightboxImg.parentElement;
let lbItems = [], lbIndex = 0;
function openLightbox(items, idx){
  lbItems = items; lbIndex = idx;
  updateLightbox(false);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
}
function updateLightbox(animate = true){
  const it = lbItems[lbIndex];
  document.getElementById('lightboxTitle').textContent = it.title;
  document.getElementById('lightboxCount').textContent = String(lbIndex+1).padStart(2,'0') + ' / ' + String(lbItems.length).padStart(2,'0');
  if(!animate){
    lightboxImg.src = it.img.replace('w=900','w=1600');
    lightboxImg.alt = it.title;
    return;
  }
  lightboxImgWrap.classList.add('is-changing');
  requestAnimationFrame(() => {
    lightboxImg.src = it.img.replace('w=900','w=1600');
    lightboxImg.alt = it.title;
    requestAnimationFrame(() => lightboxImgWrap.classList.remove('is-changing'));
  });
}
function closeLightbox(){ lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden','true'); }
document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxBg').addEventListener('click', closeLightbox);
document.getElementById('lbNext').addEventListener('click', () => {
  if(!lbItems.length) return;
  lbIndex = (lbIndex+1)%lbItems.length;
  updateLightbox();
});
document.getElementById('lbPrev').addEventListener('click', () => {
  if(!lbItems.length) return;
  lbIndex = (lbIndex-1+lbItems.length)%lbItems.length;
  updateLightbox();
});
let lbTouchStart = null;
lightboxImgWrap.addEventListener('pointerdown', e => {
  if(e.pointerType !== 'touch') return;
  lbTouchStart = {x:e.clientX, y:e.clientY};
});
lightboxImgWrap.addEventListener('pointerup', e => {
  if(!lbTouchStart || e.pointerType !== 'touch') return;
  const deltaX = e.clientX - lbTouchStart.x;
  const deltaY = e.clientY - lbTouchStart.y;
  lbTouchStart = null;
  if(Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
  document.getElementById(deltaX < 0 ? 'lbNext' : 'lbPrev').click();
});
lightboxImgWrap.addEventListener('pointercancel', () => { lbTouchStart = null; });
window.addEventListener('keydown', e => {
  if(!lightbox.classList.contains('open')) return;
  if(e.key==='Escape') closeLightbox();
  if(e.key==='ArrowRight') document.getElementById('lbNext').click();
  if(e.key==='ArrowLeft') document.getElementById('lbPrev').click();
});
})();
