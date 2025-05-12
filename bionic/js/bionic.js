const textBox = document.getElementById("myTextbox");
const outputDiv = document.getElementById("output");

function applyBionic(text) {
  const words = text.split(/(\s+)/);
  return words.map(word => {
    if (word.trim() === "") return word;
    const boldLength = Math.ceil(word.length * 0.35);
    return `<span class="bold">${word.slice(0, boldLength)}</span>${word.slice(boldLength)}`;
  }).join("");
}

textBox.addEventListener("input", () => {
  outputDiv.innerHTML = applyBionic(textBox.value);
});

function toggleTheme() {
  const body = document.body;
  body.classList.toggle("dark");
  body.classList.toggle("light");
}

function copyOutput() {
  const tempEl = document.createElement("textarea");
  tempEl.value = outputDiv.innerText;
  document.body.appendChild(tempEl);
  tempEl.select();
  document.execCommand("copy");
  document.body.removeChild(tempEl);
  alert("Text copied to clipboard!");
}
