(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var links = document.querySelector('[data-nav-links]');
        if (!button || !links) {
            return;
        }
        button.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        inputs.forEach(function (input) {
            var panel = input.closest('.search-panel');
            var scope = panel ? panel.parentElement.querySelector('[data-search-scope]') : document;
            var clear = panel ? panel.querySelector('[data-clear-search]') : null;
            if (!scope) {
                scope = document;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card], .category-tile'));
            var empty = document.createElement('div');
            empty.className = 'empty-result is-hidden';
            empty.textContent = '没有找到匹配内容';
            scope.appendChild(empty);

            function apply() {
                var keyword = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    var match = !keyword || text.indexOf(keyword) !== -1;
                    card.classList.toggle('is-hidden', !match);
                    if (match) {
                        visible += 1;
                    }
                });
                empty.classList.toggle('is-hidden', visible !== 0);
            }

            input.addEventListener('input', apply);
            if (clear) {
                clear.addEventListener('click', function () {
                    input.value = '';
                    apply();
                    input.focus();
                });
            }
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var trigger = player.querySelector('.player-cover');
            if (!video) {
                return;
            }
            var source = video.getAttribute('data-video-url');
            var loaded = false;
            var hls = null;

            function load() {
                if (loaded || !source) {
                    return;
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                }
            }

            function play() {
                load();
                player.classList.add('is-playing');
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (trigger) {
                trigger.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.add('is-playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initPlayers();
    });
})();
