# TVCompany Local (no Supabase)

Static HTML/CSS/JavaScript application. Content, including image/video blobs, is stored in IndexedDB **on the device and in the browser profile where it was added**. No cloud database and no upload server. The shell is cached with a service worker for offline operation after first successful visit.

## Deploy
1. Upload all files to a public GitHub repository (or a private repository if your plan supports Pages).
2. GitHub repository Settings → Pages → Deploy from branch → main / (root).
3. Open `https://USERNAME.github.io/REPO/` on the display device.
4. Add content using Admin on **that same device**, then open Display.
5. Use Export backup and save the JSON file safely. Import on another device to copy the content.

## Important limitations
- This is a **single-device local content manager**, not a shared multi-device admin system.
- No login/authentication: anyone using the same browser profile can edit the local content. GitHub Pages hosts public code, not a protected server.
- The browser can evict IndexedDB and cache. Use Export backup; large videos may exceed device storage/quota. Request persistent storage if available.
- Each device has its own content. Changes do not sync automatically.
- External sites require internet. Popup blockers can prevent automatic windows. Browsers usually prohibit scripts from closing tabs they did not open; kiosk browser configuration may be needed.
- Videos are muted for autoplay compatibility. Large videos can consume RAM during backup/export; avoid enormous backup files.
- Use HTTPS via GitHub Pages, or localhost during development, for service workers and full browser functionality.
