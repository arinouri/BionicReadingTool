const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const intro = $('#intro');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function closeIntro() {
  if (!intro || intro.classList.contains('out')) return;
  intro.classList.add('out');
  document.body.classList.remove('intro-playing');
  window.setTimeout(() => intro.remove(), reducedMotion.matches ? 0 : 520);
}

if (intro) {
  document.body.classList.add('intro-playing');
  if (reducedMotion.matches) closeIntro();
  else window.setTimeout(closeIntro, 2050);
  $('#skipIntro').addEventListener('click', closeIntro);
}

const storedTheme = localStorage.getItem('readeasier-theme');
const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  const toggle = $('#themeToggle');
  if (toggle) {
    toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
    toggle.setAttribute('aria-label', `Use ${theme === 'dark' ? 'light' : 'dark'} theme`);
  }
}

applyTheme(initialTheme);
$('#themeToggle')?.addEventListener('click', () => {
  const theme = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(theme);
  localStorage.setItem('readeasier-theme', theme);
});

const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }), { threshold: 0.08 })
  : null;

$$('.reveal').forEach(element => revealObserver ? revealObserver.observe(element) : element.classList.add('visible'));

const search = $('#toolSearch');
const cards = $$('.tool-card');
const filterButtons = $$('.filter-bar button');
let currentFilter = 'all';

function filterTools() {
  const query = (search?.value || '').trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const categoryMatch = currentFilter === 'all' || card.dataset.category === currentFilter;
    const searchText = `${card.textContent} ${card.dataset.search || ''}`.toLowerCase();
    const queryMatch = !query || searchText.includes(query);
    card.hidden = !(categoryMatch && queryMatch);
    if (!card.hidden) visible += 1;
  });
  $('#toolCount').textContent = `${visible} ${visible === 1 ? 'tool' : 'tools'}`;
  $('#noResults').hidden = visible !== 0;
}

search?.addEventListener('input', filterTools);
filterButtons.forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  filterTools();
}));

$('#year').textContent = new Date().getFullYear();
