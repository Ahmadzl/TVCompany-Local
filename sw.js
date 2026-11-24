
// =====================================================
// Service Worker Configuration
// =====================================================

const CACHE = 'tvcompany-shell-v2';

const ASSETS = [
    './',
    './index.html',
    './display.html',
    './style.css',
    './db.js',
    './admin.js',
    './display.js'
];


// =====================================================
// Install Service Worker
// =====================================================

self.addEventListener('install', e => {

    e.waitUntil(

        caches.open(CACHE)

            .then(c => {

                // Cache Application Files
                return c.addAll(ASSETS);

            })

            .then(() => {

                // Activate New Service Worker Immediately
                return self.skipWaiting();

            })

    );

});


// =====================================================
// Activate Service Worker
// =====================================================

self.addEventListener('activate', e => {

    e.waitUntil(

        // Take Control of Open Pages
        self.clients.claim()

    );

});


// =====================================================
// Fetch Event - Network First Strategy
// =====================================================

self.addEventListener('fetch', e => {

    const u = new URL(e.request.url);


    // Ignore Non-GET Requests and External Origins
    if (
        e.request.method !== 'GET' ||
        u.origin !== self.location.origin
    ) {
        return;
    }


    // Handle Network Requests
    e.respondWith(

        fetch(e.request)

            .then(r => {

                // Cache Successful Responses
                if (r.ok) {

                    const copy = r.clone();

                    caches.open(CACHE)

                        .then(c => {

                            return c.put(e.request, copy);

                        })

                        .catch(() => {});

                }


                // Return Network Response
                return r;

            })

            .catch(() => {

                // Use Cached Response When Offline
                return caches.match(e.request);

            })

    );

});
