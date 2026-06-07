/* ================================
   DevToolKit - AI CV Generator API
   File: api/generate-cv.js
   Purpose: Full CV generation with Gemini
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

    const input = req.body || {};

    if (!input.fullName || !input.jobTitle) {
      return res.status(400).json({
        success: false,
        message: "Full Name and Job Title are required."
      });
    }

    const cleanInput = sanitizeCvInput(input);

    const generatedCv = await generateCvWithGemini({
      geminiApiKey,
      input: cleanInput
    });

    if (!generatedCv) {
      return res.status(500).json({
        success: false,
        message: "AI CV generation failed. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      cv: generatedCv
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
   Gemini Full CV Generation
================================ */

async function generateCvWithGemini({ geminiApiKey, input }) {
  try {
    const prompt = `
You are a senior professional resume writer and ATS resume optimizer.

Create an improved ATS-friendly CV from the user data below.

IMPORTANT RULES:
- Return ONLY valid JSON.
- Do not return markdown.
- Do not wrap JSON inside code fences.
- Do not add comments outside JSON.
- Do not fabricate employer names, job titles, schools, degrees, dates, emails, phone numbers, or URLs.
- You may improve wording, clarity, action verbs, grammar, structure, and ATS keywords.
- You may suggest relevant skills only if they are clearly related to the user's role and experience.
- Keep the CV concise and professional.
- Keep experience bullet points action-focused and ATS-friendly.
- Do not include private identity data such as CNIC, passport, bank details, or full home address.
- Links must display as labels only, but keep URLs in the JSON.

USER DATA:
${JSON.stringify(input, null, 2)}

Return JSON in exactly this structure:

{
  "fullName": "string",
  "jobTitle": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "links": [
    {
      "type": "LinkedIn",
      "url": "https://example.com"
    }
  ],
  "summary": "ATS-friendly professional summary, 2-4 sentences maximum",
  "skills": ["skill 1", "skill 2", "skill 3"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "responsibilities": "bullet points separated by new lines"
    }
  ],
  "education": [
    {
      "degree": "string",
      "field": "string",
      "institution": "string",
      "location": "string",
      "year": "string",
      "details": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "professional project description",
      "techStack": "string",
      "link": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "year": "string"
    }
  ],
  "languages": [
    {
      "name": "string",
      "level": "Basic | Conversational | Fluent | Native"
    }
  ],
  "interests": "string"
}

Content guidelines:
- Summary: maximum 70 words.
- Skills: maximum 16 skills.
- Experience: keep each responsibility line under 22 words.
- Projects: keep descriptions under 35 words each.
- Education details: keep concise.
- Certifications: keep only real items from user input.
- If a section is empty and cannot be improved truthfully, return an empty array or empty string.
`;

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
            temperature: 0.25,
            maxOutputTokens: 3000,
            responseMimeType: "application/json"
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

    if (!text) {
      return null;
    }

    const parsed = parseJsonSafely(text);

    if (!parsed) {
      return null;
    }

    return normalizeCvResponse(parsed, input);
  } catch (error) {
    return null;
  }
}

/* ================================
   Input Sanitization
================================ */

