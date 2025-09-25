document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pushup-form');
    const input = document.getElementById('pushup-input');
    const historyList = document.getElementById('history-list');

    // Function to get push-ups from localStorage
    const getPushups = () => {
        return JSON.parse(localStorage.getItem('pushupHistory')) || [];
    };

    // Function to save push-ups to localStorage
    const savePushups = (pushups) => {
        localStorage.setItem('pushupHistory', JSON.stringify(pushups));
    };

    // Function to render the history list
    const renderHistory = () => {
        const pushups = getPushups();
        historyList.innerHTML = ''; // Clear the list first
        if (pushups.length === 0) {
            historyList.innerHTML = '<li>No push-ups logged yet.</li>';
            return;
        }
        // Sort by date, newest first
        pushups.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        pushups.forEach(entry => {
            const li = document.createElement('li');
            const countText = `<strong>${entry.count}</strong> push-ups`;
            const dateText = `<span>${new Date(entry.date).toLocaleString()}</span>`;
            li.innerHTML = `${countText}${dateText}`;
            historyList.appendChild(li);
        });
    };

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
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    }
});