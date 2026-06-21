(function() {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function() {
        menu.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero-carousel]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function(slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function(dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function() {
          show(active + 1);
        }, 5000);
      }

      dots.forEach(function(dot) {
        dot.addEventListener("click", function() {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function() {
          show(active - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function() {
          show(active + 1);
          restart();
        });
      }

      show(0);
      restart();
    }

    var form = document.querySelector("[data-filter-form]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var status = document.querySelector("[data-filter-status]");
    if (form && cards.length) {
      var query = document.getElementById("filter-query");
      var region = document.getElementById("filter-region");
      var type = document.getElementById("filter-type");
      var year = document.getElementById("filter-year");

      function value(input) {
        return input ? input.value.trim().toLowerCase() : "";
      }

      function filterCards() {
        var q = value(query);
        var r = value(region);
        var t = value(type);
        var y = value(year);
        var visible = 0;
        cards.forEach(function(card) {
          var text = card.textContent.toLowerCase() + " " + (card.getAttribute("data-title") || "").toLowerCase();
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (r && card.getAttribute("data-region") !== r) {
            ok = false;
          }
          if (t && card.getAttribute("data-type") !== t) {
            ok = false;
          }
          if (y && card.getAttribute("data-year") !== y) {
            ok = false;
          }
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (status) {
          status.textContent = "搜索结果 · " + visible + " 部影片";
        }
      }

      [query, region, type, year].forEach(function(input) {
        if (input) {
          input.addEventListener("input", filterCards);
          input.addEventListener("change", filterCards);
        }
      });

      form.addEventListener("reset", function() {
        window.setTimeout(filterCards, 0);
      });

      filterCards();
    }
  });
})();
