(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showSlide(nextIndex) {
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }
    }

    var input = document.querySelector('[data-search-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    if (cards.length && (input || categoryFilter)) {
        var grid = document.querySelector('[data-card-grid]');
        var empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = '没有找到匹配内容，请调整关键词或频道。';
        if (grid && grid.parentNode) {
            grid.parentNode.appendChild(empty);
        }

        function runFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var category = categoryFilter ? categoryFilter.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-category') || ''
                ].join(' ').toLowerCase();
                var categoryOk = !category || card.getAttribute('data-category') === category;
                var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
                var keep = categoryOk && keywordOk;
                card.classList.toggle('is-filtered-out', !keep);
                if (keep) {
                    visible += 1;
                }
            });

            empty.classList.toggle('is-visible', visible === 0);
        }

        if (input) {
            input.addEventListener('input', runFilter);
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', runFilter);
        }
    }

    function startPlayer(shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('.play-cover');
        var streamUrl = shell.getAttribute('data-stream');

        if (!video || !streamUrl) {
            return;
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }

        video.controls = true;

        if (!video.getAttribute('data-ready')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                video.hlsInstance = hls;
            } else {
                video.src = streamUrl;
            }
            video.setAttribute('data-ready', 'true');
        }

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(function (shell) {
        var cover = shell.querySelector('.play-cover');
        var video = shell.querySelector('video');

        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!video.getAttribute('data-ready')) {
                    startPlayer(shell);
                }
            });
        }
    });
})();
