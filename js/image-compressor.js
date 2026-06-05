/* ================================
   DevToolKit - Image Compressor
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("image-compressor-status");

  const imageInput = document.getElementById("compressor-image-input");
  const uploadBox = document.getElementById("image-compressor-upload-box");

  const fileName = document.getElementById("compressor-file-name");
  const fileSize = document.getElementById("compressor-file-size");

  const qualityInput = document.getElementById("compression-quality");
  const qualityValue = document.getElementById("compression-quality-value");

  const outputFormat = document.getElementById("compressor-output-format");
  const resizeWidth = document.getElementById("resize-width");
  const keepAspectRatio = document.getElementById("keep-aspect-ratio");

  const bgColor = document.getElementById("compressor-bg-color");
  const bgColorText = document.getElementById("compressor-bg-color-text");

  const originalPreview = document.getElementById("compressor-original-preview");
  const resultPreview = document.getElementById("compressor-result-preview");

  const originalInfo = document.getElementById("compressor-original-info");
  const resultInfo = document.getElementById("compressor-result-info");

  const originalSize = document.getElementById("compressor-original-size");
  const compressedSize = document.getElementById("compressor-compressed-size");
  const savedPercent = document.getElementById("compressor-saved-percent");
  const outputType = document.getElementById("compressor-output-type");

  const compressionBarLabel = document.getElementById("compression-bar-label");
  const compressionBarFill = document.getElementById("compression-bar-fill");

  const compressBtn = document.getElementById("compress-image-btn");
  const downloadBtn = document.getElementById("download-compressed-image-btn");
  const clearBtn = document.getElementById("clear-image-compressor-btn");

  let selectedFile = null;
  let originalImage = null;
  let compressedBlob = null;
  let compressedURL = null;

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

    return extensions[mimeType] || "jpg";
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
      return;
    }

    bgColor.value = value;
    bgColorText.value = value;
    setStatus("Color Updated", "success");
  }

  function getOutputMimeType() {
    if (!selectedFile) return "image/jpeg";

    if (outputFormat.value === "original") {
      return selectedFile.type;
    }

    return outputFormat.value;
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

    originalInfo.textContent = `${image.width} × ${image.height}px • ${getFormatLabel(file.type)}`;
    originalSize.textContent = formatFileSize(file.size);
  }

  function clearCompressedPreview() {
    if (compressedURL) {
      URL.revokeObjectURL(compressedURL);
      compressedURL = null;
    }

    compressedBlob = null;

    resultPreview.innerHTML = `<span>Compressed Preview</span>`;
    resultInfo.textContent = "Compress an image first";

    compressedSize.textContent = "0 KB";
    savedPercent.textContent = "0%";
    outputType.textContent = "None";

    compressionBarLabel.textContent = "0%";
    compressionBarFill.style.width = "0%";

    downloadBtn.disabled = true;
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
      clearCompressedPreview();

      setStatus("Image Loaded", "success");
    } catch (error) {
      setStatus("Image Load Failed", "error");
      showCopyMessage(error.message);
    }
  }

  function getCanvasSize(image) {
    const originalWidth = image.naturalWidth || image.width;
    const originalHeight = image.naturalHeight || image.height;

    const targetWidth = Number(resizeWidth.value);

    if (!targetWidth || targetWidth <= 0) {
      return {
        width: originalWidth,
        height: originalHeight
      };
    }

    if (keepAspectRatio.checked) {
      const ratio = originalHeight / originalWidth;

      return {
        width: targetWidth,
        height: Math.round(targetWidth * ratio)
      };
    }

    return {
      width: targetWidth,
      height: originalHeight
    };
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

  async function compressImage() {
    if (!selectedFile || !originalImage) {
      setStatus("Image Required", "warning");
      showCopyMessage("Please upload an image first.");
      return;
    }

    const targetType = getOutputMimeType();
    const quality = Number(qualityInput.value) / 100;

    const canvasSize = getCanvasSize(originalImage);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    if (targetType === "image/jpeg") {
      ctx.fillStyle = bgColor.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas, targetType, quality);

    if (!blob) {
      setStatus("Compression Failed", "error");
      showCopyMessage("Image compression failed.");
      return;
    }

    if (compressedURL) {
      URL.revokeObjectURL(compressedURL);
    }

    compressedBlob = blob;
    compressedURL = URL.createObjectURL(blob);

    resultPreview.innerHTML = "";

    const img = document.createElement("img");
    img.src = compressedURL;
    img.alt = "Compressed image preview";

    resultPreview.appendChild(img);

    const saved = selectedFile.size > 0
      ? Math.max(0, ((selectedFile.size - blob.size) / selectedFile.size) * 100)
      : 0;

    const savedRounded = Math.round(saved);

    resultInfo.textContent = `${canvas.width} × ${canvas.height}px • ${getFormatLabel(targetType)}`;
    compressedSize.textContent = formatFileSize(blob.size);
    savedPercent.textContent = `${savedRounded}%`;
    outputType.textContent = getFormatLabel(targetType);

    compressionBarLabel.textContent = `${savedRounded}%`;
    compressionBarFill.style.width = `${savedRounded}%`;

    downloadBtn.disabled = false;

    if (blob.size >= selectedFile.size) {
      setStatus("Compressed, But Larger", "warning");
      showCopyMessage("Compression done, but file is not smaller.");
    } else {
      setStatus("Image Compressed", "success");
      showCopyMessage("Image compressed successfully!");
    }
  }

  function downloadCompressedImage() {
    if (!compressedBlob || !compressedURL || !selectedFile) {
      setStatus("Nothing to Download", "warning");
      showCopyMessage("Compress an image first.");
      return;
    }

    const targetType = getOutputMimeType();
    const extension = getFileExtension(targetType);
    const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
    const downloadName = `${originalName}-compressed.${extension}`;

    const link = document.createElement("a");
    link.href = compressedURL;
    link.download = downloadName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatus("Download Started", "success");
    showCopyMessage("Download started!");
  }

  function clearTool() {
    selectedFile = null;
    originalImage = null;

    imageInput.value = "";

    if (compressedURL) {
      URL.revokeObjectURL(compressedURL);
      compressedURL = null;
    }

    compressedBlob = null;

    fileName.textContent = "No image selected";
    fileSize.textContent = "File size: 0 KB";

    originalPreview.innerHTML = `<span>Original Preview</span>`;
    resultPreview.innerHTML = `<span>Compressed Preview</span>`;

    originalInfo.textContent = "No image selected";
    resultInfo.textContent = "Compress an image first";

    originalSize.textContent = "0 KB";
    compressedSize.textContent = "0 KB";
    savedPercent.textContent = "0%";
    outputType.textContent = "None";

    compressionBarLabel.textContent = "0%";
    compressionBarFill.style.width = "0%";

    qualityInput.value = 75;
    updateQualityLabel();

    outputFormat.value = "original";
    resizeWidth.value = "";
    keepAspectRatio.checked = true;

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

  if (compressBtn) {
    compressBtn.addEventListener("click", compressImage);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadCompressedImage);
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", clearTool);
  }

  if (uploadBox) {
    uploadBox.addEventListener("dragover", handleDragOver);
    uploadBox.addEventListener("dragleave", handleDragLeave);
    uploadBox.addEventListener("drop", handleDrop);
  }

  updateQualityLabel();
});