(function () {
  "use strict";

  var root = document.documentElement;
  var SCREENS = "assets/img/screens/";
  var THEME_KEY = "estatehub-landing-theme";
  var THEME_COLORS = { light: "#f6f7fd", dark: "#0b1222" };

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function screenUrl(name, width) {
    return SCREENS + name + "-" + width + ".webp";
  }

  function setScreen(img, name) {
    if (img.getAttribute("data-current") === name) return;

    var widths = (img.getAttribute("data-widths") || "960,1920").split(",");
    img.srcset = widths
      .map(function (width) {
        return screenUrl(name, width) + " " + width + "w";
      })
      .join(", ");
    img.src = screenUrl(name, widths[0]);
    img.setAttribute("data-current", name);
  }

  function syncThemedScreens() {
    var theme = currentTheme();
    $$("img[data-light]").forEach(function (img) {
      setScreen(img, img.getAttribute("data-" + theme));
    });
  }

  /* Theme */

  var themeToggle = $("#theme-toggle");
  var themeColor = $('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    if (themeColor) themeColor.setAttribute("content", THEME_COLORS[theme]);
    syncThemedScreens();
  }

  themeToggle.addEventListener("click", function () {
    var next = currentTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (error) {}
    applyTheme(next);
  });

  applyTheme(currentTheme());

  /* Outbound links */

  var links = window.ESTATEHUB_LINKS || {};
  var hasLinks = false;

  $$("[data-link]").forEach(function (anchor) {
    var url = links[anchor.getAttribute("data-link")];
    if (!url) return;
    anchor.href = url;
    anchor.hidden = false;
    hasLinks = true;
  });

  if (hasLinks) root.classList.add("has-links");

  /* Header */

  var header = $(".site-header");
  var nav = $("#site-nav");
  var navToggle = $("#nav-toggle");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function setNav(open) {
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  navToggle.addEventListener("click", function () {
    setNav(navToggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setNav(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setNav(false);
  });

  /* Screens showcase */

  var tabs = $$(".tab");
  var stage = $(".showcase-stage");
  var shot = $("#showcase-shot");
  var pathLabel = $("#showcase-path");
  var caption = $("#showcase-caption");
  var activePanel = null;

  function panelOf(tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  }

  function screenNames(button) {
    var name = button.getAttribute("data-shot");
    var themed = button.closest(".showcase-panel").hasAttribute("data-themed");
    return { light: themed ? name + "-light" : name, dark: themed ? name + "-dark" : name };
  }

  function selectScreen(button) {
    var names = screenNames(button);

    $$(".screen-btn", activePanel).forEach(function (item) {
      if (item === button) item.setAttribute("aria-current", "true");
      else item.removeAttribute("aria-current");
    });

    shot.setAttribute("data-light", names.light);
    shot.setAttribute("data-dark", names.dark);
    shot.alt = button.textContent.trim() + ": " + button.getAttribute("data-caption");
    pathLabel.textContent = button.getAttribute("data-path");
    caption.textContent = button.getAttribute("data-caption");

    if (shot.getAttribute("data-current") !== names[currentTheme()]) {
      stage.classList.add("is-loading");
      setScreen(shot, names[currentTheme()]);
    }

    if (button.scrollIntoView && window.matchMedia("(max-width: 999px)").matches) {
      button.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }

  function selectTab(tab, focus) {
    tabs.forEach(function (item) {
      var selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      panelOf(item).hidden = !selected;
    });

    activePanel = panelOf(tab);
    selectScreen($('.screen-btn[aria-current="true"]', activePanel) || $(".screen-btn", activePanel));
    if (focus) tab.focus();
  }

  function clearLoading() {
    stage.classList.remove("is-loading");
  }

  shot.addEventListener("load", clearLoading);
  shot.addEventListener("error", clearLoading);

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      selectTab(tab);
    });

    tab.addEventListener("keydown", function (event) {
      var step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      selectTab(tabs[(index + step + tabs.length) % tabs.length], true);
    });
  });

  $$(".screen-btn").forEach(function (button) {
    button.addEventListener("click", function () {
      selectScreen(button);
    });
  });

  activePanel = panelOf(tabs[0]);
  $(".screen-btn", activePanel).setAttribute("aria-current", "true");

  /* Screenshot viewer */

  var lightbox = $("#lightbox");
  var lightboxImage = $("#lightbox-img");
  var lightboxTitle = $("#lightbox-title");

  function activeScreens() {
    return $$(".screen-btn", activePanel);
  }

  function activeIndex() {
    return activeScreens().indexOf($('.screen-btn[aria-current="true"]', activePanel));
  }

  function renderLightbox() {
    var button = activeScreens()[activeIndex()];
    var tab = document.getElementById(activePanel.getAttribute("aria-labelledby"));
    lightboxImage.src = screenUrl(screenNames(button)[currentTheme()], 1920);
    lightboxImage.alt = shot.alt;
    lightboxTitle.textContent = tab.textContent.trim() + " · " + button.textContent.trim();
  }

  function stepLightbox(step) {
    var screens = activeScreens();
    selectScreen(screens[(activeIndex() + step + screens.length) % screens.length]);
    renderLightbox();
  }

  function openLightbox() {
    if (typeof lightbox.showModal !== "function") return;
    renderLightbox();
    lightbox.showModal();
  }

  $("#showcase-zoom").addEventListener("click", openLightbox);
  $("#showcase-enlarge").addEventListener("click", openLightbox);
  $("#lightbox-close").addEventListener("click", function () {
    lightbox.close();
  });
  $("#lightbox-prev").addEventListener("click", function () {
    stepLightbox(-1);
  });
  $("#lightbox-next").addEventListener("click", function () {
    stepLightbox(1);
  });

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox || event.target.classList.contains("lightbox-stage")) lightbox.close();
  });

  lightbox.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });

  /* Theme comparison */

  var compare = $("#compare");
  var compareRange = $(".compare-range", compare);

  compareRange.addEventListener("input", function () {
    compare.style.setProperty("--pos", compareRange.value + "%");
  });

  /* Scroll reveal */

  var revealItems = $$(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }
})();
