/* ================================
   DevToolKit - AI CV Field Generator API
   File: api/generate-field.js
   Purpose: Inline field AI generation
================================ */

export default async function handler(req, res) {
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

    const { fieldType, context } = req.body || {};

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
    const result = await generateFieldWithGemini({
      geminiApiKey,
      fieldType,
      context: cleanContext
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

async function generateFieldWithGemini({ geminiApiKey, fieldType, context }) {
  try {
    const prompt = buildFieldPrompt(fieldType, context);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
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
      return null;
    }

    const geminiData = await geminiResponse.json();

    const text =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) return null;

    return cleanAiText(text);
  } catch (error) {
    return null;
  }
}

/* ================================
   Prompt Builder
================================ */

function buildFieldPrompt(fieldType, context) {
  const baseContext = `
User CV Context:
Full Name: ${context.fullName || "N/A"}
Job Title / Desired Role: ${context.jobTitle || "N/A"}
Summary: ${context.summary || "N/A"}
Skills: ${Array.isArray(context.skills) ? context.skills.join(", ") : "N/A"}
Experience: ${JSON.stringify(context.experience || [], null, 2)}
Projects: ${JSON.stringify(context.projects || [], null, 2)}
Education: ${JSON.stringify(context.education || [], null, 2)}
`;

  if (fieldType === "summary") {
    return `
You are an ATS resume writer.

Using the CV context below, write one professional summary for the user.

Rules:
- Return only the summary text.
- 2 to 4 sentences.
- 60 to 90 words maximum.
- Use professional, ATS-friendly wording.
- Mention the target role, key skills, and work/project strengths.
- Do not invent fake employers, dates, degrees, or certifications.

${baseContext}
`;
  }

  if (fieldType === "experience_bullets") {
    return `
You are improving resume work experience bullet points.

Rewrite the relevant responsibilities into ATS-friendly bullet points.

Rules:
- Return only bullet points.
- Use each bullet on a new line.
- Start with strong action verbs.
- Keep 3 to 5 bullets.
- Keep each bullet under 22 words.
- Quantify results only when the user gave enough context.
- Do not invent fake metrics, tools, employers, or achievements.

${baseContext}
`;
  }

  if (fieldType === "project_description") {
    return `
You are improving a resume project description.

Rewrite the project description professionally.

Rules:
- Return only the improved project description.
- 1 to 2 sentences maximum.
- Mention purpose, tools/tech, and result if available.
- Make it ATS-friendly.
- Do not invent fake numbers or fake features.

${baseContext}
`;
  }

  if (fieldType === "skills_suggestions") {
    return `
You are suggesting ATS-friendly skills for a resume.

Suggest relevant skills based on the target role and experience.

Rules:
- Return only a comma-separated list of skills.
- Maximum 14 skills.
- Do not include explanations.
- Do not suggest unrelated skills.
- Keep skills concise.

${baseContext}
`;
  }

  return `
Return a short ATS-friendly resume improvement based on this context.

${baseContext}
`;
}

/* ================================
   Sanitization
================================ */

function sanitizeContext(context) {
  return {
    fullName: cleanText(context.fullName, 90),
    jobTitle: cleanText(context.jobTitle, 100),
    email: cleanText(context.email, 130),
    phone: cleanText(context.phone, 70),
    location: cleanText(context.location, 130),
    links: Array.isArray(context.links) ? context.links.slice(0, 8) : [],
    summary: cleanText(context.summary, 1600),
    skills: Array.isArray(context.skills)
      ? context.skills.map((skill) => cleanText(skill, 70)).filter(Boolean).slice(0, 30)
      : [],
    experience: Array.isArray(context.experience)
      ? context.experience.map(sanitizeExperienceItem).slice(0, 6)
      : [],
    education: Array.isArray(context.education)
      ? context.education.slice(0, 5)
      : [],
    projects: Array.isArray(context.projects)
      ? context.projects.map(sanitizeProjectItem).slice(0, 6)
      : [],
    certifications: Array.isArray(context.certifications)
      ? context.certifications.slice(0, 8)
      : [],
    languages: Array.isArray(context.languages)
      ? context.languages.slice(0, 8)
      : [],
    interests: cleanText(context.interests, 500)
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
    description: cleanText(item.description, 1000),
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
    .trim();
}
