/*
 * scroll-progress.js — walkthrough progress bar
 * ------------------------------------------------------------------
 * Drives the fixed bar + step pill at the top of the page as the user
 * scrolls the Maya walkthrough (the `.scene` blocks in the demo stage).
 *
 * Responsibilities:
 *   - fill width        -> how far through the walkthrough we are (0..1)
 *   - "Step N / total"  -> which scene is currently in focus
 *   - show / hide        -> only visible while the walkthrough is on screen
 *
 * Performance: step offsets are measured once (and only re-measured on
 * resize / font + image load), scroll handling is rAF-throttled, DOM writes
 * are memoized, and the fill uses a composited transform. See inline notes.
 * Wrapped in an IIFE to keep everything off the global scope.
 */
(function () {
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;
  var fill = bar.querySelector('.sp-fill');
  var labelEl = bar.querySelector('.sp-label');
  var countEl = bar.querySelector('.sp-count');
  // All walkthrough steps are .scene elements (Meet Maya + 8 feature steps).
  // Note: the website-preview section also uses the .demo-stage class but holds
  // no .scene, so we select scenes document-wide rather than by container.
  var steps = Array.prototype.slice.call(document.querySelectorAll('.scene'));
  if (!steps.length) return;
  var featureCount = steps.length - 1; // exclude the "Meet Maya" intro

  // Each step's label is fixed, so read it once instead of querying on scroll.
  var labels = steps.map(function (el, i) {
    if (i === 0) return 'Meet Maya';
    var lab = el.querySelector('.scene-num');
    return lab ? lab.textContent.trim() : ('Step ' + i);
  });

  // Cache the document-space offset of each step. Reading getBoundingClientRect
  // on every scroll frame forces a layout reflow and is the main cause of scroll
  // jank, so we measure once here and recompute only when layout can change
  // (resize / image + font load). update() then runs on pure arithmetic.
  var tops = [];
  var startY = 0, endY = 0;
  function measure() {
    tops = steps.map(function (el) {
      return el.getBoundingClientRect().top + window.pageYOffset;
    });
    startY = tops[0];
    var last = steps[steps.length - 1].getBoundingClientRect();
    endY = last.top + window.pageYOffset + last.height;
  }

  // Track last-written values so we only touch the DOM when something changes.
  var lastActive = -1, lastShow = null;
  function update() {
    var y = window.pageYOffset;
    var ref = y + window.innerHeight * 0.45;
    var span = Math.max(1, endY - startY);
    var pct = Math.max(0, Math.min(1, (ref - startY) / span));

    // Drive the bar with a GPU-composited transform (scaleX) instead of width:
    // width changes relayout + repaint every scroll frame, whereas a transform is
    // composited off the main thread. CSS sets width:100% + transform-origin:left,
    // so scaleX(pct) fills the track left-to-right.
    fill.style.transform = 'scaleX(' + pct.toFixed(4) + ')';
    bar.setAttribute('aria-valuenow', Math.round(pct * 100));

    // Active step = the last step whose cached top has passed the reference line.
    var active = 0;
    for (var i = 0; i < tops.length; i++) {
      if (tops[i] <= ref) active = i;
    }
    if (active !== lastActive) {
      labelEl.textContent = labels[active];
      countEl.textContent = active === 0 ? 'Intro' : ('Step ' + active + ' / ' + featureCount);
      lastActive = active;
    }

    // Visible only while the walkthrough is on screen.
    var show = (y + window.innerHeight > startY + 80) && (y < endY - 40);
    if (show !== lastShow) {
      bar.classList.toggle('visible', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      lastShow = show;
    }
  }

  function remeasure() { measure(); update(); }

  var scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    var run = function () { scheduled = false; update(); };
    // rAF keeps updates paint-aligned and smooth while the tab is visible, but
    // rAF callbacks are suspended on a hidden page (background tab / headless
    // preview) which would freeze the bar, so fall back to setTimeout there.
    if (typeof window.requestAnimationFrame === 'function' && !document.hidden) {
      window.requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
  }
  // rAF-debounced remeasure: collapses a burst of layout-changing events into
  // a single getBoundingClientRect pass so we never read layout per frame.
  var remeasureScheduled = false;
  function scheduleRemeasure() {
    if (remeasureScheduled) return;
    remeasureScheduled = true;
    var run = function () { remeasureScheduled = false; remeasure(); };
    if (typeof window.requestAnimationFrame === 'function' && !document.hidden) {
      window.requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', remeasure);
  window.addEventListener('load', remeasure);
  document.addEventListener('visibilitychange', update);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(remeasure); }

  // The scenes use CSS `content-visibility: auto`: an off-screen step is laid out
  // from its estimated `contain-intrinsic-size` and only resolves to its true
  // height as it nears the viewport. That height change shifts every later step's
  // document offset, so the cached `tops` must be refreshed when it happens.
  // A ResizeObserver on the steps is the robust trigger — it fires whenever any
  // step's box changes size (content-visibility resolving, font/image reflow,
  // layout shifts), across all evergreen browsers, without reading layout every
  // scroll frame. rAF-debounced via scheduleRemeasure so a burst coalesces.
  if (typeof ResizeObserver === 'function') {
    var ro = new ResizeObserver(scheduleRemeasure);
    steps.forEach(function (el) { ro.observe(el); });
  }
  // Where supported, contentvisibilityautostatechange is the most direct signal;
  // it's harmless (never fires) in browsers without content-visibility.
  steps.forEach(function (el) {
    el.addEventListener('contentvisibilityautostatechange', scheduleRemeasure);
  });

  measure();
  update();
})();
