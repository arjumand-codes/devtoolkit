/* ================================
   DevToolKit - Image Resizer
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("image-resizer-status");

  const imageInput = document.getElementById("resizer-image-input");
  const uploadBox = document.getElementById("image-resizer-upload-box");

  const fileName = document.getElementById("resizer-file-name");
  const fileSize = document.getElementById("resizer-file-size");

  const widthInput = document.getElementById("resize-image-width");
  const heightInput = document.getElementById("resize-image-height");
  const keepAspect = document.getElementById("resize-keep-aspect");

  const outputFormat = document.getElementById("resize-output-format");
  const qualityInput = document.getElementById("resize-image-quality");
  const qualityValue = document.getElementById("resize-image-quality-value");

  const bgColor = document.getElementById("resize-bg-color");
  const bgColorText = document.getElementById("resize-bg-color-text");

  const originalPreview = document.getElementById("resizer-original-preview");
  const resultPreview = document.getElementById("resizer-result-preview");

  const originalInfo = document.getElementById("resizer-original-info");
  const resultInfo = document.getElementById("resizer-result-info");

  const originalSize = document.getElementById("resizer-original-size");
  const newSize = document.getElementById("resizer-new-size");
  const originalDimensions = document.getElementById("resizer-original-dimensions");
  const newDimensions = document.getElementById("resizer-new-dimensions");

  const resizeBtn = document.getElementById("resize-image-btn");
  const downloadBtn = document.getElementById("download-resized-image-btn");
  const clearBtn = document.getElementById("clear-image-resizer-btn");
  const presetBtns = document.querySelectorAll(".resizer-preset-btn");

  let selectedFile = null;
  let originalImage = null;
  let resizedBlob = null;
  let resizedURL = null;
  let originalRatio = 1;
  let isUpdatingDimension = false;

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

  function getFormatLabel(mimeType) {
    const labels = {
      "image/png": "PNG",
      "image/jpeg": "JPG",
      "image/webp": "WEBP"
    };

    return labels[mimeType] || "IMAGE";
  }

  function getFileExtension(mimeType) {
    const extensions = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp"
    };

    return extensions[mimeType] || "png";
  }

  function getOutputMimeType() {
    if (!selectedFile) return "image/png";

    if (outputFormat.value === "original") {
      return selectedFile.type;
    }

    return outputFormat.value;
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

  function updateQualityLabel() {
    qualityValue.textContent = `${qualityInput.value}%`;
  }

  function updateBgColorFromPicker() {
    bgColorText.value = bgColor.value;
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

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        type,
        quality
      );
    });
  }

  function clearResizedPreview() {
    if (resizedURL) {
      URL.revokeObjectURL(resizedURL);
      resizedURL = null;
    }

    resizedBlob = null;

    resultPreview.innerHTML = `<span>Resized Preview</span>`;
    resultInfo.textContent = "Resize an image first";

    newSize.textContent = "0 KB";
    newDimensions.textContent = "0 × 0";

    downloadBtn.disabled = true;
  }

  function renderOriginalPreview(file, image) {
    const previewURL = URL.createObjectURL(file);

    originalPreview.innerHTML = "";

    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = "Original image preview";

    img.onload = () => {
      URL.revokeObjectURL(previewURL);
    };

    originalPreview.appendChild(img);

    fileName.textContent = file.name;
    fileSize.textContent = `File size: ${formatFileSize(file.size)}`;

    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;

    originalInfo.textContent = `${width} × ${height}px • ${getFormatLabel(file.type)}`;
    originalSize.textContent = formatFileSize(file.size);
    originalDimensions.textContent = `${width} × ${height}`;

    widthInput.value = width;
    heightInput.value = height;

    originalRatio = height / width;
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
      originalImage = await loadImageFromFile(file);

      renderOriginalPreview(file, originalImage);
      clearResizedPreview();

      setStatus("Image Loaded", "success");
    } catch (error) {
      setStatus("Image Load Failed", "error");
      showCopyMessage(error.message);
    }
  }

  function updateHeightFromWidth() {
    if (!keepAspect.checked || !originalImage || isUpdatingDimension) return;

    const width = Number(widthInput.value);

    if (!width || width <= 0) return;

    isUpdatingDimension = true;
    heightInput.value = Math.round(width * originalRatio);
    isUpdatingDimension = false;
  }

  function updateWidthFromHeight() {
    if (!keepAspect.checked || !originalImage || isUpdatingDimension) return;

    const height = Number(heightInput.value);

    if (!height || height <= 0) return;

    isUpdatingDimension = true;
    widthInput.value = Math.round(height / originalRatio);
    isUpdatingDimension = false;
  }

  function getResizeDimensions() {
    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    if (!width || width <= 0 || !height || height <= 0) {
      return null;
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  async function resizeImage() {
    if (!selectedFile || !originalImage) {
      setStatus("Image Required", "warning");
      showCopyMessage("Please upload an image first.");
      return;
    }

    const dimensions = getResizeDimensions();

    if (!dimensions) {
      setStatus("Invalid Dimensions", "error");
      showCopyMessage("Please enter valid width and height.");
      return;
    }

    const targetType = getOutputMimeType();
    const quality = Number(qualityInput.value) / 100;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    if (targetType === "image/jpeg") {
      ctx.fillStyle = bgColor.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas, targetType, quality);

    if (!blob) {
      setStatus("Resize Failed", "error");
      showCopyMessage("Image resize failed.");
      return;
    }

    if (resizedURL) {
      URL.revokeObjectURL(resizedURL);
    }

    resizedBlob = blob;
    resizedURL = URL.createObjectURL(blob);

    resultPreview.innerHTML = "";

    const img = document.createElement("img");
    img.src = resizedURL;
    img.alt = "Resized image preview";

    resultPreview.appendChild(img);

    resultInfo.textContent = `${canvas.width} × ${canvas.height}px • ${getFormatLabel(targetType)}`;
    newSize.textContent = formatFileSize(blob.size);
    newDimensions.textContent = `${canvas.width} × ${canvas.height}`;

    downloadBtn.disabled = false;

    setStatus("Image Resized", "success");
    showCopyMessage("Image resized successfully!");
  }

  function downloadResizedImage() {
    if (!resizedBlob || !resizedURL || !selectedFile) {
      setStatus("Nothing to Download", "warning");
      showCopyMessage("Resize an image first.");
      return;
    }

    const targetType = getOutputMimeType();
    const extension = getFileExtension(targetType);
    const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
    const downloadName = `${originalName}-resized.${extension}`;

    const link = document.createElement("a");
    link.href = resizedURL;
    link.download = downloadName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatus("Download Started", "success");
    showCopyMessage("Download started!");
  }

  function applyPresetWidth(button) {
    if (!originalImage) {
      setStatus("Image Required", "warning");
      showCopyMessage("Upload an image first.");
      return;
    }

    const width = Number(button.dataset.width);

    if (!width) return;

    widthInput.value = width;
    updateHeightFromWidth();

    setStatus(`${width}px Width Applied`, "success");
  }

  function clearTool() {
    selectedFile = null;
    originalImage = null;
    resizedBlob = null;
    originalRatio = 1;

    imageInput.value = "";

    if (resizedURL) {
      URL.revokeObjectURL(resizedURL);
      resizedURL = null;
    }

    fileName.textContent = "No image selected";
    fileSize.textContent = "File size: 0 KB";

    originalPreview.innerHTML = `<span>Original Preview</span>`;
    resultPreview.innerHTML = `<span>Resized Preview</span>`;

    originalInfo.textContent = "No image selected";
    resultInfo.textContent = "Resize an image first";

    originalSize.textContent = "0 KB";
    newSize.textContent = "0 KB";

    originalDimensions.textContent = "0 × 0";
    newDimensions.textContent = "0 × 0";

    widthInput.value = "";
    heightInput.value = "";
    keepAspect.checked = true;

    outputFormat.value = "original";

    qualityInput.value = 90;
    updateQualityLabel();

    bgColor.value = "#ffffff";
    bgColorText.value = "#ffffff";

    downloadBtn.disabled = true;

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

  if (widthInput) {
    widthInput.addEventListener("input", () => {
      updateHeightFromWidth();

      if (resizedBlob) {
        clearResizedPreview();
      }
    });
  }

  if (heightInput) {
    heightInput.addEventListener("input", () => {
      updateWidthFromHeight();

      if (resizedBlob) {
        clearResizedPreview();
      }
    });
  }

  if (keepAspect) {
    keepAspect.addEventListener("change", () => {
      if (keepAspect.checked) {
        updateHeightFromWidth();
      }
    });
  }

  if (qualityInput) {
    qualityInput.addEventListener("input", updateQualityLabel);
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

  if (resizeBtn) {
    resizeBtn.addEventListener("click", resizeImage);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadResizedImage);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearTool);
  }

  presetBtns.forEach((button) => {
    button.addEventListener("click", () => {
      applyPresetWidth(button);
    });
  });

  if (uploadBox) {
    uploadBox.addEventListener("dragover", handleDragOver);
    uploadBox.addEventListener("dragleave", handleDragLeave);
    uploadBox.addEventListener("drop", handleDrop);
  }

  updateQualityLabel();
});