/* CBA Watch — countdown, reveals, counters, charts */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE_OUT = function (p) { return 1 - Math.pow(1 - p, 3); };

  /* ── countdown: CBA expires Dec 1, 2026, 11:59 pm ET (04:59 UTC Dec 2) ── */
  var EXPIRY = Date.UTC(2026, 11, 2, 4, 59, 0);
  var el = function (id) { return document.getElementById(id); };
  var cd = { d: el("cd-days"), h: el("cd-hours"), m: el("cd-mins"), s: el("cd-secs") };
  var miniClock = el("mini-clock");

  function pad(n) { return String(n).padStart(2, "0"); }

  function tick() {
    var ms = EXPIRY - Date.now();
    if (ms <= 0) {
      cd.d.textContent = "0";
      cd.h.textContent = cd.m.textContent = cd.s.textContent = "00";
      miniClock.textContent = "expired";
      el("clock-caption").textContent =
        "The CBA has expired. Now we find out what baseball wants to be.";
      return;
    }
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor(s / 3600) % 24;
    var m = Math.floor(s / 60) % 60;
    cd.d.textContent = String(d);
    cd.h.textContent = pad(h);
    cd.m.textContent = pad(m);
    cd.s.textContent = pad(s % 60);
    miniClock.textContent = d + "d " + pad(h) + ":" + pad(m) + ":" + pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  /* ── hero figure count-up ── */
  var heroCount = el("hero-count");
  if (heroCount && !reducedMotion) {
    var HERO_TARGET = 417300000;
    var t0 = null;
    var run = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / 1600, 1);
      heroCount.textContent = Math.round(HERO_TARGET * EASE_OUT(p)).toLocaleString("en-US");
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  /* ── nav state ── */
  var nav = el("nav");
  var scrollScheduled = false;
  function onScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(function () {
      nav.classList.toggle("is-stuck", window.scrollY > 12);
      scrollScheduled = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ── charts ── */
  /* 2026 opening day payrolls, AP / MLB Labor Relations Dept. figures.
     ghost = the slice MLB's present-value accounting discounts away. */
  var PAYROLLS = [
    { name: "Mets", value: 352.2 },
    { name: "Dodgers", value: 316.6, hero: true, ghost: 78.6,
      tip: "Dodgers · $316.6M official / $395.2M undiscounted" },
    { name: "Yankees", value: 297.2 },
    { name: "Phillies", value: 282 },
    { name: "Blue Jays", value: 269 },
    { name: "Cardinals", value: 100.4 },
    { name: "Twins", value: 96.5 },
    { name: "Guardians", value: 62.3 }
  ];

  /* 2025 luxury-tax bills (three more clubs owed smaller amounts) */
  var TAXES = [
    { name: "Dodgers", value: 169.4, hero: true },
    { name: "Mets", value: 91.6 },
    { name: "Yankees", value: 61.8 },
    { name: "Phillies", value: 56.1 },
    { name: "Blue Jays", value: 13.6 },
    { name: "Rangers", value: 0.2 }
  ];

  /* Dodgers deferred salary, approx. per player, $1.051B total */
  var DEFERRALS = [
    { name: "Shohei Ohtani", value: 680, hero: true },
    { name: "Mookie Betts", value: 115 },
    { name: "Blake Snell", value: 66 },
    { name: "Freddie Freeman", value: 57 },
    { name: "Will Smith", value: 50 },
    { name: "T. Hernández", value: 32 },
    { name: "Tommy Edman", value: 25 },
    { name: "Tanner Scott", value: 21 }
  ];

  var tip = el("tip");

  function showTip(text, x, y) {
    tip.textContent = text;
    tip.hidden = false;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }
  function hideTip() { tip.hidden = true; }

  function fmtM(v) { return "$" + v.toLocaleString("en-US") + "M"; }

  function buildChart(chartId, tbodyId, data) {
    var chart = el(chartId);
    var tbody = el(tbodyId);
    if (!chart) return;
    var max = Math.max.apply(null, data.map(function (d) { return d.value + (d.ghost || 0); }));

    data.forEach(function (d) {
      var w = Math.max(1.2, (d.value / max) * 100);

      var row = document.createElement("div");
      row.className = "chart-row" + (d.hero ? " is-hero" : "");
      row.tabIndex = 0;
      row.setAttribute("aria-label", d.name + ": " + d.value + " million dollars" +
        (d.ghost ? ", plus " + d.ghost + " million discounted by deferral accounting" : ""));

      var name = document.createElement("span");
      name.className = "chart-name";
      name.textContent = d.name;

      var track = document.createElement("div");
      track.className = "chart-track";
      var fill = document.createElement("div");
      fill.className = "chart-fill";
      fill.style.setProperty("--w", w + "%");
      track.appendChild(fill);
      if (d.ghost) {
        var ghost = document.createElement("div");
        ghost.className = "chart-ghost";
        ghost.style.setProperty("--w", (d.ghost / max) * 100 + "%");
        ghost.style.setProperty("--x", w + "%");
        track.appendChild(ghost);
      }

      var val = document.createElement("span");
      val.className = "chart-value";
      val.textContent = fmtM(d.value);

      row.appendChild(name);
      row.appendChild(track);
      row.appendChild(val);
      chart.appendChild(row);

      var tipText = d.tip || (d.name + " · " + fmtM(d.value));
      row.addEventListener("mousemove", function (e) { showTip(tipText, e.clientX, e.clientY); });
      row.addEventListener("mouseleave", hideTip);
      row.addEventListener("focus", function () {
        var r = row.getBoundingClientRect();
        showTip(tipText, r.left + r.width / 2, r.top);
      });
      row.addEventListener("blur", hideTip);

      if (tbody) {
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.textContent = d.name;
        var td2 = document.createElement("td");
        td2.textContent = d.value.toLocaleString("en-US");
        tr.appendChild(td1);
        tr.appendChild(td2);
        tbody.appendChild(tr);
      }
    });
  }

  buildChart("payroll-chart", "payroll-table-body", PAYROLLS);
  buildChart("tax-chart", "tax-table-body", TAXES);
  buildChart("deferral-chart", "deferral-table-body", DEFERRALS);

  /* ── animated counters ── */
  function countUp(node) {
    var target = parseFloat(node.getAttribute("data-count"));
    var decimals = parseInt(node.getAttribute("data-decimals") || "0", 10);
    if (reducedMotion) {
      node.textContent = target.toFixed(decimals);
      return;
    }
    var t0 = null;
    var run = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / 1300, 1);
      node.textContent = (target * EASE_OUT(p)).toFixed(decimals);
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  /* ── scroll reveals ── */
  var counted = new WeakSet();

  function activate(node) {
    node.classList.add("in-view");
    node.querySelectorAll("[data-count]").forEach(function (c) {
      if (!counted.has(c)) { counted.add(c); countUp(c); }
    });
    var chart = node.querySelector(".chart");
    if (chart) chart.classList.add("animated");
  }

  var targets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          activate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(activate);
  }
})();
