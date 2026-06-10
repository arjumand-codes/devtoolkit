/* ================================
   DevToolKit - AI CV Generator
   File: js/cv-generator.js
================================ */

const cvForm = document.getElementById("cvGeneratorForm");
const cvPreview = document.getElementById("cvPreview");

const generateWithoutAiBtn = document.getElementById("generateWithoutAiBtn");
const generateWithAiBtn = document.getElementById("generateWithAiBtn");

const clearCvFormBtn = document.getElementById("clearCvFormBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const downloadHtmlBtn = document.getElementById("downloadHtmlBtn");
const copyCvTextBtn = document.getElementById("copyCvTextBtn");

const addLinkBtn = document.getElementById("addLinkBtn");
const addExperienceBtn = document.getElementById("addExperienceBtn");
const addEducationBtn = document.getElementById("addEducationBtn");
const addProjectBtn = document.getElementById("addProjectBtn");
const addCertificationBtn = document.getElementById("addCertificationBtn");
const addLanguageBtn = document.getElementById("addLanguageBtn");

const linksList = document.getElementById("linksList");
const experienceList = document.getElementById("experienceList");
const educationList = document.getElementById("educationList");
const projectsList = document.getElementById("projectsList");
const certificationsList = document.getElementById("certificationsList");
const languagesList = document.getElementById("languagesList");

const skillInput = document.getElementById("skillInput");
const skillsTags = document.getElementById("skillsTags");
const skillsHiddenInput = document.getElementById("skills");
const skillsError = document.getElementById("skillsError");

const summaryTextarea = document.getElementById("summary");
const summaryCounter = document.getElementById("summaryCounter");

const cvToast = document.getElementById("cvToast");
const cvAiLimitStatus = document.getElementById("cvAiLimitStatus");
const selectedTemplateMeta = document.getElementById("selectedTemplateMeta");
const autosaveMeta = document.getElementById("autosaveMeta");

const AI_LIMIT_KEY = "dtk_cv_ai_uses";
const AUTOSAVE_KEY = "dtk_cv_generator_autosave";
const FULL_AI_DAILY_LIMIT = 3;

let selectedTemplate = "classic-clean";
let skills = [];
let autosaveTimer = null;

/* ================================
   Init
================================ */

document.addEventListener("DOMContentLoaded", () => {
  initTemplateSelector();
  initRepeatableButtons();
  initSkillsInput();
  initSummaryCounter();
  initInlineAiButtons();
  initLivePreview();
  initAutosave();
  updateAiLimitStatus();

  renderPreviewFromForm();
});

/* ================================
   Template Selector
================================ */

function initTemplateSelector() {
  const templateCards = document.querySelectorAll(".cv-template-card");

  templateCards.forEach((card) => {
    card.addEventListener("click", () => {
      selectedTemplate = card.dataset.template || "classic-clean";

      templateCards.forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });

      card.classList.add("active");
      card.setAttribute("aria-pressed", "true");

      updateTemplateMeta();
      renderPreviewFromForm();
      saveFormData();
    });
  });
}

function updateTemplateMeta() {
  if (!selectedTemplateMeta) return;

  const names = {
    "classic-clean": "Classic Clean",
    "modern-sidebar": "Modern Sidebar",
    "minimalist-pro": "Minimalist Pro",
    "executive-bold": "Executive Bold",
    "tech-stack": "Tech Stack"
  };

  selectedTemplateMeta.textContent = `Template: ${names[selectedTemplate] || "Classic Clean"}`;
}

/* ================================
   Repeatable Sections
================================ */

function initRepeatableButtons() {
  if (addLinkBtn) {
    addLinkBtn.addEventListener("click", () => {
      linksList.insertAdjacentHTML("beforeend", getLinkRowHtml());
      saveFormData();
    });
  }

  if (addExperienceBtn) {
    addExperienceBtn.addEventListener("click", () => {
      experienceList.insertAdjacentHTML("beforeend", getExperienceHtml(getItemCount(".experience-item") + 1));
      renumberCards(".experience-item", "Experience");
      initInlineAiButtons();
      saveFormData();
    });
  }

  if (addEducationBtn) {
    addEducationBtn.addEventListener("click", () => {
      educationList.insertAdjacentHTML("beforeend", getEducationHtml(getItemCount(".education-item") + 1));
      renumberCards(".education-item", "Education");
      saveFormData();
    });
  }

  if (addProjectBtn) {
    addProjectBtn.addEventListener("click", () => {
      projectsList.insertAdjacentHTML("beforeend", getProjectHtml(getItemCount(".project-item") + 1));
      renumberCards(".project-item", "Project");
      initInlineAiButtons();
      saveFormData();
    });
  }

  if (addCertificationBtn) {
    addCertificationBtn.addEventListener("click", () => {
      certificationsList.insertAdjacentHTML("beforeend", getCertificationRowHtml());
      saveFormData();
    });
  }

  if (addLanguageBtn) {
    addLanguageBtn.addEventListener("click", () => {
      languagesList.insertAdjacentHTML("beforeend", getLanguageRowHtml());
      saveFormData();
    });
  }

  document.addEventListener("click", (event) => {
    const removeBtn = event.target.closest(".remove-row-btn");

    if (!removeBtn) return;

    const row = removeBtn.closest(".repeatable-row, .repeatable-card");

    if (!row) return;

    const parentList = row.parentElement;
    const siblings = parentList.querySelectorAll(".repeatable-row, .repeatable-card");

    if (siblings.length <= 1) {
      showToast("At least one row should stay in this section.", "warning");
      return;
    }

    row.remove();

    renumberCards(".experience-item", "Experience");
    renumberCards(".education-item", "Education");
    renumberCards(".project-item", "Project");

    renderPreviewFromForm();
    saveFormData();
  });

  document.addEventListener("change", (event) => {
    if (event.target.classList.contains("exp-present")) {
      const card = event.target.closest(".experience-item");
      const endInput = card?.querySelector(".exp-end");

      if (endInput) {
        if (event.target.checked) {
          endInput.value = "Present";
          endInput.disabled = true;
        } else {
          endInput.value = "";
          endInput.disabled = false;
        }
      }

      renderPreviewFromForm();
      saveFormData();
    }
  });
}

function getItemCount(selector) {
  return document.querySelectorAll(selector).length;
}

function renumberCards(selector, label) {
  document.querySelectorAll(selector).forEach((item, index) => {
    const title = item.querySelector(".repeatable-card-header strong");

    if (title) {
      title.textContent = `${label} ${index + 1}`;
    }
  });
}

