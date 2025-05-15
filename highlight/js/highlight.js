let lines = [];
let currentLine = 0;

function loadLines() {
  const text = document.getElementById("highlightInput").value.trim();
  if (!text) return;
  lines = text.split(/\n|(?<=\.)\s/); // split by newline or after periods
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

function toggleTheme() {
  const body = document.body;
  body.classList.toggle("dark");
  body.classList.toggle("light");
}