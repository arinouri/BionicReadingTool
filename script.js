function toggleMode() {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
    document.getElementById("modeToggle").textContent =
      document.body.classList.contains("dark") ? "🌙" : "☀️";
  }
  
  const words = [
    "Bionic Reading",
    "Spritz Reader",
    "Chunking",
    "Text-to-Speech",
    "Line Highlighting",
    "Reader View",
    "Colored Overlays"
  ];
  
  const typedText = document.getElementById("typedText");
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  
  const typingSpeed = 100;
  const deletingSpeed = 50;
  const pauseBetweenWords = 1500;
  
  function typeEffect() {
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
  
  setTimeout(typeEffect, 1000);
  