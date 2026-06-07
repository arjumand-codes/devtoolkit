/* ================================
   DevToolKit - QR Code Generator
   Author: Arjumand Ali
================================ */

document.addEventListener("DOMContentLoaded", () => {
  const statusBox = document.getElementById("qr-status");

  const qrType = document.getElementById("qr-type");
  const qrInput = document.getElementById("qr-input");

  const qrSize = document.getElementById("qr-size");
  const qrSizeValue = document.getElementById("qr-size-value");

  const foregroundColor = document.getElementById("qr-foreground-color");
  const foregroundColorText = document.getElementById("qr-foreground-color-text");

  const backgroundColor = document.getElementById("qr-background-color");
  const backgroundColorText = document.getElementById("qr-background-color-text");

  const errorLevel = document.getElementById("qr-error-level");

  const previewBox = document.getElementById("qr-preview-box");

  const metaType = document.getElementById("qr-meta-type");
  const metaSize = document.getElementById("qr-meta-size");
  const metaChars = document.getElementById("qr-meta-chars");

  const sampleBtn = document.getElementById("sample-qr-btn");
  const generateBtn = document.getElementById("generate-qr-btn");
  const refreshBtn = document.getElementById("refresh-qr-btn");
  const downloadBtn = document.getElementById("download-qr-btn");
  const copyTextBtn = document.getElementById("copy-qr-text-btn");
  const clearBtn = document.getElementById("clear-qr-btn");

  let qrImageElement = null;
  let currentQRContent = "";

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

  function renderPlaceholder() {
    previewBox.innerHTML = `
      <div class="qr-placeholder">
        <span>QR</span>
        <strong>Generate QR Code</strong>
        <small>Your QR preview will appear here.</small>
      </div>
    `;
  }

  function getTypeLabel(type) {
    const labels = {
      text: "Text",
      url: "URL",
      email: "Email",
      phone: "Phone",
      whatsapp: "WhatsApp"
    };

    return labels[type] || "Text";
  }

  function updateSizeLabel() {
    qrSizeValue.textContent = `${qrSize.value}px`;
    metaSize.textContent = `${qrSize.value}px`;
  }

  function updateMeta(content = "") {
    metaType.textContent = getTypeLabel(qrType.value);
    metaSize.textContent = `${qrSize.value}px`;
    metaChars.textContent = content.length;
  }

  function cleanPhoneNumber(value) {
    return value.replace(/[^\d+]/g, "");
  }

  function buildQRContent() {
    const type = qrType.value;
    const value = qrInput.value.trim();

    if (!value) return "";

    if (type === "url") {
      return /^https?:\/\//i.test(value) ? value : `https://${value}`;
    }

    if (type === "email") {
      return /^mailto:/i.test(value) ? value : `mailto:${value}`;
    }

    if (type === "phone") {
      return /^tel:/i.test(value) ? value : `tel:${cleanPhoneNumber(value)}`;
    }

    if (type === "whatsapp") {
      if (/^https?:\/\//i.test(value)) return value;

      const phone = cleanPhoneNumber(value).replace("+", "");
      return `https://wa.me/${phone}`;
    }

    return value;
  }

  function getCorrectLevel() {
    const level = errorLevel.value;

    if (!QRCode.CorrectLevel) return undefined;

    if (level === "L") return QRCode.CorrectLevel.L;
    if (level === "M") return QRCode.CorrectLevel.M;
    if (level === "Q") return QRCode.CorrectLevel.Q;
    if (level === "H") return QRCode.CorrectLevel.H;

    return QRCode.CorrectLevel.M;
  }

  function generateQRCode() {
    const content = buildQRContent();

    if (!content) {
      setStatus("Content Required", "warning");
      showCopyMessage("Please enter QR content first.");
      renderPlaceholder();
      downloadBtn.disabled = true;
      qrImageElement = null;
      currentQRContent = "";
      updateMeta("");
      return;
    }

    if (typeof QRCode === "undefined") {
      setStatus("QR Library Missing", "error");
      showCopyMessage("QRCode.js library is not loaded.");
      console.error("QRCode.js is missing. Check qrcodejs CDN script.");
      return;
    }

    const size = Number(qrSize.value);

    previewBox.innerHTML = "";

    try {
      new QRCode(previewBox, {
        text: content,
        width: size,
        height: size,
        colorDark: foregroundColor.value,
        colorLight: backgroundColor.value,
        correctLevel: getCorrectLevel()
      });

      setTimeout(() => {
        qrImageElement = previewBox.querySelector("img") || previewBox.querySelector("canvas");

        if (!qrImageElement) {
          setStatus("QR Failed", "error");
          showCopyMessage("QR image was not created.");
          return;
        }

        currentQRContent = content;
        downloadBtn.disabled = false;

        updateMeta(content);
        setStatus("QR Code Ready", "success");
        showCopyMessage("QR code generated successfully!");
      }, 100);
    } catch (error) {
      console.error(error);

      renderPlaceholder();
      downloadBtn.disabled = true;
      qrImageElement = null;
      currentQRContent = "";

      setStatus("QR Failed", "error");
      showCopyMessage("QR generation failed.");
    }
  }

  function downloadQRCode() {
    if (!qrImageElement) {
      setStatus("Nothing to Download", "warning");
      showCopyMessage("Generate a QR code first.");
      return;
    }

    let dataURL = "";

    if (qrImageElement.tagName.toLowerCase() === "canvas") {
      dataURL = qrImageElement.toDataURL("image/png");
    } else {
      dataURL = qrImageElement.src;
    }

    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `devtoolkit-${qrType.value}-qr-code.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatus("Download Started", "success");
    showCopyMessage("Download started!");
  }

  async function copyQRContent() {
    const content = buildQRContent();

    if (!content) {
      setStatus("Nothing to Copy", "warning");
      showCopyMessage("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setStatus("Copied", "success");
      showCopyMessage("QR content copied successfully!");
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";

      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);

      setStatus("Copied", "success");
      showCopyMessage("QR content copied successfully!");
    }
  }

  function updatePlaceholderByType() {
    const placeholders = {
      text: "Example: DevToolKit is a free online tools website.",
      url: "Example: https://devtoolkit.vercel.app/",
      email: "Example: arjumand@example.com",
      phone: "Example: +923001422239",
      whatsapp: "Example: +923001422239"
    };

    qrInput.placeholder = placeholders[qrType.value] || placeholders.text;
    updateMeta(buildQRContent());
  }

  function addSampleQR() {
    qrType.value = "url";
    qrInput.value = "https://devtoolkit.vercel.app/";
    qrSize.value = 280;
    foregroundColor.value = "#111827";
    foregroundColorText.value = "#111827";
    backgroundColor.value = "#ffffff";
    backgroundColorText.value = "#ffffff";
    errorLevel.value = "M";

    updatePlaceholderByType();
    updateSizeLabel();
    generateQRCode();
  }

  function clearTool() {
    qrType.value = "url";
    qrInput.value = "";
    qrSize.value = 280;

    foregroundColor.value = "#111827";
    foregroundColorText.value = "#111827";

    backgroundColor.value = "#ffffff";
    backgroundColorText.value = "#ffffff";

    errorLevel.value = "M";

    qrImageElement = null;
    currentQRContent = "";
    downloadBtn.disabled = true;

    updatePlaceholderByType();
    updateSizeLabel();
    updateMeta("");
    renderPlaceholder();

    setStatus("Ready");
  }

  function syncColorPicker(colorInput, textInput) {
    textInput.value = colorInput.value;

    if (currentQRContent) {
      generateQRCode();
    }
  }

  function syncColorText(textInput, colorInput) {
    let value = textInput.value.trim();

    if (!value.startsWith("#")) {
      value = `#${value}`;
    }

    if (!/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      setStatus("Invalid HEX", "error");
      showCopyMessage("Please enter a valid HEX color.");
      return;
    }

    textInput.value = value;
    colorInput.value = value;

    if (currentQRContent) {
      generateQRCode();
    }
  }

  if (sampleBtn) sampleBtn.addEventListener("click", addSampleQR);
  if (generateBtn) generateBtn.addEventListener("click", generateQRCode);
  if (refreshBtn) refreshBtn.addEventListener("click", generateQRCode);
  if (downloadBtn) downloadBtn.addEventListener("click", downloadQRCode);
  if (copyTextBtn) copyTextBtn.addEventListener("click", copyQRContent);
  if (clearBtn) clearBtn.addEventListener("click", clearTool);

  if (qrType) {
    qrType.addEventListener("change", () => {
      updatePlaceholderByType();

      if (qrInput.value.trim()) {
        generateQRCode();
      }
    });
  }

  if (qrInput) {
    qrInput.addEventListener("input", () => {
      const content = buildQRContent();

      updateMeta(content);

      if (!qrInput.value.trim()) {
        currentQRContent = "";
        qrImageElement = null;
        downloadBtn.disabled = true;
        renderPlaceholder();
        setStatus("Ready");
      } else {
        setStatus("Typing...");
      }
    });
  }

  if (qrSize) {
    qrSize.addEventListener("input", () => {
      updateSizeLabel();

      if (currentQRContent) {
        generateQRCode();
      }
    });
  }

  if (foregroundColor) {
    foregroundColor.addEventListener("input", () => {
      syncColorPicker(foregroundColor, foregroundColorText);
    });
  }

  if (backgroundColor) {
    backgroundColor.addEventListener("input", () => {
      syncColorPicker(backgroundColor, backgroundColorText);
    });
  }

  if (foregroundColorText) {
    foregroundColorText.addEventListener("change", () => {
      syncColorText(foregroundColorText, foregroundColor);
    });
  }

  if (backgroundColorText) {
    backgroundColorText.addEventListener("change", () => {
      syncColorText(backgroundColorText, backgroundColor);
    });
  }

  if (errorLevel) {
    errorLevel.addEventListener("change", () => {
      if (currentQRContent) {
        generateQRCode();
      }
    });
  }

  updatePlaceholderByType();
  updateSizeLabel();
  updateMeta("");
  renderPlaceholder();
});