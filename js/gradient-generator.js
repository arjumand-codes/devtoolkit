/* ================================
   DevToolKit - Gradient Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const gradientType = document.getElementById("gradient-type");
  const gradientDirection = document.getElementById("gradient-direction");
  const gradientDirectionGroup = document.getElementById("gradient-direction-group");

  const colorOne = document.getElementById("gradient-color-one");
  const colorTwo = document.getElementById("gradient-color-two");
  const colorThree = document.getElementById("gradient-color-three");

  const colorOneText = document.getElementById("gradient-color-one-text");
  const colorTwoText = document.getElementById("gradient-color-two-text");
  const colorThreeText = document.getElementById("gradient-color-three-text");

  const enableThirdColor = document.getElementById("enable-third-color");

  const previewBox = document.getElementById("gradient-preview");
  const outputBox = document.getElementById("gradient-output");
  const statusBox = document.getElementById("gradient-status");

  const generateBtn = document.getElementById("generate-gradient-btn");
  const copyBtn = document.getElementById("copy-gradient-btn");
  const resetBtn = document.getElementById("reset-gradient-btn");
  const randomBtn = document.getElementById("random-gradient-btn");
  const presetCards = document.querySelectorAll(".gradient-preset-card");

  const defaultSettings = {
    type: "linear",
    direction: "135deg",
    colorOne: "#7c3aed",
    colorTwo: "#ccf381",
    colorThree: "#00d4ff",
    thirdColor: false
  };

  const randomColors = [
    "#7c3aed",
    "#ccf381",
    "#00d4ff",
    "#fc466b",
    "#f7971e",
    "#ffd200",
    "#11998e",
    "#38ef7d",
    "#667eea",
    "#764ba2",
    "#0f2027",
    "#2c5364",
    "#ff512f",
    "#dd2476",
    "#00c6ff",
    "#0072ff",
    "#f953c6",
    "#b91d73",
    "#43cea2",
    "#185a9d"
  ];

  function setStatus(message, type = "default") {
    if (!statusBox) return;

    statusBox.textContent = message;
    statusBox.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") {
      statusBox.classList.add("status-success");
    }

    if (type === "error") {
      statusBox.classList.add("status-error");
    }

    if (type === "warning") {
      statusBox.classList.add("status-warning");
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

  function syncColorText(colorInput, textInput) {
    if (!colorInput || !textInput) return;
    textInput.value = colorInput.value;
  }

  function syncTextColor(textInput, colorInput) {
    if (!textInput || !colorInput) return;

    const value = normalizeHex(textInput.value);

    if (isValidHex(value)) {
      colorInput.value = value;
      textInput.value = value;
      generateGradient();
      setStatus("Color Updated", "success");
    } else {
      setStatus("Invalid HEX", "error");
    }
  }

  function getGradientCSS() {
    const type = gradientType.value;
    const direction = gradientDirection.value;
    const first = colorOne.value;
    const second = colorTwo.value;
    const third = colorThree.value;
    const useThird = enableThirdColor.checked;

    if (type === "radial") {
      return useThird
        ? `radial-gradient(circle, ${first}, ${second}, ${third})`
        : `radial-gradient(circle, ${first}, ${second})`;
    }

    return useThird
      ? `linear-gradient(${direction}, ${first}, ${second}, ${third})`
      : `linear-gradient(${direction}, ${first}, ${second})`;
  }

  function updateDirectionVisibility() {
    if (!gradientDirectionGroup) return;

    if (gradientType.value === "radial") {
      gradientDirectionGroup.style.display = "none";
    } else {
      gradientDirectionGroup.style.display = "grid";
    }
  }

  function generateGradient() {
    const gradientCSS = getGradientCSS();
    const fullCSS = `background: ${gradientCSS};`;

    previewBox.style.background = gradientCSS;
    outputBox.textContent = fullCSS;

    updateDirectionVisibility();
    setStatus("Gradient Ready", "success");
  }

  async function copyGradientCSS() {
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

  function resetGradient() {
    gradientType.value = defaultSettings.type;
    gradientDirection.value = defaultSettings.direction;

    colorOne.value = defaultSettings.colorOne;
    colorTwo.value = defaultSettings.colorTwo;
    colorThree.value = defaultSettings.colorThree;

    colorOneText.value = defaultSettings.colorOne;
    colorTwoText.value = defaultSettings.colorTwo;
    colorThreeText.value = defaultSettings.colorThree;

    enableThirdColor.checked = defaultSettings.thirdColor;

    generateGradient();
    setStatus("Reset Done", "success");
  }

  function getRandomColor() {
    const randomIndex = Math.floor(Math.random() * randomColors.length);
    return randomColors[randomIndex];
  }

  function generateRandomGradient() {
    const first = getRandomColor();
    let second = getRandomColor();
    let third = getRandomColor();

    while (second === first) {
      second = getRandomColor();
    }

    while (third === first || third === second) {
      third = getRandomColor();
    }

    const directions = [
      "135deg",
      "90deg",
      "180deg",
      "to right",
      "to left",
      "to bottom",
      "to top",
      "to bottom right",
      "to top right"
    ];

    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    const useThird = Math.random() > 0.5;
    const useRadial = Math.random() > 0.65;

    gradientType.value = useRadial ? "radial" : "linear";
    gradientDirection.value = randomDirection;

    colorOne.value = first;
    colorTwo.value = second;
    colorThree.value = third;

    colorOneText.value = first;
    colorTwoText.value = second;
    colorThreeText.value = third;

    enableThirdColor.checked = useThird;

    generateGradient();
    setStatus("Random Gradient", "success");
  }

  function applyPreset(card) {
    const presetGradient = card.dataset.gradient;

    if (!presetGradient) {
      setStatus("Preset Missing", "error");
      return;
    }

    previewBox.style.background = presetGradient;
    outputBox.textContent = `background: ${presetGradient};`;
    setStatus("Preset Applied", "success");
  }

  function addColorListeners(colorInput, textInput) {
    if (!colorInput || !textInput) return;

    colorInput.addEventListener("input", () => {
      syncColorText(colorInput, textInput);
      generateGradient();
    });

    textInput.addEventListener("change", () => {
      syncTextColor(textInput, colorInput);
    });

    textInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        syncTextColor(textInput, colorInput);
      }
    });
  }

  if (gradientType) {
    gradientType.addEventListener("change", generateGradient);
  }

  if (gradientDirection) {
    gradientDirection.addEventListener("change", generateGradient);
  }

  if (enableThirdColor) {
    enableThirdColor.addEventListener("change", generateGradient);
  }

  addColorListeners(colorOne, colorOneText);
  addColorListeners(colorTwo, colorTwoText);
  addColorListeners(colorThree, colorThreeText);

  if (generateBtn) {
    generateBtn.addEventListener("click", generateGradient);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyGradientCSS);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetGradient);
  }

  if (randomBtn) {
    randomBtn.addEventListener("click", generateRandomGradient);
  }

  if (presetCards.length > 0) {
    presetCards.forEach((card) => {
      card.addEventListener("click", () => {
        applyPreset(card);
      });
    });
  }

  generateGradient();
});