/* ================================
   AI CV Maker - Frontend Script
   DevToolKit
================================ */

const aiCvForm = document.getElementById("aiCvForm");
const generateCvBtn = document.getElementById("generateCvBtn");
const previewManualCvBtn = document.getElementById("previewManualCvBtn");
const clearCvFormBtn = document.getElementById("clearCvFormBtn");
const printCvBtn = document.getElementById("printCvBtn");
const editCvBtn = document.getElementById("editCvBtn");

const cvPreview = document.getElementById("cvPreview");
const cvMessageBox = document.getElementById("cvMessageBox");
const cvLimitStatus = document.getElementById("cvLimitStatus");
const cvTemplateMeta = document.getElementById("cvTemplateMeta");
const cvEditMeta = document.getElementById("cvEditMeta");

const DAILY_LIMIT = 3;
const LIMIT_KEY = "devtoolkit_ai_cv_daily_limit";
let isCvEditable = false;

/* ================================
   Init
================================ */

document.addEventListener("DOMContentLoaded", () => {
  updateLimitStatus();
  setCvEditable(false);
});

/* ================================
   AI Generate CV
================================ */

if (aiCvForm) {
  aiCvForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = getCvFormData();

    if (!formData.fullName || !formData.jobTitle || !formData.summary || !formData.skills) {
      showCvMessage("Please fill Full Name, Job Title, Summary, and Skills.", "error");
      return;
    }

    if (!canUseAiGeneration()) {
      showCvMessage("Daily AI limit reached. Use Preview Without AI and edit manually.", "warning");
      return;
    }

    setGenerateLoading(true);
    showCvMessage("Generating a clean one-page professional CV...", "success");

    try {
      const response = await fetch("/api/ai-cv-maker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      setGenerateLoading(false);

      if (!response.ok || !data.success) {
        showCvMessage(data.message || "AI CV generation failed. Try manual preview.", "error");
        return;
      }

      increaseAiUsage();

      const cvData = data.cv || formData;
      renderCv(cvData);

      setCvEditable(false);
      showCvMessage("Professional CV generated. Click Edit CV if you want to change text.", "success");
      updateLimitStatus();
    } catch (error) {
      setGenerateLoading(false);
      showCvMessage("Something went wrong. Please try again or use manual preview.", "error");
    }
  });
}

/* ================================
   Manual Preview
================================ */

if (previewManualCvBtn) {
  previewManualCvBtn.addEventListener("click", () => {
    const formData = getCvFormData();

    if (!formData.fullName || !formData.jobTitle) {
      showCvMessage("Please add at least your Full Name and Job Title.", "error");
      return;
    }

    renderCv(formData);
    setCvEditable(false);
    showCvMessage("Manual professional CV preview created. Click Edit CV to change it.", "success");
  });
}

/* ================================
   Edit Toggle
================================ */

if (editCvBtn) {
  editCvBtn.addEventListener("click", () => {
    if (!cvPreview || cvPreview.querySelector(".cv-empty-state")) {
      showCvMessage("Generate or preview a CV first.", "error");
      return;
    }

    setCvEditable(!isCvEditable);

    if (isCvEditable) {
      showCvMessage("Edit mode enabled. Click inside the CV and change the text.", "success");
    } else {
      showCvMessage("Edit mode locked. CV is ready for print or PDF.", "success");
    }
  });
}

function setCvEditable(status) {
  isCvEditable = status;

  if (cvPreview) {
    cvPreview.setAttribute("contenteditable", status ? "true" : "false");
    cvPreview.classList.toggle("is-editing", status);
  }

  if (editCvBtn) {
    editCvBtn.textContent = status ? "Lock CV" : "Edit CV";
  }

  if (cvEditMeta) {
    cvEditMeta.textContent = status ? "Edit mode enabled" : "Edit mode locked";
  }
}

/* ================================
   Clear Form
================================ */

if (clearCvFormBtn) {
  clearCvFormBtn.addEventListener("click", () => {
    if (!confirm("Clear all CV form fields?")) return;

    aiCvForm.reset();

    cvPreview.className = "cv-preview cv-template-professional";
    cvPreview.innerHTML = `
      <div class="cv-empty-state">
        <span>CV</span>
        <h3>Your CV Preview Will Appear Here</h3>
        <p>
          Fill the form, then generate your professional one-page CV
          or preview it manually.
        </p>
      </div>
    `;

    setCvEditable(false);
    updateTemplateMeta();
    showCvMessage("Form cleared.", "success");
  });
}

/* ================================
   Print / Save PDF
================================ */

if (printCvBtn) {
  printCvBtn.addEventListener("click", () => {
    if (!cvPreview || cvPreview.querySelector(".cv-empty-state")) {
      showCvMessage("Generate or preview a CV first.", "error");
      return;
    }

    setCvEditable(false);

    document.body.classList.add("printing-cv");

    setTimeout(() => {
      window.print();

      setTimeout(() => {
        document.body.classList.remove("printing-cv");
      }, 500);
    }, 100);
  });
}

/* ================================
   Get Form Data
================================ */

function getCvFormData() {
  return {
    fullName: getInputValue("fullName"),
    jobTitle: getInputValue("jobTitle"),
    email: getInputValue("email"),
    phone: getInputValue("phone"),
    location: getInputValue("location"),
    portfolio: getInputValue("portfolio"),
    summary: getInputValue("summary"),
    skills: getInputValue("skills"),
    experience: getInputValue("experience"),
    projects: getInputValue("projects"),
    education: getInputValue("education"),
    certifications: getInputValue("certifications"),
    languages: getInputValue("languages"),
    cvTone: getInputValue("cvTone") || "professional",
    template: "professional"
  };
}

function getInputValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : "";
}

/* ================================
   Render CV
================================ */

function renderCv(data) {
  const cleanData = normalizeCvData(data);

  cvPreview.className = "cv-preview cv-template-professional";
  cvPreview.innerHTML = renderProfessionalTemplate(cleanData);

  updateTemplateMeta();
}

function renderProfessionalTemplate(data) {
  return `
    <div class="cv-document cv-one-page-document">
      <header class="cv-pro-header">
        <div>
          <h1>${escapeHtml(data.fullName)}</h1>
          <h2>${escapeHtml(data.jobTitle)}</h2>
        </div>

        <div class="cv-pro-contact">
          ${data.email ? `<span>${escapeHtml(data.email)}</span>` : ""}
          ${data.phone ? `<span>${escapeHtml(data.phone)}</span>` : ""}
          ${data.location ? `<span>${escapeHtml(data.location)}</span>` : ""}
          ${data.portfolio ? `<span>${escapeHtml(data.portfolio)}</span>` : ""}
        </div>
      </header>

      ${renderTextSection("Professional Summary", data.summary)}
      ${renderCompactSkills(data.skills)}
      ${renderBulletSection("Experience", data.experience, 4)}
      ${renderBulletSection("Projects", data.projects, 3)}

      <div class="cv-pro-two-col">
        ${renderBulletSection("Education", data.education, 2)}
        ${renderBulletSection("Certifications", data.certifications, 2)}
      </div>

      ${renderTextSection("Languages", data.languages)}
    </div>
  `;
}

function renderTextSection(title, content) {
  if (!content) return "";

  return `
    <section class="cv-pro-section">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(limitWords(content, 55))}</p>
    </section>
  `;
}

function renderBulletSection(title, content, maxItems = 4) {
  if (!content) return "";

  const items = splitToList(content).slice(0, maxItems);

  if (!items.length) return "";

  return `
    <section class="cv-pro-section">
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(limitWords(item, 22))}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderCompactSkills(skills) {
  if (!skills) return "";

  const skillList = splitToList(skills).slice(0, 14);

  return `
    <section class="cv-pro-section">
      <h3>Core Skills</h3>
      <div class="cv-pro-skills">
        ${skillList.map((skill) => `<span>${escapeHtml(skill)}</span>`).join("")}
      </div>
    </section>
  `;
}

/* ================================
   Normalize Data
================================ */

function normalizeCvData(data) {
  return {
    fullName: data.fullName || data.name || "",
    jobTitle: data.jobTitle || data.title || "",
    email: data.email || "",
    phone: data.phone || "",
    location: data.location || "",
    portfolio: data.portfolio || data.linkedin || "",
    summary: arrayToText(data.summary),
    skills: arrayToText(data.skills),
    experience: arrayToText(data.experience),
    projects: arrayToText(data.projects),
    education: arrayToText(data.education),
    certifications: arrayToText(data.certifications),
    languages: arrayToText(data.languages)
  };
}

function arrayToText(value) {
  if (!value) return "";

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;

        if (typeof item === "object") {
          return Object.values(item).filter(Boolean).join(" - ");
        }

        return String(item);
      })
      .join("\n");
  }

  return String(value);
}

function splitToList(text) {
  if (!text) return [];

  return String(text)
    .split(/\n|,|•/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function limitWords(text, maxWords) {
  const words = String(text).trim().split(/\s+/);

  if (words.length <= maxWords) return String(text).trim();

  return words.slice(0, maxWords).join(" ") + ".";
}

/* ================================
   Meta
================================ */

function updateTemplateMeta() {
  if (cvTemplateMeta) {
    cvTemplateMeta.textContent = "Template: Professional Resume";
  }
}

/* ================================
   Daily AI Limit
================================ */

function getLimitData() {
  const today = new Date().toISOString().slice(0, 10);
  const saved = localStorage.getItem(LIMIT_KEY);

  if (!saved) {
    return {
      date: today,
      used: 0
    };
  }

  try {
    const data = JSON.parse(saved);

    if (data.date !== today) {
      return {
        date: today,
        used: 0
      };
    }

    return data;
  } catch (error) {
    return {
      date: today,
      used: 0
    };
  }
}

function canUseAiGeneration() {
  const data = getLimitData();
  return data.used < DAILY_LIMIT;
}

function increaseAiUsage() {
  const data = getLimitData();

  localStorage.setItem(
    LIMIT_KEY,
    JSON.stringify({
      date: data.date,
      used: data.used + 1
    })
  );
}

function updateLimitStatus() {
  if (!cvLimitStatus) return;

  const data = getLimitData();
  const remaining = Math.max(DAILY_LIMIT - data.used, 0);

  cvLimitStatus.textContent = `${remaining} AI Uses Left Today`;
}

/* ================================
   UI Helpers
================================ */

function setGenerateLoading(isLoading) {
  if (!generateCvBtn) return;

  if (isLoading) {
    generateCvBtn.disabled = true;
    generateCvBtn.textContent = "Generating...";
  } else {
    generateCvBtn.disabled = false;
    generateCvBtn.textContent = "Generate AI CV";
  }
}

function showCvMessage(message, type = "success") {
  if (!cvMessageBox) return;

  cvMessageBox.textContent = message;
  cvMessageBox.className = `ai-cv-message ${type}`;
  cvMessageBox.classList.remove("hidden");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}