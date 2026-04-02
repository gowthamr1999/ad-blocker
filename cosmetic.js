// Cosmetic Ad Filter — runs on all sites
// Hides ad elements that slip through network blocking

(function () {
  'use strict';

  const adSelectors = [
    // Google Ads
    'ins.adsbygoogle',
    '[data-ad-slot]',
    '[data-google-query-id]',
    '[id^="google_ads_"]',
    '[id*="google-ads"]',
    '[class*="GoogleAd"]',

    // Generic ad patterns
    '[class*="advertisement"]',
    '[class*="ad-banner"]',
    '[class*="ad-container"]',
    '[class*="ad-wrapper"]',
    '[class*="ad-block"]',
    '[class*="ad-unit"]',
    '[class*="ad-slot"]',
    '[id*="advertisement"]',
    '[id*="ad-banner"]',
    '[id*="ad-container"]',
    '[id*="ad-slot"]',
    '[id*="ad-unit"]',

    // Specific networks
    '[id*="taboola"]',
    '[class*="taboola"]',
    '[id*="outbrain"]',
    '[class*="outbrain"]',
    '[id*="criteo"]',
    '[class*="criteo"]',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="amazon-adsystem"]',
    'iframe[src*="adnxs"]',
    'iframe[src*="rubiconproject"]',
    'iframe[src*="pubmatic"]',

    // Popups & overlays
    '[class*="popup-ad"]',
    '[class*="ad-popup"]',
    '[class*="interstitial"]',
    '[id*="interstitial"]',

    // Anti-adblock walls (hide the nag, not the content)
    '[class*="adblock-notice"]',
    '[class*="ad-block-message"]',
    '[id*="adblock-notice"]',
    '[class*="adBlocker"]',
    '[id*="adBlockDetected"]',
    '[class*="adblockDetected"]'
  ];

  function hideAds() {
    adSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          // Don't remove, just hide — safer and less likely to break layouts
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
          el.style.setProperty('height', '0', 'important');
          el.style.setProperty('overflow', 'hidden', 'important');
        });
      } catch (e) {}
    });
  }

  // Inject CSS for instant hiding before JS runs
  function injectCSS() {
    const style = document.createElement('style');
    style.id = 'ad-blocker-pro-styles';

    if (document.getElementById('ad-blocker-pro-styles')) return;

    style.textContent = adSelectors.map(s =>
      `${s} { display: none !important; visibility: hidden !important; height: 0 !important; overflow: hidden !important; }`
    ).join('\n');

    // Inject into head or documentElement
    const target = document.head || document.documentElement;
    if (target) target.appendChild(style);
  }

  // Watch for dynamically inserted ads (SPAs, lazy-loaded content)
  function watchDynamicAds() {
    const observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length > 0) shouldCheck = true;
      });
      if (shouldCheck) hideAds();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Run immediately
  injectCSS();
  hideAds();

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      hideAds();
      watchDynamicAds();
    });
  } else {
    hideAds();
    watchDynamicAds();
  }

  // Final pass after full load
  window.addEventListener('load', hideAds);

})();
