/* ================================
   DevToolKit - CSS Minifier / Beautifier
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("css-minifier-status");

  const cssInput = document.getElementById("css-input");
  const cssOutput = document.getElementById("css-output");

  const inputSize = document.getElementById("css-input-size");
  const inputLines = document.getElementById("css-input-lines");
  const inputRules = document.getElementById("css-input-rules");

  const outputSize = document.getElementById("css-output-size");
  const savedSize = document.getElementById("css-saved-size");
  const reductionPercent = document.getElementById("css-reduction-percent");

  const sampleBtn = document.getElementById("sample-css-btn");
  const copyBtn = document.getElementById("copy-css-output-btn");
  const minifyBtn = document.getElementById("minify-css-btn");
  const beautifyBtn = document.getElementById("beautify-css-btn");
  const removeCommentsBtn = document.getElementById("remove-css-comments-btn");
  const swapBtn = document.getElementById("swap-css-output-btn");
  const clearBtn = document.getElementById("clear-css-btn");

  let currentOutput = "";

  const sampleCSS = `/* DevToolKit sample CSS */
.card {
  padding: 24px;
  margin: 20px auto;
  color: #ffffff;
  background: linear-gradient(135deg, #4831d4, #ccf381);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

.card h2 {
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.1;
}

.card p {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.7;
}`;

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

  function formatBytes(bytes) {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }

    return `${(kb / 1024).toFixed(2)} MB`;
  }

  function getByteSize(value) {
    return new Blob([value]).size;
  }

  function countCssRules(value) {
    const clean = removeCssComments(value);
    const matches = clean.match(/{/g);

    return matches ? matches.length : 0;
  }

  function updateInputStats() {
    const value = cssInput.value;
    const lines = value ? value.split("\n").length : 0;

    inputSize.textContent = formatBytes(getByteSize(value));
    inputLines.textContent = lines;
    inputRules.textContent = countCssRules(value);
  }

  function updateOutputStats(output) {
    const inputBytes = getByteSize(cssInput.value);
    const outputBytes = getByteSize(output);

    const savedBytes = Math.max(0, inputBytes - outputBytes);
    const reduction = inputBytes > 0 ? Math.max(0, (savedBytes / inputBytes) * 100) : 0;

    outputSize.textContent = formatBytes(outputBytes);
    savedSize.textContent = formatBytes(savedBytes);
    reductionPercent.textContent = `${Math.round(reduction)}%`;
  }

  function setOutput(value, message = "Done", type = "success") {
    currentOutput = value;
    cssOutput.textContent = value || "Your converted CSS will appear here.";

    updateOutputStats(value);
    setStatus(message, type);
  }

  function checkInput() {
    const value = cssInput.value;

    if (!value.trim()) {
      setOutput("", "Input Required", "warning");
      showCopyMessage("Please enter CSS first.");
      return null;
    }

    return value;
  }

  function removeCssComments(value) {
    return value.replace(/\/\*[\s\S]*?\*\//g, "");
  }

  function minifyCSS() {
    const value = checkInput();
    if (value === null) return;

    const minified = removeCssComments(value)
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,>+~])\s*/g, "$1")
      .replace(/;}/g, "}")
      .replace(/\s*!important/g, "!important")
      .replace(/,\s+/g, ",")
      .replace(/\s+\{/g, "{")
      .trim();

    setOutput(minified, "CSS Minified", "success");
  }

  function beautifyCSS() {
    const value = checkInput();
    if (value === null) return;

    const withoutComments = removeCssComments(value);

    let beautified = withoutComments
      .replace(/\s*{\s*/g, " {\n  ")
      .replace(/;\s*/g, ";\n  ")
      .replace(/\s*}\s*/g, "\n}\n\n")
      .replace(/,\s*/g, ", ")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();

    beautified = beautified
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed) return "";

        if (trimmed === "}") return "}";

        if (trimmed.endsWith("{")) return trimmed;

        if (trimmed.includes(":") || trimmed.endsWith(";")) {
          return `  ${trimmed}`;
        }

        return trimmed;
      })
      .join("\n")
      .replace(/\n\s+}/g, "\n}");

    setOutput(beautified, "CSS Beautified", "success");
  }

  function removeCommentsOnly() {
    const value = checkInput();
    if (value === null) return;

    const cleaned = removeCssComments(value)
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();

    setOutput(cleaned, "Comments Removed", "success");
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
      showCopyMessage("CSS output copied successfully!");
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
      showCopyMessage("CSS output copied successfully!");
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

    cssInput.value = currentOutput;
    currentOutput = "";
    cssOutput.textContent = "Your converted CSS will appear here.";

    updateInputStats();
    updateOutputStats("");

    setStatus("Output Moved to Input", "success");
  }

  function addSampleCSS() {
    cssInput.value = sampleCSS;

    updateInputStats();
    setOutput("Sample added. Choose minify, beautify, or remove comments.", "Sample Added", "success");
  }

  function clearTool() {
    cssInput.value = "";
    currentOutput = "";
    cssOutput.textContent = "Your converted CSS will appear here.";

    updateInputStats();
    updateOutputStats("");

    setStatus("Ready");
  }

  if (cssInput) {
    cssInput.addEventListener("input", () => {
      updateInputStats();

      if (!cssInput.value.trim()) {
        currentOutput = "";
        cssOutput.textContent = "Your converted CSS will appear here.";
        updateOutputStats("");
        setStatus("Ready");
      } else {
        setStatus("Typing...");
      }
    });
  }

  if (sampleBtn) sampleBtn.addEventListener("click", addSampleCSS);
  if (copyBtn) copyBtn.addEventListener("click", copyOutput);
  if (minifyBtn) minifyBtn.addEventListener("click", minifyCSS);
  if (beautifyBtn) beautifyBtn.addEventListener("click", beautifyCSS);
  if (removeCommentsBtn) removeCommentsBtn.addEventListener("click", removeCommentsOnly);
  if (swapBtn) swapBtn.addEventListener("click", swapOutputToInput);
  if (clearBtn) clearBtn.addEventListener("click", clearTool);

  updateInputStats();
  updateOutputStats("");
});