/* =========================================================================
   Portfolio BUT 2 — Lucas Requena
   Moteur de navigation entre sous-pages + gestion des traces manquantes.
   Aucune dépendance externe : le site fonctionne aussi en file://
   ========================================================================= */
(function () {
  "use strict";

  /* -----------------------------------------------------------------------
     1. Navigation entre les sous-pages
        - onglets (rôle tablist), flèches précédent / suivant,
        - clavier gauche/droite, ancre dans l'URL pour un lien direct.
     --------------------------------------------------------------------- */
  function initSubnav() {
    var nav = document.querySelector(".subnav");
    if (!nav) return;

    var tabs   = Array.prototype.slice.call(nav.querySelectorAll(".sp-tab"));
    var pages  = Array.prototype.slice.call(document.querySelectorAll(".subpage"));
    var prevBt = nav.querySelector("[data-nav='prev']");
    var nextBt = nav.querySelector("[data-nav='next']");
    if (!tabs.length || !pages.length) return;

    var index = 0;

    function show(i, pushHash) {
      if (i < 0) i = 0;
      if (i > pages.length - 1) i = pages.length - 1;
      index = i;

      pages.forEach(function (p, k) {
        p.classList.toggle("is-active", k === i);
        p.hidden = k !== i;
      });
      tabs.forEach(function (t, k) {
        t.setAttribute("aria-selected", k === i ? "true" : "false");
        t.tabIndex = k === i ? 0 : -1;
      });

      if (prevBt) prevBt.disabled = i === 0;
      if (nextBt) nextBt.disabled = i === pages.length - 1;

      // L'onglet actif reste visible dans la barre défilante
      var t = tabs[i];
      if (t && t.scrollIntoView) t.scrollIntoView({ block: "nearest", inline: "nearest" });

      if (pushHash && pages[i].id) {
        history.replaceState(null, "", "#" + pages[i].id);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { show(k, true); });
    });
    if (prevBt) prevBt.addEventListener("click", function () { show(index - 1, true); });
    if (nextBt) nextBt.addEventListener("click", function () { show(index + 1, true); });

    document.addEventListener("keydown", function (e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") { show(index + 1, true); }
      else if (e.key === "ArrowLeft") { show(index - 1, true); }
    });

    // Ouverture directe sur une sous-page via l'ancre (#sp-3, #bilan…)
    var start = 0;
    if (location.hash) {
      var found = pages.findIndex(function (p) { return "#" + p.id === location.hash; });
      if (found >= 0) start = found;
    }
    show(start, false);

    window.addEventListener("hashchange", function () {
      var f = pages.findIndex(function (p) { return "#" + p.id === location.hash; });
      if (f >= 0 && f !== index) show(f, false);
    });
  }

  /* -----------------------------------------------------------------------
     2. Traces : substitut affiché tant que la capture n'est pas déposée
        dans assets/img/. Le repère et la légende restent lisibles.
     --------------------------------------------------------------------- */
  function initTraces() {
    var medias = document.querySelectorAll(".trace-media[data-src]");
    Array.prototype.forEach.call(medias, function (media) {
      var img = media.querySelector("img");
      if (!img) return;

      function fallback() {
        if (media.classList.contains("is-missing")) return;
        media.classList.add("is-missing");
        var ph = document.createElement("div");
        ph.className = "ph";
        ph.innerHTML =
          '<span class="ph-t">CAPTURE À DÉPOSER</span>' +
          '<span class="ph-p">' + media.getAttribute("data-src") + "</span>" +
          '<span class="ph-d">' + (media.getAttribute("data-hint") || "") + "</span>";
        media.appendChild(ph);
      }

      img.addEventListener("error", fallback);
      if (img.complete && img.naturalWidth === 0) fallback();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSubnav();
    initTraces();
  });
})();
