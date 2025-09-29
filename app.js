document.addEventListener('DOMContentLoaded', () => {
    // ==============================================================================
    // Environment Detection and Base URL Configuration
    // ==============================================================================
    const localHostnames = [
        'localhost',
        '127.0.0.1',
        'pushup-app.lndo.site'
    ];

    const IS_LOCAL = localHostnames.includes(window.location.hostname);

    // Determine the base URL for asset loading (crucial for GitHub Pages subdirectories)
    // If local, base is just '/'. If production, it includes the repo name.
    const BASE_URL = IS_LOCAL ? '/' : '/pushup-log-pwa/'; // <-- IMPORTANT: Replace 'pushup-tracker' with your repo name if different!

    if (IS_LOCAL) {
        console.log(`Running in Local Development Mode. Base URL: ${BASE_URL}`);
    } else {
        console.log(`Running in Production (GitHub Pages) Mode. Base URL: ${BASE_URL}`);
    }
    // ==============================================================================


    const form = document.getElementById('pushup-form');
    const input = document.getElementById('pushup-input');
    const historyList = document.getElementById('history-list');

    const getPushups = () => {
        return JSON.parse(localStorage.getItem('pushupHistory')) || [];
    };

    const savePushups = (pushups) => {
        localStorage.setItem('pushupHistory', JSON.stringify(pushups));
    };

    const renderHistory = () => {
        const pushups = getPushups();
        historyList.innerHTML = '';

        if (pushups.length === 0) {
            historyList.innerHTML = '<li class="list-group-item text-center text-muted">No push-ups logged yet.</li>';
            return;
        }

        pushups.sort((a, b) => new Date(b.date) - new Date(a.date));

        pushups.forEach(entry => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            const countText = `<span><strong>${entry.count}</strong> push-ups</span>`;
            const dateText = `<span class="text-muted small">${new Date(entry.date).toLocaleString()}</span>`;
            li.innerHTML = `${countText}${dateText}`;
            historyList.appendChild(li);
        });
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const count = parseInt(input.value, 10);

        if (isNaN(count) || count <= 0) {
            alert('Please enter a valid number.');
            return;
        }

        const pushups = getPushups();
        const newEntry = {
            count: count,
            date: new Date().toISOString()
        };

        pushups.push(newEntry);
        savePushups(pushups);
        renderHistory();
        form.reset();
    });

    renderHistory();

    // ==============================================================================
    // Service Worker Registration (using the determined BASE_URL)
    // ==============================================================================
    if ('serviceWorker' in navigator) {
        // We register the service worker at the root scope, but tell it about the BASE_URL
        // This makes sure the service worker controls the whole app,
        // and its internal paths are correct.
        navigator.serviceWorker.register(`${BASE_URL}sw.js`, { scope: BASE_URL }) // Pass BASE_URL as scope
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
    // ==============================================================================
});
