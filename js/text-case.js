/* ================================
   DevToolKit - Text Case Converter
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("text-case-status");

  const inputText = document.getElementById("text-case-input");
  const outputText = document.getElementById("text-case-output");

  const wordCount = document.getElementById("text-case-word-count");
  const charCount = document.getElementById("text-case-char-count");
  const lineCount = document.getElementById("text-case-line-count");

  const sampleBtn = document.getElementById("sample-text-case-btn");
  const copyBtn = document.getElementById("copy-text-case-btn");
  const clearBtn = document.getElementById("clear-text-case-btn");

  const uppercaseBtn = document.getElementById("uppercase-btn");
  const lowercaseBtn = document.getElementById("lowercase-btn");
  const titlecaseBtn = document.getElementById("titlecase-btn");
  const sentencecaseBtn = document.getElementById("sentencecase-btn");
  const camelcaseBtn = document.getElementById("camelcase-btn");
  const pascalcaseBtn = document.getElementById("pascalcase-btn");
  const snakecaseBtn = document.getElementById("snakecase-btn");
  const kebabcaseBtn = document.getElementById("kebabcase-btn");
  const slugcaseBtn = document.getElementById("slugcase-btn");

  let currentOutput = "";

  const sampleText = "my new devtoolkit project website";

  function setStatus(message, type = "default") {
    if (!statusBox) return;

    statusBox.textContent = message;
    statusBox.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") statusBox.classList.add("status-success");
    if (type === "error") statusBox.classList.add("status-error");
    if (type === "warning") statusBox.classList.add("status-warning");
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

  function getInputValue() {
    return inputText.value;
  }

  function setOutput(value, statusMessage = "Converted", statusType = "success") {
    currentOutput = value;
    outputText.textContent = value || "Your converted text will appear here.";
    setStatus(statusMessage, statusType);
  }

  function updateStats() {
    const value = getInputValue();
    const trimmed = value.trim();

    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = value.length;
    const lines = value ? value.split("\n").length : 0;

    wordCount.textContent = words;
    charCount.textContent = chars;
    lineCount.textContent = lines;
  }

  function checkInput() {
    const value = getInputValue();

    if (!value.trim()) {
      setOutput("", "Input Required", "warning");
      showCopyMessage("Please enter text first.");
      return null;
    }

    return value;
  }

  function splitWords(value) {
    return value
      .trim()
      .replace(/[_-]+/g, " ")
      .replace(/[^\p{L}\p{N}\s]+/gu, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  function capitalizeWord(word) {
    if (!word) return "";

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  function toTitleCase(value) {
    return value
      .toLowerCase()
      .replace(/\b\p{L}/gu, (char) => char.toUpperCase());
  }

  function toSentenceCase(value) {
    const lower = value.toLowerCase();

    return lower.replace(/(^\s*\p{L}|[.!?]\s*\p{L})/gu, (match) => {
      return match.toUpperCase();
    });
  }

  function toCamelCase(value) {
    const words = splitWords(value);

    if (!words.length) return "";

    return words
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }

        return capitalizeWord(word);
      })
      .join("");
  }

  function toPascalCase(value) {
    const words = splitWords(value);

    return words.map(capitalizeWord).join("");
  }

  function toSnakeCase(value) {
    return splitWords(value)
      .map((word) => word.toLowerCase())
      .join("_");
  }

  function toKebabCase(value) {
    return splitWords(value)
      .map((word) => word.toLowerCase())
      .join("-");
  }

  function toSlug(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/&/g, "and")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "");
  }

  function convertUppercase() {
    const value = checkInput();
    if (!value) return;

    setOutput(value.toUpperCase(), "Uppercase Ready", "success");
  }

  function convertLowercase() {
    const value = checkInput();
    if (!value) return;

    setOutput(value.toLowerCase(), "Lowercase Ready", "success");
  }

  function convertTitleCase() {
    const value = checkInput();
    if (!value) return;

    setOutput(toTitleCase(value), "Title Case Ready", "success");
  }

  function convertSentenceCase() {
    const value = checkInput();
    if (!value) return;

    setOutput(toSentenceCase(value), "Sentence Case Ready", "success");
  }

  function convertCamelCase() {
    const value = checkInput();
    if (!value) return;

    setOutput(toCamelCase(value), "camelCase Ready", "success");
  }

  function convertPascalCase() {
    const value = checkInput();
    if (!value) return;

    setOutput(toPascalCase(value), "PascalCase Ready", "success");
  }

  function convertSnakeCase() {
    const value = checkInput();
    if (!value) return;

    setOutput(toSnakeCase(value), "snake_case Ready", "success");
  }

  function convertKebabCase() {
    const value = checkInput();
    if (!value) return;

    setOutput(toKebabCase(value), "kebab-case Ready", "success");
  }

  function convertSlugCase() {
    const value = checkInput();
    if (!value) return;

    setOutput(toSlug(value), "Slug Ready", "success");
  }

  async function copyOutput() {
    const text = currentOutput.trim();

    if (!text || text === "Your converted text will appear here.") {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(currentOutput);
      setStatus("Copied", "success");
      showCopyMessage("Text copied successfully!");
    } catch (error) {
      fallbackCopy(currentOutput);
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
      showCopyMessage("Text copied successfully!");
    } catch (error) {
      setStatus("Copy Failed", "error");
      showCopyMessage("Copy failed. Please try again.");
    }

    document.body.removeChild(tempTextarea);
  }

  function addSampleText() {
    inputText.value = sampleText;
    updateStats();
    setOutput("Sample added. Choose a case format.", "Sample Added", "success");
  }

  function clearTool() {
    inputText.value = "";
    currentOutput = "";
    outputText.textContent = "Your converted text will appear here.";

    updateStats();
    setStatus("Ready");
  }

  if (inputText) {
    inputText.addEventListener("input", () => {
      updateStats();

      if (!inputText.value.trim()) {
        outputText.textContent = "Your converted text will appear here.";
        currentOutput = "";
        setStatus("Ready");
      } else {
        setStatus("Typing...");
      }
    });
  }

  if (sampleBtn) sampleBtn.addEventListener("click", addSampleText);
  if (copyBtn) copyBtn.addEventListener("click", copyOutput);
  if (clearBtn) clearBtn.addEventListener("click", clearTool);

  if (uppercaseBtn) uppercaseBtn.addEventListener("click", convertUppercase);
  if (lowercaseBtn) lowercaseBtn.addEventListener("click", convertLowercase);
  if (titlecaseBtn) titlecaseBtn.addEventListener("click", convertTitleCase);
  if (sentencecaseBtn) sentencecaseBtn.addEventListener("click", convertSentenceCase);
  if (camelcaseBtn) camelcaseBtn.addEventListener("click", convertCamelCase);
  if (pascalcaseBtn) pascalcaseBtn.addEventListener("click", convertPascalCase);
  if (snakecaseBtn) snakecaseBtn.addEventListener("click", convertSnakeCase);
  if (kebabcaseBtn) kebabcaseBtn.addEventListener("click", convertKebabCase);
  if (slugcaseBtn) slugcaseBtn.addEventListener("click", convertSlugCase);

  updateStats();
});