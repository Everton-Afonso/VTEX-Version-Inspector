const script = document.createElement("script");

script.src = chrome.runtime.getURL("content/page-script.js");

script.onload = () => {
    script.remove();
};

document.documentElement.appendChild(script);

let vtexRuntime = null;

window.addEventListener("message", (event) => {
    if (event.source !== window || event.data.type !== "VTEX_RUNTIME") {
        return;
    }

    vtexRuntime = event.data.runtime;
});

function getComponents() {
    const components = vtexRuntime?.components;

    if (!components) return {};

    const apps = {};

    components.forEach((key) => {
        const match = key.match(/^(.+?)@([^/]+)\/(.+)$/);

        if (!match) return;

        const [, app, version] = match;

        const appKey = `${app}@${version}`;

        if (!apps[appKey]) {
            apps[appKey] = {
                app,
                version
            };
        }
    });

    return apps;
}

//busca o orderform

async function getOrderForm() {
    try {
        const response = await fetch("/api/checkout/pub/orderForm", {
            credentials: "include",
        });

        if (!response.ok) return null;
        
        return await response.json();
    } catch {
        return null;
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case "GET_COMPONENTS": sendResponse(getComponents());
            return true;

        case "GET_ORDERFORM": getOrderForm().then(sendResponse).catch(() => sendResponse(null));
            return true;
    }
});