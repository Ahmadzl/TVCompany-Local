
const TVDB = (() => {

    // =====================================================
    // Database Configuration
    // =====================================================

    const DB = 'tvcompany-local-v1';

    const STORE = 'slides';


    // =====================================================
    // Open IndexedDB Database
    // =====================================================

    function open() {

        return new Promise((resolve, reject) => {

            const r = indexedDB.open(DB, 1);


            // Create Object Store if it does not exist
            r.onupgradeneeded = () => {

                const d = r.result;

                if (!d.objectStoreNames.contains(STORE)) {

                    d.createObjectStore(STORE, {
                        keyPath: 'id'
                    });

                }

            };


            // Database Opened Successfully
            r.onsuccess = () => {

                resolve(r.result);

            };


            // Database Error
            r.onerror = () => {

                reject(r.error);

            };

        });

    }


    // =====================================================
    // Database Transaction Helper
    // =====================================================

    async function transaction(mode, work) {

        const db = await open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(STORE, mode);

            const store = tx.objectStore(STORE);

            let request;


            // Execute Database Operation
            try {

                request = work(store);

            } catch (e) {

                db.close();

                reject(e);

                return;

            }


            // Transaction Completed
            tx.oncomplete = () => {

                db.close();

                resolve(request?.result);

            };


            // Transaction Error
            tx.onerror = () => {

                db.close();

                reject(tx.error);

            };


            // Transaction Aborted
            tx.onabort = () => {

                db.close();

                reject(tx.error);

            };

        });

    }


    // =====================================================
    // Public Database Methods
    // =====================================================

    return {

        // Get All Slides
        all: async () => {

            const slides = await transaction(
                'readonly',
                s => s.getAll()
            );

            return slides.sort(
                (a, b) =>
                    a.sort - b.sort ||
                    a.id.localeCompare(b.id)
            );

        },


        // Add or Update Slide
        put: x => transaction(
            'readwrite',
            s => s.put(x)
        ),


        // Delete Slide by ID
        remove: id => transaction(
            'readwrite',
            s => s.delete(id)
        ),


        // Delete All Slides
        clear: () => transaction(
            'readwrite',
            s => s.clear()
        )

    };

})();


// =====================================================
// Service Worker Registration
// =====================================================

if (
    'serviceWorker' in navigator &&
    location.protocol !== 'file:'
) {

    navigator.serviceWorker
        .register('./sw.js')
        .catch(console.warn);

}
