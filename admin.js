
const $ = id => document.getElementById(id);

const status = $('status');

let editingId = null;
let editingBlob = null;
let chosenFile = null;
let previewUrls = [];


// =====================================================
// Notifications
// =====================================================

function notify(message, error = false) {

    status.textContent = message;

    status.style.color = error
        ? '#b91c1c'
        : '#166534';

}


// =====================================================
// Content Type
// =====================================================

function updateType() {

    const t = $('type').value;

    const media = t === 'image' || t === 'video';

    $('dropZone').hidden = !media;
    $('fileRow').hidden = !media;

    $('bodyRow').hidden = t !== 'news';
    $('urlRow').hidden = t !== 'external';

    $('file').accept = t === 'image'
        ? 'image/*'
        : 'video/*';

    if (
        chosenFile &&
        (
            (t === 'image' && !chosenFile.type.startsWith('image/')) ||
            (t === 'video' && !chosenFile.type.startsWith('video/'))
        )
    ) {

        chosenFile = null;

        $('file').value = '';

        $('fileName').textContent = 'No file selected';

    }

}

$('type').addEventListener('change', updateType);

updateType();


// =====================================================
// File Selection
// =====================================================

function setFile(file) {

    if (!file) return;

    chosenFile = file;

    $('fileName').textContent =
        `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`;

}


// File Input
$('file').addEventListener('change', e => {

    setFile(e.target.files[0]);

});


// =====================================================
// Drag & Drop
// =====================================================

const zone = $('dropZone');

for (const ev of ['dragenter', 'dragover']) {

    zone.addEventListener(ev, e => {

        e.preventDefault();

        zone.classList.add('drag-over');

    });

}

for (const ev of ['dragleave', 'drop']) {

    zone.addEventListener(ev, e => {

        e.preventDefault();

        zone.classList.remove('drag-over');

    });

}

zone.addEventListener('drop', e => {

    setFile(e.dataTransfer.files[0]);

});


// =====================================================
// Reset Editor
// =====================================================

function resetEditor() {

    $('editor').reset();

    editingId = null;
    editingBlob = null;
    chosenFile = null;

    $('fileName').textContent = 'No file selected';

    $('saveButton').textContent = 'Add Content';

    $('editorHeading').textContent = 'Add New Content';

    $('cancelEdit').hidden = true;

    updateType();

}


// Cancel Editing
$('cancelEdit').onclick = () => {

    resetEditor();

    notify('Editing cancelled');

};


// =====================================================
// Render Saved Content
// =====================================================

async function render() {

    // Clear previous preview URLs
    previewUrls.forEach(URL.revokeObjectURL);

    previewUrls = [];

    // Load saved slides
    const slides = await TVDB.all();

    // Update item counter
    $('itemCount').textContent =
        `${slides.length} item${slides.length === 1 ? '' : 's'}`;

    // Clear content list
    $('items').replaceChildren();


    // Empty List
    if (!slides.length) {

        const empty = document.createElement('div');

        empty.className = 'empty-list';

        empty.textContent =
            'No content saved yet. Add your first item above.';

        $('items').append(empty);

        return;

    }


    // Create Content Items
    for (const s of slides) {

        const div = document.createElement('div');

        div.className = 'item';


        // ---------------------------------------------
        // Preview
        // ---------------------------------------------

        const preview = document.createElement('div');

        preview.className = 'item-preview';

        if (
            s.blob &&
            (s.type === 'image' || s.type === 'video')
        ) {

            const u = URL.createObjectURL(s.blob);

            previewUrls.push(u);

            const el = document.createElement(
                s.type === 'image' ? 'img' : 'video'
            );

            el.src = u;

            if (s.type === 'video') {
                el.muted = true;
            }

            preview.append(el);

        } else {

            preview.textContent =
                s.type === 'news' ? '✎' : '↗';

        }


        // ---------------------------------------------
        // Content Information
        // ---------------------------------------------

        const info = document.createElement('div');

        info.className = 'item-info';


        // Title
        const title = document.createElement('div');

        title.className = 'item-title';

        title.textContent = s.title;


        // Metadata
        const meta = document.createElement('div');

        meta.className = 'item-meta';

        meta.textContent =
            `${s.type} · ${s.duration}s · Order ${s.sort}`;


        info.append(title, meta);


        // ---------------------------------------------
        // Action Buttons
        // ---------------------------------------------

        const actions = document.createElement('div');

        actions.className = 'item-buttons';


        // Edit Button
        const edit = document.createElement('button');

        edit.type = 'button';

        edit.className = 'button-secondary';

        edit.textContent = 'Edit';


        edit.onclick = () => {

            editingId = s.id;

            editingBlob = s.blob || null;

            chosenFile = null;

            $('file').value = '';

            $('fileName').textContent = s.blob
                ? 'Current media will be kept unless replaced'
                : 'No file selected';

            $('type').value = s.type;

            $('title').value = s.title;

            $('body').value = s.body || '';

            $('url').value = s.url || '';

            $('duration').value = s.duration;

            $('sort').value = s.sort;

            updateType();

            $('editorHeading').textContent = 'Edit Content';

            $('saveButton').textContent = 'Save Changes';

            $('cancelEdit').hidden = false;

            $('editor').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

        };


        // Delete Button
        const del = document.createElement('button');

        del.type = 'button';

        del.className = 'delete-button';

        del.textContent = 'Delete';


        del.onclick = async () => {

            if (confirm(`Delete "${s.title}"?`)) {

                await TVDB.remove(s.id);

                if (editingId === s.id) {
                    resetEditor();
                }

                await render();

                notify('Content deleted');

            }

        };


        // Add Action Buttons
        actions.append(edit, del);


        // Add Item to List
        div.append(preview, info, actions);

        $('items').append(div);

    }

}


