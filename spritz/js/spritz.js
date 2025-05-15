let words = [];
let index = 0;
let interval = null;
let baseDelay = 100; // Default for 150 WPM

function startSpritz() {
  const input = document.getElementById("spritzInput").value;
  if (!input.trim()) return;

  words = input.trim().split(/\s+/);
  const wpm = parseInt(document.getElementById("speedControl").value) || 150;
  baseDelay = 60000 / wpm;

  if (interval) clearInterval(interval);
  interval = setInterval(() => showNextWord(), baseDelay);
}

function showNextWord() {
  const box = document.getElementById("spritzBox");
  const inputEl = document.getElementById("spritzInput");

  if (index >= words.length) {
    box.textContent = "Done!";
    clearInterval(interval);
    return;
  }

  const currentWord = words[index];
  box.textContent = currentWord;

  // Highlight current word in textarea
  const inputText = inputEl.value;
  const wordStartIndex = findWordStart(inputText, index);
  const wordEndIndex = wordStartIndex + currentWord.length;
  inputEl.setSelectionRange(wordStartIndex, wordEndIndex);

  index++;

  // Pause if word ends with period
  if (currentWord.endsWith(".")) {
    clearInterval(interval);
    setTimeout(() => {
      interval = setInterval(() => showNextWord(), baseDelay);
    }, 800);
  }
}

function findWordStart(text, wordIndex) {
  let count = 0;
  let idx = 0;
  while (count < wordIndex && idx < text.length) {
    if (/\s/.test(text[idx])) {
      while (idx < text.length && /\s/.test(text[idx])) idx++;
      count++;
    } else {
      idx++;
    }
  }
  return idx;
}

function pauseSpritz() {
  clearInterval(interval);
}

document.getElementById("spritzInput").addEventListener("click", (e) => {
  const pos = e.target.selectionStart;
  const textBefore = e.target.value.slice(0, pos);
  index = textBefore.trim().split(/\s+/).length - 1;
  showNextWord(); // Show the selected word immediately
});

function toggleTheme() {
  const body = document.body;
  body.classList.toggle("dark");
  body.classList.toggle("light");
}