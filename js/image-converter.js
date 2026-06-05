/* ================================
   DevToolKit - Image Converter
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("image-converter-status");

  const imageInput = document.getElementById("image-input");
  const uploadBox = document.getElementById("image-upload-box");

  const uploadedFileName = document.getElementById("uploaded-file-name");
  const uploadedFileSize = document.getElementById("uploaded-file-size");

  const outputFormat = document.getElementById("output-format");
  const imageQuality = document.getElementById("image-quality");
  const imageQualityValue = document.getElementById("image-quality-value");

  const jpgBgColor = document.getElementById("jpg-background-color");
  const jpgBgColorText = document.getElementById("jpg-background-color-text");

  const originalPreview = document.getElementById("original-image-preview");
  const convertedPreview = document.getElementById("converted-image-preview");

  const originalInfo = document.getElementById("original-image-info");
  const convertedInfo = document.getElementById("converted-image-info");

  const originalSize = document.getElementById("original-size");
  const convertedSize = document.getElementById("converted-size");
  const convertedType = document.getElementById("converted-type");

  const convertBtn = document.getElementById("convert-image-btn");
  const downloadBtn = document.getElementById("download-image-btn");
  const clearBtn = document.getElementById("clear-image-converter-btn");

  let selectedFile = null;
  let originalImage = null;
  let convertedBlob = null;
  let convertedURL = null;

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
    imageQualityValue.textContent = `${imageQuality.value}%`;
  }

  function updateBgColorFromPicker() {
    jpgBgColorText.value = jpgBgColor.value;
  }

  function updateBgColorFromText() {
    const value = normalizeHex(jpgBgColorText.value);

    if (!isValidHex(value)) {
      setStatus("Invalid HEX", "error");
      return;
    }

    jpgBgColor.value = value;
    jpgBgColorText.value = value;
    setStatus("Color Updated", "success");
  }

  function clearConvertedPreview() {
    if (convertedURL) {
      URL.revokeObjectURL(convertedURL);
      convertedURL = null;
    }

    convertedBlob = null;

    convertedPreview.innerHTML = `<span>Converted Preview</span>`;
    convertedInfo.textContent = "Convert an image first";
    convertedSize.textContent = "0 KB";
    convertedType.textContent = "None";

    downloadBtn.disabled = true;
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
    img.alt = "Original uploaded image preview";

    img.onload = () => {
      URL.revokeObjectURL(previewURL);
    };

    originalPreview.appendChild(img);

    uploadedFileName.textContent = file.name;
    uploadedFileSize.textContent = `File size: ${formatFileSize(file.size)}`;

    originalInfo.textContent = `${image.width} × ${image.height}px • ${getFormatLabel(file.type)}`;
    originalSize.textContent = formatFileSize(file.size);
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
      clearConvertedPreview();

      setStatus("Image Loaded", "success");
    } catch (error) {
      setStatus("Image Load Failed", "error");
      showCopyMessage(error.message);
    }
  }

  function convertCanvasToBlob(canvas, type, quality) {
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

  async function convertImage() {
    if (!selectedFile || !originalImage) {
      setStatus("Image Required", "warning");
      showCopyMessage("Please upload an image first.");
      return;
    }

    const targetType = outputFormat.value;
    const quality = Number(imageQuality.value) / 100;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = originalImage.naturalWidth || originalImage.width;
    canvas.height = originalImage.naturalHeight || originalImage.height;

    if (targetType === "image/jpeg") {
      ctx.fillStyle = jpgBgColor.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

    const blob = await convertCanvasToBlob(canvas, targetType, quality);

    if (!blob) {
      setStatus("Convert Failed", "error");
      showCopyMessage("Image conversion failed.");
      return;
    }

    if (convertedURL) {
      URL.revokeObjectURL(convertedURL);
    }

    convertedBlob = blob;
    convertedURL = URL.createObjectURL(blob);

    convertedPreview.innerHTML = "";
    const img = document.createElement("img");
    img.src = convertedURL;
    img.alt = "Converted image preview";
    convertedPreview.appendChild(img);

    convertedInfo.textContent = `${canvas.width} × ${canvas.height}px • ${getFormatLabel(targetType)}`;
    convertedSize.textContent = formatFileSize(blob.size);
    convertedType.textContent = getFormatLabel(targetType);

    downloadBtn.disabled = false;

    setStatus("Image Converted", "success");
    showCopyMessage("Image converted successfully!");
  }

  function downloadConvertedImage() {
    if (!convertedBlob || !convertedURL || !selectedFile) {
      setStatus("Nothing to Download", "warning");
      showCopyMessage("Convert an image first.");
      return;
    }

    const extension = getFileExtension(outputFormat.value);
    const originalName = selectedFile.name.replace(/\.[^/.]+$/, "");
    const fileName = `${originalName}-converted.${extension}`;

    const link = document.createElement("a");
    link.href = convertedURL;
    link.download = fileName;

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

    if (convertedURL) {
      URL.revokeObjectURL(convertedURL);
      convertedURL = null;
    }

    convertedBlob = null;

    uploadedFileName.textContent = "No image selected";
    uploadedFileSize.textContent = "File size: 0 KB";

    originalPreview.innerHTML = `<span>Original Preview</span>`;
    convertedPreview.innerHTML = `<span>Converted Preview</span>`;

    originalInfo.textContent = "No image selected";
    convertedInfo.textContent = "Convert an image first";

    originalSize.textContent = "0 KB";
    convertedSize.textContent = "0 KB";
    convertedType.textContent = "None";

    outputFormat.value = "image/png";
    imageQuality.value = 90;
    updateQualityLabel();

    jpgBgColor.value = "#ffffff";
    jpgBgColorText.value = "#ffffff";

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

  if (imageQuality) {
    imageQuality.addEventListener("input", updateQualityLabel);
  }

  if (jpgBgColor) {
    jpgBgColor.addEventListener("input", updateBgColorFromPicker);
  }

  if (jpgBgColorText) {
    jpgBgColorText.addEventListener("change", updateBgColorFromText);

    jpgBgColorText.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        updateBgColorFromText();
      }
    });
  }

  if (convertBtn) {
    convertBtn.addEventListener("click", convertImage);
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadConvertedImage);
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