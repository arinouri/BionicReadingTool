function updateOverlay() {
    const color = document.getElementById("overlayColor").value;
    const opacity = document.getElementById("overlayOpacity").value;
    const overlay = document.getElementById("overlay");
    overlay.style.backgroundColor = color;
    overlay.style.opacity = opacity;
  }
  
  // Initialize default overlay on page load
  updateOverlay();
  
  function toggleTheme() {
    const body = document.body;
    body.classList.toggle("dark");
    body.classList.toggle("light");
  }