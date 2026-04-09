// Service worker for tinytask.tools
// Sole responsibility: intercept Web Share Target POST requests, stash the
// shared image in IndexedDB, then redirect to the image optimizer.

const DB_NAME = 'tinytask-share';
const STORE_NAME = 'shared-files';
const SHARED_KEY = 'shared-image';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveSharedImage(file) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(file, SHARED_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const file = formData.get('image');
          if (file instanceof File) {
            await saveSharedImage(file);
          }
        } catch {
          // If stashing fails, the user still lands on the page with the upload UI
        }
        return Response.redirect('/tools/image-optimizer?shared=1', 303);
      })(),
    );
  }
});
