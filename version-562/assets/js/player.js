import { H as Hls } from './hls-vendor-dru42stk.js';

(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    boxes.forEach(function (box) {
        var video = box.querySelector('video');
        var overlay = box.querySelector('.player-overlay');
        var hlsReady = false;
        var hlsInstance = null;

        if (!video || !overlay) {
            return;
        }

        function streamUrl() {
            var tag = video.querySelector('source');
            return tag ? tag.getAttribute('src') : '';
        }

        function bindStream() {
            var url = streamUrl();

            if (!url || hlsReady) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                hlsReady = true;
                return;
            }

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsReady = true;
                return;
            }

            video.src = url;
            hlsReady = true;
        }

        function play() {
            bindStream();
            overlay.classList.add('is-hidden');
            video.controls = true;
            var start = video.play();

            if (start && typeof start.catch === 'function') {
                start.catch(function () {});
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!hlsReady) {
                play();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
