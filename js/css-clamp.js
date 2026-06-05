/* ================================
   DevToolKit - CSS Clamp Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const clampStatus = document.getElementById("clamp-status");

  const minFontSize = document.getElementById("min-font-size");
  const maxFontSize = document.getElementById("max-font-size");
  const minFontUnit = document.getElementById("min-font-unit");
  const maxFontUnit = document.getElementById("max-font-unit");

  const minViewport = document.getElementById("min-viewport");
  const maxViewport = document.getElementById("max-viewport");

  const cssProperty = document.getElementById("css-property");

  const clampOutput = document.getElementById("clamp-output");
  const previewHeading = document.getElementById("clamp-preview-heading");
  const previewCard = document.querySelector(".clamp-preview-card");
  const previewStage = document.querySelector(".clamp-preview-stage");

  const generateBtn = document.getElementById("generate-clamp-btn");
  const copyBtn = document.getElementById("copy-clamp-btn");
  const resetBtn = document.getElementById("reset-clamp-btn");
  const sampleBtn = document.getElementById("sample-clamp-btn");
  const presetCards = document.querySelectorAll(".clamp-example-card");

  const defaultSettings = {
    minSize: 32,
    maxSize: 80,
    minUnit: "px",
    maxUnit: "px",
    minViewport: 360,
    maxViewport: 1200,
    property: "font-size"
  };

  const presets = {
    "hero-heading": {
      minSize: 32,
      maxSize: 88,
      minUnit: "px",
      maxUnit: "px",
      minViewport: 360,
      maxViewport: 1280,
      property: "font-size"
    },

    "section-heading": {
      minSize: 28,
      maxSize: 56,
      minUnit: "px",
      maxUnit: "px",
      minViewport: 360,
      maxViewport: 1200,
      property: "font-size"
    },

    "body-text": {
      minSize: 16,
      maxSize: 20,
      minUnit: "px",
      maxUnit: "px",
      minViewport: 360,
      maxViewport: 1200,
      property: "font-size"
    },

    "card-gap": {
      minSize: 16,
      maxSize: 40,
      minUnit: "px",
      maxUnit: "px",
      minViewport: 360,
      maxViewport: 1200,
      property: "gap"
    }
  };

  function setStatus(message, type = "default") {
    if (!clampStatus) return;

    clampStatus.textContent = message;
    clampStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") clampStatus.classList.add("status-success");
    if (type === "error") clampStatus.classList.add("status-error");
    if (type === "warning") clampStatus.classList.add("status-warning");
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

  function pxToRem(pxValue) {
    return Number(pxValue) / 16;
  }

  function remToPx(remValue) {
    return Number(remValue) * 16;
  }

  function roundNumber(value, decimals = 4) {
    return Number(value.toFixed(decimals));
  }

  function convertSizeToPx(size, unit) {
    const number = Number(size);

    if (unit === "rem") {
      return remToPx(number);
    }

    return number;
  }

  function formatRemValue(pxValue) {
    const remValue = pxToRem(pxValue);
    const rounded = roundNumber(remValue, 4);

    return `${rounded}rem`;
  }

  function validateInputs() {
    const minSize = Number(minFontSize.value);
    const maxSize = Number(maxFontSize.value);
    const minVp = Number(minViewport.value);
    const maxVp = Number(maxViewport.value);

    if (!minSize || !maxSize || !minVp || !maxVp) {
      setStatus("All Fields Required", "warning");
      return false;
    }

    if (minSize <= 0 || maxSize <= 0 || minVp <= 0 || maxVp <= 0) {
      setStatus("Values Must Be Positive", "error");
      return false;
    }

    if (maxSize <= minSize) {
      setStatus("Max Size Must Be Bigger", "error");
      return false;
    }

    if (maxVp <= minVp) {
      setStatus("Max Viewport Must Be Bigger", "error");
      return false;
    }

    return true;
  }

  function calculateClamp() {
    const minSizePx = convertSizeToPx(minFontSize.value, minFontUnit.value);
    const maxSizePx = convertSizeToPx(maxFontSize.value, maxFontUnit.value);

    const minViewportPx = Number(minViewport.value);
    const maxViewportPx = Number(maxViewport.value);

    const slope = (maxSizePx - minSizePx) / (maxViewportPx - minViewportPx);
    const yAxisIntersection = minSizePx - slope * minViewportPx;

    const preferredVw = roundNumber(slope * 100, 4);
    const preferredRem = roundNumber(pxToRem(yAxisIntersection), 4);

    const minValue = formatRemValue(minSizePx);
    const maxValue = formatRemValue(maxSizePx);

    let preferredValue;

    if (preferredRem === 0) {
      preferredValue = `${preferredVw}vw`;
    } else if (preferredRem > 0) {
      preferredValue = `${preferredVw}vw + ${preferredRem}rem`;
    } else {
      preferredValue = `${preferredVw}vw - ${Math.abs(preferredRem)}rem`;
    }

    return `clamp(${minValue}, ${preferredValue}, ${maxValue})`;
  }

  function buildCSSOutput() {
    const clampValue = calculateClamp();
    const property = cssProperty.value;

    return `${property}: ${clampValue};`;
  }

  function resetPreviewStyles() {
    if (!previewHeading || !previewCard || !previewStage) return;

    previewHeading.style.fontSize = "";
    previewHeading.style.lineHeight = "";
    previewCard.style.padding = "";
    previewCard.style.margin = "";
    previewCard.style.width = "";
    previewCard.style.gap = "";
    previewStage.style.gap = "";
  }

  function updatePreview(clampValue) {
    const property = cssProperty.value;

    resetPreviewStyles();

    if (property === "font-size") {
      previewHeading.style.fontSize = clampValue;
      previewHeading.style.lineHeight = "0.98";
    }

    if (property === "line-height") {
      previewHeading.style.fontSize = "clamp(2rem, 5.714vw + 0.714rem, 5rem)";
      previewHeading.style.lineHeight = clampValue;
    }

    if (property === "padding") {
      previewCard.style.padding = clampValue;
    }

    if (property === "margin") {
      previewCard.style.margin = clampValue;
    }

    if (property === "gap") {
      previewCard.style.display = "grid";
      previewCard.style.gap = clampValue;
    }

    if (property === "width") {
      previewCard.style.width = clampValue;
      previewCard.style.maxWidth = "100%";
    }
  }

  function generateClamp() {
    if (!validateInputs()) return;

    const clampValue = calculateClamp();
    const cssText = `${cssProperty.value}: ${clampValue};`;

    clampOutput.textContent = cssText;
    updatePreview(clampValue);

    setStatus("Clamp Ready", "success");
  }

  async function copyClampCSS() {
    const cssText = clampOutput.textContent.trim();

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

  function applySettings(settings) {
    minFontSize.value = settings.minSize;
    maxFontSize.value = settings.maxSize;

    minFontUnit.value = settings.minUnit;
    maxFontUnit.value = settings.maxUnit;

    minViewport.value = settings.minViewport;
    maxViewport.value = settings.maxViewport;

    cssProperty.value = settings.property;

    generateClamp();
  }

  function resetClamp() {
    applySettings(defaultSettings);
    setStatus("Reset Done", "success");
  }

  function addSampleClamp() {
    applySettings({
      minSize: 40,
      maxSize: 96,
      minUnit: "px",
      maxUnit: "px",
      minViewport: 375,
      maxViewport: 1440,
      property: "font-size"
    });

    setStatus("Sample Added", "success");
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

  function addInputListeners() {
    const inputs = [
      minFontSize,
      maxFontSize,
      minFontUnit,
      maxFontUnit,
      minViewport,
      maxViewport,
      cssProperty
    ];

    inputs.forEach((input) => {
      if (!input) return;

      input.addEventListener("input", generateClamp);
      input.addEventListener("change", generateClamp);
    });
  }

  if (generateBtn) generateBtn.addEventListener("click", generateClamp);
  if (copyBtn) copyBtn.addEventListener("click", copyClampCSS);
  if (resetBtn) resetBtn.addEventListener("click", resetClamp);
  if (sampleBtn) sampleBtn.addEventListener("click", addSampleClamp);

  presetCards.forEach((card) => {
    card.addEventListener("click", () => {
      applyPreset(card);
    });
  });

  addInputListeners();
  generateClamp();
});