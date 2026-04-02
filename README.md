# 🛡️ Simple Ad Blocker — Chrome Extension

## Files
```
ad-blocker/
├── manifest.json     ← Extension config
├── rules.json        ← 20 ad network block rules
├── background.js     ← Service worker (counts blocks, injects CSS hider)
├── popup.html        ← Extension popup UI
├── popup.js          ← Popup logic
└── icons/
    └── icon128.png   ← Extension icon
```

## How to Install in Chrome

1. Open Chrome and go to: `chrome://extensions`
2. Enable **Developer Mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select this `ad-blocker/` folder
5. The extension appears in your toolbar — click the shield icon

## How to Test

Visit any site with ads (e.g. a news site) and open the popup.
You should see the blocked count increasing.

## Blocked Ad Networks (20 total)
- Google (DoubleClick, AdSense, AdService)
- Amazon Ads
- Facebook Pixel
- AppNexus (adnxs)
- Outbrain, Taboola
- Criteo, Moat, Rubicon, PubMatic, OpenX
- Yahoo Ads, Media.net, Quantserve
- Scorecard Research, Advertising.com, YieldMo

## Adding More Rules

Edit `rules.json` and add entries following this pattern:
```json
{
  "id": 21,
  "priority": 1,
  "action": { "type": "block" },
  "condition": {
    "urlFilter": "||adnetwork.com^",
    "resourceTypes": ["script", "image", "xmlhttprequest", "sub_frame"]
  }
}
```
Each rule needs a unique `id`.

## Next Steps
- Load EasyList filter lists (50,000+ rules) for broader coverage
- Add per-site whitelist support
- Add cosmetic filtering for ad placeholder elements
