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

// ------- Reader logic -------

function simplifyText() {
  const input = document.getElementById("readerInput").value;
  const output = document.getElementById("readerBox");
  const parser = new DOMParser();
  let cleaned = input;

  try {
    const doc = parser.parseFromString(input, "text/html");
    cleaned = doc.body.textContent || input;
  } catch (e) {
    cleaned = input;
  }

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  output.textContent = cleaned || "Nothing to show yet. Paste some text above and click Simplify.";
}

function adjustFontSize(value) {
  const box = document.getElementById("readerBox");
  box.style.fontSize = value + "px";
}

function adjustLineHeight(value) {
  const box = document.getElementById("readerBox");
  box.style.lineHeight = value;
}
