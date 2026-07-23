const container = document.getElementById("apps");
const search = document.getElementById("search");
const orderformContainer = document.getElementById("orderform");

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

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

function renderOrderForm(orderform) {
    if (!orderform) {
        orderformContainer.innerHTML = `
            <p>OrderForm not found</p>
        `;
        return;
    }

    orderformContainer.innerHTML = `
        <div class="orderform-row">
            <span class="orderform-label">ID</span>
            <span class="orderform-value">${orderform.orderFormId}</span>
        </div>

        <div class="orderform-row">
            <span class="orderform-label">Items</span>
            <span class="orderform-value">${orderform.items.length}</span>
        </div>

        <div class="orderform-row">
            <span class="orderform-label">Value</span>
            <span class="orderform-value">
                R$ ${(orderform.value / 100).toFixed(2)}
            </span>
        </div>

        <div class="orderform-row">
            <span class="orderform-label">Email</span>
            <span class="orderform-value">
                ${orderform.clientProfileData?.email ?? "-"}
            </span>
        </div>
    `;
}

tabs.forEach(button => {
    button.addEventListener("click", () => {

        tabs.forEach(tab => tab.classList.remove("active"));
        panels.forEach(panel => panel.classList.remove("active"));

        button.classList.add("active");

        document
            .getElementById(`${button.dataset.tab}-panel`)
            .classList.add("active");
    });
});

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage( tab.id, { type: "GET_ORDERFORM" }, (orderForm) => {
            if (chrome.runtime.lastError) {
                orderformContainer.innerHTML =
                    "<p>Unable to load OrderForm.</p>";
                return;
            }

            renderOrderForm(orderForm);
        }
    );

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