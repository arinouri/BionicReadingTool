function simplifyText() {
    const rawInput = document.getElementById("readerInput").value;
    const readerBox = document.getElementById("readerBox");
  
    // Create a virtual element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = rawInput;
  
    // Remove scripts, styles, navs, etc.
    tempDiv.querySelectorAll("script, style, iframe, nav, footer, header, button").forEach(el => el.remove());
  
    // Extract clean readable text
    const cleanText = tempDiv.textContent || tempDiv.innerText || "";
  
    readerBox.textContent = cleanText.trim();
  }
  