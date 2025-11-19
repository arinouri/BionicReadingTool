// ---------- THEME TOGGLE WITH PERSISTENCE ----------

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

function toggleMode() {
  const isCurrentlyDark = document.body.classList.contains("dark");
  const nextTheme = isCurrentlyDark ? "light" : "dark";
  applyTheme(nextTheme);
  localStorage.setItem("readeasier-theme", nextTheme);
}

// Initialize theme once DOM is ready (script is at end of body, so DOM is loaded)
initTheme();

// ---------- TYPEWRITER EFFECT ----------

const words = [
  "Bionic Reading",
  "Spritz Reader",
  "Chunking",
  "Text-to-Speech",
  "Line Highlighting",
  "Reader View",
  "Colored Overlays",
];

const typedText = document.getElementById("typedText");
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typingSpeed = 90;
const deletingSpeed = 45;
const pauseBetweenWords = 1500;

function typeEffect() {
  if (!typedText) return;

  const currentWord = words[wordIndex];

  if (!isDeleting) {
    typedText.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentWord.length) {
      isDeleting = true;
      setTimeout(typeEffect, pauseBetweenWords);
      return;
    }
  } else {
    typedText.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeEffect, 500);
      return;
    }
  }

  setTimeout(typeEffect, isDeleting ? deletingSpeed : typingSpeed);
}

// Start the typing effect with a short delay
setTimeout(typeEffect, 700);
