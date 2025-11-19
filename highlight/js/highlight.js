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

// ------- Line highlight logic -------

let lines = [];
let currentLine = 0;

function loadLines() {
  const text = document.getElementById("highlightInput").value.trim();
  if (!text) return;
  lines = text.split(/\n|(?<=\.)\s/);
  currentLine = 0;
  renderLines();
}

function renderLines() {
  const box = document.getElementById("highlightBox");
  box.innerHTML = "";
  lines.forEach((line, i) => {
    const span = document.createElement("span");
    span.className = "line" + (i === currentLine ? " highlighted" : "");
    span.textContent = line;
    box.appendChild(span);
  });
}

function nextLine() {
  if (currentLine < lines.length - 1) {
    currentLine++;
    renderLines();
  }
}

function prevLine() {
  if (currentLine > 0) {
    currentLine--;
    renderLines();
  }
}
