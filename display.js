
 // =====================================================
 // Global Variables
 // =====================================================

let slides = [];
let index = 0;
let timer = null;
let objectUrl = null;
let popup = null;


// =====================================================
// DOM Elements
// =====================================================

const screen = document.getElementById('screen');

const counter = document.getElementById('counter');


// =====================================================
// Cleanup Current Slide
// =====================================================

function cleanup() {

    // Clear Slide Timer
    clearTimeout(timer);


    // Release Media Object URL
    if (objectUrl) {

        URL.revokeObjectURL(objectUrl);

        objectUrl = null;

    }


    // Close External Website Window
    if (popup && !popup.closed) {

        try {

            popup.close();

        } catch {

        }

    }

    popup = null;


    // Clear Display Screen
    screen.replaceChildren();

}


// =====================================================
// Move to Next Slide
// =====================================================

function next() {

    if (!slides.length) {
        return;
    }

    index = (index + 1) % slides.length;

    show();

}


// =====================================================
// Display Current Slide
// =====================================================

function show() {

    // Clear Previous Slide
    cleanup();


    // No Content Available
    if (!slides.length) {

        screen.textContent = 'No content saved on this device';

        counter.textContent = '';

        return;

    }


    // Get Current Slide
    const s = slides[index];


    // Update Slide Counter
    counter.textContent =
        `${index + 1}/${slides.length} · ${s.title}`;


    let node;


    // =================================================
    // Image Slide
    // =================================================

    if (s.type === 'image' && s.blob) {

        node = document.createElement('img');

        objectUrl = URL.createObjectURL(s.blob);

        node.src = objectUrl;

        node.alt = s.title;

    }


    // =================================================
    // Video Slide
    // =================================================

    else if (s.type === 'video' && s.blob) {

        node = document.createElement('video');

        objectUrl = URL.createObjectURL(s.blob);

        node.src = objectUrl;

        node.autoplay = true;

        node.muted = true;

        node.playsInline = true;


        // Move to Next Slide When Video Ends
        node.onended = next;


        // Move to Next Slide if Video Fails
        node.onerror = next;


        // Start Video Playback
        node.play().catch(() => {});

    }


    // =================================================
    // News / Announcement Slide
    // =================================================

    else if (s.type === 'news') {

        node = document.createElement('div');

        node.className = 'news';


        // News Title
        const h = document.createElement('h2');

        h.textContent = s.title;


        // News Description
        const p = document.createElement('p');

        p.textContent = s.body;


        // Add News Content
        node.append(h, p);

    }


    // =================================================
    // External Website Slide
    // =================================================

    else if (s.type === 'external') {

        node = document.createElement('div');

        node.className = 'external';


        // Website Title
        const h = document.createElement('h2');

        h.textContent = s.title;


        // Website Link
        const a = document.createElement('a');

        a.textContent = 'Open external website';

        a.href = s.url;

        a.target = '_blank';

        a.rel = 'noopener';


        // Add Website Information
        node.append(h, a);


        // Open External Website in Separate Window
        // Popup blockers may prevent automatic opening.

        try {

            popup = window.open(
                s.url,
                'TVCompanyExternal'
            );

        } catch {

        }

    }


    // =================================================
    // Invalid Slide
    // =================================================

    else {

        next();

        return;

    }


    // =================================================
    // Add Slide to Display
    // =================================================

    screen.append(node);


    // =================================================
    // Start Slide Timer
    // =================================================

    timer = setTimeout(
        next,
        Math.max(2, Number(s.duration) || 15) * 1000
    );

}


// =====================================================
// Reload Display Content
// =====================================================

async function reload() {

    // Load Slides from IndexedDB
    slides = await TVDB.all();


    // Reset Slide Index
    index = 0;


    // Show First Slide
    show();

}


// =====================================================
// Refresh Button
// =====================================================

document.getElementById('refresh').onclick = reload;


// =====================================================
// Fullscreen Button
// =====================================================

document.getElementById('fullscreen').onclick = () => {

    // Enter Fullscreen
    if (!document.fullscreenElement) {

        document.documentElement
            .requestFullscreen()
            .catch(console.warn);

    }

    // Exit Fullscreen
    else {

        document.exitFullscreen();

    }

};


// =====================================================
// Cleanup Before Closing Page
// =====================================================

window.addEventListener(
    'beforeunload',
    cleanup
);


// =====================================================
// Initialize Display
// =====================================================

reload().catch(e => {

    screen.textContent =
        'Could not load local content: ' + e.message;

});
