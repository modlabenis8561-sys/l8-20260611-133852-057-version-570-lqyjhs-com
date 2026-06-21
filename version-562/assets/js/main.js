(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var heroForm = document.querySelector('[data-hero-search]');

    if (heroForm) {
        heroForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = heroForm.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = './search.html';

            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }

            window.location.href = target;
        });
    }

    var filterInput = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty]');

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var query = normalize(filterInput ? filterInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var region = regionSelect ? regionSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var title = normalize(card.getAttribute('data-title'));
            var tags = normalize(card.getAttribute('data-tags'));
            var cardYear = card.getAttribute('data-year') || '';
            var cardRegion = card.getAttribute('data-region') || '';
            var matchQuery = !query || title.indexOf(query) !== -1 || tags.indexOf(query) !== -1;
            var matchYear = !year || cardYear === year;
            var matchRegion = !region || cardRegion.indexOf(region) !== -1;
            var matched = matchQuery && matchYear && matchRegion;

            card.style.display = matched ? '' : 'none';

            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.style.display = visible ? 'none' : 'block';
        }
    }

    [filterInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q');

        if (queryValue) {
            filterInput.value = queryValue;
        }

        applyFilters();
    }
})();