function getLinkRowHtml() {
  return `
    <div class="repeatable-row link-row">
      <select class="tool-select link-type" aria-label="Link type">
        <option value="LinkedIn">LinkedIn</option>
        <option value="GitHub">GitHub</option>
        <option value="Portfolio">Portfolio</option>
        <option value="Website">Website</option>
        <option value="Twitter/X">Twitter/X</option>
        <option value="Other">Other</option>
      </select>

      <input
        type="url"
        class="tool-input link-url"
        placeholder="https://example.com"
        aria-label="Link URL"
      />

      <button type="button" class="mini-btn remove-row-btn" aria-label="Remove link">
        Remove
      </button>
    </div>
  `;
}

function getExperienceHtml(index) {
  return `
    <article class="repeatable-card experience-item">
      <div class="repeatable-card-header">
        <strong>Experience ${index}</strong>
        <button type="button" class="mini-btn remove-row-btn">Remove</button>
      </div>

      <div class="form-grid two-columns">
        <div class="form-group">
          <label>Job Title *</label>
          <input type="text" class="tool-input exp-title" placeholder="Front-End Developer" />
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label>Company *</label>
          <input type="text" class="tool-input exp-company" placeholder="Company Name" />
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label>Location</label>
          <input type="text" class="tool-input exp-location" placeholder="Lahore, Pakistan" />
        </div>

        <div class="form-group">
          <label>Start Date</label>
          <input type="text" class="tool-input exp-start" placeholder="Jan 2024" />
        </div>

        <div class="form-group">
          <label>End Date</label>
          <input type="text" class="tool-input exp-end" placeholder="Dec 2024" />
        </div>

        <label class="checkbox-control exp-present-control">
          <input type="checkbox" class="exp-present" />
          <span>Currently working here</span>
        </label>
      </div>

      <div class="cv-field-label-row">
        <label>Responsibilities / Achievements *</label>

        <button type="button" class="mini-btn ai-field-btn" data-field-type="experience_bullets">
          ✨ Improve Bullets
        </button>
      </div>

      <textarea
        class="tool-textarea cv-medium-textarea exp-responsibilities"
        placeholder="Write responsibilities or achievements. Separate points with new lines."
      ></textarea>
      <small class="field-error"></small>
    </article>
  `;
}

function getEducationHtml(index) {
  return `
    <article class="repeatable-card education-item">
      <div class="repeatable-card-header">
        <strong>Education ${index}</strong>
        <button type="button" class="mini-btn remove-row-btn">Remove</button>
      </div>

      <div class="form-grid two-columns">
        <div class="form-group">
          <label>Degree *</label>
          <input type="text" class="tool-input edu-degree" placeholder="ICS / BS Computer Science" />
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label>Field of Study</label>
          <input type="text" class="tool-input edu-field" placeholder="Computer Science" />
        </div>

        <div class="form-group">
          <label>Institution *</label>
          <input type="text" class="tool-input edu-institution" placeholder="College / University Name" />
          <small class="field-error"></small>
        </div>

        <div class="form-group">
          <label>Location</label>
          <input type="text" class="tool-input edu-location" placeholder="Lahore, Pakistan" />
        </div>

        <div class="form-group">
          <label>Graduation Year</label>
          <input type="text" class="tool-input edu-year" placeholder="2024" />
        </div>
      </div>

      <div class="form-group">
        <label>Relevant Courses or Achievements</label>
        <textarea class="tool-textarea cv-small-textarea edu-details" placeholder="Optional courses, marks, achievements, or activities."></textarea>
      </div>
    </article>
  `;
}

function getProjectHtml(index) {
  return `
    <article class="repeatable-card project-item">
      <div class="repeatable-card-header">
        <strong>Project ${index}</strong>
        <button type="button" class="mini-btn remove-row-btn">Remove</button>
      </div>

      <div class="form-grid two-columns">
        <div class="form-group">
          <label>Project Name</label>
          <input type="text" class="tool-input project-name" placeholder="DevToolKit" />
        </div>

        <div class="form-group">
          <label>Tech Stack</label>
          <input type="text" class="tool-input project-tech" placeholder="HTML, CSS, JavaScript, Vercel" />
        </div>

        <div class="form-group">
          <label>Project Link</label>
          <input type="url" class="tool-input project-link" placeholder="https://example.com" />
        </div>
      </div>

      <div class="cv-field-label-row">
        <label>Project Description</label>

        <button type="button" class="mini-btn ai-field-btn" data-field-type="project_description">
          ✨ Improve Description
        </button>
      </div>

      <textarea class="tool-textarea cv-small-textarea project-description" placeholder="Write what the project does and what you built."></textarea>
    </article>
  `;
}

function getCertificationRowHtml() {
  return `
    <div class="repeatable-row certification-row">
      <input type="text" class="tool-input cert-name" placeholder="Certification Name" />
      <input type="text" class="tool-input cert-issuer" placeholder="Issuer" />
      <input type="text" class="tool-input cert-year" placeholder="Year" />
      <button type="button" class="mini-btn remove-row-btn">Remove</button>
    </div>
  `;
}

function getLanguageRowHtml() {
  return `
    <div class="repeatable-row language-row">
      <input type="text" class="tool-input lang-name" placeholder="English" />

      <select class="tool-select lang-level">
        <option value="Basic">Basic</option>
        <option value="Conversational">Conversational</option>
        <option value="Fluent">Fluent</option>
        <option value="Native">Native</option>
      </select>

      <button type="button" class="mini-btn remove-row-btn">Remove</button>
    </div>
  `;
}

/* ================================
   Skills Tags
================================ */

function initSkillsInput() {
  if (!skillInput) return;

  skillInput.addEventListener("keydown", (event) => {
    const key = event.key;
    const isMobile = window.innerWidth <= 768;

    const shouldAddSkill =
      key === "Enter" ||
      key === "," ||
      (isMobile && key === " ");

    if (shouldAddSkill) {
      event.preventDefault();

      const value = skillInput.value.trim().replace(/,$/, "");

      if (value) {
        addSkill(value);
        skillInput.value = "";
      }

      return;
    }

    if (key === "Backspace" && !skillInput.value && skills.length > 0) {
      skills.pop();
      renderSkills();
      renderPreviewFromForm();
      saveFormData();
    }
  });

  skillInput.addEventListener("input", () => {
    const isMobile = window.innerWidth <= 768;
    const value = skillInput.value;

    if (!isMobile) return;

    if (value.includes(",") || value.endsWith(" ")) {
      const cleanedValue = value.replace(/,/g, " ").trim();

      if (cleanedValue) {
        addSkill(cleanedValue);
        skillInput.value = "";
      }
    }
  });

  skillInput.addEventListener("blur", () => {
    const value = skillInput.value.trim().replace(/,$/, "");

    if (value) {
      addSkill(value);
      skillInput.value = "";
    }
  });

  skillsTags?.addEventListener("click", (event) => {
    const removeBtn = event.target.closest("[data-remove-skill]");

    if (!removeBtn) return;

    const skill = removeBtn.dataset.removeSkill;
    skills = skills.filter((item) => item !== skill);

    renderSkills();
    renderPreviewFromForm();
    saveFormData();
  });
}

