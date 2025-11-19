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

// ------- Chunking logic -------

let chunks = [];
let currentChunkIndex = 0;

function chunkText() {
  const input = document.getElementById("chunkInput").value.trim();
  const chunkSize = parseInt(document.getElementById("chunkSize").value) || 30;
  const words = input.split(/\s+/);

  chunks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  currentChunkIndex = 0;
  displayChunk();
}

function displayChunk() {
  const chunkBox = document.getElementById("chunkBox");
  if (chunks.length === 0) {
    chunkBox.textContent = "No content to display.";
  } else {
    chunkBox.textContent = chunks[currentChunkIndex];
  }
}

function nextChunk() {
  if (currentChunkIndex < chunks.length - 1) {
    currentChunkIndex++;
    displayChunk();
  }
}

function prevChunk() {
  if (currentChunkIndex > 0) {
    currentChunkIndex--;
    displayChunk();
  }
}
