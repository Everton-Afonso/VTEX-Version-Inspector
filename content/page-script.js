function sendRuntime() {
    const runtime = window.__RUNTIME__;

    window.postMessage(
        {
            type: "VTEX_RUNTIME",
            runtime: {
                components: Object.keys(runtime.components)
            }
        }, "*"
    );
}

const interval = setInterval(() => {
    const runtime = window.__RUNTIME__;

    if ( runtime && runtime.components && Object.keys(runtime.components).length > 0) {
        clearInterval(interval);

        sendRuntime();
    }
}, 500);