function addSkill(value) {
  const skill = String(value || "").trim();

  if (!skill) return;

  if (skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
    showToast("Skill already added.", "warning");
    return;
  }

  skills.push(skill);
  renderSkills();
  renderPreviewFromForm();
  saveFormData();
}

function addSkillsFromText(text) {
  String(text || "")
    .split(/\n|,|•/)
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((skill) => addSkill(skill));
}

function renderSkills() {
  if (!skillsTags || !skillsHiddenInput) return;

  skillsTags.innerHTML = skills
    .map((skill) => {
      return `
        <span class="skill-tag">
          ${escapeHtml(skill)}
          <button type="button" data-remove-skill="${escapeHtml(skill)}" aria-label="Remove ${escapeHtml(skill)}">×</button>
        </span>
      `;
    })
    .join("");

  skillsHiddenInput.value = skills.join(", ");

  if (skills.length > 0 && skillsError) {
    skillsError.classList.remove("show");
    skillsError.textContent = "";
  }
}

/* ================================
   Summary Counter
================================ */

function initSummaryCounter() {
  if (!summaryTextarea || !summaryCounter) return;

  const update = () => {
    const count = summaryTextarea.value.length;
    summaryCounter.textContent = `${count} characters`;

    if (count > 200) {
      summaryCounter.textContent = `${count} characters — keep summary short`;
    }
  };

  summaryTextarea.addEventListener("input", update);
  update();
}

/* ================================
   Inline Field AI
================================ */

function initInlineAiButtons() {
  document.querySelectorAll(".ai-field-btn").forEach((button) => {
    if (button.dataset.bound === "true") return;

    button.dataset.bound = "true";

    button.addEventListener("click", async () => {
      const fieldType = button.dataset.fieldType;

      if (!fieldType) return;

      await handleInlineAi(button, fieldType);
    });
  });
}

async function handleInlineAi(button, fieldType) {
  const context = collectCvData();

  setButtonLoading(button, true);

  try {
    const response = await fetch("/api/generate-field", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fieldType,
        context
      })
    });

    const data = await response.json();

    setButtonLoading(button, false);

    if (!response.ok || !data.success) {
      showToast(data.message || "AI field generation failed.", "error");
      return;
    }

    const result = data.result || "";

    if (!result) {
      showToast("AI did not return usable content.", "warning");
      return;
    }

    applyFieldAiResult(button, fieldType, result);
    showToast("AI content added successfully.", "success");
    renderPreviewFromForm();
    saveFormData();
  } catch (error) {
    setButtonLoading(button, false);
    showToast("AI request failed. Please try again.", "error");
  }
}

function applyFieldAiResult(button, fieldType, result) {
  if (fieldType === "summary") {
    if (summaryTextarea) {
      const existingSummary = summaryTextarea.value.trim();
      const aiSummary = result.trim();

      if (existingSummary) {
        summaryTextarea.value = `${existingSummary}\n\n${aiSummary}`;
      } else {
        summaryTextarea.value = aiSummary;
      }

      summaryTextarea.dispatchEvent(new Event("input"));
    }

    return;
  }

  if (fieldType === "skills_suggestions") {
    addSkillsFromText(result);
    return;
  }

  if (fieldType === "experience_bullets") {
    const card = button.closest(".experience-item");
    const textarea = card?.querySelector(".exp-responsibilities");

    if (textarea) {
      const existingText = textarea.value.trim();
      const aiText = result.trim();

      textarea.value = existingText ? `${existingText}\n${aiText}` : aiText;
    }

    return;
  }

  if (fieldType === "project_description") {
    const card = button.closest(".project-item");
    const textarea = card?.querySelector(".project-description");

    if (textarea) {
      const existingText = textarea.value.trim();
      const aiText = result.trim();

      textarea.value = existingText ? `${existingText}\n\n${aiText}` : aiText;
    }
  }
}

function setButtonLoading(button, isLoading) {
  if (!button) return;

  if (isLoading) {
    button.classList.add("is-loading");
    button.disabled = true;
  } else {
    button.classList.remove("is-loading");
    button.disabled = false;
  }
}

/* ================================
   Generate Buttons
================================ */

if (generateWithoutAiBtn) {
  generateWithoutAiBtn.addEventListener("click", () => {
    const validation = validateCvForm({
      strict: true
    });

    if (!validation.valid) {
      showToast(`${validation.missingCount} required field(s) missing. Please fix highlighted fields.`, "error");
      scrollToFirstError();
      return;
    }

    renderPreviewFromForm();
    saveFormData();

    const previewPanel = document.querySelector(".cv-preview-panel");

    if (previewPanel) {
      setTimeout(() => {
        previewPanel.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 150);
    }

    showToast("CV preview generated successfully.", "success");
  });
}

if (generateWithAiBtn) {
  generateWithAiBtn.addEventListener("click", async () => {
    const validation = validateCvForm({
      strict: false
    });

    if (!validation.valid) {
      showToast(`${validation.missingCount} required field(s) missing for AI generation.`, "error");
      scrollToFirstError();
      return;
    }

    const formData = collectCvData();

    setButtonText(generateWithAiBtn, "Generating...");

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      setButtonText(generateWithAiBtn, "Generate CV With AI");

      if (!response.ok || !data.success) {
        showToast(data.message || "AI CV generation failed.", "error");
        return;
      }

      const improvedData = normalizeApiCvData(data.cv || formData);

      fillFormFromData(improvedData);
      renderCv(improvedData);

      showToast("AI CV generated successfully.", "success");
      saveFormData();
    } catch (error) {
      setButtonText(generateWithAiBtn, "Generate CV With AI");
      showToast("AI CV generation failed. Please try again.", "error");
    }
  });
}

