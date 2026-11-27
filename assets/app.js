(function () {
  var root = document.documentElement;
  var THEME_KEY = 'tt_theme';
  var FONT_KEY = 'tt_font';
  var LANG_KEY = 'tt_lang';
  var LAST_EP_KEY = 'tt_last_episode';

  function getStored(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (_err) {
      return null;
    }
  }

  function setStored(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_err) {
      // Ignore storage failures in private browsing
    }
  }

  // Theme toggle
  var themeBtn = document.getElementById('theme-toggle');
  function syncThemeButton() {
    if (!themeBtn) return;
    var isNight = root.getAttribute('data-theme') === 'night';
    themeBtn.textContent = isNight
      ? themeBtn.getAttribute('data-day-label') || 'Day'
      : themeBtn.getAttribute('data-night-label') || 'Night';
    themeBtn.setAttribute('aria-pressed', String(isNight));
  }

  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'night' ? 'archival' : 'night';
      root.setAttribute('data-theme', next);
      setStored(THEME_KEY, next);
      syncThemeButton();
    });
  }

  // Font size switcher
  var fontButtons = document.querySelectorAll('[data-font-choice]');
  function syncFontButtons() {
    var active = root.getAttribute('data-font') || 'md';
    fontButtons.forEach(function (btn) {
      var match = btn.getAttribute('data-font-choice') === active;
      btn.classList.toggle('is-active', match);
      btn.setAttribute('aria-pressed', String(match));
    });
  }

  if (fontButtons.length) {
    if (!root.getAttribute('data-font')) {
      root.setAttribute('data-font', getStored(FONT_KEY) || 'md');
    }
    syncFontButtons();
    fontButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var choice = btn.getAttribute('data-font-choice');
        root.setAttribute('data-font', choice);
        setStored(FONT_KEY, choice);
        syncFontButtons();
      });
    });
  }

  // Language preference memory
  document.querySelectorAll('[data-lang-choice]').forEach(function (link) {
    link.addEventListener('click', function () {
      var code = link.getAttribute('data-lang-choice');
      if (code) setStored(LANG_KEY, code);
    });
  });

  // Reading progress bar & last-watched memory on episode pages
  var episodeSlug = document.body.getAttribute('data-episode-slug');
  var episodeNum = document.body.getAttribute('data-episode-number');
  if (episodeSlug && episodeNum) {
    setStored(
      LAST_EP_KEY,
      JSON.stringify({ slug: episodeSlug, number: Number(episodeNum) })
    );
  }

  var progressFill = document.getElementById('progress-fill');
  if (progressFill) {
    function updateProgress() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      var docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      progressFill.style.width = pct.toFixed(1) + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // Homepage Continue Watching CTA
  var heroCta = document.getElementById('hero-primary-cta');
  if (heroCta) {
    var rawLast = getStored(LAST_EP_KEY);
    if (rawLast) {
      try {
        var last = JSON.parse(rawLast);
        if (last && last.slug && last.number) {
          var basePath = heroCta.getAttribute('data-base-path') || '/';
          var langPrefix = heroCta.getAttribute('data-lang-prefix') || '';
          var prefix = heroCta.getAttribute('data-continue-prefix') || '';
          var suffix = heroCta.getAttribute('data-continue-suffix') || '';
          var padded = String(last.number).padStart(2, '0');
          heroCta.href = basePath + 'episodes/' + last.slug + '/' + langPrefix;
          heroCta.textContent = prefix + padded + suffix;
        }
      } catch (_err) {
        // Keep default Episode 01 CTA
      }
    }
  }

  // Lightbox for 16:9 illustrations
  var lightbox = document.getElementById('image-lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.still-frame img').forEach(function (img) {
      img.addEventListener('click', function () {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        if (lightboxCaption) lightboxCaption.textContent = img.alt || '';
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
      });
    });

    lightbox.addEventListener('click', closeLightbox);
  }

  // Keyboard navigation
  document.addEventListener('keydown', function (event) {
    if (event.target && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
    if (event.key === 'Escape' && lightbox && lightbox.classList.contains('is-open')) {
      closeLightbox();
      return;
    }
    if (event.key === 'ArrowLeft') {
      var prev = document.getElementById('nav-prev-episode');
      if (prev && prev.href && !prev.classList.contains('is-disabled')) {
        window.location.href = prev.href;
      }
    }
    if (event.key === 'ArrowRight') {
      var next = document.getElementById('nav-next-episode');
      if (next && next.href && !next.classList.contains('is-disabled')) {
        window.location.href = next.href;
      }
    }
  });
})();
