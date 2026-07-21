// ------- THEME -------

function applyTheme(theme) {
  const body = document.body;
  const toggle = document.getElementById("modeToggle");

  body.classList.remove("dark", "light");
  body.classList.add(theme);

  if (toggle) {
    toggle.textContent = theme === "dark" ? "🌙" : "☀️";
  }
}

function initTheme() {
  const stored = localStorage.getItem("readeasier-theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = stored || (prefersDark ? "dark" : "light");
  applyTheme(theme);
}

function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  const next = isDark ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("readeasier-theme", next);
}

initTheme();

// ------- Spritz logic -------

let words = [];
let index = 0;
let interval = null;
let baseDelay = 100;

function startSpritz() {
  const input = document.getElementById("spritzInput").value;
  if (!input.trim()) return;

  words = input.trim().split(/\s+/);
  const wpm = parseInt(document.getElementById("speedControl").value) || 150;
  baseDelay = 60000 / wpm;

  if (interval) clearInterval(interval);
  index = 0;
  interval = setInterval(showNextWord, baseDelay);
}

function showNextWord() {
  const box = document.getElementById("spritzBox");
  if (index >= words.length) {
    box.textContent = "Done!";
    clearInterval(interval);
    return;
  }

  const currentWord = words[index];
  box.textContent = currentWord;
  index++;

  if (currentWord.endsWith(".")) {
    clearInterval(interval);
    setTimeout(() => {
      interval = setInterval(showNextWord, baseDelay);
    }, 800);
  }
}

function pauseSpritz() {
  clearInterval(interval);
}
