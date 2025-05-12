const synth = window.speechSynthesis;
const voiceSelect = document.getElementById("voiceSelect");
const rateInput = document.getElementById("rate");
let utterance;

function populateVoices() {
  const voices = synth.getVoices();
  voiceSelect.innerHTML = "";
  voices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

populateVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoices;
}

function speakText() {
  const text = document.getElementById("ttsInput").value;
  if (!text.trim()) return;
  stopSpeech();

  utterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = synth.getVoices()[voiceSelect.value];
  utterance.voice = selectedVoice;
  utterance.rate = parseFloat(rateInput.value);

  synth.speak(utterance);
}

function pauseSpeech() {
  if (synth.speaking && !synth.paused) {
    synth.pause();
  }
}

function resumeSpeech() {
  if (synth.paused) {
    synth.resume();
  }
}

function stopSpeech() {
  synth.cancel();
}
