/* ================================
   FaceitFinder - Frontend Script
   DevToolKit
================================ */

const faceitForm = document.getElementById("faceitForm");
const nicknameInput = document.getElementById("nickname");
const searchBtn = document.getElementById("searchBtn");
const loadingBox = document.getElementById("loadingBox");
const errorBox = document.getElementById("errorBox");
const resultBox = document.getElementById("resultBox");

if (faceitForm) {
  faceitForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
      showFaceitError("Please enter a FACEIT username.");
      return;
    }

    setFaceitLoading(true);
    hideFaceitError();
    clearFaceitResult();

    try {
      const response = await fetch(`/api/faceitfinder?nickname=${encodeURIComponent(nickname)}`);
      const data = await response.json();

      setFaceitLoading(false);

      if (!response.ok || !data.success) {
        showFaceitError(data.message || "FACEIT player not found.");
        return;
      }

      renderFaceitPlayer(data);
    } catch (error) {
      setFaceitLoading(false);
      showFaceitError("Something went wrong. Please check your connection and try again.");
    }
  });
}

function setFaceitLoading(isLoading) {
  if (!loadingBox || !searchBtn) return;

  if (isLoading) {
    loadingBox.classList.remove("hidden");
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
  } else {
    loadingBox.classList.add("hidden");
    searchBtn.disabled = false;
    searchBtn.textContent = "Find Player";
  }
}

function showFaceitError(message) {
  if (!errorBox) return;

  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideFaceitError() {
  if (!errorBox) return;

  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function clearFaceitResult() {
  if (!resultBox) return;

  resultBox.innerHTML = "";
  resultBox.classList.add("hidden");
}

function renderFaceitPlayer(data) {
  if (!resultBox) return;

  const player = data.player || {};
  const stats = data.stats || {};
  const history = data.history || {};
  const aiSummary = data.aiSummary || "";

  const cs2 = player.games?.cs2 || {};
  const lifetime = stats.lifetime || {};

  const nickname = safeText(player.nickname || "Unknown Player");
  const country = safeText(player.country ? player.country.toUpperCase() : "Unknown Country");
  const avatar = player.avatar || "https://placehold.co/120x120/0f172a/ccf381?text=FACEIT";
  const profileUrl = player.faceit_url || "#";

  const skillLevel = safeText(cs2.skill_level || "N/A");
  const faceitElo = safeText(cs2.faceit_elo || "N/A");
  const region = safeText(cs2.region || "N/A");

  const matches = safeText(lifetime.Matches || "N/A");
  const winRate = safeText(
    lifetime["Win Rate %"] ? `${lifetime["Win Rate %"]}%` : "N/A"
  );
  const kdRatio = safeText(lifetime["Average K/D Ratio"] || "N/A");

  const recentMatchesHtml = renderRecentMatches(history);

  resultBox.innerHTML = `
    <div class="faceit-player-card">
      <div class="faceit-player-header">
        <img src="${avatar}" alt="${nickname} FACEIT avatar" loading="lazy" />

        <div>
          <h2>${nickname}</h2>
          <p>${country}</p>
          <a href="${profileUrl}" target="_blank" rel="noopener noreferrer">
            Open FACEIT Profile
          </a>
        </div>
      </div>

      <div class="faceit-stats-grid">
        <div>
          <span>Skill Level</span>
          <strong>${skillLevel}</strong>
        </div>

        <div>
          <span>FACEIT ELO</span>
          <strong>${faceitElo}</strong>
        </div>

        <div>
          <span>Region</span>
          <strong>${region}</strong>
        </div>

        <div>
          <span>Matches</span>
          <strong>${matches}</strong>
        </div>

        <div>
          <span>Win Rate</span>
          <strong>${winRate}</strong>
        </div>

        <div>
          <span>K/D Ratio</span>
          <strong>${kdRatio}</strong>
        </div>
      </div>

      ${
        aiSummary
          ? `
            <div class="faceit-ai-box">
              <h3>AI Player Summary</h3>
              <p>${safeText(aiSummary)}</p>
            </div>
          `
          : ""
      }

      <div class="faceit-matches-box">
        <h3>Recent Matches</h3>
        <ul>
          ${recentMatchesHtml}
        </ul>
      </div>
    </div>
  `;

  resultBox.classList.remove("hidden");
}

function renderRecentMatches(history) {
  if (!history.items || !Array.isArray(history.items) || history.items.length === 0) {
    return `
      <li>
        <div>
          <strong>No recent matches found</strong>
          <span>This player may not have public recent CS2 match data.</span>
        </div>
      </li>
    `;
  }

  return history.items
    .map((match) => {
      const competitionName = safeText(match.competition_name || "FACEIT Match");
      const region = safeText(match.region || "Unknown Region");

      const date = match.started_at
        ? new Date(match.started_at * 1000).toLocaleDateString()
        : "Unknown Date";

      return `
        <li>
          <div>
            <strong>${competitionName}</strong>
            <span>${region}</span>
          </div>
          <small>${safeText(date)}</small>
        </li>
      `;
    })
    .join("");
}

function safeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}