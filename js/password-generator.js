/* ================================
   DevToolKit - Password Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const passwordStatus = document.getElementById("password-status");

  const passwordLength = document.getElementById("password-length");
  const passwordLengthValue = document.getElementById("password-length-value");

  const includeUppercase = document.getElementById("include-uppercase");
  const includeLowercase = document.getElementById("include-lowercase");
  const includeNumbers = document.getElementById("include-numbers");
  const includeSymbols = document.getElementById("include-symbols");

  const excludeSimilar = document.getElementById("exclude-similar");
  const excludeAmbiguous = document.getElementById("exclude-ambiguous");

  const passwordOutput = document.getElementById("password-output");
  const strengthLabel = document.getElementById("password-strength-label");
  const strengthFill = document.getElementById("password-strength-fill");

  const metaLength = document.getElementById("password-meta-length");
  const metaSets = document.getElementById("password-meta-sets");
  const metaStrength = document.getElementById("password-meta-strength");

  const generateBtn = document.getElementById("generate-password-btn");
  const copyBtn = document.getElementById("copy-password-btn");
  const copyMiniBtn = document.getElementById("copy-password-mini-btn");
  const clearBtn = document.getElementById("clear-password-btn");
  const toggleVisibilityBtn = document.getElementById("toggle-password-visibility");
  const randomPresetBtn = document.getElementById("random-password-preset-btn");
  const presetCards = document.querySelectorAll(".password-preset-card");

  let currentPassword = "";
  let passwordVisible = true;

  const characterSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=<>?/|~"
  };

  const similarCharacters = "O0Il1";
  const ambiguousCharacters = "{}[]()/\\'\"`,;:.<>";

  const presets = {
    basic: {
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeSimilar: true,
      excludeAmbiguous: true
    },

    strong: {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false
    },

    "extra-strong": {
      length: 24,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: true,
      excludeAmbiguous: true
    },

    pin: {
      length: 8,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
      excludeSimilar: false,
      excludeAmbiguous: true
    }
  };

  function setStatus(message, type = "default") {
    if (!passwordStatus) return;

    passwordStatus.textContent = message;
    passwordStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") passwordStatus.classList.add("status-success");
    if (type === "error") passwordStatus.classList.add("status-error");
    if (type === "warning") passwordStatus.classList.add("status-warning");
  }

  function showCopyMessage(message = "Copied successfully!") {
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

  function updateLengthLabel() {
    passwordLengthValue.textContent = passwordLength.value;
  }

  function getSelectedSets() {
    const sets = [];

    if (includeUppercase.checked) {
      sets.push({
        name: "uppercase",
        chars: characterSets.uppercase
      });
    }

    if (includeLowercase.checked) {
      sets.push({
        name: "lowercase",
        chars: characterSets.lowercase
      });
    }

    if (includeNumbers.checked) {
      sets.push({
        name: "numbers",
        chars: characterSets.numbers
      });
    }

    if (includeSymbols.checked) {
      sets.push({
        name: "symbols",
        chars: characterSets.symbols
      });
    }

    return sets;
  }

  function removeCharacters(source, charactersToRemove) {
    return source
      .split("")
      .filter((char) => !charactersToRemove.includes(char))
      .join("");
  }

  function cleanCharacterSet(chars) {
    let cleaned = chars;

    if (excludeSimilar.checked) {
      cleaned = removeCharacters(cleaned, similarCharacters);
    }

    if (excludeAmbiguous.checked) {
      cleaned = removeCharacters(cleaned, ambiguousCharacters);
    }

    return cleaned;
  }

  function getRandomIndex(max) {
    const cryptoObject = window.crypto || window.msCrypto;

    if (cryptoObject && cryptoObject.getRandomValues) {
      const randomArray = new Uint32Array(1);
      cryptoObject.getRandomValues(randomArray);

      return randomArray[0] % max;
    }

    return Math.floor(Math.random() * max);
  }

  function getRandomChar(chars) {
    return chars[getRandomIndex(chars.length)];
  }

  function shuffleString(value) {
    const array = value.split("");

    for (let index = array.length - 1; index > 0; index--) {
      const randomIndex = getRandomIndex(index + 1);
      [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
    }

    return array.join("");
  }

  function calculateStrength(password, selectedSetCount) {
    const length = password.length;

    let score = 0;

    if (length >= 8) score += 20;
    if (length >= 12) score += 20;
    if (length >= 16) score += 20;
    if (length >= 24) score += 15;

    score += Math.min(selectedSetCount * 10, 25);

    if (excludeSimilar.checked) score += 5;
    if (excludeAmbiguous.checked) score += 5;

    score = Math.min(score, 100);

    if (score < 35) {
      return {
        label: "Weak",
        score
      };
    }

    if (score < 65) {
      return {
        label: "Medium",
        score
      };
    }

    if (score < 85) {
      return {
        label: "Strong",
        score
      };
    }

    return {
      label: "Very Strong",
      score
    };
  }

  function renderPassword(password, selectedSetCount) {
    currentPassword = password;

    if (!password) {
      passwordOutput.textContent = "Click generate to create a password";
      strengthLabel.textContent = "Not generated";
      strengthFill.style.width = "0%";

      metaLength.textContent = "0";
      metaSets.textContent = "0";
      metaStrength.textContent = "None";

      return;
    }

    const strength = calculateStrength(password, selectedSetCount);

    if (passwordVisible) {
      passwordOutput.textContent = password;
    } else {
      passwordOutput.textContent = "•".repeat(password.length);
    }

    strengthLabel.textContent = strength.label;
    strengthFill.style.width = `${strength.score}%`;

    metaLength.textContent = password.length;
    metaSets.textContent = selectedSetCount;
    metaStrength.textContent = strength.label;
  }

  function generatePassword() {
    const length = Number(passwordLength.value);
    const selectedSets = getSelectedSets();

    if (!selectedSets.length) {
      setStatus("Select One Option", "warning");
      showCopyMessage("Select at least one character type.");
      renderPassword("", 0);
      return;
    }

    const cleanedSets = selectedSets
      .map((set) => {
        return {
          ...set,
          chars: cleanCharacterSet(set.chars)
        };
      })
      .filter((set) => set.chars.length > 0);

    if (!cleanedSets.length) {
      setStatus("No Characters Left", "error");
      showCopyMessage("Your exclusions removed all characters.");
      renderPassword("", 0);
      return;
    }

    let password = "";

    cleanedSets.forEach((set) => {
      if (password.length < length) {
        password += getRandomChar(set.chars);
      }
    });

    const allCharacters = cleanedSets.map((set) => set.chars).join("");

    while (password.length < length) {
      password += getRandomChar(allCharacters);
    }

    password = shuffleString(password).slice(0, length);

    renderPassword(password, cleanedSets.length);
    setStatus("Password Generated", "success");
  }

  async function copyPassword() {
    if (!currentPassword) {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Generate a password first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(currentPassword);
      setStatus("Copied", "success");
      showCopyMessage("Password copied successfully!");
    } catch (error) {
      fallbackCopy(currentPassword);
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
      setStatus("Copied", "success");
      showCopyMessage("Password copied successfully!");
    } catch (error) {
      setStatus("Copy Failed", "error");
      showCopyMessage("Copy failed. Please try again.");
    }

    document.body.removeChild(tempTextarea);
  }

  function clearPassword() {
    currentPassword = "";
    passwordVisible = true;

    toggleVisibilityBtn.textContent = "Show";
    renderPassword("", 0);

    setStatus("Ready");
  }

  function togglePasswordVisibility() {
    if (!currentPassword) {
      setStatus("Nothing to Show", "warning");
      return;
    }

    passwordVisible = !passwordVisible;

    if (passwordVisible) {
      passwordOutput.textContent = currentPassword;
      toggleVisibilityBtn.textContent = "Hide";
    } else {
      passwordOutput.textContent = "•".repeat(currentPassword.length);
      toggleVisibilityBtn.textContent = "Show";
    }
  }

  function applyPreset(settings) {
    passwordLength.value = settings.length;
    includeUppercase.checked = settings.uppercase;
    includeLowercase.checked = settings.lowercase;
    includeNumbers.checked = settings.numbers;
    includeSymbols.checked = settings.symbols;
    excludeSimilar.checked = settings.excludeSimilar;
    excludeAmbiguous.checked = settings.excludeAmbiguous;

    updateLengthLabel();
    generatePassword();
  }

  function handlePresetClick(card) {
    const presetName = card.dataset.preset;
    const preset = presets[presetName];

    if (!preset) {
      setStatus("Preset Missing", "error");
      return;
    }

    applyPreset(preset);
    setStatus("Preset Applied", "success");
  }

  function randomPreset() {
    const presetKeys = Object.keys(presets);
    const randomKey = presetKeys[getRandomIndex(presetKeys.length)];

    applyPreset(presets[randomKey]);
    setStatus("Random Preset", "success");
  }

  function handleOptionChange() {
    if (currentPassword) {
      generatePassword();
    }
  }

  if (passwordLength) {
    passwordLength.addEventListener("input", () => {
      updateLengthLabel();

      if (currentPassword) {
        generatePassword();
      }
    });
  }

  [
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    excludeSimilar,
    excludeAmbiguous
  ].forEach((input) => {
    if (!input) return;
    input.addEventListener("change", handleOptionChange);
  });

  if (generateBtn) {
    generateBtn.addEventListener("click", generatePassword);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyPassword);
  }

  if (copyMiniBtn) {
    copyMiniBtn.addEventListener("click", copyPassword);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearPassword);
  }

  if (toggleVisibilityBtn) {
    toggleVisibilityBtn.addEventListener("click", togglePasswordVisibility);
  }

  if (randomPresetBtn) {
    randomPresetBtn.addEventListener("click", randomPreset);
  }

  presetCards.forEach((card) => {
    card.addEventListener("click", () => {
      handlePresetClick(card);
    });
  });

  updateLengthLabel();
});