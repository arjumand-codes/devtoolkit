/* ================================
   DevToolKit - Glassmorphism Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const glassStatus = document.getElementById("glass-status");

  const glassBlur = document.getElementById("glass-blur");
  const glassOpacity = document.getElementById("glass-opacity");
  const glassBorderOpacity = document.getElementById("glass-border-opacity");
  const glassRadius = document.getElementById("glass-radius");
  const glassShadowBlur = document.getElementById("glass-shadow-blur");
  const glassShadowOpacity = document.getElementById("glass-shadow-opacity");

  const glassBlurValue = document.getElementById("glass-blur-value");
  const glassOpacityValue = document.getElementById("glass-opacity-value");
  const glassBorderOpacityValue = document.getElementById("glass-border-opacity-value");
  const glassRadiusValue = document.getElementById("glass-radius-value");
  const glassShadowBlurValue = document.getElementById("glass-shadow-blur-value");
  const glassShadowOpacityValue = document.getElementById("glass-shadow-opacity-value");

  const glassColor = document.getElementById("glass-color");
  const glassColorText = document.getElementById("glass-color-text");

  const glassBorderColor = document.getElementById("glass-border-color");
  const glassBorderColorText = document.getElementById("glass-border-color-text");

  const glassPreviewCard = document.getElementById("glass-preview-card");
  const glassOutput = document.getElementById("glass-output");

  const generateBtn = document.getElementById("generate-glass-btn");
  const copyBtn = document.getElementById("copy-glass-btn");
  const resetBtn = document.getElementById("reset-glass-btn");
  const randomBtn = document.getElementById("random-glass-btn");
  const presetCards = document.querySelectorAll(".glass-preset-card");

  const defaultSettings = {
    blur: 16,
    opacity: 12,
    borderOpacity: 20,
    radius: 28,
    shadowBlur: 60,
    shadowOpacity: 35,
    glassColor: "#ffffff",
    borderColor: "#ffffff"
  };

  const presets = {
    "soft-glass": {
      blur: 12,
      opacity: 12,
      borderOpacity: 18,
      radius: 24,
      shadowBlur: 38,
      shadowOpacity: 22,
      glassColor: "#ffffff",
      borderColor: "#ffffff"
    },

    "deep-glass": {
      blur: 20,
      opacity: 26,
      borderOpacity: 14,
      radius: 28,
      shadowBlur: 70,
      shadowOpacity: 42,
      glassColor: "#0f172a",
      borderColor: "#ffffff"
    },

    "frosted-glass": {
      blur: 28,
      opacity: 24,
      borderOpacity: 32,
      radius: 32,
      shadowBlur: 52,
      shadowOpacity: 26,
      glassColor: "#ffffff",
      borderColor: "#ffffff"
    },

    "neon-glass": {
      blur: 18,
      opacity: 18,
      borderOpacity: 45,
      radius: 30,
      shadowBlur: 80,
      shadowOpacity: 46,
      glassColor: "#7c3aed",
      borderColor: "#ccf381"
    }
  };

  const randomColors = [
    "#ffffff",
    "#7c3aed",
    "#ccf381",
    "#00d4ff",
    "#f97316",
    "#f43f5e",
    "#38bdf8",
    "#22c55e"
  ];

  function setStatus(message, type = "default") {
    if (!glassStatus) return;

    glassStatus.textContent = message;
    glassStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") {
      glassStatus.classList.add("status-success");
    }

    if (type === "error") {
      glassStatus.classList.add("status-error");
    }

    if (type === "warning") {
      glassStatus.classList.add("status-warning");
    }
  }

  function showCopyMessage(message = "CSS copied successfully!") {
    let toast = document.querySelector(".copy-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "copy-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toast.hideTimeout);

    toast.hideTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
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

  function rgbaFromHex(hex, opacityPercent) {
    const rgb = hexToRgb(hex);
    const alpha = Number(opacityPercent) / 100;

    return `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${alpha.toFixed(2)})`;
  }

  function updateLabels() {
    glassBlurValue.textContent = `${glassBlur.value}px`;
    glassOpacityValue.textContent = `${glassOpacity.value}%`;
    glassBorderOpacityValue.textContent = `${glassBorderOpacity.value}%`;
    glassRadiusValue.textContent = `${glassRadius.value}px`;
    glassShadowBlurValue.textContent = `${glassShadowBlur.value}px`;
    glassShadowOpacityValue.textContent = `${glassShadowOpacity.value}%`;
  }

  function getGlassCSSValues() {
    const blur = Number(glassBlur.value);
    const opacity = Number(glassOpacity.value);
    const borderOpacity = Number(glassBorderOpacity.value);
    const radius = Number(glassRadius.value);
    const shadowBlur = Number(glassShadowBlur.value);
    const shadowOpacity = Number(glassShadowOpacity.value);

    const background = rgbaFromHex(glassColor.value, opacity);
    const border = rgbaFromHex(glassBorderColor.value, borderOpacity);
    const shadow = `rgba(0, 0, 0, ${(shadowOpacity / 100).toFixed(2)})`;

    return {
      background,
      blur,
      border,
      radius,
      shadowBlur,
      shadow
    };
  }

  function buildGlassCSS() {
    const values = getGlassCSSValues();

    return `.glass-card {
  background: ${values.background};
  backdrop-filter: blur(${values.blur}px);
  -webkit-backdrop-filter: blur(${values.blur}px);
  border: 1px solid ${values.border};
  border-radius: ${values.radius}px;
  box-shadow: 0 24px ${values.shadowBlur}px ${values.shadow};
}`;
  }

  function generateGlass() {
    const values = getGlassCSSValues();
    const css = buildGlassCSS();

    glassPreviewCard.style.background = values.background;
    glassPreviewCard.style.backdropFilter = `blur(${values.blur}px)`;
    glassPreviewCard.style.webkitBackdropFilter = `blur(${values.blur}px)`;
    glassPreviewCard.style.border = `1px solid ${values.border}`;
    glassPreviewCard.style.borderRadius = `${values.radius}px`;
    glassPreviewCard.style.boxShadow = `0 24px ${values.shadowBlur}px ${values.shadow}`;

    glassOutput.textContent = css;

    updateLabels();
    setStatus("Glass Ready", "success");
  }

  function syncColorInput(colorInput, textInput) {
    if (!colorInput || !textInput) return;

    textInput.value = colorInput.value;
    generateGlass();
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

    generateGlass();
    setStatus("Color Updated", "success");
  }

  async function copyGlassCSS() {
    const cssText = glassOutput.textContent.trim();

    if (!cssText) {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(cssText);
      setStatus("CSS Copied", "success");
      showCopyMessage("CSS copied successfully!");
    } catch (error) {
      fallbackCopy(cssText);
    }

    setTimeout(() => {
      setStatus("Ready");
    }, 3000);
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
      showCopyMessage("CSS copied successfully!");
    } catch (error) {
      setStatus("Copy Failed", "error");
      showCopyMessage("Copy failed. Please try again.");
    }

    document.body.removeChild(tempTextarea);
  }

  function resetGlass() {
    applySettings(defaultSettings);
    setStatus("Reset Done", "success");
  }

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomColor() {
    const index = Math.floor(Math.random() * randomColors.length);
    return randomColors[index];
  }

  function generateRandomGlass() {
    const settings = {
      blur: getRandomNumber(8, 34),
      opacity: getRandomNumber(8, 34),
      borderOpacity: getRandomNumber(12, 58),
      radius: getRandomNumber(16, 44),
      shadowBlur: getRandomNumber(35, 100),
      shadowOpacity: getRandomNumber(18, 55),
      glassColor: getRandomColor(),
      borderColor: getRandomColor()
    };

    applySettings(settings);
    setStatus("Random Glass", "success");
  }

  function applySettings(settings) {
    glassBlur.value = settings.blur;
    glassOpacity.value = settings.opacity;
    glassBorderOpacity.value = settings.borderOpacity;
    glassRadius.value = settings.radius;
    glassShadowBlur.value = settings.shadowBlur;
    glassShadowOpacity.value = settings.shadowOpacity;

    glassColor.value = settings.glassColor;
    glassColorText.value = settings.glassColor;

    glassBorderColor.value = settings.borderColor;
    glassBorderColorText.value = settings.borderColor;

    generateGlass();
  }

  function applyPreset(card) {
    const presetName = card.dataset.preset;
    const preset = presets[presetName];

    if (!preset) {
      setStatus("Preset Missing", "error");
      return;
    }

    applySettings(preset);
    setStatus("Preset Applied", "success");
  }

  function addRangeListener(rangeInput) {
    if (!rangeInput) return;

    rangeInput.addEventListener("input", generateGlass);
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

  addRangeListener(glassBlur);
  addRangeListener(glassOpacity);
  addRangeListener(glassBorderOpacity);
  addRangeListener(glassRadius);
  addRangeListener(glassShadowBlur);
  addRangeListener(glassShadowOpacity);

  addColorListeners(glassColor, glassColorText);
  addColorListeners(glassBorderColor, glassBorderColorText);

  if (generateBtn) {
    generateBtn.addEventListener("click", generateGlass);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyGlassCSS);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetGlass);
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", generateRandomGlass);
  }

  presetCards.forEach((card) => {
    card.addEventListener("click", () => {
      applyPreset(card);
    });
  });

  generateGlass();
});