/* ================================
   FaceitFinder - Backend API Route
   DevToolKit
================================ */

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        success: false,
        message: "Method not allowed."
      });
    }

    const { nickname } = req.query;

    if (!nickname || !nickname.trim()) {
      return res.status(400).json({
        success: false,
        message: "FACEIT username is required."
      });
    }

    const faceitApiKey = process.env.FACEIT_API_KEY;
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!faceitApiKey) {
      return res.status(500).json({
        success: false,
        message: "FACEIT API key is missing on the server."
      });
    }

    const cleanNickname = nickname.trim();

    const faceitHeaders = {
      Authorization: `Bearer ${faceitApiKey}`,
      Accept: "application/json"
    };

    /* ================================
       1. Get FACEIT Player Profile
    ================================ */

    const playerResponse = await fetch(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(cleanNickname)}`,
      {
        method: "GET",
        headers: faceitHeaders
      }
    );

    if (playerResponse.status === 404) {
      return res.status(404).json({
        success: false,
        message: "FACEIT player not found. Check the username and try again."
      });
    }

    if (!playerResponse.ok) {
      return res.status(playerResponse.status).json({
        success: false,
        message: "FACEIT API request failed. Please try again later."
      });
    }

    const player = await playerResponse.json();

    if (!player || !player.player_id) {
      return res.status(404).json({
        success: false,
        message: "FACEIT player data not found."
      });
    }

    const playerId = player.player_id;
    const game = "cs2";

    let stats = null;
    let history = null;
    let aiSummary = null;

    /* ================================
       2. Get CS2 Player Stats
    ================================ */

    try {
      const statsResponse = await fetch(
        `https://open.faceit.com/data/v4/players/${playerId}/stats/${game}`,
        {
          method: "GET",
          headers: faceitHeaders
        }
      );

      if (statsResponse.ok) {
        stats = await statsResponse.json();
      }
    } catch (error) {
      stats = null;
    }

    /* ================================
       3. Get Recent Match History
    ================================ */

    try {
      const historyResponse = await fetch(
        `https://open.faceit.com/data/v4/players/${playerId}/history?game=${game}&offset=0&limit=5`,
        {
          method: "GET",
          headers: faceitHeaders
        }
      );

      if (historyResponse.ok) {
        history = await historyResponse.json();
      }
    } catch (error) {
      history = null;
    }

    /* ================================
       4. Generate Gemini AI Summary
    ================================ */

    if (stats) {
      if (geminiApiKey) {
        aiSummary = await generateGeminiSummary({
          geminiApiKey,
          player,
          stats,
          history
        });
      } else {
        aiSummary = createFallbackSummary(player, stats);
      }
    }

    return res.status(200).json({
      success: true,
      player,
      stats,
      history,
      aiSummary
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later."
    });
  }
}

/* ================================
   Gemini AI Summary Function
================================ */

async function generateGeminiSummary({ geminiApiKey, player, stats, history }) {
  const cs2 = player.games?.cs2 || {};
  const lifetime = stats?.lifetime || {};
  const recentMatchesCount = Array.isArray(history?.items) ? history.items.length : 0;

  const fallbackSummary = createFallbackSummary(player, stats);

  try {
    const prompt = `
Analyze this CS2 FACEIT player using the public stats below.

Player Stats:
Nickname: ${player.nickname || "N/A"}
Country: ${player.country || "N/A"}
Skill Level: ${cs2.skill_level || "N/A"}
FACEIT ELO: ${cs2.faceit_elo || "N/A"}
Region: ${cs2.region || "N/A"}
Matches: ${lifetime.Matches || "N/A"}
Win Rate: ${lifetime["Win Rate %"] || "N/A"}%
Average K/D Ratio: ${lifetime["Average K/D Ratio"] || "N/A"}
Average Headshots %: ${lifetime["Average Headshots %"] || "N/A"}
Recent Matches Loaded: ${recentMatchesCount}

Return exactly 3 complete bullet points.
Each bullet point must be one full sentence.
Keep the full answer under 80 words.

Format:
• Player level: ...
• Main strength: ...
• Improvement tip: ...

Rules:
Do not stop after the nickname.
Do not write incomplete sentences.
Do not use markdown headings.
Do not exaggerate.
If data is limited, say the stats are limited.
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
            temperature: 0.2,
            maxOutputTokens: 350
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      return fallbackSummary;
    }

    const geminiData = await geminiResponse.json();

    const summary =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!summary || summary.length < 80 || !summary.includes("•")) {
      return fallbackSummary;
    }

    return summary;
  } catch (error) {
    return fallbackSummary;
  }
}

/* ================================
   Fallback AI Summary
================================ */

function createFallbackSummary(player, stats) {
  const cs2 = player.games?.cs2 || {};
  const lifetime = stats?.lifetime || {};

  const nickname = player.nickname || "This player";
  const skillLevel = Number(cs2.skill_level || 0);
  const elo = Number(cs2.faceit_elo || 0);

  const matches = lifetime.Matches || "N/A";
  const winRate = lifetime["Win Rate %"] || "N/A";
  const kdRatio = lifetime["Average K/D Ratio"] || "N/A";

  let levelText = "has limited public CS2 FACEIT data";

  if (skillLevel >= 10 || elo >= 2500) {
    levelText = "looks like an elite FACEIT player";
  } else if (skillLevel >= 7 || elo >= 1800) {
    levelText = "looks like a strong FACEIT player";
  } else if (skillLevel >= 4 || elo >= 1100) {
    levelText = "looks like an average FACEIT player";
  } else if (skillLevel > 0) {
    levelText = "looks like a beginner or developing FACEIT player";
  }

  return `• Player level: ${nickname} ${levelText} based on skill level ${skillLevel || "N/A"} and ${elo || "N/A"} ELO.
• Main strength: The profile shows ${matches} matches, ${winRate}% win rate, and ${kdRatio} average K/D ratio.
• Improvement tip: Focus on consistency, smarter positioning, and reviewing recent losses to improve performance.`;
}