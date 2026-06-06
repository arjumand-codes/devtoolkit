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

    if (geminiApiKey && stats) {
      aiSummary = await generateGeminiSummary({
        geminiApiKey,
        player,
        stats,
        history
      });
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
  try {
    const cs2 = player.games?.cs2 || {};
    const lifetime = stats?.lifetime || {};
    const recentMatchesCount = Array.isArray(history?.items) ? history.items.length : 0;

    const prompt = `
You are analyzing a CS2 FACEIT player using public FACEIT stats.

Player:
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

Write a useful but short player analysis in exactly 3 bullet points.

Rules:
- Do not use markdown headings.
- Do not exaggerate.
- Mention if the player looks beginner, average, strong, or elite.
- Mention one strength based on the stats.
- Mention one simple improvement suggestion.
- Keep the full answer under 70 words.
- If stats are missing or limited, say the stats are limited.
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
            temperature: 0.35,
            maxOutputTokens: 220
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      return null;
    }

    const geminiData = await geminiResponse.json();

    return (
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
    );
  } catch (error) {
    return null;
  }
}
