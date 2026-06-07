/* ================================
   DevToolKit - Favicon Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("favicon-status");

  const imageInput = document.getElementById("favicon-image-input");
  const uploadBox = document.getElementById("favicon-upload-box");

  const fileName = document.getElementById("favicon-file-name");
  const fileSize = document.getElementById("favicon-file-size");

  const bgColor = document.getElementById("favicon-bg-color");
  const bgColorText = document.getElementById("favicon-bg-color-text");

  const paddingInput = document.getElementById("favicon-padding");
  const paddingValue = document.getElementById("favicon-padding-value");

  const shapeInput = document.getElementById("favicon-shape");
  const sizeCheckboxes = document.querySelectorAll(".favicon-size-checkbox");

  const sourcePreview = document.getElementById("favicon-source-preview");
  const sourceInfo = document.getElementById("favicon-source-info");

  const fakeTabIcon = document.getElementById("fake-tab-icon");
  const outputGrid = document.getElementById("favicon-output-grid");
  const htmlOutput = document.getElementById("favicon-html-output");

  const generateBtn = document.getElementById("generate-favicon-btn");
  const downloadBtn = document.getElementById("download-favicon-btn");
  const copyHtmlBtn = document.getElementById("copy-favicon-html-btn");
  const clearBtn = document.getElementById("clear-favicon-btn");

  let selectedFile = null;
  let sourceImage = null;
  let generatedIcons = [];

  const defaultHTML = "<!-- Favicon HTML tags will appear here -->";

  function setStatus(message, type = "default") {
    if (!statusBox) return;

    statusBox.textContent = message;
    statusBox.classList.remove("status-success", "status-error", "status-warning");

    if (type === "success") statusBox.classList.add("status-success");
    if (type === "error") statusBox.classList.add("status-error");
    if (type === "warning") statusBox.classList.add("status-warning");
  }

  function showCopyMessage(message = "Done successfully!") {
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

  function formatFileSize(bytes) {
    if (!bytes && bytes !== 0) return "0 KB";

    const kb = bytes / 1024;
    const mb = kb / 1024;

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${kb.toFixed(2)} KB`;
  }

  function isValidHex(value) {
    return /^#([0-9A-F]{3}){1,2}$/i.test(value.trim());
  }

  function normalizeHex(value) {
    const trimmed = value.trim();

    if (!trimmed.startsWith("#")) {
      return `#${trimmed}`;
    }

    return trimmed;
  }

  function updatePaddingLabel() {
    paddingValue.textContent = `${paddingInput.value}%`;
  }

  function updateBgColorFromPicker() {
    bgColorText.value = bgColor.value;

    if (generatedIcons.length) {
      generateFavicons();
    }
  }

  function updateBgColorFromText() {
    const value = normalizeHex(bgColorText.value);

    if (!isValidHex(value)) {
      setStatus("Invalid HEX", "error");
      showCopyMessage("Please enter a valid HEX color.");
      return;
    }

    bgColor.value = value;
    bgColorText.value = value;

    if (generatedIcons.length) {
      generateFavicons();
    }

    setStatus("Color Updated", "success");
  }

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load this image."));
      };

      image.src = url;
    });
  }

  function renderSourcePreview(file, image) {
    const previewURL = URL.createObjectURL(file);

    sourcePreview.innerHTML = "";

    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = "Uploaded favicon source preview";

    img.onload = () => {
      URL.revokeObjectURL(previewURL);
    };

    sourcePreview.appendChild(img);

    fileName.textContent = file.name;
    fileSize.textContent = `File size: ${formatFileSize(file.size)}`;

    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    sourceInfo.textContent = `${width} × ${height}px`;
  }

  function clearGeneratedOutput() {
    generatedIcons.forEach((icon) => {
      if (icon.url) URL.revokeObjectURL(icon.url);
    });

    generatedIcons = [];

    outputGrid.innerHTML = `
      <div class="favicon-empty-state">
        <span>ICO</span>
        <strong>No favicons generated yet</strong>
        <small>Upload an image and click generate.</small>
      </div>
    `;

    htmlOutput.textContent = defaultHTML;
    downloadBtn.disabled = true;

    fakeTabIcon.style.backgroundImage = "";
    fakeTabIcon.style.backgroundSize = "";
    fakeTabIcon.style.backgroundPosition = "";
  }

  async function handleImageUpload(event) {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setStatus("Unsupported Format", "error");
      showCopyMessage("Please upload PNG, JPG, JPEG, or WEBP.");
      return;
    }

    try {
      selectedFile = file;
      sourceImage = await loadImageFromFile(file);

      renderSourcePreview(file, sourceImage);
      clearGeneratedOutput();

      setStatus("Image Loaded", "success");
    } catch (error) {
      setStatus("Image Load Failed", "error");
      showCopyMessage(error.message);
    }
  }

  function getSelectedSizes() {
    return Array.from(sizeCheckboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => Number(checkbox.value))
      .filter((size) => size > 0)
      .sort((a, b) => a - b);
  }

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    const safeRadius = Math.min(radius, width / 2, height / 2);

    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.lineTo(x + width - safeRadius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
    ctx.lineTo(x + width, y + height - safeRadius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
    ctx.lineTo(x + safeRadius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
    ctx.lineTo(x, y + safeRadius);
    ctx.quadraticCurveTo(x, y, x + safeRadius, y);
    ctx.closePath();
  }

  function applyShapeClip(ctx, size) {
    const shape = shapeInput.value;

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      return;
    }

    if (shape === "rounded") {
      drawRoundedRect(ctx, 0, 0, size, size, Math.round(size * 0.2));
      ctx.clip();
    }
  }

  function createFaviconCanvas(size) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = size;
    canvas.height = size;

    ctx.save();
    applyShapeClip(ctx, size);

    ctx.fillStyle = bgColor.value;
    ctx.fillRect(0, 0, size, size);

    const padding = Math.round(size * (Number(paddingInput.value) / 100));
    const drawSize = size - padding * 2;

    const sourceWidth = sourceImage.naturalWidth || sourceImage.width;
    const sourceHeight = sourceImage.naturalHeight || sourceImage.height;

    const scale = Math.min(drawSize / sourceWidth, drawSize / sourceHeight);

    const targetWidth = sourceWidth * scale;
    const targetHeight = sourceHeight * scale;

    const x = (size - targetWidth) / 2;
    const y = (size - targetHeight) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(sourceImage, x, y, targetWidth, targetHeight);

    ctx.restore();

    return canvas;
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }

  function buildFaviconHTML(sizes) {
    const lines = [];

    if (sizes.includes(16)) {
      lines.push(`<link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.png" />`);
    }

    if (sizes.includes(32)) {
      lines.push(`<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.png" />`);
    }

    if (sizes.includes(48)) {
      lines.push(`<link rel="icon" type="image/png" sizes="48x48" href="/assets/icons/favicon-48x48.png" />`);
    }

    if (sizes.includes(180)) {
      lines.push(`<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-touch-icon.png" />`);
    }

    if (sizes.includes(192)) {
      lines.push(`<link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/android-chrome-192x192.png" />`);
    }

    if (sizes.includes(512)) {
      lines.push(`<link rel="icon" type="image/png" sizes="512x512" href="/assets/icons/android-chrome-512x512.png" />`);
    }

    return lines.join("\n");
  }

  function getIconFileName(size) {
    if (size === 180) return "apple-touch-icon.png";
    if (size === 192) return "android-chrome-192x192.png";
    if (size === 512) return "android-chrome-512x512.png";

    return `favicon-${size}x${size}.png`;
  }

  async function generateFavicons() {
    if (!selectedFile || !sourceImage) {
      setStatus("Image Required", "warning");
      showCopyMessage("Please upload an image first.");
      return;
    }

    const sizes = getSelectedSizes();

    if (!sizes.length) {
      setStatus("Select Size", "warning");
      showCopyMessage("Please select at least one favicon size.");
      return;
    }

    clearGeneratedOutput();

    outputGrid.innerHTML = "";

    for (const size of sizes) {
      const canvas = createFaviconCanvas(size);
      const blob = await canvasToBlob(canvas);

      if (!blob) continue;

      const url = URL.createObjectURL(blob);
      const file = getIconFileName(size);

      generatedIcons.push({
        size,
        blob,
        url,
        file
      });

      const card = document.createElement("article");
      card.className = "favicon-output-card";

      const preview = document.createElement("div");
      preview.className = "favicon-icon-preview";

      const img = document.createElement("img");
      img.src = url;
      img.alt = `${size} by ${size} favicon preview`;

      const title = document.createElement("strong");
      title.textContent = `${size}×${size}`;

      const subtitle = document.createElement("small");
      subtitle.textContent = file;

      const link = document.createElement("a");
      link.href = url;
      link.download = file;
      link.className = "favicon-download-link";
      link.textContent = "Download";

      preview.appendChild(img);
      card.appendChild(preview);
      card.appendChild(title);
      card.appendChild(subtitle);
      card.appendChild(link);

      outputGrid.appendChild(card);
    }

    const htmlTags = buildFaviconHTML(sizes);
    htmlOutput.textContent = htmlTags || defaultHTML;

    if (generatedIcons.length) {
      fakeTabIcon.style.backgroundImage = `url("${generatedIcons[0].url}")`;
      fakeTabIcon.style.backgroundSize = "cover";
      fakeTabIcon.style.backgroundPosition = "center";
      downloadBtn.disabled = false;

      setStatus("Favicons Generated", "success");
      showCopyMessage("Favicons generated successfully!");
    } else {
      setStatus("Generation Failed", "error");
      showCopyMessage("Could not generate favicons.");
    }
  }

  function downloadAllIcons() {
    if (!generatedIcons.length) {
      setStatus("Nothing to Download", "warning");
      showCopyMessage("Generate favicons first.");
      return;
    }

    generatedIcons.forEach((icon, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = icon.url;
        link.download = icon.file;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 150);
    });

    setStatus("Downloads Started", "success");
    showCopyMessage("Favicon downloads started!");
  }

  async function copyHTMLTags() {
    const text = htmlOutput.textContent.trim();

    if (!text || text === defaultHTML) {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Generate favicon HTML first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied", "success");
      showCopyMessage("Favicon HTML copied!");
    } catch (error) {
      fallbackCopy(text);
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
      showCopyMessage("Favicon HTML copied!");
    } catch (error) {
      setStatus("Copy Failed", "error");
      showCopyMessage("Copy failed. Please try again.");
    }

    document.body.removeChild(tempTextarea);
  }

  function clearTool() {
    selectedFile = null;
    sourceImage = null;

    imageInput.value = "";

    clearGeneratedOutput();

    fileName.textContent = "No image selected";
    fileSize.textContent = "File size: 0 KB";

    sourcePreview.innerHTML = `<span>Source Preview</span>`;
    sourceInfo.textContent = "No image selected";

    bgColor.value = "#ffffff";
    bgColorText.value = "#ffffff";

    paddingInput.value = 12;
    updatePaddingLabel();

    shapeInput.value = "rounded";

    sizeCheckboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });

    setStatus("Ready");
  }

  function handleDragOver(event) {
    event.preventDefault();
    uploadBox.classList.add("drag-over");
  }

  function handleDragLeave(event) {
    event.preventDefault();
    uploadBox.classList.remove("drag-over");
  }

  async function handleDrop(event) {
    event.preventDefault();
    uploadBox.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (!file) return;

    imageInput.files = event.dataTransfer.files;

    await handleImageUpload({
      target: {
        files: [file]
      }
    });
  }

  if (imageInput) {
    imageInput.addEventListener("change", handleImageUpload);
  }

  if (bgColor) {
    bgColor.addEventListener("input", updateBgColorFromPicker);
  }

  if (bgColorText) {
    bgColorText.addEventListener("change", updateBgColorFromText);

    bgColorText.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        updateBgColorFromText();
      }
    });
  }

  if (paddingInput) {
    paddingInput.addEventListener("input", () => {
      updatePaddingLabel();

      if (generatedIcons.length) {
        generateFavicons();
      }
    });
  }

  if (shapeInput) {
    shapeInput.addEventListener("change", () => {
      if (generatedIcons.length) {
        generateFavicons();
      }
    });
  }

  sizeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (generatedIcons.length) {
        generateFavicons();
      }
    });
  });

  if (generateBtn) {
    generateBtn.addEventListener("click", generateFavicons);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadAllIcons);
  }

  if (copyHtmlBtn) {
    copyHtmlBtn.addEventListener("click", copyHTMLTags);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearTool);
  }

  if (uploadBox) {
    uploadBox.addEventListener("dragover", handleDragOver);
    uploadBox.addEventListener("dragleave", handleDragLeave);
    uploadBox.addEventListener("drop", handleDrop);
  }

  updatePaddingLabel();
});