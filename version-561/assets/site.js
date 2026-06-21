(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var links = document.querySelector("[data-nav-links]");
    if (!button || !links) {
      return;
    }
    button.addEventListener("click", function () {
      links.classList.toggle("is-open");
      button.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

    if (!cards.length) {
      return;
    }

    function getKeyword() {
      var value = "";
      inputs.forEach(function (input) {
        if (input.value.trim()) {
          value = input.value.trim().toLowerCase();
        }
      });
      return value;
    }

    function getActiveValue() {
      var active = document.querySelector("[data-filter-value].is-active");
      return active ? active.getAttribute("data-filter-value").toLowerCase() : "";
    }

    function apply() {
      var keyword = getKeyword();
      var activeValue = getActiveValue();

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter") || "").toLowerCase();
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchValue = !activeValue || text.indexOf(activeValue) !== -1;
        card.classList.toggle("is-hidden", !(matchKeyword && matchValue));
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", apply);
    });

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        apply();
      });
    });
  }

  window.initMoviePlayer = function (url) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.querySelector("[data-player-overlay]");
    var attached = false;
    var hls = null;

    if (!video || !url) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
        return;
      }

      video.src = url;
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });

    attach();
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
