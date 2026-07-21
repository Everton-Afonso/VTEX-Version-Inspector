const container = document.getElementById("apps");
const search = document.getElementById("search");

let allApps = {};

function renderApps(apps) {
    container.innerHTML = "";

    Object.entries(apps).forEach(([key, info]) => {
        const card = document.createElement("div");

        card.className = "app-card";

        card.innerHTML = `
            <div class="app-info">
                <span class="label">App:</span>
                <span class="app-name">${info.app}</span>
            </div>

            <div class="app-info">
                <span class="label">Version:</span>
                <span class="version">${info.version}</span>
            </div>
        `;

        container.appendChild(card);
    });
}


chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "GET_COMPONENTS" }, (apps) => {
        if (chrome.runtime.lastError) {
            container.innerHTML = `
                <p>Content script not found. Reload the page.</p>
            `;

            return;
        }

        if (!apps || Object.keys(apps).length === 0) {
            container.innerHTML = `
                <p>No VTEX app found.</p>
            `;

            return;
        }

        allApps = apps;

        search.style.display = "block";

        renderApps(allApps);
    });
});

search.addEventListener("input", () => {
    const value = search.value.toLowerCase().trim();

    const filteredApps = Object.fromEntries(
        Object.entries(allApps).filter(([key, info]) =>
            info.app.toLowerCase().includes(value)
        )
    );

    renderApps(filteredApps);
});