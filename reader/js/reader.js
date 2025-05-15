function simplifyText() {
  const rawInput = document.getElementById("readerInput").value;
  const readerBox = document.getElementById("readerBox");

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = rawInput;

  tempDiv.querySelectorAll("script, style, iframe, nav, footer, header, button").forEach(el => el.remove());

  const cleanText = tempDiv.textContent || tempDiv.innerText || "";
  readerBox.textContent = cleanText.trim();
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle("dark");
  body.classList.toggle("light");
}

function adjustFontSize(size) {
  document.getElementById("readerBox").style.fontSize = `${size}px`;
}

function adjustLineHeight(height) {
  document.getElementById("readerBox").style.lineHeight = height;
}

function toggleImmersive() {
  document.body.classList.toggle("immersive");
}
