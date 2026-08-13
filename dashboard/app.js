const API = "https://backend.troytravelagency.com";
const API_KEY = "C4bpx5efVqhzZbtSiVrXWwAprGyydKM2Wi2fVV8icN8";

const headers = {
  "Content-Type": "application/json",
  "X-Backend-Key": API_KEY,
};

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

async function checkStatus() {
  const dot = document.getElementById("status-dot");
  const label = document.getElementById("backend-status");
  try {
    const res = await fetch(`${API}/health`, { headers: { "X-Backend-Key": API_KEY } });
    if (res.ok) {
      dot.classList.add("online");
      dot.classList.remove("offline");
      if (label) label.textContent = "";
    } else {
      dot.classList.add("offline");
      dot.classList.remove("online");
      if (label) label.textContent = "— backend unreachable";
    }
  } catch {
    dot.classList.add("offline");
    dot.classList.remove("online");
    if (label) label.textContent = "— backend unreachable";
  }
}

const expandedMemoryIds = new Set();

async function loadMemory() {
  try {
    const res = await fetch(`${API}/memory/records`, { headers });
    if (!res.ok) return;
    const data = await res.json();
    const records = data.records || [];

    document.getElementById("memory-count").textContent =
      records.length > 0 ? `— ${records.length} learnings saved` : "";

    const list = document.getElementById("memory-list");
    if (records.length === 0) {
      list.innerHTML = '<p class="empty-state">Nothing saved yet. Learnings appear here as agents complete tasks.</p>';
      return;
    }

    list.innerHTML = records
      .slice(0, 30)
      .map((r) => {
        const expanded = expandedMemoryIds.has(r.id);
        const preview = (r.content || "").slice(0, 90);
        return `
      <div class="run-item">
        <div class="run-item-header" data-memory-id="${escapeHtml(r.id)}">
          <span class="run-dept">${escapeHtml(r.scope || "")}</span>
          <span class="run-skill">${escapeHtml(preview)}${(r.content || "").length > 90 ? "…" : ""}</span>
          <span class="run-time">${formatTime(r.created_at)}</span>
        </div>
        <div class="run-output ${expanded ? "open" : ""}" data-memory-detail-id="${escapeHtml(r.id)}">
          <pre>${escapeHtml((r.categories || []).join(", ") || "—")}\n\n${escapeHtml(r.content)}</pre>
        </div>
      </div>`;
      })
      .join("");
  } catch {}
}

document.getElementById("memory-list").addEventListener("click", (e) => {
  const item = e.target.closest(".run-item-header[data-memory-id]");
  if (!item) return;
  const id = item.dataset.memoryId;
  const detail = document.querySelector(`.run-output[data-memory-detail-id="${CSS.escape(id)}"]`);
  if (!detail) return;
  if (expandedMemoryIds.has(id)) {
    expandedMemoryIds.delete(id);
    detail.classList.remove("open");
  } else {
    expandedMemoryIds.add(id);
    detail.classList.add("open");
  }
});

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
}

// Endpoint map — mirrors server.py's routes exactly.
const ENDPOINTS = {
  "marketing/research-deals": "/marketing/research-deals",
  "marketing/campaign-content": "/marketing/campaign-content",
  "marketing/outreach-content": "/marketing/outreach-content",
  "sales/qualify-lead": "/sales/qualify-lead",
  "sales/booking-followup": "/sales/booking-followup",
  "sales/objection-handler": "/sales/objection-handler",
  "finance/verify-listings": "/finance/verify-listings",
  "finance/commission-track": "/finance/commission-track",
  "finance/roi-report": "/finance/roi-report",
  "cto/audit-codebase": "/cto/audit-codebase",
  "cto/workflow-map": "/cto/workflow-map",
  "management/daily-briefing": "/management/daily-briefing",
  "management/coordinate": "/management/coordinate",
};

const runList = document.getElementById("run-list");
let runCounter = 0;

function addRunItem(dept, skill) {
  runCounter += 1;
  const id = `run-${runCounter}`;

  if (runList.querySelector(".empty-state")) runList.innerHTML = "";

  const item = document.createElement("div");
  item.className = "run-item";
  item.innerHTML = `
    <div class="run-item-header" data-run-id="${id}">
      <span class="run-dept">${escapeHtml(dept)}</span>
      <span class="run-skill">${escapeHtml(skill)}</span>
      <span class="run-status running" id="${id}-status">running</span>
      <span class="run-time">${new Date().toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</span>
    </div>
    <div class="run-output open" data-run-detail-id="${id}">
      <pre id="${id}-output">Running — this makes a real LLM call and may take 20-90 seconds…</pre>
    </div>`;
  runList.prepend(item);

  item.querySelector(".run-item-header").addEventListener("click", () => {
    item.querySelector(".run-output").classList.toggle("open");
  });

  return id;
}

async function runSkill(dept, skill, btn) {
  const key = `${dept}/${skill}`;
  const endpoint = ENDPOINTS[key];
  if (!endpoint) return;

  const brief = document.getElementById("brief-input").value.trim();
  const runId = addRunItem(dept, skill);
  const statusEl = document.getElementById(`${runId}-status`);
  const outputEl = document.getElementById(`${runId}-output`);

  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Running…";

  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ task_id: runId, brief, department: dept, skill }),
    });
    const data = await res.json();

    if (res.ok && data.status === "completed") {
      statusEl.textContent = "completed";
      statusEl.className = "run-status completed";
      outputEl.textContent = data.result || "(no output)";
    } else {
      statusEl.textContent = "failed";
      statusEl.className = "run-status failed";
      outputEl.textContent = data.detail || JSON.stringify(data);
    }
  } catch (err) {
    statusEl.textContent = "failed";
    statusEl.className = "run-status failed";
    outputEl.textContent = `Request failed: ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.textContent = originalLabel;
    loadMemory();
  }
}

document.querySelectorAll(".run-btn[data-dept][data-skill]").forEach((btn) => {
  btn.addEventListener("click", () => {
    runSkill(btn.dataset.dept, btn.dataset.skill, btn);
  });
});

checkStatus();
loadMemory();
setInterval(checkStatus, 60000);
setInterval(loadMemory, 30000);
