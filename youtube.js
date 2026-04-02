// YouTube Ad Skipper
// Runs on every YouTube page, handles all ad types

(function () {
  'use strict';

  let skipInterval = null;
  let muteInterval = null;

  function skipAd() {
    // Click all skip buttons (handles multiple languages)
    const skipSelectors = [
      '.ytp-skip-ad-button',
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      'button[class*="skip"]',
      '.videoAdUiSkipButton'
    ];

    skipSelectors.forEach(selector => {
      const btn = document.querySelector(selector);
      if (btn) {
        btn.click();
        notifyBackground('skipped');
      }
    });
  }

  function muteAndSpeedAd() {
    const video = document.querySelector('video');
    if (!video) return;

    // Check if an ad is playing
    const adOverlay = document.querySelector('.ytp-ad-player-overlay');
    const adBadge = document.querySelector('.ytp-ad-simple-ad-badge, .ytp-ad-preview-container');

    if (adOverlay || adBadge) {
      // Mute the ad
      video.muted = true;
      // Speed through it as fast as possible
      video.playbackRate = 16;
    } else {
      // Restore normal settings after ad
      if (video.muted && video.playbackRate === 16) {
        video.muted = false;
        video.playbackRate = 1;
      }
    }
  }

  function removeOverlayAds() {
    // Remove overlay ads that appear on top of videos
    const overlaySelectors = [
      '.ytp-ad-overlay-container',
      '.ytp-ad-text-overlay',
      '.ytp-ce-element',           // Cards
      '.ytp-suggested-action',     // Suggested actions overlay
      '#masthead-ad',              // Top banner ad
      '#player-ads',               // Player ads container
      '.ytd-banner-promo-renderer',
      '.ytd-statement-banner-renderer',
      'ytd-ad-slot-renderer',
      'ytd-in-feed-ad-layout-renderer',
      '.ytd-promoted-sparkles-web-renderer',
      '.ytd-promoted-video-renderer',
      'ytd-display-ad-renderer',
      'ytd-action-companion-ad-renderer',
      '.ytp-ad-overlay-close-button'
    ];

    overlaySelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.display = 'none';
        el.remove();
      });
    });
  }

  function notifyBackground(action) {
    chrome.runtime.sendMessage({ type: 'YT_AD_' + action.toUpperCase() })
      .catch(() => {}); // ignore if background not ready
  }

  function startWatching() {
    // Run every 300ms — fast enough to catch ads immediately
    skipInterval = setInterval(() => {
      skipAd();
      muteAndSpeedAd();
      removeOverlayAds();
    }, 300);
  }

  // Handle YouTube's SPA navigation (page doesn't fully reload on navigation)
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      removeOverlayAds();
    }
  });

  observer.observe(document.body, { subtree: true, childList: true });

  // Start immediately
  startWatching();

  // Also run on full page load
  window.addEventListener('load', () => {
    removeOverlayAds();
  });

})();
