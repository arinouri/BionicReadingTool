// ------- THEME (shared) -------

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

// ------- Bionic logic -------

const textBox = document.getElementById("myTextbox");
const outputDiv = document.getElementById("output");

function applyBionic(text) {
  const words = text.split(/(\s+)/);
  return words
    .map((word) => {
      if (word.trim() === "") return word;
      const boldLength = Math.ceil(word.length * 0.35);
      return `<span class="bold">${word.slice(0, boldLength)}</span>${word.slice(
        boldLength
      )}`;
    })
    .join("");
}

textBox.addEventListener("input", () => {
  outputDiv.innerHTML = applyBionic(textBox.value);
});

function copyOutput() {
  const tempEl = document.createElement("textarea");
  tempEl.value = outputDiv.innerText;
  document.body.appendChild(tempEl);
  tempEl.select();
  document.execCommand("copy");
  document.body.removeChild(tempEl);
  alert("Text copied to clipboard!");
}
