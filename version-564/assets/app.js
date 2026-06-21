(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = qs(".nav-toggle");
        var menu = qs(".mobile-menu");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = menu.hasAttribute("hidden");
            if (open) {
                menu.removeAttribute("hidden");
            } else {
                menu.setAttribute("hidden", "");
            }
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa(".hero-slide", hero);
        var dots = qsa(".hero-dots button", hero);
        var prev = qs(".hero-prev", hero);
        var next = qs(".hero-next", hero);
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        show(0);
    }

    function setupRows() {
        qsa("[data-scroll-row]").forEach(function (wrap) {
            var row = qs(".movie-row", wrap);
            var left = qs("[data-scroll-left]", wrap);
            var right = qs("[data-scroll-right]", wrap);
            if (!row) {
                return;
            }
            if (left) {
                left.addEventListener("click", function () {
                    row.scrollBy({ left: -420, behavior: "smooth" });
                });
            }
            if (right) {
                right.addEventListener("click", function () {
                    row.scrollBy({ left: 420, behavior: "smooth" });
                });
            }
        });
    }

    function setupFilters() {
        qsa("[data-filter-panel]").forEach(function (panel) {
            var container = panel.parentElement;
            var input = qs(".filter-input", panel);
            var year = qs(".filter-year", panel);
            var type = qs(".filter-type", panel);
            var category = qs(".filter-category", panel);
            var cards = qsa(".movie-card, .horizontal-card", container);
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var y = year ? year.value : "";
                var t = type ? type.value : "";
                var c = category ? category.value : "";
                cards.forEach(function (card) {
                    var haystack = [
                        card.dataset.title,
                        card.dataset.year,
                        card.dataset.type,
                        card.dataset.region,
                        card.dataset.category,
                        card.dataset.keywords
                    ].join(" ").toLowerCase();
                    var ok = true;
                    if (query && haystack.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (y && card.dataset.year !== y) {
                        ok = false;
                    }
                    if (t && card.dataset.type !== t) {
                        ok = false;
                    }
                    if (c && card.dataset.category !== c) {
                        ok = false;
                    }
                    card.hidden = !ok;
                });
            }
            [input, year, type, category].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", apply);
                    element.addEventListener("change", apply);
                }
            });
            var params = new URLSearchParams(window.location.search);
            if (input && params.get("q")) {
                input.value = params.get("q");
            }
            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupRows();
        setupFilters();
    });
})();