function setButtonText(button, text) {
  if (!button) return;
  button.textContent = text;
}

/* ================================
   Validation
================================ */

function validateCvForm({ strict }) {
  clearValidation();

  let missingCount = 0;

  const requiredInputs = cvForm.querySelectorAll("[data-required='true']");

  requiredInputs.forEach((input) => {
    const value = input.value.trim();

    if (!value) {
      markFieldError(input, "This field is required.");
      missingCount++;
    }
  });

  const email = getValue("email");

  if (email && !isValidEmail(email)) {
    markFieldError(document.getElementById("email"), "Enter a valid email address.");
    missingCount++;
  }

  const phone = getValue("phone");

  if (phone && !isValidPhone(phone)) {
    markFieldError(document.getElementById("phone"), "Enter a valid phone number.");
    missingCount++;
  }

  if (!skills.length) {
    if (skillsError) {
      skillsError.textContent = "Add at least one skill.";
      skillsError.classList.add("show");
    }

    document.querySelector(".cv-form-section:has(#skillsTagsBox)")?.classList.add("has-error");
    missingCount++;
  }

  const experiences = getExperienceData();
  const hasExperience = experiences.some((item) => item.title && item.company);

  if (!hasExperience) {
    const firstExperience = document.querySelector(".experience-item");
    firstExperience?.classList.add("has-error");
    missingCount++;
  }

  if (strict) {
    const education = getEducationData();
    const hasEducation = education.some((item) => item.degree && item.institution);

    if (!hasEducation) {
      const firstEducation = document.querySelector(".education-item");
      firstEducation?.classList.add("has-error");
      missingCount++;
    }
  }

  return {
    valid: missingCount === 0,
    missingCount
  };
}

function clearValidation() {
  document.querySelectorAll(".has-error").forEach((item) => {
    item.classList.remove("has-error");
  });

  document.querySelectorAll(".field-error").forEach((item) => {
    item.textContent = "";
    item.classList.remove("show");
  });

  document.querySelectorAll(".tool-input, .tool-select, .tool-textarea").forEach((item) => {
    item.classList.remove("has-error");
  });
}

function markFieldError(input, message) {
  if (!input) return;

  input.classList.add("has-error");

  const formGroup = input.closest(".form-group") || input.closest(".cv-form-section");
  const error = formGroup?.querySelector(".field-error");

  formGroup?.classList.add("has-error");

  if (error) {
    error.textContent = message;
    error.classList.add("show");
  }
}

function scrollToFirstError() {
  const firstError = document.querySelector(".has-error, .field-error.show");

  if (firstError) {
    firstError.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^[0-9+\-\s()]{7,22}$/.test(phone);
}

/* ================================
   Live Preview
================================ */

function initLivePreview() {
  if (!cvForm) return;

  cvForm.addEventListener("input", debounce(() => {
    renderPreviewFromForm();
    queueAutosave();
  }, 350));

  cvForm.addEventListener("change", debounce(() => {
    renderPreviewFromForm();
    queueAutosave();
  }, 350));
}

function renderPreviewFromForm() {
  const data = collectCvData();

  if (!data.fullName && !data.jobTitle && !data.summary && skills.length === 0) {
    renderEmptyPreview();
    return;
  }

  renderCv(data);
}

function renderEmptyPreview() {
  if (!cvPreview) return;

  cvPreview.className = "cv-preview cv-template-classic-clean";
  cvPreview.innerHTML = `
    <div class="cv-empty-state">
      <span>CV</span>
      <h3>Your Resume Preview Will Appear Here</h3>
      <p>
        Fill the form and generate your CV. The selected professional template will appear here.
      </p>
    </div>
  `;
}

function renderCv(data) {
  if (!cvPreview) return;

  cvPreview.className = `cv-preview cv-template-${selectedTemplate}`;

  if (selectedTemplate === "modern-sidebar") {
    cvPreview.innerHTML = renderModernSidebarCv(data);
    return;
  }

  if (selectedTemplate === "executive-bold") {
    cvPreview.innerHTML = renderExecutiveBoldCv(data);
    return;
  }

  cvPreview.innerHTML = renderStandardCv(data);
}

function renderStandardCv(data) {
  return `
    <div class="cv-doc">
      ${renderHeader(data)}
      ${renderBodySections(data)}
    </div>
  `;
}

function renderModernSidebarCv(data) {
  return `
    <div class="cv-doc">
      <aside class="cv-sidebar">
        ${renderHeader(data)}
        ${renderSkillsSection(data.skills)}
        ${renderLinksBlock(data.links)}
        ${renderLanguagesSection(data.languages)}
        ${renderInterestsSection(data.interests)}
      </aside>

      <main class="cv-main">
        ${renderSummarySection(data.summary)}
        ${renderExperienceSection(data.experience)}
        ${renderProjectsSection(data.projects)}
        ${renderEducationSection(data.education)}
        ${renderCertificationsSection(data.certifications)}
      </main>
    </div>
  `;
}

function renderExecutiveBoldCv(data) {
  return `
    <div class="cv-doc">
      ${renderHeader(data)}

      <div class="cv-body">
        ${renderBodySections(data)}
      </div>
    </div>
  `;
}

function renderBodySections(data) {
  return `
    ${renderSummarySection(data.summary)}
    ${renderSkillsSection(data.skills)}
    ${renderExperienceSection(data.experience)}
    ${renderProjectsSection(data.projects)}
    ${renderEducationSection(data.education)}
    ${renderCertificationsSection(data.certifications)}
    ${renderLanguagesSection(data.languages)}
    ${renderInterestsSection(data.interests)}
  `;
}

function renderHeader(data) {
  return `
    <header class="cv-header">
      <h1 class="cv-name">${escapeHtml(data.fullName || "Your Name")}</h1>
      <p class="cv-role">${escapeHtml(data.jobTitle || "Your Job Title")}</p>

      <div class="cv-contact-list">
        ${data.email ? `<span>${escapeHtml(data.email)}</span>` : ""}
        ${data.phone ? `<span>${escapeHtml(data.phone)}</span>` : ""}
        ${data.location ? `<span>${escapeHtml(data.location)}</span>` : ""}
      </div>

      ${renderLinksInline(data.links)}
    </header>
  `;
}

function renderLinksInline(links) {
  if (!links || !links.length) return "";

  return `
    <div class="cv-link-list">
      ${links
        .map((link) => {
          return `<a href="${escapeAttr(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.type)}</a>`;
        })
        .join("")}
    </div>
  `;
}

function renderLinksBlock(links) {
  if (!links || !links.length) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Links</h2>
      <ul>
        ${links
          .map((link) => {
            return `<li><a href="${escapeAttr(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.type)}</a></li>`;
          })
          .join("")}
      </ul>
    </section>
  `;
}

function renderSummarySection(summary) {
  if (!summary) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Professional Summary</h2>
      <p>${escapeHtml(summary)}</p>
    </section>
  `;
}

