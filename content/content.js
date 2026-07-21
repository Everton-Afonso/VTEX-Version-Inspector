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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_COMPONENTS") {

        const result = getComponents();

        console.log("📦 Enviando componentes:", result);

        sendResponse(result);
    }

    return true;
});