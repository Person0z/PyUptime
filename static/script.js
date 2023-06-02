setInterval(monitor, 5000);

function monitor() {
    fetch('/api/monitor')
        .then(response => response.json())
        .then(data => {
            let status = '';
            for (const [server, info] of Object.entries(data)) {
                let since = new Date(info.since);
                let now = new Date();
                let seconds = Math.floor((now - since) / 1000);
                let time = formatTime(seconds);
                let statusClass = info.status === 'running' ? 'status-online' : 'status-offline';
                status += `
                    <div class="server">
                        <div class="server-status-icon ${statusClass}"></div>
                        <div class="server-info">
                            <div class="server-name">${server}</div>
                            <div class="server-status">${info.status} (${time})</div>
                        </div>
                    </div>`;
            }
            document.getElementById('status').innerHTML = status;
        });
}

function formatTime(seconds) {
    let days = Math.floor(seconds / (3600*24));
    seconds  -= days*3600*24;
    let hrs   = Math.floor(seconds / 3600);
    seconds  -= hrs*3600;
    let mnts = Math.floor(seconds / 60);
    if (days > 0) {
        return `${days} days, ${hrs} hours, ${mnts} minutes`;
    } else if (hrs > 0) {
        return `${hrs} hours, ${mnts} minutes`;
    } else {
        return `${mnts} minutes`;
    }
}
