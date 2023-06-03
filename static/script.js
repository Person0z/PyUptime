window.onload = function() {
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Check if a preference cookie exists
    const modePreference = getCookie('modePreference');
    if (modePreference === 'dark') {
        darkModeToggle.checked = true;
        document.body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            setCookie('modePreference', 'dark', 365); // Set preference cookie for 1 year
        } else {
            document.body.classList.remove('dark-mode');
            setCookie('modePreference', 'light', 365); // Set preference cookie for 1 year
        }
    });

    monitor();
    setInterval(monitor, 30000);
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
}

// Function to get a cookie value
function getCookie(name) {
    const cookieName = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return '';
}

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
