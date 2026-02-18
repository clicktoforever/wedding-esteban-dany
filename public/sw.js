self.addEventListener('install', () => {
    // Skip over the "waiting" lifecycle state, to ensure that our
    // new service worker is activated immediately.
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    // Unregister the service worker immediately to stop 404 errors
    self.registration.unregister().then(() => {
        console.log('ServiceWorker unregistered');
    });
});
