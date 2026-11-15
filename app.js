const sources = [
  {
    id: "overview",
    title: "Bridge The Gap Hacks overview",
    url: "https://sq-hacks.devpost.com/",
    date: "Checked 2026-11-15",
    excerpt: "The overview lists the deadline as November 20, 2026 at 11:45 PM PST and says participants must be students ages 13–21. It highlights education, accessibility, community impact, health, and open innovation."
  },
  {
    id: "rules",
    title: "Official rules",
    url: "https://sq-hacks.devpost.com/rules",
    date: "Checked 2026-11-15",
    excerpt: "The rules list a November 15–20 hackathon period and a November 20, 2026 at 11:59 PM PT deadline. They describe eligibility as high-school and undergraduate students, allow teams up to four, require a title, team information, short description, public source, and screenshots, and recommend a 2–5 minute demo."
  }
];

const requirements = [
  { id: "title", label: "Project name", type: "Required", source: "rules", note: "Project title" },
  { id: "team", label: "Team member information", type: "Required", source: "rules", note: "Solo or team information" },
  { id: "description", label: "Short project description", type: "Required", source: "rules", note: "300 words is recommended, not stated as a hard limit" },
  { id: "source", label: "Public GitHub repository or source code", type: "Required", source: "rules", note: "Public source/code link" },
  { id: "screenshots", label: "Screenshots or project visuals", type: "Required", source: "rules", note: "Screenshots / visuals" },
  { id: "demo", label: "Demo video, 2–5 minutes", type: "Recommended", source: "rules", note: "Recommended by the organizer" }
];

const ruleClaims = [
  { key: "deadline", label: "Submission deadline", value: "2026-11-21T07:45:00Z", display: "November 20, 2026 at 11:45 PM PST", source: "overview" },
  { key: "deadline", label: "Submission deadline", value: "2026-11-21T07:59:00Z", display: "November 20, 2026 at 11:59 PM PT", source: "rules" },
  { key: "eligibility", label: "Student eligibility", value: "Students ages 13–21", display: "Students ages 13–21", source: "overview" },
  { key: "eligibility", label: "Student eligibility", value: "High-school and undergraduate students", display: "High-school and undergraduate students", source: "rules" }
];
const deadlineClaims = ruleClaims.filter((claim) => claim.key === "deadline");
const safeDeadline = new Date(Math.min(...deadlineClaims.map((claim) => Date.parse(claim.value))));
const rulesDeadline = new Date(Date.parse(deadlineClaims.find((claim) => claim.source === "rules").value));
const storageKey = "rulebridge-bridge-gap-v1";
const state = loadState();
const timezone = document.querySelector("#timezone");

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return {
      name: typeof saved.name === "string" ? saved.name : "",
      start: typeof saved.start === "string" ? saved.start : "",
      zone: typeof saved.zone === "string" ? saved.zone : "Asia/Shanghai",
      checked: saved.checked && typeof saved.checked === "object" ? saved.checked : {}
    };
  } catch {
    return { name: "", start: "", zone: "Asia/Shanghai", checked: {} };
  }
}

function saveState() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Private browsing may disable storage. */ }
}

