/* ================================
   DevToolKit - Regex Tester
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const regexStatus = document.getElementById("regex-status");

  const regexPattern = document.getElementById("regex-pattern");
  const regexTestText = document.getElementById("regex-test-text");

  const flagG = document.getElementById("flag-g");
  const flagI = document.getElementById("flag-i");
  const flagM = document.getElementById("flag-m");
  const flagS = document.getElementById("flag-s");
  const flagU = document.getElementById("flag-u");

  const regexPreview = document.getElementById("regex-preview");
  const regexMatchesList = document.getElementById("regex-matches-list");
  const regexMatchCount = document.getElementById("regex-match-count");
  const regexActiveFlags = document.getElementById("regex-active-flags");

  const testBtn = document.getElementById("test-regex-btn");
  const copyPatternBtn = document.getElementById("copy-regex-btn");
  const clearBtn = document.getElementById("clear-regex-btn");
  const copyResultBtn = document.getElementById("copy-regex-result-btn");
  const sampleBtn = document.getElementById("sample-regex-btn");
  const exampleCards = document.querySelectorAll(".regex-example-card");

  function setStatus(message, type = "default") {
    if (!regexStatus) return;

    regexStatus.textContent = message;
    regexStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") regexStatus.classList.add("status-success");
    if (type === "error") regexStatus.classList.add("status-error");
    if (type === "warning") regexStatus.classList.add("status-warning");
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

  function escapeHTML(text) {
    return text.replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return entities[char];
    });
  }

  function getFlags() {
    let flags = "";

    if (flagG.checked) flags += "g";
    if (flagI.checked) flags += "i";
    if (flagM.checked) flags += "m";
    if (flagS.checked) flags += "s";
    if (flagU.checked) flags += "u";

    return flags;
  }

  function updateActiveFlags() {
    const flags = getFlags();

    regexActiveFlags.textContent = flags || "none";
  }

  function setFlags(flags) {
    flagG.checked = flags.includes("g");
    flagI.checked = flags.includes("i");
    flagM.checked = flags.includes("m");
    flagS.checked = flags.includes("s");
    flagU.checked = flags.includes("u");

    updateActiveFlags();
  }

  function buildPatternText() {
    const pattern = regexPattern.value.trim();
    const flags = getFlags();

    if (!pattern) return "";

    return `/${pattern}/${flags}`;
  }

  function clearMatches() {
    regexMatchCount.textContent = "0";
    regexMatchesList.innerHTML = `<span class="empty-match">No matches yet.</span>`;
  }

  function renderMatchesList(matches) {
    if (!matches.length) {
      regexMatchesList.innerHTML = `<span class="empty-match">No matches found.</span>`;
      return;
    }

    regexMatchesList.innerHTML = matches
      .map((match, index) => {
        return `<span class="regex-match-chip">${index + 1}. ${escapeHTML(match)}</span>`;
      })
      .join("");
  }

  function testRegex() {
    const pattern = regexPattern.value.trim();
    const text = regexTestText.value;

    updateActiveFlags();

    if (!pattern) {
      regexPreview.textContent = "Please enter a regex pattern first.";
      clearMatches();
      setStatus("Pattern Required", "warning");
      return;
    }

    if (!text.trim()) {
      regexPreview.textContent = "Please enter test text first.";
      clearMatches();
      setStatus("Text Required", "warning");
      return;
    }

    try {
      const flags = getFlags();
      const safeFlags = flags.includes("g") ? flags : `${flags}g`;
      const regex = new RegExp(pattern, safeFlags);

      const matches = [];
      let highlightedHTML = "";
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(text)) !== null) {
        const matchedText = match[0];

        matches.push(matchedText);

        highlightedHTML += escapeHTML(text.slice(lastIndex, match.index));
        highlightedHTML += `<mark class="regex-highlight">${escapeHTML(matchedText)}</mark>`;

        lastIndex = match.index + matchedText.length;

        if (matchedText === "") {
          regex.lastIndex++;
        }
      }

      highlightedHTML += escapeHTML(text.slice(lastIndex));

      regexPreview.innerHTML = highlightedHTML || escapeHTML(text);
      regexMatchCount.textContent = String(matches.length);
      renderMatchesList(matches);

      if (matches.length > 0) {
        setStatus(`${matches.length} Match${matches.length > 1 ? "es" : ""}`, "success");
      } else {
        setStatus("No Matches", "warning");
      }
    } catch (error) {
      regexPreview.textContent = `Invalid Regex\n\n${error.message}`;
      clearMatches();
      setStatus("Invalid Regex", "error");
    }
  }

  async function copyText(text, successMessage) {
    if (!text.trim()) {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied", "success");
      showCopyMessage(successMessage);
    } catch (error) {
      fallbackCopy(text, successMessage);
    }

    setTimeout(() => {
      setStatus("Ready");
    }, 3000);
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
      setStatus("Copied", "success");
      showCopyMessage(successMessage);
    } catch (error) {
      setStatus("Copy Failed", "error");
      showCopyMessage("Copy failed. Please try again.");
    }

    document.body.removeChild(tempTextarea);
  }

  function copyPattern() {
    const patternText = buildPatternText();

    copyText(patternText, "Regex pattern copied!");
  }

  function copyResults() {
    const resultText = regexMatchesList.innerText.trim();

    if (!resultText || resultText === "No matches yet." || resultText === "No matches found.") {
      setStatus("No Results", "warning");
      showCopyMessage("No results to copy.");
      return;
    }

    copyText(resultText, "Regex results copied!");
  }

  function clearRegexTool() {
    regexPattern.value = "";
    regexTestText.value = "";

    setFlags("g");

    regexPreview.textContent = "Your highlighted result will appear here.";
    clearMatches();

    setStatus("Ready");
  }

  function addSampleRegex() {
    regexPattern.value = "\\d+";
    setFlags("g");

    regexTestText.value = `Order ID: 2456
Invoice Number: 98231
User: Arjumand Ali
Total Price: 4500 PKR`;

    testRegex();
    setStatus("Sample Added", "success");
  }

  function applyExample(card) {
    const pattern = card.dataset.pattern || "";
    const flags = card.dataset.flags || "g";

    regexPattern.value = pattern;
    setFlags(flags);

    if (!regexTestText.value.trim()) {
      regexTestText.value = `Contact me at arjumand@example.com
Visit https://devtoolkit.vercel.app
Order number is 2456
Primary color is #7C3AED`;
    }

    testRegex();
    setStatus("Example Applied", "success");
  }

  const flagInputs = [flagG, flagI, flagM, flagS, flagU];

  flagInputs.forEach((flag) => {
    if (!flag) return;

    flag.addEventListener("change", testRegex);
  });

  if (regexPattern) {
    regexPattern.addEventListener("input", testRegex);

    regexPattern.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        testRegex();
      }
    });
  }

  if (regexTestText) {
    regexTestText.addEventListener("input", testRegex);
  }

  if (testBtn) {
    testBtn.addEventListener("click", testRegex);
  }

  if (copyPatternBtn) {
    copyPatternBtn.addEventListener("click", copyPattern);
  }

  if (copyResultBtn) {
    copyResultBtn.addEventListener("click", copyResults);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearRegexTool);
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", addSampleRegex);
  }

  exampleCards.forEach((card) => {
    card.addEventListener("click", () => {
      applyExample(card);
    });
  });

  updateActiveFlags();
  clearMatches();
});