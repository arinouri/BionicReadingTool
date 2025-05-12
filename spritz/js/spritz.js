let words = [];
let index = 0;
let interval = null;

function startSpritz() {
  const input = document.getElementById("spritzInput").value;
  if (!input.trim()) return;
  words = input.trim().split(/\s+/);
  const wpm = parseInt(document.getElementById("speedControl").value) || 300;
  const delay = 60000 / wpm;

  if (interval) clearInterval(interval);
  index = 0;
  interval = setInterval(showNextWord, delay);
}

function showNextWord() {
  const box = document.getElementById("spritzBox");
  if (index >= words.length) {
    box.textContent = "Done!";
    clearInterval(interval);
    return;
  }
  box.textContent = words[index];
  index++;
}

function pauseSpritz() {
  clearInterval(interval);
}
