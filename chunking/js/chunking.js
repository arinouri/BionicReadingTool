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