function renderSkillsSection(skillList) {
  if (!skillList || !skillList.length) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Skills</h2>
      <div class="cv-skills">
        ${skillList.map((skill) => `<span class="cv-skill">${escapeHtml(skill)}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderExperienceSection(experience) {
  if (!experience || !experience.length) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Work Experience</h2>

      ${experience
        .map((item) => {
          return `
            <article class="cv-item">
              <h3 class="cv-item-title">${escapeHtml(item.title)}${item.company ? ` — ${escapeHtml(item.company)}` : ""}</h3>
              <p class="cv-item-meta">
                ${[item.location, formatDateRange(item.startDate, item.endDate)].filter(Boolean).map(escapeHtml).join(" | ")}
              </p>
              ${renderBulletList(item.responsibilities)}
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderProjectsSection(projects) {
  if (!projects || !projects.length) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Projects</h2>

      ${projects
        .map((item) => {
          return `
            <article class="cv-item">
              <h3 class="cv-item-title">${escapeHtml(item.name)}</h3>
              <p class="cv-item-meta">
                ${[item.techStack, item.link].filter(Boolean).map(escapeHtml).join(" | ")}
              </p>
              ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderEducationSection(education) {
  if (!education || !education.length) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Education</h2>

      ${education
        .map((item) => {
          return `
            <article class="cv-item">
              <h3 class="cv-item-title">${escapeHtml([item.degree, item.field].filter(Boolean).join(" - "))}</h3>
              <p class="cv-item-meta">
                ${[item.institution, item.location, item.year].filter(Boolean).map(escapeHtml).join(" | ")}
              </p>
              ${item.details ? `<p>${escapeHtml(item.details)}</p>` : ""}
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function renderCertificationsSection(certifications) {
  if (!certifications || !certifications.length) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Certifications</h2>
      <ul>
        ${certifications
          .map((item) => {
            const text = [item.name, item.issuer, item.year].filter(Boolean).join(" — ");
            return `<li>${escapeHtml(text)}</li>`;
          })
          .join("")}
      </ul>
    </section>
  `;
}

function renderLanguagesSection(languages) {
  if (!languages || !languages.length) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Languages</h2>
      <ul>
        ${languages.map((item) => `<li>${escapeHtml(item.name)} — ${escapeHtml(item.level)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function renderInterestsSection(interests) {
  if (!interests) return "";

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Interests</h2>
      <p>${escapeHtml(interests)}</p>
    </section>
  `;
}

function renderBulletList(text) {
  const items = splitLines(text);

  if (!items.length) return "";

  return `
    <ul>
      ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
}

/* ================================
   Collect Data
================================ */

function collectCvData() {
  return {
    fullName: getValue("fullName"),
    jobTitle: getValue("jobTitle"),
    email: getValue("email"),
    phone: getValue("phone"),
    location: getValue("location"),
    links: getLinksData(),
    summary: getValue("summary"),
    skills: [...skills],
    experience: getExperienceData(),
    education: getEducationData(),
    projects: getProjectsData(),
    certifications: getCertificationsData(),
    languages: getLanguagesData(),
    interests: getValue("interests"),
    template: selectedTemplate
  };
}

function getValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : "";
}

function getLinksData() {
  return [...document.querySelectorAll(".link-row")]
    .map((row) => {
      return {
        type: row.querySelector(".link-type")?.value.trim() || "",
        url: row.querySelector(".link-url")?.value.trim() || ""
      };
    })
    .filter((item) => item.type && item.url);
}

function getExperienceData() {
  return [...document.querySelectorAll(".experience-item")]
    .map((item) => {
      return {
        title: item.querySelector(".exp-title")?.value.trim() || "",
        company: item.querySelector(".exp-company")?.value.trim() || "",
        location: item.querySelector(".exp-location")?.value.trim() || "",
        startDate: item.querySelector(".exp-start")?.value.trim() || "",
        endDate: item.querySelector(".exp-present")?.checked ? "Present" : item.querySelector(".exp-end")?.value.trim() || "",
        responsibilities: item.querySelector(".exp-responsibilities")?.value.trim() || ""
      };
    })
    .filter((item) => item.title || item.company || item.responsibilities);
}

function getEducationData() {
  return [...document.querySelectorAll(".education-item")]
    .map((item) => {
      return {
        degree: item.querySelector(".edu-degree")?.value.trim() || "",
        field: item.querySelector(".edu-field")?.value.trim() || "",
        institution: item.querySelector(".edu-institution")?.value.trim() || "",
        location: item.querySelector(".edu-location")?.value.trim() || "",
        year: item.querySelector(".edu-year")?.value.trim() || "",
        details: item.querySelector(".edu-details")?.value.trim() || ""
      };
    })
    .filter((item) => item.degree || item.institution || item.details);
}

function getProjectsData() {
  return [...document.querySelectorAll(".project-item")]
    .map((item) => {
      return {
        name: item.querySelector(".project-name")?.value.trim() || "",
        description: item.querySelector(".project-description")?.value.trim() || "",
        techStack: item.querySelector(".project-tech")?.value.trim() || "",
        link: item.querySelector(".project-link")?.value.trim() || ""
      };
    })
    .filter((item) => item.name || item.description || item.techStack);
}

function getCertificationsData() {
  return [...document.querySelectorAll(".certification-row")]
    .map((row) => {
      return {
        name: row.querySelector(".cert-name")?.value.trim() || "",
        issuer: row.querySelector(".cert-issuer")?.value.trim() || "",
        year: row.querySelector(".cert-year")?.value.trim() || ""
      };
    })
    .filter((item) => item.name || item.issuer || item.year);
}

function getLanguagesData() {
  return [...document.querySelectorAll(".language-row")]
    .map((row) => {
      return {
        name: row.querySelector(".lang-name")?.value.trim() || "",
        level: row.querySelector(".lang-level")?.value.trim() || ""
      };
    })
    .filter((item) => item.name);
}

/* ================================
   Normalize API CV Data
================================ */

function normalizeApiCvData(cv) {
  return {
    fullName: cv.fullName || "",
    jobTitle: cv.jobTitle || "",
    email: cv.email || "",
    phone: cv.phone || "",
    location: cv.location || "",
    links: Array.isArray(cv.links) ? cv.links : getLinksData(),
    summary: cv.summary || "",
    skills: Array.isArray(cv.skills) ? cv.skills : splitLines(cv.skills),
    experience: Array.isArray(cv.experience) ? cv.experience : [],
    education: Array.isArray(cv.education) ? cv.education : [],
    projects: Array.isArray(cv.projects) ? cv.projects : [],
    certifications: Array.isArray(cv.certifications) ? cv.certifications : [],
    languages: Array.isArray(cv.languages) ? cv.languages : [],
    interests: cv.interests || "",
    template: selectedTemplate
  };
}

/* ================================
   AI Limit
================================ */

function updateAiLimitStatus() {
  if (!cvAiLimitStatus) return;

  cvAiLimitStatus.textContent = "AI Mode Active";
}

/* ================================
   Download / Copy
================================ */

if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener("click", async () => {
    if (!cvPreview || cvPreview.querySelector(".cv-empty-state")) {
      showToast("Generate a CV first.", "warning");
      return;
    }

    downloadPdfBtn.disabled = true;
    downloadPdfBtn.textContent = "Preparing PDF...";

    try {
      await loadPdfLibraries();
      await downloadCvAsPdf();

      showToast("PDF downloaded successfully.", "success");
    } catch (error) {
      console.error("PDF download error:", error);
      showToast("PDF download failed. Use Download HTML for now.", "error");
    } finally {
      downloadPdfBtn.disabled = false;
      downloadPdfBtn.textContent = "Download PDF";
    }
  });
}

if (downloadHtmlBtn) {
  downloadHtmlBtn.addEventListener("click", () => {
    if (cvPreview?.querySelector(".cv-empty-state")) {
      showToast("Generate a CV first.", "warning");
      return;
    }

    const html = createStandaloneHtml();
    const blob = new Blob([html], {
      type: "text/html"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${slugify(getValue("fullName") || "cv")}.html`;
    link.click();

    URL.revokeObjectURL(url);
    showToast("HTML CV downloaded.", "success");
  });
}

if (copyCvTextBtn) {
  copyCvTextBtn.addEventListener("click", async () => {
    if (cvPreview?.querySelector(".cv-empty-state")) {
      showToast("Generate a CV first.", "warning");
      return;
    }

    const plainText = cvPreview.innerText.trim();

    try {
      await navigator.clipboard.writeText(plainText);
      showToast("CV text copied to clipboard.", "success");
    } catch (error) {
      showToast("Could not copy CV text.", "error");
    }
  });
}

function createStandaloneHtml() {
  const cvTitle = getValue("fullName") || "CV";
  const cvHtml = cvPreview.outerHTML;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(cvTitle)}</title>

<style>
* {
  box-sizing: border-box;
}

@page {
  size: A4;
  margin: 12mm 12mm 14mm 12mm;
}

html,
body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
  overflow: visible !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  padding: 0;
}

/* Main CV */
.cv-preview {
  width: 100%;
  max-width: 186mm;
  margin: 0 auto;
  background: #ffffff;
  color: #111827;
  box-shadow: none !important;
  overflow: visible !important;
}

.cv-doc {
  width: 100%;
  min-height: auto !important;
  height: auto !important;
  max-height: none !important;
  padding: 0;
  background: #ffffff;
  color: #111827;
  overflow: visible !important;
  font-family: Arial, Helvetica, sans-serif;
}

/* Header */
.cv-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #111827;
}

.cv-name {
  margin: 0 0 4px;
  color: #111827;
  font-family: Georgia, "Times New Roman", serif;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.03em;
  font-weight: 800;
}

.cv-role {
  margin: 0 0 10px;
  color: #111827;
  font-size: 14px;
  line-height: 1.2;
  font-weight: 800;
}

.cv-contact-list,
.cv-link-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  align-items: center;
  margin-top: 7px;
  color: #4b5563;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 700;
}

.cv-link-list a {
  color: #2563eb;
  text-decoration: none;
}

/* Sections */
.cv-section {
  margin-top: 13px;
  break-inside: auto;
  page-break-inside: auto;
}

.cv-section-title {
  margin: 0 0 7px;
  padding-bottom: 4px;
  border-bottom: 1px solid #cbd5e1;
  color: #111827;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 12.5px;
  line-height: 1.2;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  break-after: avoid;
  page-break-after: avoid;
}

.cv-section p {
  margin: 0 0 6px;
  color: #1f2937;
  font-size: 11.5px;
  line-height: 1.42;
}

/* Items */
.cv-item {
  margin-bottom: 10px;
  break-inside: auto;
  page-break-inside: auto;
}

.cv-item:last-child {
  margin-bottom: 0;
}

.cv-item-title {
  margin: 0 0 2px;
  color: #111827;
  font-size: 12.5px;
  line-height: 1.25;
  font-weight: 900;
  break-after: avoid;
  page-break-after: avoid;
}

.cv-item-meta {
  margin: 0 0 5px;
  color: #374151;
  font-size: 10.5px;
  line-height: 1.3;
  font-weight: 700;
  break-after: avoid;
  page-break-after: avoid;
}

/* Skills */
.cv-skills {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 6px 7px;
  margin: 8px auto 2px;
  text-align: center;
}

.cv-skill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 4px 9px;
  border: 1px solid #dbe3ea;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 10.5px;
  line-height: 1.2;
  font-weight: 800;
  text-align: center;
}

/* Bullets */
.cv-section ul {
  margin: 5px 0 0;
  padding-left: 17px;
  list-style: disc;
  list-style-position: outside;
}

.cv-section li {
  margin: 0 0 3px;
  padding-left: 2px;
  color: #1f2937;
  font-size: 11.5px;
  line-height: 1.42;
  text-align: left;
  break-inside: auto;
  page-break-inside: auto;
}

/* Classic Clean */
.cv-template-classic-clean .cv-doc {
  font-family: Arial, Helvetica, sans-serif;
}

.cv-template-classic-clean .cv-name {
  font-family: Georgia, "Times New Roman", serif;
}

.cv-template-classic-clean .cv-role {
  font-family: Arial, Helvetica, sans-serif;
}

/* Modern Sidebar */
.cv-template-modern-sidebar .cv-doc {
  display: grid;
  grid-template-columns: 58mm 1fr;
  gap: 8mm;
  min-height: auto !important;
}

.cv-template-modern-sidebar .cv-sidebar {
  padding: 8mm 6mm;
  background: #111827;
  color: #ffffff;
}

.cv-template-modern-sidebar .cv-main {
  padding: 8mm 0;
}

.cv-template-modern-sidebar .cv-name,
.cv-template-modern-sidebar .cv-role,
.cv-template-modern-sidebar .cv-sidebar .cv-section-title,
.cv-template-modern-sidebar .cv-sidebar p,
.cv-template-modern-sidebar .cv-sidebar li,
.cv-template-modern-sidebar .cv-sidebar span,
.cv-template-modern-sidebar .cv-sidebar a {
  color: #ffffff;
}

.cv-template-modern-sidebar .cv-role {
  color: #ccf381;
}

.cv-template-modern-sidebar .cv-sidebar .cv-skill {
  background: rgba(204, 243, 129, 0.14);
  color: #ccf381;
  border-color: rgba(204, 243, 129, 0.25);
}

/* Minimalist Pro */
.cv-template-minimalist-pro .cv-header {
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.cv-template-minimalist-pro .cv-contact-list,
.cv-template-minimalist-pro .cv-link-list {
  justify-content: center;
}

/* Executive Bold */
.cv-template-executive-bold .cv-header {
  padding: 10mm;
  margin-bottom: 14px;
  background: #111827;
  color: #ffffff;
  border-bottom: 0;
}

.cv-template-executive-bold .cv-name,
.cv-template-executive-bold .cv-role,
.cv-template-executive-bold .cv-contact-list,
.cv-template-executive-bold .cv-link-list,
.cv-template-executive-bold .cv-link-list a {
  color: #ffffff;
}

.cv-template-executive-bold .cv-body {
  padding: 0;
}

/* Tech Stack */
.cv-template-tech-stack .cv-doc {
  border-left: 6px solid #22c55e;
  padding-left: 8mm;
}

.cv-template-tech-stack .cv-header {
  padding: 7mm;
  background: #0f172a;
  border-radius: 12px;
  color: #ffffff;
  border-bottom: 0;
}

.cv-template-tech-stack .cv-name,
.cv-template-tech-stack .cv-role,
.cv-template-tech-stack .cv-contact-list,
.cv-template-tech-stack .cv-link-list,
.cv-template-tech-stack .cv-link-list a {
  color: #ffffff;
}

.cv-template-tech-stack .cv-role {
  color: #ccf381;
  font-family: Consolas, Monaco, monospace;
}

/* Print Rules */
@media print {
  @page {
    size: A4;
    margin: 12mm 12mm 14mm 12mm;
  }

  html,
  body {
    width: auto !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: visible !important;
  }

  .cv-preview {
    width: 100% !important;
    max-width: 186mm !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    margin: 0 auto !important;
    padding: 0 !important;
    background: #ffffff !important;
    box-shadow: none !important;
    overflow: visible !important;
  }

  .cv-doc {
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    background: #ffffff !important;
  }

  .cv-section {
    margin-top: 12px !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .cv-item {
    margin-bottom: 9px !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .cv-header {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .cv-section-title,
  .cv-item-title,
  .cv-item-meta,
  h1,
  h2,
  h3 {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  .cv-section li,
  .cv-section p {
    break-inside: auto !important;
    page-break-inside: auto !important;
  }
}
</style>
</head>

<body>
${cvHtml}
</body>
</html>`;
}

/* ================================
   Direct PDF Download
   Uses html2pdf.js
================================ */



/* ================================
   Direct PDF Download
   html2canvas + jsPDF
================================ */


function loadPdfLibraries() {
  return new Promise((resolve, reject) => {
    const scriptsToLoad = [];

    if (!window.html2canvas) {
      scriptsToLoad.push({
        id: "html2canvas-cdn",
        src: "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
      });
    }

    if (!window.jspdf) {
      scriptsToLoad.push({
        id: "jspdf-cdn",
        src: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
      });
    }

    if (!scriptsToLoad.length) {
      resolve();
      return;
    }

    let loadedCount = 0;

    scriptsToLoad.forEach((scriptData) => {
      const existingScript = document.getElementById(scriptData.id);

      if (existingScript) {
        if (window.html2canvas && window.jspdf) {
          loadedCount++;

          if (loadedCount === scriptsToLoad.length) {
            resolve();
          }

          return;
        }

        existingScript.addEventListener("load", handleLoaded);
        existingScript.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.id = scriptData.id;
      script.src = scriptData.src;
      script.async = true;

      script.onload = handleLoaded;
      script.onerror = () => reject(new Error(`Failed to load ${scriptData.id}`));

      document.body.appendChild(script);
    });

    function handleLoaded() {
      loadedCount++;

      if (loadedCount === scriptsToLoad.length) {
        setTimeout(() => {
          if (window.html2canvas && window.jspdf) {
            resolve();
          } else {
            reject(new Error("PDF libraries are not available."));
          }
        }, 250);
      }
    }
  });
}

async function downloadCvAsPdf() {
  const cvHtml = createStandaloneHtml();

  const printFrame = document.createElement("iframe");

  printFrame.style.position = "fixed";
  printFrame.style.left = "-9999px";
  printFrame.style.top = "0";
  printFrame.style.width = "0";
  printFrame.style.height = "0";
  printFrame.style.border = "0";
  printFrame.style.opacity = "0";
  printFrame.style.pointerEvents = "none";

  document.body.appendChild(printFrame);

  const frameWindow = printFrame.contentWindow;
  const frameDoc = frameWindow.document;

  frameDoc.open();
  frameDoc.write(cvHtml);
  frameDoc.close();

  printFrame.onload = () => {
    setTimeout(() => {
      frameWindow.focus();
      frameWindow.print();

      frameWindow.onafterprint = () => {
        printFrame.remove();
      };

      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          printFrame.remove();
        }
      }, 5000);
    }, 600);
  };
}

function waitForPdfRender() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 500);
      });
    });
  });
}

/* ================================
   Autosave
================================ */

function initAutosave() {
  loadSavedFormData();

  setInterval(() => {
    saveFormData();
  }, 5000);
}

function queueAutosave() {
  clearTimeout(autosaveTimer);

  autosaveTimer = setTimeout(() => {
    saveFormData();
  }, 600);
}

function saveFormData() {
  const data = collectCvData();

  localStorage.setItem(
    AUTOSAVE_KEY,
    JSON.stringify({
      data,
      selectedTemplate,
      savedAt: new Date().toISOString()
    })
  );

  if (autosaveMeta) {
    autosaveMeta.textContent = "Autosaved";
  }
}

function loadSavedFormData() {
  const saved = localStorage.getItem(AUTOSAVE_KEY);

  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);

    if (!parsed.data) return;

    if (!confirm("Restore your autosaved CV draft?")) return;

    fillFormFromData(parsed.data);

    selectedTemplate = parsed.selectedTemplate || parsed.data.template || "classic-clean";
    setTemplateActive(selectedTemplate);

    renderPreviewFromForm();

    showToast("Autosaved draft restored.", "success");
  } catch (error) {
    localStorage.removeItem(AUTOSAVE_KEY);
  }
}