// =====================================================
// Save Content
// =====================================================

$('editor').onsubmit = async e => {

    e.preventDefault();

    try {

        const type = $('type').value;

        const file = chosenFile;

        const blob = file || editingBlob;


        // Validate Media
        if (
            ['image', 'video'].includes(type) &&
            !blob
        ) {
            throw Error('Choose a file');
        }


        if (
            type === 'image' &&
            blob &&
            !blob.type.startsWith('image/')
        ) {
            throw Error('Choose an image');
        }


        if (
            type === 'video' &&
            blob &&
            !blob.type.startsWith('video/')
        ) {
            throw Error('Choose a video');
        }


        // Validate External URL
        const url = $('url').value.trim();

        if (
            type === 'external' &&
            !/^https?:\/\//i.test(url)
        ) {
            throw Error('Enter a valid http(s) URL');
        }


        // Validate Title
        const title = $('title').value.trim();

        if (!title) {
            throw Error('Enter a title');
        }


        // Create Content Object
        const item = {

            id: editingId || crypto.randomUUID(),

            type,

            title,

            duration: Number($('duration').value),

            sort: Number($('sort').value),

            body: $('body').value,

            url,

            blob: ['image', 'video'].includes(type)
                ? blob
                : null

        };


        // Validate Duration
        if (
            !Number.isFinite(item.duration) ||
            item.duration < 2 ||
            item.duration > 3600
        ) {
            throw Error(
                'Duration must be between 2 and 3600 seconds'
            );
        }


        // Save to IndexedDB
        await TVDB.put(item);


        // Reset Form
        resetEditor();

        notify('Content saved locally on this device');


        // Refresh Content List
        await render();

    } catch (err) {

        notify('Save failed: ' + err.message, true);

    }

};


// =====================================================
// Blob Conversion Helpers
// =====================================================

// Convert Blob to Data URL
function blobToDataURL(blob) {

    return new Promise((resolve, reject) => {

        const r = new FileReader();

        r.onload = () => resolve(r.result);

        r.onerror = () => reject(r.error);

        r.readAsDataURL(blob);

    });

}


// Convert Data URL to Blob
async function dataURLToBlob(url) {

    const res = await fetch(url);

    return res.blob();

}


// =====================================================
// Export Backup
// =====================================================

$('export').onclick = async () => {

    try {

        notify('Preparing backup...');

        const slides = await TVDB.all();


        // Convert Media Files
        for (const s of slides) {

            if (s.blob) {

                s.dataURL = await blobToDataURL(s.blob);

                delete s.blob;

            }

        }


        // Create Backup JSON
        const json = JSON.stringify({

            format: 'tvcompany-local-v1',

            slides

        });


        // Create Download URL
        const url = URL.createObjectURL(
            new Blob([json], {
                type: 'application/json'
            })
        );


        // Download Backup
        const a = document.createElement('a');

        a.href = url;

        a.download = 'tvcompany-backup.json';

        a.click();


        // Release URL
        setTimeout(() => {

            URL.revokeObjectURL(url);

        }, 10000);


        notify('Backup exported');

    } catch (e) {

        notify(e.message, true);

    }

};


// =====================================================
// Import Backup
// =====================================================

$('import').onchange = async e => {

    const file = e.target.files[0];

    if (!file) return;

    try {

        // Read Backup File
        const backup = JSON.parse(
            await file.text()
        );


        // Validate Backup Format
        if (
            backup.format !== 'tvcompany-local-v1' ||
            !Array.isArray(backup.slides)
        ) {
            throw Error('Invalid backup');
        }


        // Confirm Import
        if (
            !confirm(
                `Import ${backup.slides.length} items? Existing content will remain; matching IDs will be replaced.`
            )
        ) {
            return;
        }


        // Import Content
        for (const s of backup.slides) {

            if (
                !['image', 'video', 'news', 'external'].includes(s.type) ||
                typeof s.id !== 'string'
            ) {
                continue;
            }


            // Restore Media
            if (s.dataURL) {

                s.blob = await dataURLToBlob(s.dataURL);

                delete s.dataURL;

            }


            // Save Item
            await TVDB.put(s);

        }


        notify('Backup imported');

        await render();

    } catch (err) {

        notify('Import failed: ' + err.message, true);

    } finally {

        e.target.value = '';

    }

};


// =====================================================
// Persistent Storage
// =====================================================

$('persist').onclick = async () => {

    notify(
        navigator.storage?.persist
            ? (
                (await navigator.storage.persist())
                    ? 'Persistent storage granted'
                    : 'Browser did not grant persistent storage'
            )
            : 'Not supported by this browser'
    );

};


// =====================================================
// Initialize Application
// =====================================================

render().catch(e => {

    notify(e.message, true);

});
