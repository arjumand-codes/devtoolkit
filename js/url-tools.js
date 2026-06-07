/* ================================
   DevToolKit - URL Tools
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById("url-input");
  const urlOutput = document.getElementById("url-output");
  const urlStatus = document.getElementById("url-status");
  const urlChars = document.getElementById("url-chars");
  const urlWords = document.getElementById("url-words");

  const encodeBtn = document.getElementById("url-encode-btn");
  const decodeBtn = document.getElementById("url-decode-btn");
  const slugBtn = document.getElementById("slug-generate-btn");
  const base64EncodeBtn = document.getElementById("base64-encode-btn");
  const base64DecodeBtn = document.getElementById("base64-decode-btn");
  const clearBtn = document.getElementById("clear-url-btn");
  const copyBtn = document.getElementById("copy-url-btn");
  const sampleBtn = document.getElementById("sample-url-btn");

  function setStatus(message, type = "default") {
    if (!urlStatus) return;

    urlStatus.textContent = message;
    urlStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") {
      urlStatus.classList.add("status-success");
    }

    if (type === "error") {
      urlStatus.classList.add("status-error");
    }

    if (type === "warning") {
      urlStatus.classList.add("status-warning");
    }
  }

  function getInputValue() {
    return urlInput.value.trim();
  }

  function updateMeta(text) {
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    if (urlChars) {
      urlChars.textContent = `Characters: ${characters}`;
    }

    if (urlWords) {
      urlWords.textContent = `Words: ${words}`;
    }
  }

  function setOutput(text) {
    urlOutput.textContent = text;
    updateMeta(text);
  }

  function checkInput() {
    const value = getInputValue();

    if (!value) {
      setOutput("Please enter text first.");
      setStatus("Input Required", "warning");
      return null;
    }

    return value;
  }

  function encodeURL() {
    const value = checkInput();
    if (!value) return;

    try {
      const result = encodeURIComponent(value);
      setOutput(result);
      setStatus("URL Encoded", "success");
    } catch (error) {
      setOutput(`Encoding failed: ${error.message}`);
      setStatus("Encode Failed", "error");
    }
  }

  function decodeURL() {
    const value = checkInput();
    if (!value) return;

    try {
      const result = decodeURIComponent(value);
      setOutput(result);
      setStatus("URL Decoded", "success");
    } catch (error) {
      setOutput(`Invalid encoded URL text.\n\n${error.message}`);
      setStatus("Decode Failed", "error");
    }
  }

  function generateSlug() {
    const value = checkInput();
    if (!value) return;

    const result = value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!result) {
      setOutput("Could not generate a slug from this input.");
      setStatus("Slug Failed", "error");
      return;
    }

    setOutput(result);
    setStatus("Slug Generated", "success");
  }

  function base64Encode() {
    const value = checkInput();
    if (!value) return;

    try {
      const result = btoa(unescape(encodeURIComponent(value)));
      setOutput(result);
      setStatus("Base64 Encoded", "success");
    } catch (error) {
      setOutput(`Base64 encoding failed: ${error.message}`);
      setStatus("Encode Failed", "error");
    }
  }

  function base64Decode() {
    const value = checkInput();
    if (!value) return;

    try {
      const result = decodeURIComponent(escape(atob(value)));
      setOutput(result);
      setStatus("Base64 Decoded", "success");
    } catch (error) {
      setOutput("Invalid Base64 text. Please check your input and try again.");
      setStatus("Decode Failed", "error");
    }
  }

  function clearTool() {
    urlInput.value = "";
    setOutput("Your result will appear here.");
    updateMeta("");
    setStatus("Ready");
  }

  function addSample() {
    const sampleText = "My New DevToolKit Project Website";

    urlInput.value = sampleText;
    setOutput("Sample added. Choose an action to generate output.");
    updateMeta("");
    setStatus("Sample Added", "success");
  }

  async function copyOutput() {
    const outputText = urlOutput.textContent.trim();

    if (!outputText || outputText === "Your result will appear here.") {
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

  function liveTypingStatus() {
    const value = getInputValue();

    if (!value) {
      setStatus("Ready");
      return;
    }

    updateMeta(value);
    setStatus("Typing...");
  }

  if (encodeBtn) {
    encodeBtn.addEventListener("click", encodeURL);
  }

  if (decodeBtn) {
    decodeBtn.addEventListener("click", decodeURL);
  }

  if (slugBtn) {
    slugBtn.addEventListener("click", generateSlug);
  }

  if (base64EncodeBtn) {
    base64EncodeBtn.addEventListener("click", base64Encode);
  }

  if (base64DecodeBtn) {
    base64DecodeBtn.addEventListener("click", base64Decode);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearTool);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyOutput);
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", addSample);
  }

  if (urlInput) {
    urlInput.addEventListener("input", liveTypingStatus);

    urlInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        encodeURL();
      }
    });
  }

  updateMeta("");
});