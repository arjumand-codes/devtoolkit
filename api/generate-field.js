/* ================================
   DevToolKit - AI CV Field Generator API
   File: api/generate-field.js
   Purpose: Inline field AI generation
================================ */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed. Use POST."
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is missing on the server."
      });
    }

    const { fieldType, context, targetIndex } = req.body || {};

    const allowedTypes = [
      "summary",
      "experience_bullets",
      "project_description",
      "skills_suggestions"
    ];

    if (!fieldType || !allowedTypes.includes(fieldType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field type."
      });
    }

    const cleanContext = sanitizeContext(context || {});

    // Pass targetIndex so we can target the right experience/project entry
    const result = await generateFieldWithGemini({
      geminiApiKey,
      fieldType,
      context: cleanContext,
      targetIndex: typeof targetIndex === "number" ? targetIndex : 0
    });

    if (!result) {
      return res.status(500).json({
        success: false,
        message: "AI field generation failed. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: error.message
    });
  }
}

/* ================================
   Gemini Field Generation
================================ */

async function generateFieldWithGemini({ geminiApiKey, fieldType, context, targetIndex }) {
  try {
    const prompt = buildFieldPrompt(fieldType, context, targetIndex);

    // Use gemini-1.5-flash — stable, fast, free-tier compatible
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 900
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json().catch(() => ({}));
      console.error("Gemini API error:", geminiResponse.status, errData);
      return null;
    }

    const geminiData = await geminiResponse.json();

    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) return null;

    return cleanAiText(text);
  } catch (error) {
    console.error("generateFieldWithGemini error:", error);
    return null;
  }
}

/* ================================
   Prompt Builder
================================ */

function buildFieldPrompt(fieldType, context, targetIndex) {
  const baseContext = `
Full Name: ${context.fullName || "N/A"}
Job Title / Desired Role: ${context.jobTitle || "N/A"}
Skills: ${Array.isArray(context.skills) ? context.skills.join(", ") : "N/A"}
`;

  if (fieldType === "summary") {
    const expSummary = Array.isArray(context.experience) && context.experience.length
      ? context.experience.map((e, i) => `  ${i + 1}. ${e.title || ""} at ${e.company || ""}: ${e.responsibilities || ""}`).join("\n")
      : "N/A";

    const projSummary = Array.isArray(context.projects) && context.projects.length
      ? context.projects.map((p) => `  - ${p.name || ""}: ${p.description || ""}`).join("\n")
      : "N/A";

    return `You are an ATS resume writer. Write one professional summary for the candidate below.

Rules:
- Return ONLY the summary text, nothing else.
- 2 to 4 sentences.
- 60 to 90 words maximum.
- Use professional, ATS-friendly wording.
- Mention the target role, key skills, and strongest experience.
- Do not invent fake employers, dates, degrees, or certifications.

Candidate Info:
${baseContext}
Work Experience:
${expSummary}
Projects:
${projSummary}
Existing Summary (improve this if provided): ${context.summary || "None"}
`;
  }

  if (fieldType === "experience_bullets") {
    // Target the specific experience entry by index
    const expList = Array.isArray(context.experience) ? context.experience : [];
    const targetExp = expList[targetIndex] || expList[0] || {};

    return `You are improving resume work experience bullet points.

Rewrite the responsibilities for this specific role into ATS-friendly bullet points.

Rules:
- Return ONLY bullet points, one per line.
- Do NOT include any intro text, explanations, or numbering.
- Start each bullet with a strong action verb (e.g. Developed, Led, Optimized, Designed).
- Write 3 to 5 bullets maximum.
- Keep each bullet under 20 words.
- Quantify results only when the user gave enough context.
- Do not invent fake metrics, tools, employers, or achievements.

Job Role: ${targetExp.title || "N/A"}
Company: ${targetExp.company || "N/A"}
Current Responsibilities Text:
${targetExp.responsibilities || "No responsibilities provided."}

Candidate Context:
${baseContext}
`;
  }

  if (fieldType === "project_description") {
    const projList = Array.isArray(context.projects) ? context.projects : [];
    const targetProj = projList[targetIndex] || projList[0] || {};

    return `You are improving a resume project description.

Rewrite the description for this specific project professionally.

Rules:
- Return ONLY the improved project description text, nothing else.
- 1 to 2 sentences maximum.
- Mention purpose, tools or tech stack, and result if available.
- Make it ATS-friendly and impactful.
- Do not invent fake numbers or fake features.

Project Name: ${targetProj.name || "N/A"}
Tech Stack: ${targetProj.techStack || "N/A"}
Current Description:
${targetProj.description || "No description provided."}

Candidate Context:
${baseContext}
`;
  }

  if (fieldType === "skills_suggestions") {
    const expRoles = Array.isArray(context.experience)
      ? context.experience.map((e) => `${e.title || ""} at ${e.company || ""}`).join(", ")
      : "N/A";

    return `You are suggesting ATS-friendly skills for a resume.

Suggest relevant technical and soft skills based on the target role and experience.

Rules:
- Return ONLY a comma-separated list of skills, nothing else.
- No intro text, no explanations, no numbering.
- Maximum 14 skills.
- Do not include skills that are obviously unrelated to the role.
- Keep each skill name short and concise.
- Do not repeat skills already listed below.

Target Role: ${context.jobTitle || "N/A"}
Experience: ${expRoles}
Already Listed Skills: ${Array.isArray(context.skills) ? context.skills.join(", ") : "None"}
`;
  }

  return `Write a short ATS-friendly resume improvement based on:
${baseContext}`;
}

/* ================================
   Sanitization
================================ */

function sanitizeContext(context) {
  return {
    fullName: cleanText(context.fullName, 90),
    jobTitle: cleanText(context.jobTitle, 100),
    summary: cleanText(context.summary, 800),
    skills: Array.isArray(context.skills)
      ? context.skills.map((s) => cleanText(s, 70)).filter(Boolean).slice(0, 30)
      : [],
    experience: Array.isArray(context.experience)
      ? context.experience.map(sanitizeExperienceItem).slice(0, 6)
      : [],
    projects: Array.isArray(context.projects)
      ? context.projects.map(sanitizeProjectItem).slice(0, 6)
      : [],
    education: Array.isArray(context.education)
      ? context.education.slice(0, 5)
      : []
  };
}

function sanitizeExperienceItem(item) {
  return {
    title: cleanText(item.title, 100),
    company: cleanText(item.company, 120),
    location: cleanText(item.location, 120),
    startDate: cleanText(item.startDate, 40),
    endDate: cleanText(item.endDate, 40),
    responsibilities: cleanText(item.responsibilities, 1800)
  };
}

function sanitizeProjectItem(item) {
  return {
    name: cleanText(item.name, 120),
    description: cleanText(item.description, 800),
    techStack: cleanText(item.techStack, 250),
    link: cleanText(item.link, 220)
  };
}

function cleanText(value, maxLength = 500) {
  if (!value) return "";
  return String(value)
    .replace(/[<>]/g, "")
    .replace(/\s{3,}/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanAiText(text) {
  return String(text || "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^["']|["']$/g, "")
    .replace(/[<>]/g, "")
    .replace(/^\s*[\*\-]\s*/gm, "")  // strip leading bullets AI sometimes adds
    .trim();
}
