/*!
 * Site project registry + navbar counter.
 *
 * Source of truth for "PROJECTS SO FAR".
 * When you add a project card on UI UX (index) or Dev (dev/dev.html),
 * add a matching entry here so the counter stays in sync.
 *
 * Counts: UI UX featured + UI UX other + Dev.
 */
(function () {
  "use strict";

  /**
   * @typedef {"uiux-featured"|"uiux-other"|"dev"} ProjectSection
   * @typedef {{
   *   id: string,
   *   title: string,
   *   section: ProjectSection,
   *   href?: string,
   *   date?: string,
   *   tags?: string[]
   * }} SiteProject
   */

  /** @type {SiteProject[]} */
  var SITE_PROJECTS = [
    // UI UX — Featured Projects (index.html)
    {
      id: "nin",
      title: "Green Wallet",
      section: "uiux-featured",
      href: "#",
      date: "JUNE-SEP 2022",
      tags: ["UI UX", "Mobile & desktop", "IOS Android & Web"]
    },
    {
      id: "equinine",
      title: "N9",
      section: "uiux-featured",
      href: "equinine.html",
      date: "FEB-2020",
      tags: ["Design Sprint", "Leadership", "Project Management"]
    },
    {
      id: "zipay",
      title: "Zi Pay",
      section: "uiux-featured",
      href: "zipay.html",
      date: "NOV-2019",
      tags: ["UI UX", "Leanstack", "IOS"]
    },

    // UI UX — Other Projects (index.html)
    {
      id: "dribbble",
      title: "Dribbble projects",
      section: "uiux-other",
      href: "https://dribbble.com/UXResearcher"
    },
    {
      id: "brands",
      title: "Logo & Brand design",
      section: "uiux-other",
      href: "brands.html"
    },
    {
      id: "sketches",
      title: "Sketches",
      section: "uiux-other",
      href: "equinine.html"
    },

    // Dev — Projects (dev/dev.html)
    {
      id: "quick-ticket-maker",
      title: "Quick Ticket Maker",
      section: "dev",
      href: "https://www.injectgroup.com/#/",
      date: "AUG-SEP 2023",
      tags: ["BEng", "R & D / DEV", "Flutter"]
    },
    {
      id: "inject-group",
      title: "Inject Group",
      section: "dev",
      href: "https://www.injectgroup.com/#/",
      date: "AUG-SEP 2022",
      tags: ["UI UX", "Development", "Flutter"]
    },
    {
      id: "abdul-today",
      title: "Abdul.today",
      section: "dev",
      href: "#",
      date: "Dec 2022",
      tags: ["UI UX", "Development", "HTML CSS JS"]
    },
    {
      id: "nigeria-party",
      title: "Nigerian Party in the Park",
      section: "dev",
      href: "https://www.nigeriapartyinthepark.co.uk/",
      date: "2021",
      tags: ["Development", "HTML5 CSS3", "Wordpress"]
    },
    {
      id: "brazilian-gymwear",
      title: "Brazilian Gym Wear",
      section: "dev",
      href: "https://www.braziliangymwear.co.uk/",
      date: "2020",
      tags: ["Development", "HTML5 CSS3", "Wix"]
    },
    {
      id: "church-presence",
      title: "Church of his presence",
      section: "dev",
      href: "https://churchofhispresence.org.uk/",
      date: "2018",
      tags: ["Development", "HTML5 CSS3", "Wordpress"]
    },
    {
      id: "maesthetic",
      title: "M Aesthetic Doctors",
      section: "dev",
      href: "../maestheticdoctors/index.html",
      date: "2017",
      tags: ["Development", "HTML5 CSS3 GIT"]
    }
  ];

  function projectsBySection(section) {
    return SITE_PROJECTS.filter(function (project) {
      return project.section === section;
    });
  }

  function totalProjectCount() {
    return SITE_PROJECTS.length;
  }

  function sectionCounts() {
    return {
      uiuxFeatured: projectsBySection("uiux-featured").length,
      uiuxOther: projectsBySection("uiux-other").length,
      uiux: projectsBySection("uiux-featured").length + projectsBySection("uiux-other").length,
      dev: projectsBySection("dev").length,
      total: totalProjectCount()
    };
  }

  function renderProjectCounter() {
    var total = totalProjectCount();
    var nodes = document.querySelectorAll(
      "#header .counter, .navbar-project-counter .counter, [data-site-project-counter]"
    );

    nodes.forEach(function (el) {
      el.textContent = String(total);
      el.setAttribute("data-site-project-total", String(total));
    });

    var caption = document.querySelector(
      "#header .project-counter-caption, .navbar-project-counter .project-counter-caption"
    );
    if (caption) {
      var counts = sectionCounts();
      caption.setAttribute(
        "title",
        "UI UX " + counts.uiux + " · Dev " + counts.dev + " · Total " + counts.total
      );
    }
  }

  var scheduled = false;

  function scheduleRender() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    requestAnimationFrame(function () {
      scheduled = false;
      renderProjectCounter();
    });
  }

  function watchHeader() {
    var root = document.getElementById("header") || document.body;
    if (root && window.MutationObserver) {
      new MutationObserver(scheduleRender).observe(root, {
        childList: true,
        subtree: true
      });
    }
    scheduleRender();
  }

  window.SiteProjects = {
    list: SITE_PROJECTS,
    bySection: projectsBySection,
    total: totalProjectCount,
    counts: sectionCounts,
    renderCounter: renderProjectCounter
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchHeader);
  } else {
    watchHeader();
  }
})();