function formatDateTime(date, zone) {
  return new Intl.DateTimeFormat("en", {
    timeZone: zone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(date);
}

function updateDeadlines() {
  document.querySelector("#safe-deadline").textContent = formatDateTime(safeDeadline, state.zone);
  document.querySelector("#rules-deadline").textContent = formatDateTime(rulesDeadline, state.zone);
}

function renderRequirements() {
  const required = requirements.filter((item) => item.type === "Required");
  const complete = required.filter((item) => state.checked[item.id]).length;
  document.querySelector("#progress-count").textContent = `${complete} / ${required.length} required`;
  document.querySelector("#requirements-progress").textContent = `${complete} / ${required.length} required`;

  const quick = requirements.filter((item) => item.type === "Required").map((item) => `
    <li><input type="checkbox" data-check="${item.id}" aria-label="Mark ${item.label} complete" ${state.checked[item.id] ? "checked" : ""}><span>${item.label}</span></li>
  `).join("");
  document.querySelector("#quick-list").innerHTML = quick;

  document.querySelector("#requirements-table").innerHTML = requirements.map((item) => {
    const source = sources.find((entry) => entry.id === item.source);
    const tagClass = item.type === "Recommended" ? "type-pill recommended" : "type-pill";
    return `<tr>
      <td>${item.label}<br><span class="field-note">${item.note}</span></td>
      <td><a class="source-link" href="${source.url}" target="_blank" rel="noreferrer">${source.title} ↗</a></td>
      <td><span class="${tagClass}">${item.type}</span></td>
      <td><input class="req-check" type="checkbox" data-check="${item.id}" aria-label="Mark ${item.label} complete" ${state.checked[item.id] ? "checked" : ""}></td>
    </tr>`;
  }).join("");
  document.querySelectorAll("[data-check]").forEach((input) => {
    input.addEventListener("change", (event) => {
      state.checked[event.currentTarget.dataset.check] = event.currentTarget.checked;
      saveState();
      renderRequirements();
    });
  });
}

function renderSources() {
  document.querySelector("#source-list").innerHTML = sources.map((source, index) => `
    <article class="source-row">
      <span class="source-number">0${index + 1}</span>
      <div><h3>${source.title}</h3><p>${source.excerpt}</p><p class="field-note">${source.date}</p></div>
      <a href="${source.url}" target="_blank" rel="noreferrer">Open source ↗</a>
    </article>
  `).join("");
  renderConflicts();
}

function findConflicts(claims = ruleClaims) {
  const grouped = new Map();
  for (const claim of claims) {
    if (!grouped.has(claim.key)) grouped.set(claim.key, []);
    grouped.get(claim.key).push(claim);
  }
  return [...grouped.entries()]
    .filter(([, entries]) => new Set(entries.map((entry) => entry.value)).size > 1)
    .map(([key, entries]) => ({ key, label: entries[0].label, claims: entries }));
}

function renderConflicts() {
  const conflicts = findConflicts();
  document.querySelector("#conflict-count").textContent = `${conflicts.length} conflicts`;
  document.querySelector("#conflict-list").innerHTML = conflicts.map((conflict) => `
    <div class="conflict-row">
      <strong>${conflict.label}</strong>
      <div>${conflict.claims.map((claim) => {
        const source = sources.find((entry) => entry.id === claim.source);
        return `<p><a href="${source.url}" target="_blank" rel="noreferrer">${source.title}</a><span>${claim.display}</span></p>`;
      }).join("")}</div>
    </div>
  `).join("");
}

function updateStartDate() {
  const result = document.querySelector("#window-result");
  if (!state.start) {
    result.textContent = "Set a date to check the build window.";
    result.className = "field-note";
    return;
  }
  const inWindow = state.start >= "2026-11-15" && state.start <= "2026-11-20";
  result.textContent = inWindow ? "Date falls within the stated build window." : "Outside the stated build window; review eligibility.";
  result.className = `field-note ${inWindow ? "good" : "bad"}`;
}

function cleanField(value) {
  return String(value || "Not entered").replace(/[\s|]+/g, " ").trim() || "Not entered";
}

function buildAuditPacket(now = new Date()) {
  const completed = requirements.filter((item) => item.type === "Required" && state.checked[item.id]);
  const missing = requirements.filter((item) => item.type === "Required" && !state.checked[item.id]);
  const recommended = requirements.filter((item) => item.type === "Recommended");
  const conflicts = findConflicts();
  const deadlineConflict = conflicts.find((conflict) => conflict.key === "deadline");
  const deadlineDifference = deadlineConflict
    ? (Math.max(...deadlineConflict.claims.map((claim) => Date.parse(claim.value))) - Math.min(...deadlineConflict.claims.map((claim) => Date.parse(claim.value)))) / 60000
    : 0;
  const decisions = [
    `- Planning deadline: ${formatDateTime(safeDeadline, state.zone)} (the earlier published time)`,
    `- Rules-page deadline: ${formatDateTime(rulesDeadline, state.zone)}`,
    `- Deadline difference: ${deadlineDifference} minutes; no organizer ruling is recorded in these sources.`,
    ...conflicts.filter((conflict) => conflict.key !== "deadline").map((conflict) => `- ${conflict.label} differs: ${conflict.claims.map((claim) => `${claim.display} (${sources.find((source) => source.id === claim.source).title})`).join("; ")}.`),
    `- Recorded project-start date: ${cleanField(state.start)}. This user-entered note is not proof of when work began.`
  ];
  const checklist = [
    ...completed.map((item) => `- [x] ${item.label}`),
    ...missing.map((item) => `- [ ] ${item.label}`),
    ...recommended.map((item) => `- [${state.checked[item.id] ? "x" : " "}] ${item.label} (recommended)`)
  ];
  const sourceNotes = sources.map((source) => `### ${source.title}\n${source.url}\n${source.date}\n\n> ${source.excerpt}`).join("\n\n");
  return [
    "# RuleBridge audit packet",
    "",
    "- Event: Bridge The Gap Hacks 2026",
    `- Working project name: ${cleanField(state.name)}`,
    `- Generated: ${now.toISOString()}`,
    `- Display timezone: ${state.zone}`,
    `- Required checklist: ${completed.length}/${completed.length + missing.length} marked complete`,
    "",
    "## Requirement checklist",
    ...checklist,
    "",
    "## Decisions and unresolved wording",
    ...decisions,
    "",
    "## Captured source notes",
    sourceNotes,
    "",
    "## Limits",
    "This is a local, human-prepared reading of public pages, not an organizer ruling, eligibility determination, or proof of registration or submission. Re-open the linked sources before relying on deadlines or requirements.",
    "Checklist state and project notes were not sent to the organizer."
  ].join("\n");
}

function downloadAuditPacket() {
  const blob = new Blob([buildAuditPacket()], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "rulebridge-bridge-the-gap-audit.md";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setView(viewName) {
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === viewName));
  document.querySelectorAll(".view").forEach((view) => {
    const active = view.id === `view-${viewName}`;
    view.classList.toggle("active", active);
    view.hidden = !active;
  });
}

document.querySelector("#project-name").value = state.name;
document.querySelector("#start-date").value = state.start;
timezone.value = state.zone;
document.querySelector("#project-name").addEventListener("input", (event) => { state.name = event.currentTarget.value; saveState(); });
document.querySelector("#start-date").addEventListener("change", (event) => { state.start = event.currentTarget.value; saveState(); updateStartDate(); });
document.querySelector("#export-report").addEventListener("click", downloadAuditPacket);
timezone.addEventListener("change", (event) => { state.zone = event.currentTarget.value; saveState(); updateDeadlines(); });
document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.go)));
updateDeadlines();
updateStartDate();
renderRequirements();
renderSources();
window.RuleBridge = { buildAuditPacket, findConflicts };
