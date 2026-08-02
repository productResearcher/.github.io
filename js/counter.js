/*!
 * Shared project votes (thumbs up / thumbs down).
 * Counts sync through Abacus so every visitor sees the same totals.
 * One vote per browser per project keeps the shared totals accurate.
 */
(function () {
  "use strict";

  var API_BASE = "https://abacus.jasoncameron.dev";
  var NAMESPACE = "productresearcher-io";
  var STORAGE_PREFIX = "portfolio-vote:";

  function storageKey(projectId) {
    return STORAGE_PREFIX + projectId;
  }

  function getUserVote(projectId) {
    try {
      return localStorage.getItem(storageKey(projectId)) || "";
    } catch (err) {
      return "";
    }
  }

  function setUserVote(projectId, vote) {
    try {
      if (!vote) {
        localStorage.removeItem(storageKey(projectId));
      } else {
        localStorage.setItem(storageKey(projectId), vote);
      }
    } catch (err) {
      /* ignore quota / private mode */
    }
  }

  function counterPath(action, projectId, voteType) {
    return API_BASE + "/" + action + "/" + NAMESPACE + "/" + projectId + "-" + voteType;
  }

  function parseValue(data) {
    return typeof data === "number" ? data : Number(data && data.value) || 0;
  }

  function fetchCount(projectId, voteType) {
    return fetch(counterPath("get", projectId, voteType))
      .then(function (res) {
        if (res.status === 404) {
          return 0;
        }
        if (!res.ok) {
          throw new Error("Failed to load vote count");
        }
        return res.json();
      })
      .then(parseValue)
      .catch(function () {
        return 0;
      });
  }

  function hitCount(projectId, voteType) {
    return fetch(counterPath("hit", projectId, voteType)).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to record vote");
      }
      return res.json().then(parseValue);
    });
  }

  function setBusy(root, busy) {
    root.classList.toggle("is-busy", busy);
    root.querySelectorAll(".project-vote-btn").forEach(function (btn) {
      btn.disabled = busy;
    });
  }

  function render(root, upCount, downCount, userVote) {
    var upEl = root.querySelector('[data-count="up"]');
    var downEl = root.querySelector('[data-count="down"]');
    var upBtn = root.querySelector('[data-vote="up"]');
    var downBtn = root.querySelector('[data-vote="down"]');

    if (upEl) {
      upEl.textContent = String(upCount);
    }
    if (downEl) {
      downEl.textContent = String(downCount);
    }
    if (upBtn) {
      upBtn.classList.toggle("is-selected", userVote === "up");
      upBtn.setAttribute("aria-pressed", userVote === "up" ? "true" : "false");
    }
    if (downBtn) {
      downBtn.classList.toggle("is-selected", userVote === "down");
      downBtn.setAttribute("aria-pressed", userVote === "down" ? "true" : "false");
    }
    root.classList.toggle("has-voted", userVote === "up" || userVote === "down");
  }

  function refreshProject(projectId) {
    document.querySelectorAll('.project-votes[data-project="' + projectId + '"]').forEach(function (widget) {
      Promise.all([fetchCount(projectId, "up"), fetchCount(projectId, "down")]).then(function (counts) {
        render(widget, counts[0], counts[1], getUserVote(projectId));
      });
    });
  }

  function loadCounts(root) {
    var projectId = root.getAttribute("data-project");
    if (!projectId) {
      return;
    }
    Promise.all([fetchCount(projectId, "up"), fetchCount(projectId, "down")]).then(function (counts) {
      render(root, counts[0], counts[1], getUserVote(projectId));
    });
  }

  function handleVote(root, voteType) {
    var projectId = root.getAttribute("data-project");
    if (!projectId || root.classList.contains("is-busy")) {
      return;
    }

    var previous = getUserVote(projectId);
    if (previous) {
      return;
    }

    setBusy(root, true);

    hitCount(projectId, voteType)
      .then(function () {
        setUserVote(projectId, voteType);
        refreshProject(projectId);
      })
      .catch(function () {
        root.classList.add("has-error");
        window.setTimeout(function () {
          root.classList.remove("has-error");
        }, 1600);
      })
      .then(function () {
        setBusy(root, false);
      });
  }

  function bindRoot(root) {
    if (root.getAttribute("data-votes-bound") === "1") {
      return;
    }
    root.setAttribute("data-votes-bound", "1");

    root.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      var btn = event.target.closest(".project-vote-btn");
      if (!btn || !root.contains(btn)) {
        return;
      }

      var voteType = btn.getAttribute("data-vote");
      if (voteType === "up" || voteType === "down") {
        handleVote(root, voteType);
      }
    });

    loadCounts(root);
  }

  function initProjectVotes(scope) {
    var root = scope && scope.querySelectorAll ? scope : document;
    root.querySelectorAll(".project-votes").forEach(bindRoot);
  }

  window.initProjectVotes = initProjectVotes;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initProjectVotes(document);
    });
  } else {
    initProjectVotes(document);
  }
})();
