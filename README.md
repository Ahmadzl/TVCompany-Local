# TVCompany Local — Light UI

Static HTML/CSS/JavaScript signage application. No Supabase, IIS or external database. Uses IndexedDB in the browser for content and a Service Worker for offline app-shell caching.

## Start

1. Upload all files in this folder to a GitHub repository and enable GitHub Pages (Settings → Pages → Deploy from branch → main / root).
2. Open `index.html` on the **same device and browser** used for playback.
3. Add images, videos, announcements or external URLs. Set duration and order. Use Edit/Delete as needed.
4. Open Display to show the slideshow. Use Fullscreen for a TV.
5. Export backups regularly and keep them outside the browser. Import backups separately on other devices.

## Important limitations

- Each device/browser has its own local IndexedDB; content is **not synchronized** between devices. Browser storage may be cleared by the user or operating system. Persistent Storage reduces automatic eviction but is not a guarantee.
- GitHub Pages hosts the site code; uploaded media stays on the device, not GitHub.
- Displaying an external website via `window.open` may be blocked by popup policies, even if the site is allowed. External sites require internet.
- There is **no authentication** in this local version. Anyone with access to this browser can edit its local content.
- Use HTTPS (GitHub Pages) or localhost, not `file://`, for best IndexedDB/Service Worker support.
- Backup files containing videos can be very large.

## Design

The admin page uses a light grey background, centered white card, blue actions and a dashed upload area inspired by the supplied PDF Label Converter styling. Display stays fullscreen and black.
