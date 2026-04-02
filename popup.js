const toggle = document.getElementById("toggle");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const toggleSub = document.getElementById("toggle-sub");
const pageCount = document.getElementById("page-count");
const totalCount = document.getElementById("total-count");
const ytCount = document.getElementById("yt-count");
const reloadBtn = document.getElementById("reload-btn");
const statsSection = document.getElementById("stats-section");

// Load saved state
chrome.storage.sync.get(["enabled", "totalBlocked", "ytSkipped"], ({ enabled = true, totalBlocked = 0, ytSkipped = 0 }) => {
  toggle.checked = enabled;
  totalCount.textContent = formatCount(totalBlocked);
  ytCount.textContent = formatCount(ytSkipped);
  updateUI(enabled);
});

// Get current page blocked count
chrome.runtime.sendMessage({ type: "GET_COUNT" }, (res) => {
  if (res) {
    pageCount.textContent = formatCount(res.count);
    ytCount.textContent = formatCount(res.ytSkipped || 0);
  }
});

// Toggle
toggle.addEventListener("change", () => {
  const enabled = toggle.checked;
  updateUI(enabled);
  chrome.storage.sync.set({ enabled });
  chrome.runtime.sendMessage({ type: "TOGGLE", enabled });
});

// Reload current tab
reloadBtn.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) chrome.tabs.reload(tabs[0].id);
  });
});

function updateUI(enabled) {
  if (enabled) {
    statusDot.classList.remove("off");
    statusText.textContent = "Active — 55 rules + YouTube skipper";
    toggleSub.textContent = "Blocking ads & trackers";
    statsSection.classList.remove("disabled-overlay");
  } else {
    statusDot.classList.add("off");
    statusText.textContent = "Disabled — ads are showing";
    toggleSub.textContent = "Click to enable protection";
    statsSection.classList.add("disabled-overlay");
  }
}

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}
