/* ================================
   DevToolKit - HTML Entity Encoder / Decoder
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("html-entities-status");

  const inputBox = document.getElementById("html-entities-input");
  const outputBox = document.getElementById("html-entities-output");

  const charCount = document.getElementById("html-entities-char-count");
  const entityCount = document.getElementById("html-entities-count");
  const lineCount = document.getElementById("html-entities-line-count");

  const sampleBtn = document.getElementById("sample-html-entities-btn");
  const copyBtn = document.getElementById("copy-html-entities-btn");
  const encodeBtn = document.getElementById("encode-html-entities-btn");
  const decodeBtn = document.getElementById("decode-html-entities-btn");
  const encodeAllBtn = document.getElementById("encode-all-html-entities-btn");
  const swapBtn = document.getElementById("swap-html-entities-btn");
  const clearBtn = document.getElementById("clear-html-entities-btn");

  let currentOutput = "";

  const sampleHTML = `<section class="hero">
  <h1>Hello & Welcome</h1>
  <p>This is "DevToolKit" — a free tools website.</p>
</section>`;

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

  function updateStats(value) {
    const entityMatches = value.match(/&[#a-zA-Z0-9]+;/g);

    charCount.textContent = value.length;
    entityCount.textContent = entityMatches ? entityMatches.length : 0;
    lineCount.textContent = value ? value.split("\n").length : 0;
  }

  function getInputValue() {
    return inputBox.value;
  }

  function setOutput(value, message = "Done", type = "success") {
    currentOutput = value;
    outputBox.textContent = value || "Your converted output will appear here.";
    setStatus(message, type);
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

  function encodeBasicHTML(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function encodeAllCharacters(value) {
    return value
      .split("")
      .map((char) => {
        if (char === "\n") return "\n";
        if (char === "\t") return "\t";
        if (char === " ") return " ";

        return `&#${char.charCodeAt(0)};`;
      })
      .join("");
  }

  function decodeEntities(value) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;

    return textarea.value;
  }

  function encodeHTML() {
    const value = checkInput();
    if (value === null) return;

    const encoded = encodeBasicHTML(value);

    setOutput(encoded, "HTML Encoded", "success");
  }

  function decodeHTML() {
    const value = checkInput();
    if (value === null) return;

    const decoded = decodeEntities(value);

    setOutput(decoded, "Entities Decoded", "success");
  }

  function encodeAllHTML() {
    const value = checkInput();
    if (value === null) return;

    const encoded = encodeAllCharacters(value);

    setOutput(encoded, "All Characters Encoded", "success");
  }

  async function copyOutput() {
    if (!currentOutput.trim()) {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(currentOutput);
      setStatus("Copied", "success");
      showCopyMessage("HTML entity output copied!");
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
      showCopyMessage("HTML entity output copied!");
    } catch (error) {
      setStatus("Copy Failed", "error");
      showCopyMessage("Copy failed. Please try again.");
    }

    document.body.removeChild(tempTextarea);
  }

  function swapOutputToInput() {
    if (!currentOutput.trim()) {
      setStatus("Nothing to Swap", "warning");
      showCopyMessage("Nothing to swap.");
      return;
    }

    inputBox.value = currentOutput;
    updateStats(inputBox.value);

    setOutput("", "Output Moved to Input", "success");
  }

  function addSample() {
    inputBox.value = sampleHTML;
    updateStats(inputBox.value);
    setOutput("Sample added. Choose encode or decode.", "Sample Added", "success");
  }

  function clearTool() {
    inputBox.value = "";
    currentOutput = "";
    outputBox.textContent = "Your converted output will appear here.";

    updateStats("");
    setStatus("Ready");
  }

  if (inputBox) {
    inputBox.addEventListener("input", () => {
      updateStats(inputBox.value);

      if (!inputBox.value.trim()) {
        currentOutput = "";
        outputBox.textContent = "Your converted output will appear here.";
        setStatus("Ready");
      } else {
        setStatus("Typing...");
      }
    });
  }

  if (sampleBtn) sampleBtn.addEventListener("click", addSample);
  if (copyBtn) copyBtn.addEventListener("click", copyOutput);
  if (encodeBtn) encodeBtn.addEventListener("click", encodeHTML);
  if (decodeBtn) decodeBtn.addEventListener("click", decodeHTML);
  if (encodeAllBtn) encodeAllBtn.addEventListener("click", encodeAllHTML);
  if (swapBtn) swapBtn.addEventListener("click", swapOutputToInput);
  if (clearBtn) clearBtn.addEventListener("click", clearTool);

  updateStats("");
});