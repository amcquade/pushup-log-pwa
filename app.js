document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pushup-form');
    const input = document.getElementById('pushup-input');
    const historyList = document.getElementById('history-list');
    const allTimeTotalEl = document.getElementById('all-time-total');

    // Determine environment for correct Service Worker pathing
    const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.lndo.site');

    // Adjust the BASE_URL to your GitHub repository name
    const REPO_NAME = 'pushup-log-pwa';
    const BASE_URL = IS_LOCAL ? '/' : `/${REPO_NAME}/`;

    // --- Helper Functions ---
    const getPushups = () => JSON.parse(localStorage.getItem('pushupHistory')) || [];
    const savePushups = (pushups) => localStorage.setItem('pushupHistory', JSON.stringify(pushups));

    const groupBy = (array, getKey) => array.reduce((acc, item) => {
        const key = getKey(item);
        (acc[key] = acc[key] || []).push(item);
        return acc;
    }, {});

    const getStartOfWeek = (date) => {
        const d = new Date(date);
        // This calculation finds the preceding Sunday based on the local date.
        const dayOfWeek = d.getDay(); // Sunday - 0, Monday - 1, etc.
        const diff = d.getDate() - dayOfWeek;
        const startOfWeekDate = new Date(d.setDate(diff));

        // Format the date to YYYY-MM-DD in the local timezone to avoid UTC shifts.
        const year = startOfWeekDate.getFullYear();
        const month = (startOfWeekDate.getMonth() + 1).toString().padStart(2, '0');
        const dayOfMonth = startOfWeekDate.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${dayOfMonth}`;
    };

    const getStartOfDay = (date) => {
        const d = new Date(date);
        // Format the date to YYYY-MM-DD in the local timezone to avoid UTC shifts.
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const dayOfMonth = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${dayOfMonth}`;
    };

    // --- Core Functions ---
    const deletePushup = (id) => {
        let pushups = getPushups();
        pushups = pushups.filter(entry => entry.date !== id);
        savePushups(pushups);
        renderHistory();
    };

    const renderHistory = () => {
        const pushups = getPushups();
        historyList.innerHTML = '';

        const allTimeTotal = pushups.reduce((sum, entry) => sum + entry.count, 0);
        if (allTimeTotalEl) {
            allTimeTotalEl.innerHTML = `All-Time Total: <strong>${allTimeTotal.toLocaleString()}</strong>`;
        }

        if (pushups.length === 0) {
            historyList.innerHTML = '<li class="list-group-item text-center text-muted">No push-ups logged yet.</li>';
            return;
        }

        const entriesByWeek = groupBy(pushups, entry => getStartOfWeek(new Date(entry.date)));
        const sortedWeeks = Object.keys(entriesByWeek).sort((a, b) => new Date(b) - new Date(a));

        sortedWeeks.forEach(weekStartDate => {
            const weekEntries = entriesByWeek[weekStartDate];
            const weekTotal = weekEntries.reduce((sum, entry) => sum + entry.count, 0);

            const weekHeader = document.createElement('li');
            weekHeader.className = 'list-group-item list-group-item-secondary mt-3 fw-bold';
            weekHeader.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span>Week of ${new Date(weekStartDate).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'long', day: 'numeric' })}</span>
                    <span>Total: ${weekTotal.toLocaleString()}</span>
                </div>`;
            historyList.appendChild(weekHeader);

            const entriesByDay = groupBy(weekEntries, entry => getStartOfDay(new Date(entry.date)));
            const sortedDays = Object.keys(entriesByDay).sort((a, b) => new Date(b) - new Date(a));

            sortedDays.forEach(dayStartDate => {
                const dayEntries = entriesByDay[dayStartDate];
                const dayTotal = dayEntries.reduce((sum, entry) => sum + entry.count, 0);

                const dayHeader = document.createElement('li');
                dayHeader.className = 'list-group-item list-group-item-light';
                dayHeader.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold">${new Date(dayStartDate).toLocaleDateString(undefined, { timeZone: 'UTC', weekday: 'long' })}</span>
                        <span>Total: ${dayTotal.toLocaleString()}</span>
                    </div>`;
                historyList.appendChild(dayHeader);

                dayEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
                dayEntries.forEach(entry => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.dataset.id = entry.date;
                    li.innerHTML = `
                        <div class="row align-items-center">
                            <div class="col">
                                <span><strong>${entry.count}</strong> push-ups</span>
                            </div>
                            <div class="col-auto">
                                <span class="text-muted small me-2">${new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div class="col-auto ps-0">
                                <button type="button" class="btn btn-sm btn-outline-danger delete-btn" aria-label="Delete entry">
                                    <i class="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>`;
                    historyList.appendChild(li);
                });
            });
        });
    };

    // --- Event Listeners ---
    historyList.addEventListener('click', (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            const listItem = e.target.closest('li[data-id]');
            if (listItem && listItem.dataset.id) {
                if (confirm('Are you sure you want to delete this entry?')) {
                    deletePushup(listItem.dataset.id);
                }
            }
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const count = parseInt(input.value, 10);
        if (isNaN(count) || count <= 0) {
            alert('Please enter a valid number.');
            return;
        }
        const pushups = getPushups();
        pushups.push({ count, date: new Date().toISOString() });
        savePushups(pushups);
        renderHistory();
        form.reset();
    });

    // --- Initial Load ---
    renderHistory();

    if ('serviceWorker' in navigator) {
        const serviceWorkerUrl = `${BASE_URL}sw.js`;
        navigator.serviceWorker.register(serviceWorkerUrl, { scope: BASE_URL })
            .then(registration => console.log(`Service Worker registered successfully with scope: ${registration.scope}`))
            .catch(error => console.log('Service Worker registration failed:', error));
    }
});

