const toggle = document.getElementById("toggle");
const statusDot = document.getElementById("status-dot");
const statusText = document.getElementById("status-text");
const toggleSub = document.getElementById("toggle-sub");
const pageCount = document.getElementById("page-count");
const totalCount = document.getElementById("total-count");
const reloadBtn = document.getElementById("reload-btn");
const statsSection = document.getElementById("stats-section");

let sessionTotal = 0;

// Load saved state
chrome.storage.sync.get(["enabled", "totalBlocked"], ({ enabled = true, totalBlocked = 0 }) => {
  toggle.checked = enabled;
  sessionTotal = totalBlocked;
  totalCount.textContent = formatCount(totalBlocked);
  updateUI(enabled);
});

// Get current page blocked count
chrome.runtime.sendMessage({ type: "GET_COUNT" }, (res) => {
  if (res) pageCount.textContent = formatCount(res.count);
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
    statusText.textContent = "Active — blocking 20 ad networks";
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
