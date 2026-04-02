// Track blocked request counts per tab
const blockedCounts = {};

// Listen for blocked requests and count them
chrome.declarativeNetRequest.onRuleMatchedDebug?.addListener((info) => {
  const tabId = info.request.tabId;
  if (tabId > 0) {
    blockedCounts[tabId] = (blockedCounts[tabId] || 0) + 1;
    updateBadge(tabId);
  }
});

function updateBadge(tabId) {
  const count = blockedCounts[tabId] || 0;
  chrome.action.setBadgeText({
    text: count > 0 ? String(count) : "",
    tabId
  });
  chrome.action.setBadgeBackgroundColor({ color: "#e74c3c", tabId });
}

// Reset count when navigating to a new page
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    blockedCounts[tabId] = 0;
    updateBadge(tabId);
  }

  // Inject CSS-based ad hiding on page complete
  if (changeInfo.status === "complete") {
    chrome.storage.sync.get("enabled", ({ enabled = true }) => {
      if (!enabled) return;
      chrome.scripting.executeScript({
        target: { tabId },
        func: hideAdElements
      }).catch(() => {}); // ignore errors on restricted pages
    });
  }
});

// Clean up when tab closes
chrome.tabs.onRemoved.addListener((tabId) => {
  delete blockedCounts[tabId];
});

// CSS-based ad element hider
function hideAdElements() {
  const adSelectors = [
    "ins.adsbygoogle",
    "div[id*='google_ads']",
    "div[id*='google-ads']",
    "div[class*='GoogleAd']",
    "div[class*='advertisement']",
    "div[class*='ad-banner']",
    "div[class*='ad-container']",
    "div[class*='ad-wrapper']",
    "div[id*='taboola']",
    "div[id*='outbrain']",
    "iframe[src*='doubleclick']",
    "iframe[src*='googlesyndication']",
    "iframe[src*='amazon-adsystem']",
    "[data-ad-slot]",
    "[data-google-query-id]"
  ];

  const style = document.createElement("style");
  style.id = "ad-blocker-styles";

  // Remove existing style if re-injected
  document.getElementById("ad-blocker-styles")?.remove();

  style.textContent = adSelectors.map(s => `${s} { display: none !important; }`).join("\n");
  document.head.appendChild(style);
}

// Track YouTube ads skipped
let ytAdsSkipped = 0;

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_COUNT") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      sendResponse({
        count: blockedCounts[tabId] || 0,
        ytSkipped: ytAdsSkipped
      });
    });
    return true;
  }

  if (msg.type === "YT_AD_SKIPPED") {
    ytAdsSkipped++;
    const tabId = sender.tab?.id;
    if (tabId) {
      blockedCounts[tabId] = (blockedCounts[tabId] || 0) + 1;
      updateBadge(tabId);
    }
  }

  if (msg.type === "TOGGLE") {
    const { enabled } = msg;
    if (enabled) {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ["ruleset_1"],
        disableRulesetIds: []
      });
    } else {
      chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: [],
        disableRulesetIds: ["ruleset_1"]
      });
    }
  }
});
