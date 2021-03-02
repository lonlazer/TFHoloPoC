if (navigator.serviceWorker.controller) {
    console.log("Active service worker found");
} else {
    navigator.serviceWorker
        .register("serviceWorker.js", {
            scope: "./"
        })
        .then(function (reg) {
            console.log("Service worker  registered");
        });
}
