(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    function setHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 24 || document.body.querySelector('.inner-page')) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    setHeader();
    window.addEventListener('scroll', setHeader, { passive: true });

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                restart();
            });
        });
        restart();
    });

    document.querySelectorAll('[data-movie-rail]').forEach(function (rail) {
        var section = rail.closest('section');
        var left = section ? section.querySelector('[data-rail-left]') : null;
        var right = section ? section.querySelector('[data-rail-right]') : null;
        function move(amount) {
            rail.scrollBy({ left: amount, behavior: 'smooth' });
        }
        if (left) {
            left.addEventListener('click', function () {
                move(-420);
            });
        }
        if (right) {
            right.addEventListener('click', function () {
                move(420);
            });
        }
    });

    document.querySelectorAll('[data-filter-page]').forEach(function (page) {
        var search = page.querySelector('[data-movie-search]');
        var year = page.querySelector('[data-year-filter]');
        var region = page.querySelector('[data-region-filter]');
        var genre = page.querySelector('[data-genre-filter]');
        var count = page.querySelector('[data-visible-count]');
        var cards = Array.prototype.slice.call(page.querySelectorAll('.movie-card, .rank-item'));

        function value(node) {
            return node ? node.value.trim().toLowerCase() : '';
        }

        function matches(card, term, selectedYear, selectedRegion, selectedGenre) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags'),
                card.textContent
            ].join(' ').toLowerCase();
            if (term && haystack.indexOf(term) === -1) {
                return false;
            }
            if (selectedYear && (card.getAttribute('data-year') || '').toLowerCase() !== selectedYear) {
                return false;
            }
            if (selectedRegion && (card.getAttribute('data-region') || '').toLowerCase() !== selectedRegion) {
                return false;
            }
            if (selectedGenre && (card.getAttribute('data-genre') || '').toLowerCase().indexOf(selectedGenre) === -1) {
                return false;
            }
            return true;
        }

        function apply() {
            var total = 0;
            var term = value(search);
            var selectedYear = value(year);
            var selectedRegion = value(region);
            var selectedGenre = value(genre);
            cards.forEach(function (card) {
                var ok = matches(card, term, selectedYear, selectedRegion, selectedGenre);
                card.classList.toggle('is-hidden-card', !ok);
                if (ok) {
                    total += 1;
                }
            });
            if (count) {
                count.textContent = String(total);
            }
        }

        [search, year, region, genre].forEach(function (node) {
            if (node) {
                node.addEventListener('input', apply);
                node.addEventListener('change', apply);
            }
        });
        apply();
    });
}());

function setupMoviePlayer(mediaUrl) {
    var player = document.querySelector('[data-player]');
    if (!player) {
        return;
    }
    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var hls = null;
    var ready = false;

    function attach() {
        if (ready || !video) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(mediaUrl);
            hls.attachMedia(video);
        } else {
            video.src = mediaUrl;
        }
    }

    function play() {
        attach();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }
    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

(function () {
    function initSearch() {
        var data = window.SEARCH_DATA || [];
        var input = document.querySelector('[data-global-search]');
        var category = document.querySelector('[data-global-category]');
        var button = document.querySelector('[data-global-search-button]');
        var results = document.querySelector('[data-search-results]');
        var count = document.querySelector('[data-search-count]');

        if (!input || !results) {
            return;
        }

        function escapeHTML(value) {
            return String(value).replace(/[&<>"]/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;'
                }[char];
            });
        }

        function card(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span class="tag">' + escapeHTML(tag) + '</span>';
            }).join('');
            return '<article class="movie-card">' +
                '<a class="movie-cover" href="./' + escapeHTML(movie.file) + '">' +
                '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
                '<span class="play-badge">▶</span></a>' +
                '<div class="movie-card-body"><div class="card-meta"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.year) + '</span></div>' +
                '<h3><a href="./' + escapeHTML(movie.file) + '">' + escapeHTML(movie.title) + '</a></h3>' +
                '<p>' + escapeHTML(movie.oneLine) + '</p><div class="tag-row">' + tags + '</div></div></article>';
        }

        function run() {
            var term = input.value.trim().toLowerCase();
            var selectedCategory = category ? category.value : '';
            var filtered = data.filter(function (movie) {
                var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
                if (selectedCategory && movie.category !== selectedCategory) {
                    return false;
                }
                return !term || haystack.indexOf(term) !== -1;
            }).slice(0, 120);
            results.innerHTML = filtered.map(card).join('');
            if (count) {
                count.textContent = String(filtered.length);
            }
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial) {
            input.value = initial;
        }
        input.addEventListener('input', run);
        if (category) {
            category.addEventListener('change', run);
        }
        if (button) {
            button.addEventListener('click', run);
        }
        run();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearch);
    } else {
        initSearch();
    }
}());
