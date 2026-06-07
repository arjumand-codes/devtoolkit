/* ================================
   DevToolKit - Meta Tags Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const metaStatus = document.getElementById("meta-status");

  const siteNameInput = document.getElementById("meta-site-name");
  const titleInput = document.getElementById("meta-title");
  const descriptionInput = document.getElementById("meta-description");
  const urlInput = document.getElementById("meta-url");
  const imageInput = document.getElementById("meta-image");
  const authorInput = document.getElementById("meta-author");
  const robotsInput = document.getElementById("meta-robots");

  const titleCount = document.getElementById("meta-title-count");
  const descriptionCount = document.getElementById("meta-description-count");

  const metaOutput = document.getElementById("meta-output");

  const searchPreviewUrl = document.getElementById("search-preview-url");
  const searchPreviewTitle = document.getElementById("search-preview-title");
  const searchPreviewDescription = document.getElementById("search-preview-description");

  const socialPreviewSite = document.getElementById("social-preview-site");
  const socialPreviewTitle = document.getElementById("social-preview-title");
  const socialPreviewDescription = document.getElementById("social-preview-description");
  const socialPreviewImage = document.getElementById("social-preview-image");

  const sampleBtn = document.getElementById("sample-meta-btn");
  const generateBtn = document.getElementById("generate-meta-btn");
  const copyBtn = document.getElementById("copy-meta-btn");
  const copyOutputBtn = document.getElementById("copy-meta-output-btn");
  const clearBtn = document.getElementById("clear-meta-btn");

  const defaultOutput = "<!-- Your generated meta tags will appear here -->";

  function setStatus(message, type = "default") {
    if (!metaStatus) return;

    metaStatus.textContent = message;
    metaStatus.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") metaStatus.classList.add("status-success");
    if (type === "error") metaStatus.classList.add("status-error");
    if (type === "warning") metaStatus.classList.add("status-warning");
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

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => {
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

  function getValue(input) {
    return input.value.trim();
  }

  function updateCounters() {
    const titleLength = getValue(titleInput).length;
    const descriptionLength = getValue(descriptionInput).length;

    titleCount.textContent = titleLength;
    descriptionCount.textContent = descriptionLength;

    titleCount.style.color = titleLength > 60 ? "#f87171" : "var(--accent)";
    descriptionCount.style.color = descriptionLength > 160 ? "#f87171" : "var(--accent)";
  }

  function updateSearchPreview() {
    const title = getValue(titleInput) || "Your SEO title will appear here";
    const description = getValue(descriptionInput) || "Your meta description preview will appear here.";
    const url = getValue(urlInput) || "example.com/page";

    searchPreviewTitle.textContent = title;
    searchPreviewDescription.textContent = description;
    searchPreviewUrl.textContent = url.replace(/^https?:\/\//, "");
  }

  function updateSocialPreview() {
    const siteName = getValue(siteNameInput) || "DevToolKit";
    const title = getValue(titleInput) || "Your social title will appear here";
    const description = getValue(descriptionInput) || "Your social description preview will appear here.";
    const image = getValue(imageInput);

    socialPreviewSite.textContent = siteName;
    socialPreviewTitle.textContent = title;
    socialPreviewDescription.textContent = description;

    if (image) {
      socialPreviewImage.style.backgroundImage = `url("${image}")`;
      socialPreviewImage.innerHTML = "";
    } else {
      socialPreviewImage.style.backgroundImage = "";
      socialPreviewImage.innerHTML = "<span>OG Image</span>";
    }
  }

  function updatePreviews() {
    updateCounters();
    updateSearchPreview();
    updateSocialPreview();
  }

  function validateInputs() {
    const title = getValue(titleInput);
    const description = getValue(descriptionInput);
    const url = getValue(urlInput);

    if (!title) {
      setStatus("Title Required", "warning");
      return false;
    }

    if (!description) {
      setStatus("Description Required", "warning");
      return false;
    }

    if (!url) {
      setStatus("URL Required", "warning");
      return false;
    }

    return true;
  }

  function buildMetaTags() {
    const siteName = getValue(siteNameInput) || "Website";
    const title = getValue(titleInput);
    const description = getValue(descriptionInput);
    const url = getValue(urlInput);
    const image = getValue(imageInput);
    const author = getValue(authorInput) || "Website Author";
    const robots = getValue(robotsInput) || "index, follow";

    const safeSiteName = escapeHTML(siteName);
    const safeTitle = escapeHTML(title);
    const safeDescription = escapeHTML(description);
    const safeUrl = escapeHTML(url);
    const safeImage = escapeHTML(image);
    const safeAuthor = escapeHTML(author);
    const safeRobots = escapeHTML(robots);

    return `<!-- Primary Meta Tags -->
<title>${safeTitle}</title>
<meta name="description" content="${safeDescription}" />
<meta name="author" content="${safeAuthor}" />
<meta name="robots" content="${safeRobots}" />
<link rel="canonical" href="${safeUrl}" />

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${safeSiteName}" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDescription}" />
<meta property="og:url" content="${safeUrl}" />${safeImage ? `
<meta property="og:image" content="${safeImage}" />` : ""}

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDescription}" />${safeImage ? `
<meta name="twitter:image" content="${safeImage}" />` : ""}`;
  }

  function generateMetaTags() {
    updatePreviews();

    if (!validateInputs()) return;

    const tags = buildMetaTags();

    metaOutput.textContent = tags;
    setStatus("Meta Tags Ready", "success");
  }

  async function copyText(text, successMessage) {
    if (!text.trim() || text.trim() === defaultOutput) {
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

  function copyMetaTags() {
    const outputText = metaOutput.textContent.trim();

    copyText(outputText, "Meta tags copied successfully!");
  }

  function clearMetaTool() {
    siteNameInput.value = "";
    titleInput.value = "";
    descriptionInput.value = "";
    urlInput.value = "";
    imageInput.value = "";
    authorInput.value = "";
    robotsInput.value = "index, follow";

    metaOutput.textContent = defaultOutput;

    updatePreviews();
    setStatus("Ready");
  }

  function addSampleMeta() {
    siteNameInput.value = "DevToolKit";
    titleInput.value = "DevToolKit - Free Online Developer Tools";
    descriptionInput.value = "Free online tools for developers, designers, and creators. Format JSON, test regex, generate CSS, preview Markdown, and build faster.";
    urlInput.value = "https://devtoolkit.vercel.app/";
    imageInput.value = "https://devtoolkit.vercel.app/assets/images/og-image.png";
    authorInput.value = "Arjumand Ali";
    robotsInput.value = "index, follow";

    generateMetaTags();
    setStatus("Sample Added", "success");
  }

  const liveInputs = [
    siteNameInput,
    titleInput,
    descriptionInput,
    urlInput,
    imageInput,
    authorInput,
    robotsInput
  ];

  liveInputs.forEach((input) => {
    if (!input) return;

    input.addEventListener("input", () => {
      updatePreviews();

      if (getValue(titleInput) && getValue(descriptionInput) && getValue(urlInput)) {
        generateMetaTags();
      } else {
        setStatus("Typing...");
      }
    });

    input.addEventListener("change", updatePreviews);
  });

  if (sampleBtn) {
    sampleBtn.addEventListener("click", addSampleMeta);
  }

  if (generateBtn) {
    generateBtn.addEventListener("click", generateMetaTags);
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyMetaTags);
  }

  if (copyOutputBtn) {
    copyOutputBtn.addEventListener("click", copyMetaTags);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearMetaTool);
  }

  updatePreviews();
});


