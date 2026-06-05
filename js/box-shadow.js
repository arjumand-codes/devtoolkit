/* ================================
   DevToolKit - Box Shadow Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const shadowStatus = document.getElementById("shadow-status");

  const shadowX = document.getElementById("shadow-x");
  const shadowY = document.getElementById("shadow-y");
  const shadowBlur = document.getElementById("shadow-blur");
  const shadowSpread = document.getElementById("shadow-spread");
  const shadowOpacity = document.getElementById("shadow-opacity");

  const shadowXValue = document.getElementById("shadow-x-value");
  const shadowYValue = document.getElementById("shadow-y-value");
  const shadowBlurValue = document.getElementById("shadow-blur-value");
  const shadowSpreadValue = document.getElementById("shadow-spread-value");
  const shadowOpacityValue = document.getElementById("shadow-opacity-value");

  const shadowColor = document.getElementById("shadow-color");
  const shadowColorText = document.getElementById("shadow-color-text");

  const shadowCardColor = document.getElementById("shadow-card-color");
  const shadowCardColorText = document.getElementById("shadow-card-color-text");

  const shadowInset = document.getElementById("shadow-inset");
  const previewCard = document.getElementById("shadow-preview-card");
  const outputBox = document.getElementById("shadow-output");

  const generateBtn = document.getElementById("generate-shadow-btn");
  const copyBtn = document.getElementById("copy-shadow-btn");
  const resetBtn = document.getElementById("reset-shadow-btn");
  const randomBtn = document.getElementById("random-shadow-btn");
  const presetCards = document.querySelectorAll(".shadow-preset-card");

  const defaultSettings = {
    x: 0,
    y: 24,
    blur: 60,
    spread: 0,
    opacity: 35,
    color: "#000000",
    cardColor: "#111827",
    inset: false
  };

  const randomColors = [
    "#000000",
    "#111827",
    "#7c3aed",
    "#ccf381",
    "#00d4ff",
    "#f97316",
    "#f43f5e",
    "#22c55e",
    "#38bdf8",
    "#8b5cf6"
  ];

  function setStatus(message, type = "default") {
    if (!shadowStatus) return;

    shadowStatus.textContent = message;
    shadowStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") {
      shadowStatus.classList.add("status-success");
    }

    if (type === "error") {
      shadowStatus.classList.add("status-error");
    }

    if (type === "warning") {
      shadowStatus.classList.add("status-warning");
    }
  }

  function isValidHex(value) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(value.trim());
  }

  function normalizeHex(value) {
    const trimmed = value.trim();

    if (!trimmed.startsWith("#")) {
      return `#${trimmed}`;
    }

    return trimmed;
  }

  function hexToRgb(hex) {
    let cleanHex = hex.replace("#", "");

    if (cleanHex.length === 3) {
      cleanHex = cleanHex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const red = parseInt(cleanHex.substring(0, 2), 16);
    const green = parseInt(cleanHex.substring(2, 4), 16);
    const blue = parseInt(cleanHex.substring(4, 6), 16);

    return { red, green, blue };
  }

  function getShadowCSSValue() {
    const x = Number(shadowX.value);
    const y = Number(shadowY.value);
    const blur = Number(shadowBlur.value);
    const spread = Number(shadowSpread.value);
    const opacity = Number(shadowOpacity.value) / 100;
    const color = shadowColor.value;
    const inset = shadowInset.checked ? "inset " : "";

    const rgb = hexToRgb(color);

    return `${inset}${x}px ${y}px ${blur}px ${spread}px rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${opacity.toFixed(2)})`;
  }

  function getFullCSS() {
    return `box-shadow: ${getShadowCSSValue()};`;
  }

  function updateValueLabels() {
    shadowXValue.textContent = `${shadowX.value}px`;
    shadowYValue.textContent = `${shadowY.value}px`;
    shadowBlurValue.textContent = `${shadowBlur.value}px`;
    shadowSpreadValue.textContent = `${shadowSpread.value}px`;
    shadowOpacityValue.textContent = `${shadowOpacity.value}%`;
  }

  function generateShadow() {
    const shadowCSS = getShadowCSSValue();
    const fullCSS = getFullCSS();

    previewCard.style.boxShadow = shadowCSS;
    previewCard.style.backgroundColor = shadowCardColor.value;
    outputBox.textContent = fullCSS;

    updateValueLabels();
    setStatus("Shadow Ready", "success");
  }

  function syncColorInput(colorInput, textInput) {
    if (!colorInput || !textInput) return;

    textInput.value = colorInput.value;
    generateShadow();
  }

  function syncTextInput(textInput, colorInput) {
    if (!textInput || !colorInput) return;

    const value = normalizeHex(textInput.value);

    if (!isValidHex(value)) {
      setStatus("Invalid HEX", "error");
      return;
    }

    textInput.value = value;
    colorInput.value = value;

    generateShadow();
    setStatus("Color Updated", "success");
  }

  async function copyShadowCSS() {
    const cssText = outputBox.textContent.trim();

    if (!cssText) {
      setStatus("Nothing to Copy", "warning");
      return;
    }

    try {
      await navigator.clipboard.writeText(cssText);
      setStatus("CSS Copied", "success");

      setTimeout(() => {
        setStatus("Ready");
      }, 1600);
    } catch (error) {
      fallbackCopy(cssText);
    }
  }

  function fallbackCopy(text) {
    const tempTextarea = document.createElement("textarea");

    tempTextarea.value = text;
    tempTextarea.style.position = "fixed";
    tempTextarea.style.left = "-9999px";
    tempTextarea.style.top = "-9999px";

    document.body.appendChild(tempTextarea);
    tempTextarea.focus();
    tempTextarea.select();

    try {
      document.execCommand("copy");
      setStatus("CSS Copied", "success");
    } catch (error) {
      setStatus("Copy Failed", "error");
    }

    document.body.removeChild(tempTextarea);

    setTimeout(() => {
      setStatus("Ready");
    }, 1600);
  }

  function resetShadow() {
    shadowX.value = defaultSettings.x;
    shadowY.value = defaultSettings.y;
    shadowBlur.value = defaultSettings.blur;
    shadowSpread.value = defaultSettings.spread;
    shadowOpacity.value = defaultSettings.opacity;

    shadowColor.value = defaultSettings.color;
    shadowColorText.value = defaultSettings.color;

    shadowCardColor.value = defaultSettings.cardColor;
    shadowCardColorText.value = defaultSettings.cardColor;

    shadowInset.checked = defaultSettings.inset;

    generateShadow();
    setStatus("Reset Done", "success");
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomColor() {
    const index = Math.floor(Math.random() * randomColors.length);
    return randomColors[index];
  }

  function generateRandomShadow() {
    const x = getRandomNumber(-20, 30);
    const y = getRandomNumber(10, 50);
    const blur = getRandomNumber(25, 100);
    const spread = getRandomNumber(-10, 20);
    const opacity = getRandomNumber(15, 55);
    const color = getRandomColor();

    shadowX.value = x;
    shadowY.value = y;
    shadowBlur.value = blur;
    shadowSpread.value = spread;
    shadowOpacity.value = opacity;

    shadowColor.value = color;
    shadowColorText.value = color;

    shadowInset.checked = Math.random() > 0.82;

    generateShadow();
    setStatus("Random Shadow", "success");
  }

  function applyPreset(card) {
    const presetShadow = card.dataset.shadow;

    if (!presetShadow) {
      setStatus("Preset Missing", "error");
      return;
    }

    previewCard.style.boxShadow = presetShadow;
    outputBox.textContent = `box-shadow: ${presetShadow};`;

    setStatus("Preset Applied", "success");
  }

  function addRangeListener(rangeInput) {
    if (!rangeInput) return;

    rangeInput.addEventListener("input", generateShadow);
  }

  function addColorListeners(colorInput, textInput) {
    if (!colorInput || !textInput) return;

    colorInput.addEventListener("input", () => {
      syncColorInput(colorInput, textInput);
    });

    textInput.addEventListener("change", () => {
      syncTextInput(textInput, colorInput);
    });

    textInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        syncTextInput(textInput, colorInput);
      }
    });
  }

  addRangeListener(shadowX);
  addRangeListener(shadowY);
  addRangeListener(shadowBlur);
  addRangeListener(shadowSpread);
  addRangeListener(shadowOpacity);

  addColorListeners(shadowColor, shadowColorText);
  addColorListeners(shadowCardColor, shadowCardColorText);

  if (shadowInset) {
    shadowInset.addEventListener("change", generateShadow);
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", generateShadow);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyShadowCSS);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetShadow);
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", generateRandomShadow);
  }

  if (presetCards.length > 0) {
    presetCards.forEach((card) => {
      card.addEventListener("click", () => {
        applyPreset(card);
      });
    });
  }

  generateShadow();
});