function initVideoPlayer(videoId, source) {
  var video = document.getElementById(videoId);
  if (!video || !source) {
    return;
  }

  var shell = video.closest("[data-player-shell]");
  var overlay = shell ? shell.querySelector("[data-player-overlay]") : null;
  var hlsInstance = null;
  var loaded = false;

  function loadSource() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = source;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function showOverlay() {
    if (overlay && video.paused && !video.currentTime) {
      overlay.classList.remove("is-hidden");
    }
  }

  function playVideo() {
    loadSource();
    hideOverlay();
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function() {
        showOverlay();
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function() {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", hideOverlay);
  video.addEventListener("ended", showOverlay);
  video.addEventListener("emptied", showOverlay);

  window.addEventListener("pagehide", function() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