function sanitizeCvInput(input) {
  return {
    fullName: cleanText(input.fullName, 90),
    jobTitle: cleanText(input.jobTitle, 100),
    email: cleanText(input.email, 130),
    phone: cleanText(input.phone, 70),
    location: cleanText(input.location, 130),

    links: sanitizeLinks(input.links),

    summary: cleanText(input.summary, 1600),
    skills: sanitizeStringArray(input.skills, 30, 60),

    experience: sanitizeExperience(input.experience),
    education: sanitizeEducation(input.education),
    projects: sanitizeProjects(input.projects),
    certifications: sanitizeCertifications(input.certifications),
    languages: sanitizeLanguages(input.languages),

    interests: cleanText(input.interests, 500),
    template: cleanText(input.template, 50)
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

function sanitizeStringArray(value, maxItems = 20, maxLength = 80) {
  if (!value) return [];

  const items = Array.isArray(value)
    ? value
    : String(value).split(/\n|,|•/);

  return items
    .map((item) => cleanText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeLinks(links) {
  if (!Array.isArray(links)) return [];

  return links
    .map((link) => ({
      type: cleanText(link.type, 40),
      url: cleanText(link.url, 220)
    }))
    .filter((link) => link.type && link.url)
    .slice(0, 8);
}

function sanitizeExperience(experience) {
  if (!Array.isArray(experience)) return [];

  return experience
    .map((item) => ({
      title: cleanText(item.title, 100),
      company: cleanText(item.company, 120),
      location: cleanText(item.location, 120),
      startDate: cleanText(item.startDate, 40),
      endDate: cleanText(item.endDate, 40),
      responsibilities: cleanText(item.responsibilities, 2200)
    }))
    .filter((item) => item.title || item.company || item.responsibilities)
    .slice(0, 6);
}

function sanitizeEducation(education) {
  if (!Array.isArray(education)) return [];

  return education
    .map((item) => ({
      degree: cleanText(item.degree, 120),
      field: cleanText(item.field, 120),
      institution: cleanText(item.institution, 140),
      location: cleanText(item.location, 120),
      year: cleanText(item.year, 40),
      details: cleanText(item.details, 700)
    }))
    .filter((item) => item.degree || item.institution || item.details)
    .slice(0, 5);
}

function sanitizeProjects(projects) {
  if (!Array.isArray(projects)) return [];

  return projects
    .map((item) => ({
      name: cleanText(item.name, 120),
      description: cleanText(item.description, 1000),
      techStack: cleanText(item.techStack, 250),
      link: cleanText(item.link, 220)
    }))
    .filter((item) => item.name || item.description || item.techStack)
    .slice(0, 6);
}

function sanitizeCertifications(certifications) {
  if (!Array.isArray(certifications)) return [];

  return certifications
    .map((item) => ({
      name: cleanText(item.name, 140),
      issuer: cleanText(item.issuer, 120),
      year: cleanText(item.year, 40)
    }))
    .filter((item) => item.name || item.issuer || item.year)
    .slice(0, 8);
}

function sanitizeLanguages(languages) {
  if (!Array.isArray(languages)) return [];

  return languages
    .map((item) => ({
      name: cleanText(item.name, 80),
      level: cleanText(item.level, 40)
    }))
    .filter((item) => item.name)
    .slice(0, 8);
}

/* ================================
   JSON Parsing
================================ */

function parseJsonSafely(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    try {
      const match = text.match(/\{[\s\S]*\}/);

      if (!match) {
        return null;
      }

      return JSON.parse(match[0]);
    } catch (innerError) {
      return null;
    }
  }
}

/* ================================
   Output Normalization
================================ */

function normalizeCvResponse(cv, fallback) {
  return {
    fullName: cleanText(cv.fullName || fallback.fullName, 90),
    jobTitle: cleanText(cv.jobTitle || fallback.jobTitle, 100),
    email: cleanText(cv.email || fallback.email, 130),
    phone: cleanText(cv.phone || fallback.phone, 70),
    location: cleanText(cv.location || fallback.location, 130),

    links: normalizeLinks(cv.links || fallback.links),

    summary: cleanText(cv.summary || fallback.summary, 900),
    skills: sanitizeStringArray(cv.skills || fallback.skills, 16, 70),

    experience: normalizeExperience(cv.experience || fallback.experience),
    education: normalizeEducation(cv.education || fallback.education),
    projects: normalizeProjects(cv.projects || fallback.projects),
    certifications: normalizeCertifications(cv.certifications || fallback.certifications),
    languages: normalizeLanguages(cv.languages || fallback.languages),

    interests: cleanText(cv.interests || fallback.interests, 400)
  };
}

function normalizeLinks(links) {
  return sanitizeLinks(links);
}

function normalizeExperience(experience) {
  if (!Array.isArray(experience)) return [];

  return experience
    .map((item) => ({
      title: cleanText(item.title, 100),
      company: cleanText(item.company, 120),
      location: cleanText(item.location, 120),
      startDate: cleanText(item.startDate, 40),
      endDate: cleanText(item.endDate, 40),
      responsibilities: normalizeBulletText(item.responsibilities, 5, 24)
    }))
    .filter((item) => item.title || item.company || item.responsibilities)
    .slice(0, 5);
}

function normalizeEducation(education) {
  if (!Array.isArray(education)) return [];

  return education
    .map((item) => ({
      degree: cleanText(item.degree, 120),
      field: cleanText(item.field, 120),
      institution: cleanText(item.institution, 140),
      location: cleanText(item.location, 120),
      year: cleanText(item.year, 40),
      details: cleanText(item.details, 500)
    }))
    .filter((item) => item.degree || item.institution || item.details)
    .slice(0, 4);
}

function normalizeProjects(projects) {
  if (!Array.isArray(projects)) return [];

  return projects
    .map((item) => ({
      name: cleanText(item.name, 120),
      description: cleanText(item.description, 500),
      techStack: cleanText(item.techStack, 250),
      link: cleanText(item.link, 220)
    }))
    .filter((item) => item.name || item.description || item.techStack)
    .slice(0, 5);
}

function normalizeCertifications(certifications) {
  if (!Array.isArray(certifications)) return [];

  return certifications
    .map((item) => ({
      name: cleanText(item.name, 140),
      issuer: cleanText(item.issuer, 120),
      year: cleanText(item.year, 40)
    }))
    .filter((item) => item.name || item.issuer || item.year)
    .slice(0, 6);
}

function normalizeLanguages(languages) {
  if (!Array.isArray(languages)) return [];

  return languages
    .map((item) => ({
      name: cleanText(item.name, 80),
      level: cleanText(item.level, 40)
    }))
    .filter((item) => item.name)
    .slice(0, 6);
}

function normalizeBulletText(value, maxBullets = 5, maxWords = 24) {
  const bullets = String(value || "")
    .split(/\n|•/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, maxBullets)
    .map((item) => limitWords(item, maxWords));

  return bullets.join("\n");
}

function limitWords(text, maxWords) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return String(text || "").trim();
  }

  return words.slice(0, maxWords).join(" ") + ".";
}