function fillFormFromData(data) {
  setValue("fullName", data.fullName);
  setValue("jobTitle", data.jobTitle);
  setValue("email", data.email);
  setValue("phone", data.phone);
  setValue("location", data.location);
  setValue("summary", data.summary);
  setValue("interests", data.interests);

  skills = Array.isArray(data.skills) ? data.skills : [];
  renderSkills();

  if (Array.isArray(data.links) && data.links.length) {
    linksList.innerHTML = "";
    data.links.forEach((link) => {
      linksList.insertAdjacentHTML("beforeend", getLinkRowHtml());
      const row = linksList.lastElementChild;
      row.querySelector(".link-type").value = link.type || "Other";
      row.querySelector(".link-url").value = link.url || "";
    });
  }

  if (Array.isArray(data.experience) && data.experience.length) {
    experienceList.innerHTML = "";
    data.experience.forEach((item, index) => {
      experienceList.insertAdjacentHTML("beforeend", getExperienceHtml(index + 1));
      const card = experienceList.lastElementChild;

      card.querySelector(".exp-title").value = item.title || "";
      card.querySelector(".exp-company").value = item.company || "";
      card.querySelector(".exp-location").value = item.location || "";
      card.querySelector(".exp-start").value = item.startDate || "";
      card.querySelector(".exp-end").value = item.endDate || "";
      card.querySelector(".exp-responsibilities").value = item.responsibilities || "";
    });
  }

  if (Array.isArray(data.education) && data.education.length) {
    educationList.innerHTML = "";
    data.education.forEach((item, index) => {
      educationList.insertAdjacentHTML("beforeend", getEducationHtml(index + 1));
      const card = educationList.lastElementChild;

      card.querySelector(".edu-degree").value = item.degree || "";
      card.querySelector(".edu-field").value = item.field || "";
      card.querySelector(".edu-institution").value = item.institution || "";
      card.querySelector(".edu-location").value = item.location || "";
      card.querySelector(".edu-year").value = item.year || "";
      card.querySelector(".edu-details").value = item.details || "";
    });
  }

  if (Array.isArray(data.projects) && data.projects.length) {
    projectsList.innerHTML = "";
    data.projects.forEach((item, index) => {
      projectsList.insertAdjacentHTML("beforeend", getProjectHtml(index + 1));
      const card = projectsList.lastElementChild;

      card.querySelector(".project-name").value = item.name || "";
      card.querySelector(".project-tech").value = item.techStack || "";
      card.querySelector(".project-link").value = item.link || "";
      card.querySelector(".project-description").value = item.description || "";
    });
  }

  if (Array.isArray(data.certifications) && data.certifications.length) {
    certificationsList.innerHTML = "";
    data.certifications.forEach((item) => {
      certificationsList.insertAdjacentHTML("beforeend", getCertificationRowHtml());
      const row = certificationsList.lastElementChild;

      row.querySelector(".cert-name").value = item.name || "";
      row.querySelector(".cert-issuer").value = item.issuer || "";
      row.querySelector(".cert-year").value = item.year || "";
    });
  }

  if (Array.isArray(data.languages) && data.languages.length) {
    languagesList.innerHTML = "";
    data.languages.forEach((item) => {
      languagesList.insertAdjacentHTML("beforeend", getLanguageRowHtml());
      const row = languagesList.lastElementChild;

      row.querySelector(".lang-name").value = item.name || "";
      row.querySelector(".lang-level").value = item.level || "Basic";
    });
  }

  initInlineAiButtons();
}

