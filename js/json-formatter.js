/* ================================
   DevToolKit - JSON Formatter
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const jsonInput = document.getElementById("json-input");
  const jsonOutput = document.getElementById("json-output");
  const jsonStatus = document.getElementById("json-status");
  const jsonSize = document.getElementById("json-size");
  const jsonLines = document.getElementById("json-lines");

  const formatBtn = document.getElementById("format-json-btn");
  const minifyBtn = document.getElementById("minify-json-btn");
  const clearBtn = document.getElementById("clear-json-btn");
  const copyBtn = document.getElementById("copy-json-btn");
  const sampleBtn = document.getElementById("sample-json-btn");

  const sampleJSON = {
    project: "DevToolKit",
    tool: "JSON Formatter",
    author: "Arjumand Ali",
    version: "1.0.0",
    features: [
      "Format JSON",
      "Minify JSON",
      "Validate JSON",
      "Copy Output",
      "Clear Data"
    ],
    status: "ready"
  };

  function setStatus(message, type = "default") {
    if (!jsonStatus) return;

    jsonStatus.textContent = message;

    jsonStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") {
      jsonStatus.classList.add("status-success");
    }

    if (type === "error") {
      jsonStatus.classList.add("status-error");
    }

    if (type === "warning") {
      jsonStatus.classList.add("status-warning");
    }
  }

  function getInputValue() {
    return jsonInput.value.trim();
  }

  function parseJSON(value) {
    return JSON.parse(value);
  }

  function updateOutputMeta(outputText) {
    const bytes = new Blob([outputText]).size;
    const kb = bytes / 1024;
    const lines = outputText ? outputText.split("\n").length : 0;

    if (jsonSize) {
      jsonSize.textContent = `Size: ${kb.toFixed(2)} KB`;
    }

    if (jsonLines) {
      jsonLines.textContent = `Lines: ${lines}`;
    }
  }

  function setOutput(outputText) {
    jsonOutput.textContent = outputText;
    updateOutputMeta(outputText);
  }

  function showError(error) {
    const errorMessage = `Invalid JSON

${error.message}

Please check your JSON syntax and try again.`;

    setOutput(errorMessage);
    setStatus("Invalid JSON", "error");
  }

  function formatJSON() {
    const value = getInputValue();

    if (!value) {
      setOutput("Please paste JSON first.");
      setStatus("Input Required", "warning");
      return;
    }

    try {
      const parsedJSON = parseJSON(value);
      const formattedJSON = JSON.stringify(parsedJSON, null, 2);

      setOutput(formattedJSON);
      setStatus("Valid JSON", "success");
    } catch (error) {
      showError(error);
    }
  }

  function minifyJSON() {
    const value = getInputValue();

    if (!value) {
      setOutput("Please paste JSON first.");
      setStatus("Input Required", "warning");
      return;
    }

    try {
      const parsedJSON = parseJSON(value);
      const minifiedJSON = JSON.stringify(parsedJSON);

      setOutput(minifiedJSON);
      setStatus("JSON Minified", "success");
    } catch (error) {
      showError(error);
    }
  }

  function clearJSON() {
    jsonInput.value = "";
    setOutput(`{
  "message": "Your formatted JSON will appear here"
}`);
    updateOutputMeta("");
    setStatus("Ready");
  }

  async function copyOutput() {
    const outputText = jsonOutput.textContent.trim();

    if (!outputText || outputText.includes("Your formatted JSON will appear here")) {
      setStatus("Nothing to Copy", "warning");
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      setStatus("Copied", "success");

      setTimeout(() => {
        setStatus("Ready");
      }, 1600);
    } catch (error) {
      fallbackCopy(outputText);
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
      setStatus("Copied", "success");
    } catch (error) {
      setStatus("Copy Failed", "error");
    }

    document.body.removeChild(tempTextarea);

    setTimeout(() => {
      setStatus("Ready");
    }, 1600);
  }

  function addSampleJSON() {
    const sampleText = JSON.stringify(sampleJSON);

    jsonInput.value = sampleText;
    setOutput(`{
  "message": "Click Format JSON to beautify the sample"
}`);
    updateOutputMeta("");
    setStatus("Sample Added", "success");
  }

  function autoValidateWhileTyping() {
    const value = getInputValue();

    if (!value) {
      setStatus("Ready");
      return;
    }

    try {
      parseJSON(value);
      setStatus("Valid JSON", "success");
    } catch (error) {
      setStatus("Typing...");
    }
  }

  if (formatBtn) {
    formatBtn.addEventListener("click", formatJSON);
  }

  if (minifyBtn) {
    minifyBtn.addEventListener("click", minifyJSON);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearJSON);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyOutput);
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", addSampleJSON);
  }

  if (jsonInput) {
    jsonInput.addEventListener("input", autoValidateWhileTyping);

    jsonInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        formatJSON();
      }
    });
  }

  updateOutputMeta("");
});