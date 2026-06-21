function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  setupHero();
  setupCatalogFilters();
});

function setupHero() {
  var hero = document.querySelector("[data-hero]");
  if (!hero) {
    return;
  }

  var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
  var prev = hero.querySelector("[data-hero-prev]");
  var next = hero.querySelector("[data-hero-next]");
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
    }, 5000);
  }

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

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
      restart();
    });
  });

  show(0);
  restart();
}

function setupCatalogFilters() {
  var toolBlocks = Array.prototype.slice.call(document.querySelectorAll("[data-catalog-tools]"));

  toolBlocks.forEach(function (tools) {
    var section = tools.parentElement;
    var grid = section ? section.querySelector("[data-catalog-grid]") : null;
    var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll(".movie-card")) : [];
    var input = tools.querySelector("[data-filter-input]");
    var kind = tools.querySelector("[data-kind-filter]");
    var region = tools.querySelector("[data-region-filter]");
    var year = tools.querySelector("[data-year-filter]");
    var reset = tools.querySelector("[data-filter-reset]");

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var kindValue = kind ? kind.value : "";
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchesKind = !kindValue || card.getAttribute("data-kind") === kindValue;
        var matchesRegion = !regionValue || card.getAttribute("data-region-group") === regionValue;
        var matchesYear = !yearValue || card.getAttribute("data-year") === yearValue;
        card.classList.toggle("is-hidden", !(matchesKeyword && matchesKind && matchesRegion && matchesYear));
      });
    }

    [input, kind, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (kind) {
          kind.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
      apply();
    }
  });
}

function initHlsPlayer(videoId, overlayId, streamUrl, title) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var attached = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      attached = true;
      return;
    }

    video.src = streamUrl;
    attached = true;
  }

  function startPlayback() {
    attachStream();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (title) {
    video.setAttribute("aria-label", title);
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (!video.ended && overlay && !attached) {
      overlay.classList.remove("is-hidden");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
