/* ================================
   AI CV Maker - Backend API Route
   DevToolKit
================================ */

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed."
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
    const requiredFields = ["fullName", "jobTitle", "summary", "skills"];

    for (const field of requiredFields) {
      if (!input[field] || !String(input[field]).trim()) {
        return res.status(400).json({
          success: false,
          message: "Full Name, Job Title, Summary, and Skills are required."
        });
      }
    }

    const cleanInput = sanitizeInput(input);

    const cv = await generateAiCv({
      geminiApiKey,
      input: cleanInput
    });

    if (!cv) {
      return res.status(500).json({
        success: false,
        message: "AI CV generation failed. Please try again."
      });
    }

    return res.status(200).json({
      success: true,
      cv
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
}

/* ================================
   Gemini CV Generator
================================ */

async function generateAiCv({ geminiApiKey, input }) {
  try {
    const prompt = `
You are a senior professional resume writer.

Create a clean, modern, professional, one-page CV from the user details below.

Important:
- The CV must fit on ONE A4 page.
- Use concise professional wording.
- Do not write long paragraphs.
- Do not create too many bullet points.
- Do not invent fake jobs, fake companies, fake degrees, fake dates, or fake certifications.
- Keep it truthful to the user input.
- Make it ATS-friendly.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap JSON in code fences.

User Details:
Full Name: ${input.fullName}
Target Job Title: ${input.jobTitle}
Email: ${input.email || "N/A"}
Phone: ${input.phone || "N/A"}
Location: ${input.location || "N/A"}
Portfolio / LinkedIn: ${input.portfolio || "N/A"}
CV Tone: Professional

Rough Summary:
${input.summary}

Skills:
${input.skills}

Work Experience:
${input.experience || "N/A"}

Projects:
${input.projects || "N/A"}

Education:
${input.education || "N/A"}

Certifications:
${input.certifications || "N/A"}

Languages:
${input.languages || "N/A"}

Content limits:
- summary: maximum 45 words.
- skills: maximum 12 skills.
- experience: maximum 4 bullet points, each under 18 words.
- projects: maximum 3 bullet points, each under 18 words.
- education: maximum 2 items.
- certifications: maximum 2 items.
- languages: maximum 1 short line.

JSON format:
{
  "fullName": "string",
  "jobTitle": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "portfolio": "string",
  "summary": "maximum 45 words",
  "skills": ["skill 1", "skill 2"],
  "experience": ["bullet point 1", "bullet point 2"],
  "projects": ["project bullet 1", "project bullet 2"],
  "education": ["education item 1"],
  "certifications": ["certification item 1"],
  "languages": ["English, Urdu"]
}
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
            maxOutputTokens: 1200,
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

    if (!text) return null;

    const parsedCv = parseGeminiJson(text);

    if (!parsedCv) return null;

    return normalizeCvResponse(parsedCv, input);
  } catch (error) {
    return null;
  }
}

/* ================================
   Sanitize Input
================================ */

function sanitizeInput(input) {
  return {
    fullName: cleanText(input.fullName, 80),
    jobTitle: cleanText(input.jobTitle, 90),
    email: cleanText(input.email, 120),
    phone: cleanText(input.phone, 60),
    location: cleanText(input.location, 120),
    portfolio: cleanText(input.portfolio, 180),
    summary: cleanText(input.summary, 1000),
    skills: cleanText(input.skills, 1000),
    experience: cleanText(input.experience, 1800),
    projects: cleanText(input.projects, 1400),
    education: cleanText(input.education, 800),
    certifications: cleanText(input.certifications, 800),
    languages: cleanText(input.languages, 300),
    cvTone: "professional",
    template: "professional"
  };
}

function cleanText(value, maxLength) {
  if (!value) return "";

  return String(value)
    .replace(/[<>]/g, "")
    .replace(/\s{3,}/g, " ")
    .trim()
    .slice(0, maxLength);
}

/* ================================
   Parse Gemini JSON Safely
================================ */

function parseGeminiJson(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) return null;

      return JSON.parse(jsonMatch[0]);
    } catch (innerError) {
      return null;
    }
  }
}

/* ================================
   Normalize CV Response
================================ */

function normalizeCvResponse(cv, fallback) {
  return {
    fullName: safeString(cv.fullName || fallback.fullName),
    jobTitle: safeString(cv.jobTitle || fallback.jobTitle),
    email: safeString(cv.email || fallback.email),
    phone: safeString(cv.phone || fallback.phone),
    location: safeString(cv.location || fallback.location),
    portfolio: safeString(cv.portfolio || fallback.portfolio),
    summary: limitWords(safeString(cv.summary || fallback.summary), 45),
    skills: normalizeArray(cv.skills || fallback.skills, 12, 5),
    experience: normalizeArray(cv.experience || fallback.experience, 4, 18),
    projects: normalizeArray(cv.projects || fallback.projects, 3, 18),
    education: normalizeArray(cv.education || fallback.education, 2, 14),
    certifications: normalizeArray(cv.certifications || fallback.certifications, 2, 14),
    languages: normalizeArray(cv.languages || fallback.languages, 1, 8)
  };
}

function normalizeArray(value, maxItems, maxWords) {
  if (!value) return [];

  let items = [];

  if (Array.isArray(value)) {
    items = value;
  } else {
    items = String(value).split(/\n|,|•/);
  }

  return items
    .map((item) => limitWords(safeString(item), maxWords))
    .filter(Boolean)
    .slice(0, maxItems);
}

function safeString(value) {
  if (!value) return "";

  return String(value)
    .replace(/[<>]/g, "")
    .trim();
}

function limitWords(text, maxWords) {
  const words = String(text).trim().split(/\s+/);

  if (!text || words.length <= maxWords) {
    return String(text).trim();
  }

  return words.slice(0, maxWords).join(" ") + ".";
}