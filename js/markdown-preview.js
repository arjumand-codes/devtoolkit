/* ================================
   DevToolKit - Markdown Previewer
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const markdownStatus = document.getElementById("markdown-status");

  const markdownInput = document.getElementById("markdown-input");
  const markdownPreview = document.getElementById("markdown-preview");

  const wordCount = document.getElementById("markdown-word-count");
  const charCount = document.getElementById("markdown-char-count");
  const lineCount = document.getElementById("markdown-line-count");

  const previewBtn = document.getElementById("preview-markdown-btn");
  const copyMarkdownBtn = document.getElementById("copy-markdown-btn");
  const copyHTMLBtn = document.getElementById("copy-html-btn");
  const clearBtn = document.getElementById("clear-markdown-btn");
  const sampleBtn = document.getElementById("sample-markdown-btn");

  const sampleMarkdown = `# DevToolKit

A modern collection of **free online developer tools**.

## Features

- JSON Formatter
- Regex Tester
- URL Tools
- Markdown Previewer
- CSS Tools
- Image Tools

## Code Example

\`\`\`js
const project = "DevToolKit";
console.log(project);
\`\`\`

## Link

[Visit GitHub](https://github.com/arjumand-codes)

> Build faster with simple browser-based tools.`;

  function setStatus(message, type = "default") {
    if (!markdownStatus) return;

    markdownStatus.textContent = message;
    markdownStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") markdownStatus.classList.add("status-success");
    if (type === "error") markdownStatus.classList.add("status-error");
    if (type === "warning") markdownStatus.classList.add("status-warning");
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

  function updateStats(markdown) {
    const trimmed = markdown.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = markdown.length;
    const lines = markdown ? markdown.split("\n").length : 0;

    wordCount.textContent = words;
    charCount.textContent = chars;
    lineCount.textContent = lines;
  }

  function parseInlineMarkdown(text) {
    let html = escapeHTML(text);

    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, `<img src="$2" alt="$1" />`);
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>`);
    html = html.replace(/\*\*([^*]+)\*\*/g, `<strong>$1</strong>`);
    html = html.replace(/\*([^*]+)\*/g, `<em>$1</em>`);
    html = html.replace(/`([^`]+)`/g, `<code>$1</code>`);

    return html;
  }

  function parseMarkdown(markdown) {
    if (!markdown.trim()) {
      return "<p>Your Markdown preview will appear here.</p>";
    }

    const lines = markdown.split("\n");
    const html = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let inUl = false;
    let inOl = false;
    let inBlockquote = false;
    let blockquoteBuffer = [];

    function closeLists() {
      if (inUl) {
        html.push("</ul>");
        inUl = false;
      }

      if (inOl) {
        html.push("</ol>");
        inOl = false;
      }
    }

    function closeBlockquote() {
      if (inBlockquote) {
        html.push(`<blockquote>${blockquoteBuffer.join("")}</blockquote>`);
        blockquoteBuffer = [];
        inBlockquote = false;
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        closeLists();
        closeBlockquote();

        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBuffer = [];
        } else {
          inCodeBlock = false;
          html.push(`<pre><code>${escapeHTML(codeBuffer.join("\n"))}</code></pre>`);
          codeBuffer = [];
        }

        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (!trimmed) {
        closeLists();
        closeBlockquote();
        return;
      }

      if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
        closeLists();
        closeBlockquote();
        html.push("<hr />");
        return;
      }

      if (trimmed.startsWith(">")) {
        closeLists();

        inBlockquote = true;
        const quoteText = trimmed.replace(/^>\s?/, "");
        blockquoteBuffer.push(`<p>${parseInlineMarkdown(quoteText)}</p>`);
        return;
      }

      closeBlockquote();

      if (/^#{1,6}\s/.test(trimmed)) {
        closeLists();

        const level = trimmed.match(/^#{1,6}/)[0].length;
        const content = trimmed.replace(/^#{1,6}\s/, "");

        html.push(`<h${level}>${parseInlineMarkdown(content)}</h${level}>`);
        return;
      }

      if (/^[-*+]\s/.test(trimmed)) {
        if (!inUl) {
          closeLists();
          html.push("<ul>");
          inUl = true;
        }

        const content = trimmed.replace(/^[-*+]\s/, "");
        html.push(`<li>${parseInlineMarkdown(content)}</li>`);
        return;
      }

      if (/^\d+\.\s/.test(trimmed)) {
        if (!inOl) {
          closeLists();
          html.push("<ol>");
          inOl = true;
        }

        const content = trimmed.replace(/^\d+\.\s/, "");
        html.push(`<li>${parseInlineMarkdown(content)}</li>`);
        return;
      }

      closeLists();
      html.push(`<p>${parseInlineMarkdown(trimmed)}</p>`);
    });

    if (inCodeBlock) {
      html.push(`<pre><code>${escapeHTML(codeBuffer.join("\n"))}</code></pre>`);
    }

    closeLists();
    closeBlockquote();

    return html.join("");
  }

  function previewMarkdown() {
    const markdown = markdownInput.value;
    const html = parseMarkdown(markdown);

    markdownPreview.innerHTML = html;
    updateStats(markdown);

    if (markdown.trim()) {
      setStatus("Preview Updated", "success");
    } else {
      setStatus("Ready");
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

  function copyMarkdown() {
    copyText(markdownInput.value, "Markdown copied successfully!");
  }

  function copyHTML() {
    const html = markdownPreview.innerHTML.trim();

    if (!markdownInput.value.trim()) {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Nothing to copy.");
      return;
    }

    copyText(html, "HTML copied successfully!");
  }

  function clearMarkdown() {
    markdownInput.value = "";
    markdownPreview.innerHTML = "<p>Your Markdown preview will appear here.</p>";
    updateStats("");
    setStatus("Ready");
  }

  function addSampleMarkdown() {
    markdownInput.value = sampleMarkdown;
    previewMarkdown();
    setStatus("Sample Added", "success");
  }

  if (markdownInput) {
    markdownInput.addEventListener("input", previewMarkdown);

    markdownInput.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        previewMarkdown();
      }
    });
  }

  if (previewBtn) {
    previewBtn.addEventListener("click", previewMarkdown);
  }

  if (copyMarkdownBtn) {
    copyMarkdownBtn.addEventListener("click", copyMarkdown);
  }

  if (copyHTMLBtn) {
    copyHTMLBtn.addEventListener("click", copyHTML);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearMarkdown);
  }

  if (sampleBtn) {
    sampleBtn.addEventListener("click", addSampleMarkdown);
  }

  updateStats("");
});