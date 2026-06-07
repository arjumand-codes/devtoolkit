/* ================================
   DevToolKit - Lorem Ipsum Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("lorem-status");

  const loremType = document.getElementById("lorem-type");
  const loremAmount = document.getElementById("lorem-amount");
  const loremAmountValue = document.getElementById("lorem-amount-value");
  const loremSize = document.getElementById("lorem-size");

  const startWithLorem = document.getElementById("start-with-lorem");
  const includeHtmlTags = document.getElementById("include-html-tags");

  const outputBox = document.getElementById("lorem-output");
  const previewText = document.getElementById("lorem-preview-text");

  const wordCount = document.getElementById("lorem-word-count");
  const charCount = document.getElementById("lorem-char-count");
  const lineCount = document.getElementById("lorem-line-count");

  const generateBtn = document.getElementById("generate-lorem-btn");
  const copyBtn = document.getElementById("copy-lorem-btn");
  const copyMiniBtn = document.getElementById("copy-lorem-mini-btn");
  const clearBtn = document.getElementById("clear-lorem-btn");
  const sampleBtn = document.getElementById("sample-lorem-btn");

  let currentOutput = "";

  const loremWords = [
    "lorem",
    "ipsum",
    "dolor",
    "sit",
    "amet",
    "consectetur",
    "adipiscing",
    "elit",
    "sed",
    "do",
    "eiusmod",
    "tempor",
    "incididunt",
    "ut",
    "labore",
    "et",
    "dolore",
    "magna",
    "aliqua",
    "enim",
    "ad",
    "minim",
    "veniam",
    "quis",
    "nostrud",
    "exercitation",
    "ullamco",
    "laboris",
    "nisi",
    "aliquip",
    "ex",
    "ea",
    "commodo",
    "consequat",
    "duis",
    "aute",
    "irure",
    "reprehenderit",
    "voluptate",
    "velit",
    "esse",
    "cillum",
    "fugiat",
    "nulla",
    "pariatur",
    "excepteur",
    "sint",
    "occaecat",
    "cupidatat",
    "non",
    "proident",
    "sunt",
    "culpa",
    "officia",
    "deserunt",
    "mollit",
    "anim",
    "id",
    "est",
    "laborum"
  ];

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

  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomWord() {
    const index = Math.floor(Math.random() * loremWords.length);
    return loremWords[index];
  }

  function capitalize(value) {
    if (!value) return "";

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function getSentenceWordCount() {
    if (loremSize.value === "short") return getRandomNumber(6, 10);
    if (loremSize.value === "long") return getRandomNumber(18, 28);

    return getRandomNumber(11, 17);
  }

  function getParagraphSentenceCount() {
    if (loremSize.value === "short") return getRandomNumber(2, 3);
    if (loremSize.value === "long") return getRandomNumber(6, 8);

    return getRandomNumber(4, 5);
  }

  function generateWords(count) {
    const words = [];

    for (let index = 0; index < count; index++) {
      words.push(getRandomWord());
    }

    return words;
  }

  function generateSentence(forceLoremStart = false) {
    const wordTotal = getSentenceWordCount();
    let words = generateWords(wordTotal);

    if (forceLoremStart) {
      const loremStart = ["lorem", "ipsum", "dolor", "sit", "amet"];
      words = [...loremStart, ...generateWords(Math.max(0, wordTotal - loremStart.length))];
    }

    return `${capitalize(words.join(" "))}.`;
  }

  function generateParagraph(forceLoremStart = false) {
    const sentenceTotal = getParagraphSentenceCount();
    const sentences = [];

    for (let index = 0; index < sentenceTotal; index++) {
      sentences.push(generateSentence(forceLoremStart && index === 0));
    }

    return sentences.join(" ");
  }

  function wrapWithHtml(type, contentItems) {
    if (type === "paragraphs") {
      return contentItems.map((paragraph) => `<p>${paragraph}</p>`).join("\n\n");
    }

    if (type === "sentences" || type === "words") {
      return `<p>${contentItems.join(" ")}</p>`;
    }

    if (type === "list") {
      const listItems = contentItems.map((item) => `  <li>${item}</li>`).join("\n");
      return `<ul>\n${listItems}\n</ul>`;
    }

    return contentItems.join("\n");
  }

  function generateLorem() {
    const type = loremType.value;
    const amount = Number(loremAmount.value);
    const shouldStartWithLorem = startWithLorem.checked;
    const shouldIncludeHtml = includeHtmlTags.checked;

    let result = "";
    let items = [];

    if (type === "paragraphs") {
      for (let index = 0; index < amount; index++) {
        items.push(generateParagraph(shouldStartWithLorem && index === 0));
      }

      result = shouldIncludeHtml ? wrapWithHtml(type, items) : items.join("\n\n");
    }

    if (type === "sentences") {
      for (let index = 0; index < amount; index++) {
        items.push(generateSentence(shouldStartWithLorem && index === 0));
      }

      result = shouldIncludeHtml ? wrapWithHtml(type, items) : items.join(" ");
    }

    if (type === "words") {
      items = generateWords(amount);

      if (shouldStartWithLorem && amount >= 5) {
        items.splice(0, 5, "lorem", "ipsum", "dolor", "sit", "amet");
      }

      result = shouldIncludeHtml ? wrapWithHtml(type, items) : items.join(" ");
    }

    if (type === "list") {
      for (let index = 0; index < amount; index++) {
        items.push(generateSentence(false).replace(/\.$/, ""));
      }

      if (shouldStartWithLorem && items.length > 0) {
        items[0] = "Lorem ipsum dolor sit amet";
      }

      result = shouldIncludeHtml
        ? wrapWithHtml(type, items)
        : items.map((item) => `- ${item}`).join("\n");
    }

    currentOutput = result;
    outputBox.textContent = result;

    updateStats(result);
    updatePreview(result);

    setStatus("Text Generated", "success");
  }

  function updateStats(value) {
    const trimmed = value.trim();
    const words = trimmed ? trimmed.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length : 0;
    const chars = value.length;
    const lines = value ? value.split("\n").length : 0;

    wordCount.textContent = words;
    charCount.textContent = chars;
    lineCount.textContent = lines;
  }

  function updatePreview(value) {
    const plainText = value
      .replace(/<[^>]*>/g, "")
      .replace(/^- /gm, "")
      .trim();

    if (!plainText) {
      previewText.textContent = "Generate placeholder text to see how it can look inside a real website content area.";
      return;
    }

    previewText.textContent = plainText.slice(0, 260) + (plainText.length > 260 ? "..." : "");
  }

  async function copyLorem() {
    if (!currentOutput.trim()) {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(currentOutput);
      setStatus("Copied", "success");
      showCopyMessage("Lorem text copied successfully!");
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
      showCopyMessage("Lorem text copied successfully!");
    } catch (error) {
      setStatus("Copy Failed", "error");
      showCopyMessage("Copy failed. Please try again.");
    }

    document.body.removeChild(tempTextarea);
  }

  function clearLorem() {
    currentOutput = "";

    outputBox.textContent = "Your generated placeholder text will appear here.";
    previewText.textContent = "Generate placeholder text to see how it can look inside a real website content area.";

    updateStats("");
    setStatus("Ready");
  }

  function addSampleSettings() {
    loremType.value = "paragraphs";
    loremAmount.value = 3;
    loremSize.value = "medium";
    startWithLorem.checked = true;
    includeHtmlTags.checked = false;

    updateAmountLabel();
    generateLorem();

    setStatus("Sample Added", "success");
  }

  function updateAmountLabel() {
    loremAmountValue.textContent = loremAmount.value;
  }

  if (loremAmount) {
    loremAmount.addEventListener("input", () => {
      updateAmountLabel();

      if (currentOutput) {
        generateLorem();
      }
    });
  }

  [loremType, loremSize, startWithLorem, includeHtmlTags].forEach((input) => {
    if (!input) return;

    input.addEventListener("change", () => {
      if (currentOutput) {
        generateLorem();
      }
    });
  });

  if (generateBtn) generateBtn.addEventListener("click", generateLorem);
  if (copyBtn) copyBtn.addEventListener("click", copyLorem);
  if (copyMiniBtn) copyMiniBtn.addEventListener("click", copyLorem);
  if (clearBtn) clearBtn.addEventListener("click", clearLorem);
  if (sampleBtn) sampleBtn.addEventListener("click", addSampleSettings);

  updateAmountLabel();
  updateStats("");
});