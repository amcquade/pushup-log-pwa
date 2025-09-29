document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pushup-form');
    const input = document.getElementById('pushup-input');
    const historyList = document.getElementById('history-list');

    // Determine environment for correct Service Worker pathing
    const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.lndo.site');

    // Adjust the BASE_URL to your GitHub repository name
    const REPO_NAME = 'pushup-log-pwa';
    const BASE_URL = IS_LOCAL ? '/' : `/${REPO_NAME}/`;

    // Function to get push-ups from localStorage
    const getPushups = () => {
        return JSON.parse(localStorage.getItem('pushupHistory')) || [];
    };

    // Function to save push-ups to localStorage
    const savePushups = (pushups) => {
        localStorage.setItem('pushupHistory', JSON.stringify(pushups));
    };

    // Function to delete a specific push-up entry by its ID (date)
    const deletePushup = (id) => {
        let pushups = getPushups();
        pushups = pushups.filter(entry => entry.date !== id);
        savePushups(pushups);
        renderHistory();
    };

    // Function to render the history list
    const renderHistory = () => {
        const pushups = getPushups();
        historyList.innerHTML = ''; // Clear the list first

        if (pushups.length === 0) {
            historyList.innerHTML = '<li class="list-group-item text-center text-muted">No push-ups logged yet.</li>';
            return;
        }

        // Sort by date, newest first
        pushups.sort((a, b) => new Date(b.date) - new Date(a.date));

        pushups.forEach(entry => {
            const li = document.createElement('li');
            li.className = 'list-group-item';

            // Add a unique identifier to each list item for easier targeting
            li.dataset.id = entry.date;

            // Use a Bootstrap row with a column for the delete button
            li.innerHTML = `
                <div class="row align-items-center">
                    <div class="col">
                        <span><strong>${entry.count}</strong> push-ups</span>
                    </div>
                    <div class="col-auto">
                        <span class="text-muted small me-2">${new Date(entry.date).toLocaleString()}</span>
                    </div>
                    <div class="col-auto ps-0">
                        <button type="button" class="btn btn-sm btn-outline-danger delete-btn" aria-label="Delete entry">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            `;
            historyList.appendChild(li);
        });
    };

    // Event Delegation for delete buttons
    historyList.addEventListener('click', (e) => {
        // Find the closest delete button to where the user clicked
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            // Find the parent list item and get its ID
            const listItem = e.target.closest('li');
            if (listItem && listItem.dataset.id) {
                // Confirm before deleting
                if (confirm('Are you sure you want to delete this entry?')) {
                    deletePushup(listItem.dataset.id);
                }
            }
        }
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
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
        form.reset(); // Clear the input field
    });

    // Initial render
    renderHistory();

    // Register the Service Worker for PWA functionality
    if ('serviceWorker' in navigator) {
        const serviceWorkerUrl = `${BASE_URL}sw.js`;
        navigator.serviceWorker.register(serviceWorkerUrl, { scope: BASE_URL })
            .then(registration => {
                console.log(`Service Worker registered successfully with scope: ${registration.scope}`);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
});

