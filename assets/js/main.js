(function () {
  "use strict";

  var root = document.documentElement;
  var SCREENS = "assets/img/screens/";
  var THEME_KEY = "estatehub-landing-theme";
  var THEME_COLORS = { light: "#f5f5f2", dark: "#0b0c10" };

  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function pad(number) {
    return number < 10 ? "0" + number : String(number);
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

  /* Demo and purchase links */

  var links = window.ESTATEHUB_LINKS || {};

  $$("[data-link]").forEach(function (anchor) {
    var url = links[anchor.getAttribute("data-link")];
    if (url) anchor.href = url;
  });

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

  /* Screens */

  var tabs = $$(".tab");
  var stage = $(".showcase-stage");
  var shot = $("#showcase-shot");
  var pathLabel = $("#showcase-path");
  var caption = $("#showcase-caption");
  var counter = $("#showcase-count");
  var activePanel = null;

  function panelOf(tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  }

  function activeScreens() {
    return $$(".screen-btn", activePanel);
  }

  function activeIndex() {
    return activeScreens().indexOf($('.screen-btn[aria-current="true"]', activePanel));
  }

  function themedNames(name, themed) {
    return { light: themed ? name + "-light" : name, dark: themed ? name + "-dark" : name };
  }

  function screenNames(button) {
    return themedNames(button.getAttribute("data-shot"), button.closest(".showcase-panel").hasAttribute("data-themed"));
  }

  function selectScreen(button, reveal) {
    var names = screenNames(button);
    var screens = activeScreens();

    screens.forEach(function (item) {
      if (item === button) item.setAttribute("aria-current", "true");
      else item.removeAttribute("aria-current");
    });

    shot.setAttribute("data-light", names.light);
    shot.setAttribute("data-dark", names.dark);
    shot.alt = button.textContent.trim() + ": " + button.getAttribute("data-caption");
    pathLabel.textContent = button.getAttribute("data-path");
    caption.textContent = button.getAttribute("data-caption");
    counter.textContent = pad(screens.indexOf(button) + 1) + " / " + pad(screens.length);

    if (shot.getAttribute("data-current") !== names[currentTheme()]) {
      stage.classList.add("is-loading");
      setScreen(shot, names[currentTheme()]);
    }

    var list = button.closest(".screen-list");
    if (reveal && list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: button.offsetLeft - list.offsetLeft - 24, behavior: "smooth" });
    }
  }

  function stepScreen(step) {
    var screens = activeScreens();
    selectScreen(screens[(activeIndex() + step + screens.length) % screens.length], true);
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
      selectScreen(button, true);
    });
  });

  $("#showcase-prev").addEventListener("click", function () {
    stepScreen(-1);
  });
  $("#showcase-next").addEventListener("click", function () {
    stepScreen(1);
  });

  activePanel = panelOf(tabs[0]);
  $(".screen-btn", activePanel).setAttribute("aria-current", "true");

  /* Screenshot viewer */

  var lightbox = $("#lightbox");
  var lightboxImage = $("#lightbox-img");
  var lightboxTitle = $("#lightbox-title");
  var browsing = false;

  function showInLightbox(name, title, alt) {
    lightboxImage.src = screenUrl(name, 1920);
    lightboxImage.alt = alt;
    lightboxTitle.textContent = title;
  }

  function renderShowcaseInLightbox() {
    var button = activeScreens()[activeIndex()];
    var tab = document.getElementById(activePanel.getAttribute("aria-labelledby"));
    showInLightbox(
      screenNames(button)[currentTheme()],
      tab.firstChild.textContent.trim() + " / " + button.textContent.trim(),
      shot.alt
    );
  }

  function openLightbox(canBrowse) {
    if (typeof lightbox.showModal !== "function") return;
    browsing = canBrowse;
    lightbox.classList.toggle("is-single", !canBrowse);
    lightbox.showModal();
  }

  function stepLightbox(step) {
    if (!browsing) return;
    stepScreen(step);
    renderShowcaseInLightbox();
  }

  function openShowcase() {
    renderShowcaseInLightbox();
    openLightbox(true);
  }

  $("#showcase-zoom").addEventListener("click", openShowcase);
  $("#showcase-enlarge").addEventListener("click", openShowcase);

  $$("[data-zoom]").forEach(function (button) {
    button.addEventListener("click", function () {
      var names = themedNames(button.getAttribute("data-zoom"), button.hasAttribute("data-themed"));
      showInLightbox(names[currentTheme()], button.getAttribute("data-title"), $("img", button).alt);
      openLightbox(false);
    });
  });

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

  /* Product tour */

  var tour = $("#tour");
  var tourVideo = $("#tour-video");
  var tourPreview = $(".tour-card video");
  var reducedMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function playPreview() {
    if (!tourPreview || reducedMotion) return;
    var playing = tourPreview.play();
    if (playing && playing.catch) playing.catch(function () {});
  }

  if (tourPreview && reducedMotion) {
    tourPreview.removeAttribute("autoplay");
    tourPreview.pause();
  }

  $$("[data-tour]").forEach(function (button) {
    button.addEventListener("click", function () {
      if (typeof tour.showModal !== "function") return;
      tour.showModal();
      if (tourPreview) tourPreview.pause();
      var playing = tourVideo.play();
      if (playing && playing.catch) playing.catch(function () {});
    });
  });

  $("#tour-close").addEventListener("click", function () {
    tour.close();
  });

  tour.addEventListener("click", function (event) {
    if (event.target === tour || event.target.classList.contains("tour-stage")) tour.close();
  });

  tour.addEventListener("close", function () {
    tourVideo.pause();
    playPreview();
  });

  /* Theme comparison */

  var compare = $("#compare");
  var compareRange = $(".compare-range", compare);

  compareRange.addEventListener("input", function () {
    compare.style.setProperty("--pos", compareRange.value + "%");
  });

  /* Mobile purchase bar and scroll reveal */

  var buybar = $("#buybar");
  var revealItems = $$(".reveal");

  if ("IntersectionObserver" in window) {
    var heroActions = $("#hero-actions");
    var closing = $(".closing");
    var hidden = { hero: true, closing: false };

    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        hidden[entry.target === heroActions ? "hero" : "closing"] = entry.isIntersecting;
      });
      buybar.classList.toggle("is-visible", !hidden.hero && !hidden.closing);
    });
    barObserver.observe(heroActions);
    barObserver.observe(closing);

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );
    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    buybar.classList.add("is-visible");
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }
})();
