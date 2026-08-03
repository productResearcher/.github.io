(function () {
  "use strict";

  var STORAGE_KEY = "abdul_cookie_consent_v1";
  var COOKIE_NAME = "abdul_cookie_consent";
  var Tawk_API = window.Tawk_API || {};
  window.Tawk_API = Tawk_API;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500
  });

  function readCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function writeCookie(name, value, days) {
    var maxAge = (days || 365) * 24 * 60 * 60;
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      "; path=/; max-age=" +
      maxAge +
      "; SameSite=Lax";
  }

  function readConsent() {
    try {
      var cookieVal = readCookie(COOKIE_NAME);
      if (cookieVal === "accepted" || cookieVal === "rejected") {
        return { status: cookieVal };
      }
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (e) {
      /* ignore quota / private mode */
    }
    writeCookie(COOKIE_NAME, value.status, 365);
  }

  function loadScript(src, attrs) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      if (attrs) {
        Object.keys(attrs).forEach(function (k) {
          s.setAttribute(k, attrs[k]);
        });
      }
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function enableAnalytics() {
    if (window.__abdulAnalyticsEnabled) return;
    window.__abdulAnalyticsEnabled = true;

    gtag("consent", "update", {
      analytics_storage: "granted",
      functionality_storage: "granted"
    });

    var ids = window.ABDUL_GA_IDS || ["G-NSPSQ90SQV", "G-BSB6EF0HSM"];
    var primary = ids[0];

    loadScript("https://www.googletagmanager.com/gtag/js?id=" + primary).then(function () {
      gtag("js", new Date());
      ids.forEach(function (id) {
        gtag("config", id, {
          anonymize_ip: true,
          allow_google_signals: false
        });
      });
    });

    loadScript("/js/firebase-config.js?v=1")
      .then(function () {
        return Promise.all([
          loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"),
          loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics-compat.js"),
          loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-performance-compat.js")
        ]);
      })
      .then(function () {
        if (!window.firebase || !window.ABDUL_FIREBASE_CONFIG) return;
        if (!firebase.apps.length) {
          firebase.initializeApp(window.ABDUL_FIREBASE_CONFIG);
        }
        try {
          firebase.analytics();
        } catch (e) {
          /* analytics unavailable */
        }
        try {
          firebase.performance();
        } catch (e) {
          /* performance unavailable */
        }
      })
      .catch(function () {
        /* non-blocking */
      });

    enableChat();
  }

  function enableChat() {
    if (window.__abdulTawkLoaded) return;
    window.__abdulTawkLoaded = true;
    window.Tawk_LoadStart = new Date();
    loadScript("https://embed.tawk.to/6319e82e54f06e12d8938050/1gcej5tv8", {
      charset: "UTF-8",
      crossorigin: "*"
    }).catch(function () {
      /* chat optional */
    });
  }

  function disableAnalytics() {
    gtag("consent", "update", {
      analytics_storage: "denied",
      functionality_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      personalization_storage: "denied"
    });
  }

  function hideBanner(banner) {
    if (banner) banner.setAttribute("hidden", "");
  }

  function showBanner(banner) {
    if (banner) banner.removeAttribute("hidden");
  }

  function applyConsent(choice) {
    var payload = {
      status: choice,
      updatedAt: new Date().toISOString()
    };
    writeConsent(payload);
    if (choice === "accepted") {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
  }

  function buildBanner() {
    var existing = document.getElementById("cookie-consent-banner");
    if (existing) return existing;

    var banner = document.createElement("aside");
    banner.id = "cookie-consent-banner";
    banner.className = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "cookie-consent-title");
    banner.setAttribute("hidden", "");
    banner.innerHTML =
      '<div class="cookie-consent-inner">' +
      '<div class="cookie-consent-copy">' +
      '<h2 id="cookie-consent-title" class="cookie-consent-title">Cookies &amp; analytics</h2>' +
      '<p class="cookie-consent-text">' +
      "We use cookies and similar technologies for Google Analytics, Firebase Analytics, and performance monitoring " +
      "so we can understand visits and improve this portfolio. Chat support also uses cookies when enabled. " +
      'See our <a href="/privacy.html">Privacy Policy</a> and <a href="/terms.html">Terms of Use</a>.' +
      "</p>" +
      "</div>" +
      '<div class="cookie-consent-actions">' +
      '<button type="button" class="btn btn-warning cookie-consent-accept" data-cookie-accept>Accept</button>' +
      '<button type="button" class="btn btn-outline-light cookie-consent-reject" data-cookie-reject>Essential only</button>' +
      '<button type="button" class="btn btn-link cookie-consent-manage" data-cookie-manage hidden>Cookie settings</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(banner);
    return banner;
  }

  function bindBanner(banner) {
    banner.querySelector("[data-cookie-accept]").addEventListener("click", function () {
      applyConsent("accepted");
      hideBanner(banner);
    });
    banner.querySelector("[data-cookie-reject]").addEventListener("click", function () {
      applyConsent("rejected");
      hideBanner(banner);
    });
  }

  function bindSettingsTriggers(banner) {
    document.addEventListener("click", function (event) {
      var target = event.target.closest("[data-open-cookie-settings]");
      if (!target) return;
      event.preventDefault();
      showBanner(banner);
    });
  }

  function init() {
    if (window.__abdulConsentInit) return;
    window.__abdulConsentInit = true;

    var banner = buildBanner();
    bindBanner(banner);
    bindSettingsTriggers(banner);

    var consent = readConsent();
    if (!consent) {
      showBanner(banner);
      return;
    }
    if (consent.status === "accepted") {
      enableAnalytics();
    } else {
      disableAnalytics();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
