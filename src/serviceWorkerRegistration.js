export function register() {
    if ("serviceWorker" in navigator) {
        const publicUrl = import.meta.env.VITE_PUBLIC_URL;

        navigator.serviceWorker
            .register(`${publicUrl}/service-worker.js`, { scope: `${publicUrl}/` })
            .then((registration) => {
                console.log("Service Worker registered with scope:", registration.scope);
            })
            .catch((error) => {
                console.error("Service Worker registration failed:", error);
            });
    }
}

export function unregister() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}