function setTemplateActive(template) {
  document.querySelectorAll(".cv-template-card").forEach((card) => {
    const isActive = card.dataset.template === template;

    card.classList.toggle("active", isActive);
    card.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  updateTemplateMeta();
}

function setValue(id, value) {
  const input = document.getElementById(id);

  if (input) {
    input.value = value || "";
  }
}

/* ================================
   Clear Form
================================ */

if (clearCvFormBtn) {
  clearCvFormBtn.addEventListener("click", () => {
    if (!confirm("Clear the full CV form and autosaved draft?")) return;

    localStorage.removeItem(AUTOSAVE_KEY);

    cvForm.reset();
    skills = [];
    renderSkills();

    linksList.innerHTML = getLinkRowHtml();
    experienceList.innerHTML = getExperienceHtml(1);
    educationList.innerHTML = getEducationHtml(1);
    projectsList.innerHTML = getProjectHtml(1);
    certificationsList.innerHTML = getCertificationRowHtml();
    languagesList.innerHTML = getLanguageRowHtml();

    selectedTemplate = "classic-clean";
    setTemplateActive(selectedTemplate);

    renderEmptyPreview();
    initInlineAiButtons();

    showToast("Form cleared.", "success");
  });
}

/* ================================
   Helpers
================================ */

function splitLines(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value.filter(Boolean);

  return String(value)
    .split(/\n|•/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function formatDateRange(start, end) {
  if (!start && !end) return "";
  return `${start || ""}${start && end ? " - " : ""}${end || ""}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function slugify(value) {
  return String(value || "cv")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function debounce(callback, wait = 300) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      callback(...args);
    }, wait);
  };
}

function showToast(message, type = "success") {
  if (!cvToast) return;

  cvToast.textContent = message;
  cvToast.className = `cv-toast show ${type}`;

  setTimeout(() => {
    cvToast.classList.remove("show");
  }, 3600);
}

function textToBulletList(text = "") {
  const items = String(text)
    .split("\n")
    .map(item => item.trim())
    .filter(Boolean);

  if (!items.length) return "";

  return `
    <ul>
      ${items.map(item => `<li>${escapeHtml(item.replace(/^[-•]\s*/, ""))}</li>`).join("")}
    </ul>
  `;
}
