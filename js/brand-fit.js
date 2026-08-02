/**
 * Fit .brand-name text width to .jobtitle width (same visual line length).
 * Works after header.html is injected via jQuery .load().
 */
(function () {
  var scheduled = false;

  function fitBrandName() {
    var name = document.querySelector("#header .brand-name") || document.querySelector(".brand-name");
    var job = document.querySelector("#header .jobtitle") || document.querySelector(".jobtitle");
    if (!name || !job) return;

    name.style.fontSize = "";
    name.style.letterSpacing = "";

    var target = Math.max(job.getBoundingClientRect().width, job.scrollWidth);
    if (target < 2) return;

    var low = 8;
    var high = 72;
    for (var i = 0; i < 26; i++) {
      var mid = (low + high) / 2;
      name.style.fontSize = mid + "px";
      if (name.getBoundingClientRect().width > target) {
        high = mid;
      } else {
        low = mid;
      }
    }
    name.style.fontSize = low + "px";

    // Micro-adjust with letter-spacing for an exact match
    var finalW = name.getBoundingClientRect().width;
    var chars = (name.textContent || "").trim().length;
    if (chars > 1) {
      var spacing = (target - finalW) / (chars - 1);
      name.style.letterSpacing = spacing + "px";
    }
  }

  function scheduleFit() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        scheduled = false;
        fitBrandName();
      });
    });
  }

  function watch() {
    var root = document.getElementById("header") || document.body;
    if (root && window.MutationObserver) {
      new MutationObserver(scheduleFit).observe(root, { childList: true, subtree: true });
    }
    window.addEventListener("resize", scheduleFit);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleFit);
    }
    scheduleFit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watch);
  } else {
    watch();
  }
})();
