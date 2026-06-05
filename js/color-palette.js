/* ================================
   DevToolKit - Color Palette Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const paletteStatus = document.getElementById("palette-status");
  const paletteCards = document.querySelectorAll(".palette-color-card");
  const paletteOutput = document.getElementById("palette-output");

  const randomBtn = document.getElementById("random-palette-btn");
  const generateBtn = document.getElementById("generate-palette-btn");
  const copyPaletteBtn = document.getElementById("copy-palette-btn");
  const copyCSSBtn = document.getElementById("copy-palette-css-btn");
  const resetBtn = document.getElementById("reset-palette-btn");
  const presetCards = document.querySelectorAll(".palette-preset-card");

  const defaultPalette = [
    { name: "Primary", color: "#7c3aed" },
    { name: "Accent", color: "#ccf381" },
    { name: "Info", color: "#00d4ff" },
    { name: "Warm", color: "#f97316" },
    { name: "Dark", color: "#0f172a" }
  ];

  const presets = {
    "saas-dark": [
      { name: "Dark", color: "#0f172a" },
      { name: "Primary", color: "#7c3aed" },
      { name: "Accent", color: "#ccf381" },
      { name: "Info", color: "#38bdf8" },
      { name: "Light", color: "#f8fafc" }
    ],

    "portfolio-light": [
      { name: "Light", color: "#f8fafc" },
      { name: "Text", color: "#18181b" },
      { name: "Blue", color: "#2563eb" },
      { name: "Orange", color: "#f97316" },
      { name: "Border", color: "#e2e8f0" }
    ],

    "neon-tech": [
      { name: "Dark", color: "#020617" },
      { name: "Mint", color: "#00f5d4" },
      { name: "Purple", color: "#9b5de5" },
      { name: "Pink", color: "#f15bb5" },
      { name: "Yellow", color: "#fee440" }
    ],

    "earth-soft": [
      { name: "Forest", color: "#283618" },
      { name: "Olive", color: "#606c38" },
      { name: "Sand", color: "#dda15e" },
      { name: "Clay", color: "#bc6c25" },
      { name: "Cream", color: "#fefae0" }
    ]
  };

  const randomColorPool = [
    "#7c3aed",
    "#ccf381",
    "#00d4ff",
    "#f97316",
    "#0f172a",
    "#38bdf8",
    "#f43f5e",
    "#22c55e",
    "#eab308",
    "#8b5cf6",
    "#14b8a6",
    "#ec4899",
    "#06b6d4",
    "#84cc16",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
    "#10b981",
    "#111827",
    "#f8fafc",
    "#1e293b",
    "#fb7185",
    "#a855f7",
    "#2dd4bf",
    "#fde047"
  ];

  function setStatus(message, type = "default") {
    if (!paletteStatus) return;

    paletteStatus.textContent = message;
    paletteStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") {
      paletteStatus.classList.add("status-success");
    }

    if (type === "error") {
      paletteStatus.classList.add("status-error");
    }

    if (type === "warning") {
      paletteStatus.classList.add("status-warning");
    }
  }

  function normalizeHex(hex) {
    return hex.toLowerCase();
  }

  function formatHex(hex) {
    return hex.toUpperCase();
  }

  function isDarkColor(hex) {
    const cleanHex = hex.replace("#", "");
    const red = parseInt(cleanHex.substring(0, 2), 16);
    const green = parseInt(cleanHex.substring(2, 4), 16);
    const blue = parseInt(cleanHex.substring(4, 6), 16);

    const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

    return brightness < 145;
  }

  function getRandomColor() {
    const index = Math.floor(Math.random() * randomColorPool.length);
    return randomColorPool[index];
  }

  function generateRandomPalette() {
    const palette = [];
    const usedColors = new Set();

    while (palette.length < 5) {
      const color = getRandomColor();

      if (!usedColors.has(color)) {
        usedColors.add(color);

        palette.push({
          name: `Color ${palette.length + 1}`,
          color
        });
      }
    }

    return palette;
  }

  function buildCSSVariables(palette) {
    const variableNames = [
      "--color-primary",
      "--color-secondary",
      "--color-accent",
      "--color-surface",
      "--color-text"
    ];

    const lines = palette.map((item, index) => {
      return `  ${variableNames[index]}: ${normalizeHex(item.color)};`;
    });

    return `:root {\n${lines.join("\n")}\n}`;
  }

  function buildPlainPaletteText(palette) {
    return palette
      .map((item) => `${item.name}: ${formatHex(item.color)}`)
      .join("\n");
  }

  function updatePalette(palette) {
    paletteCards.forEach((card, index) => {
      const paletteItem = palette[index];

      if (!paletteItem) return;

      const colorName = card.querySelector(".color-name");
      const colorCode = card.querySelector("strong");

      card.style.background = paletteItem.color;
      card.dataset.color = paletteItem.color;

      if (isDarkColor(paletteItem.color)) {
        card.style.color = "#ffffff";
      } else {
        card.style.color = "#101827";
      }

      if (colorName) {
        colorName.textContent = paletteItem.name;
      }

      if (colorCode) {
        colorCode.textContent = formatHex(paletteItem.color);
      }
    });

    if (paletteOutput) {
      paletteOutput.textContent = buildCSSVariables(palette);
    }
  }

  async function copyText(text, successMessage = "Copied") {
    if (!text.trim()) {
      setStatus("Nothing to Copy", "warning");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus(successMessage, "success");

      setTimeout(() => {
        setStatus("Ready");
      }, 1600);
    } catch (error) {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
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
      setStatus(successMessage, "success");
    } catch (error) {
      setStatus("Copy Failed", "error");
    }

    document.body.removeChild(tempTextarea);

    setTimeout(() => {
      setStatus("Ready");
    }, 1600);
  }

  function getCurrentPalette() {
    return Array.from(paletteCards).map((card, index) => {
      const colorName = card.querySelector(".color-name");
      const colorCode = card.querySelector("strong");

      return {
        name: colorName ? colorName.textContent.trim() : `Color ${index + 1}`,
        color: colorCode ? normalizeHex(colorCode.textContent.trim()) : normalizeHex(card.dataset.color)
      };
    });
  }

  function handleGeneratePalette() {
    const palette = generateRandomPalette();
    updatePalette(palette);
    setStatus("Palette Generated", "success");
  }

  function handleResetPalette() {
    updatePalette(defaultPalette);
    setStatus("Palette Reset", "success");
  }

  function handleCopyPalette() {
    const palette = getCurrentPalette();
    const text = buildPlainPaletteText(palette);

    copyText(text, "Palette Copied");
  }

  function handleCopyCSS() {
    const cssText = paletteOutput.textContent.trim();

    copyText(cssText, "CSS Copied");
  }

  function handleColorCardCopy(card) {
    const color = card.dataset.color || "";
    copyText(formatHex(color), "HEX Copied");
  }

  function handlePresetClick(card) {
    const presetName = card.dataset.palette;
    const palette = presets[presetName];

    if (!palette) {
      setStatus("Preset Missing", "error");
      return;
    }

    updatePalette(palette);
    setStatus("Preset Applied", "success");
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", handleGeneratePalette);
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", handleGeneratePalette);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", handleResetPalette);
  }

  if (copyPaletteBtn) {
    copyPaletteBtn.addEventListener("click", handleCopyPalette);
  }

  if (copyCSSBtn) {
    copyCSSBtn.addEventListener("click", handleCopyCSS);
  }

  paletteCards.forEach((card) => {
    card.addEventListener("click", () => {
      handleColorCardCopy(card);
    });
  });

  presetCards.forEach((card) => {
    card.addEventListener("click", () => {
      handlePresetClick(card);
    });
  });

  updatePalette(defaultPalette);
  setStatus("Ready");
});