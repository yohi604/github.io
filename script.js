'use strict';

// Use the user's final GIFs. Static posters are their completed final frames.
const animatedNumbers = new Set([1, 2, 4, 5, 6, 8, 10]);
const galleryNumbers = [2, 3, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const gallery = document.getElementById('vacuum-gallery');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = !reducedMotion.matches;
const motionToggle = document.getElementById('motion-toggle');

galleryNumbers.forEach(number => {
  const id = String(number).padStart(2, '0');
  const isAnimated = animatedNumbers.has(number);
  const asset = 'assets/vacuum-' + id;
  const figure = document.createElement('figure');
  const link = document.createElement('a');
  link.className = 'art-button';
  link.href = asset + (isAnimated ? '.gif' : '.webp');
  link.dataset.gallery = 'vacuum';
  link.dataset.title = '오베닉 청소기 리디자인 · ' + id + (isAnimated ? ' / GIF' : '');
  link.setAttribute('aria-label', '청소기 리디자인 ' + id + ' 이미지 확대');
  const img = document.createElement('img');
  if (isAnimated) {
    img.dataset.animated = asset + '.gif';
    img.dataset.still = asset + '.webp';
    const badge = document.createElement('span');
    badge.className = 'gif-marker';
    badge.textContent = 'GIF';
    link.append(badge);
  }
  img.src = asset + (isAnimated && motionEnabled ? '.gif' : '.webp');
  img.alt = '오베닉 청소기 리디자인 상세페이지 ' + id + (isAnimated ? ' GIF 모션' : '');
  img.loading = 'lazy';
  link.append(img);
  const caption = document.createElement('figcaption');
  caption.className = 'art-caption';
  caption.textContent = 'DETAIL / ' + id + (isAnimated ? ' · GIF' : '');
  figure.append(link, caption);
  gallery.append(figure);
});

const dialog = document.getElementById('lightbox');
const image = document.getElementById('lightbox-image');
const title = document.getElementById('lightbox-title');
const previous = document.getElementById('lightbox-prev');
const next = document.getElementById('lightbox-next');
let current = 0;
let group = [];
let trigger = null;

function setMotion(enabled) {
  motionEnabled = enabled;
  document.querySelectorAll('img[data-animated]').forEach(img => {
    img.src = enabled ? img.dataset.animated : img.dataset.still;
  });
  motionToggle.setAttribute('aria-pressed', String(enabled));
  motionToggle.textContent = enabled ? '모션 정지 Ⅱ' : '모션 재생 ▶';
}

function showImage(index) {
  current = index;
  const item = group[current];
  const source = item.querySelector('img');
  if (source.dataset.animated) {
    image.dataset.animated = source.dataset.animated;
    image.dataset.still = source.dataset.still;
    image.src = motionEnabled ? source.dataset.animated : source.dataset.still;
  } else {
    delete image.dataset.animated;
    delete image.dataset.still;
    image.src = item.href;
  }
  image.alt = source.alt;
  title.textContent = item.dataset.title + ' (' + (current + 1) + ' / ' + group.length + ')';
  previous.disabled = current === 0;
  next.disabled = current === group.length - 1;
  dialog.scrollTop = 0;
}

setMotion(motionEnabled);
motionToggle.addEventListener('click', () => setMotion(!motionEnabled));
reducedMotion.addEventListener('change', event => setMotion(!event.matches));

document.addEventListener('click', event => {
  const link = event.target.closest('a[data-gallery]');
  if (!link || typeof dialog.showModal !== 'function' || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  trigger = link;
  group = Array.from(document.querySelectorAll('a[data-gallery]')).filter(item => item.dataset.gallery === link.dataset.gallery);
  if (link.dataset.gallery === 'vacuum') group.sort((a, b) => a.href.localeCompare(b.href));
  showImage(group.indexOf(link));
  dialog.showModal();
  document.body.classList.add('modal-open');
  document.getElementById('lightbox-close').focus();
});
previous.addEventListener('click', () => { if (current > 0) showImage(current - 1); });
next.addEventListener('click', () => { if (current < group.length - 1) showImage(current + 1); });
document.getElementById('lightbox-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' && current > 0) { event.preventDefault(); showImage(current - 1); }
  if (event.key === 'ArrowRight' && current < group.length - 1) { event.preventDefault(); showImage(current + 1); }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  trigger?.focus();
});
