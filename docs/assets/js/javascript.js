document.addEventListener("cw:ready", () => {
    console.log("Clockwork bundle is ready!");

    // Example: change theme
    cw.theme.apply("dark");

    // Example: show toast
    cw.ui.toast("Clockwork Connected!");

    // Example: API helper
    cw.api.fetchJSON("/data/game.json", { cacheTTL: 5000 })
        .then(data => console.log("Game Data:", data));

    // Example: modify sidebar
    cw.sidebar.init();

    // Example: use router (if desired)
    cw.router.add("/dashboard", () => {
        console.log("Dashboard loaded");
    });
});
