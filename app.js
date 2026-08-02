/* CBA*WATCH — countdown, scroll choreography, ledger charts */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- countdown: CBA expires Dec 1, 2026, 11:59 PM ET (04:59 UTC Dec 2) ---------- */
  var EXPIRY = Date.UTC(2026, 11, 2, 4, 59, 0);
  var cdDays = document.getElementById("cd-days");
  var cdHours = document.getElementById("cd-hours");
  var cdMins = document.getElementById("cd-mins");
  var cdSecs = document.getElementById("cd-secs");
  var miniClock = document.getElementById("mini-clock");

  function pad(n) { return String(n).padStart(2, "0"); }

  function updateCountdown() {
    var ms = EXPIRY - Date.now();
    if (ms <= 0) {
      cdDays.textContent = "0";
      cdHours.textContent = cdMins.textContent = cdSecs.textContent = "00";
      miniClock.textContent = "000:00:00:00";
      document.getElementById("dc-caption").textContent =
        "The CBA has expired. Lockout mode: engaged.";
      return;
    }
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor(s / 3600) % 24;
    var m = Math.floor(s / 60) % 60;
    var sec = s % 60;
    cdDays.textContent = String(d);
    cdHours.textContent = pad(h);
    cdMins.textContent = pad(m);
    cdSecs.textContent = pad(sec);
    miniClock.textContent = String(d).padStart(3, "0") + ":" + pad(h) + ":" + pad(m) + ":" + pad(sec);
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- topbar + scroll progress ---------- */
  var topbar = document.getElementById("topbar");
  var progressBar = document.getElementById("progress-bar");
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      topbar.classList.toggle("is-stuck", y > 30);
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? y / max : 0) + ")";
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- ledger charts ---------- */
  var PAYROLLS = [
    { name: "Dodgers", value: 398, hero: true },
    { name: "Mets", value: 340 },
    { name: "Yankees", value: 318 },
    { name: "Phillies", value: 285 },
    { name: "Blue Jays", value: 259 },
    { name: "League median", value: 178, median: true },
    { name: "Pirates", value: 110 },
    { name: "Rays", value: 103 },
    { name: "White Sox", value: 92 },
    { name: "Marlins", value: 86 },
    { name: "Athletics", value: 75 }
  ];

  var DEFERRALS = [
    { name: "Shohei Ohtani", value: 680, hero: true },
    { name: "Mookie Betts", value: 115 },
    { name: "Blake Snell", value: 66 },
    { name: "Freddie Freeman", value: 57 },
    { name: "Tommy Edman", value: 25 },
    { name: "T. Hernández", value: 23 },
    { name: "Other deferrals", value: 40 }
  ];

  var tooltip = document.getElementById("viz-tooltip");

  function showTooltip(text, x, y) {
    tooltip.textContent = text;
    tooltip.hidden = false;
    tooltip.style.left = x + "px";
    tooltip.style.top = y + "px";
  }
  function hideTooltip() { tooltip.hidden = true; }

  function fmtMillions(v) { return "$" + v.toLocaleString("en-US") + "M"; }

  function buildLedger(containerId, tableBodyId, data) {
    var container = document.getElementById(containerId);
    var tbody = document.getElementById(tableBodyId);
    if (!container) return;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }));

    data.forEach(function (d) {
      var w = Math.max(1.5, (d.value / max) * 100);

      var row = document.createElement("div");
      row.className = "ledger-row" + (d.hero ? " is-hero" : "") + (d.median ? " is-median" : "");
      row.tabIndex = 0;
      row.setAttribute("aria-label", d.name + ": approximately " + d.value + " million dollars");

      var name = document.createElement("span");
      name.className = "ledger-name";
      name.textContent = d.name;

      var track = document.createElement("div");
      track.className = "ledger-track";
      var fill = document.createElement("div");
      fill.className = "ledger-fill";
      fill.style.setProperty("--w", w + "%");
      track.appendChild(fill);

      var val = document.createElement("span");
      val.className = "ledger-value";
      val.textContent = fmtMillions(d.value);

      row.appendChild(name);
      row.appendChild(track);
      row.appendChild(val);
      container.appendChild(row);

      var tipText = d.name + " — " + fmtMillions(d.value) + " (APPROX.)";
      row.addEventListener("mousemove", function (e) { showTooltip(tipText, e.clientX, e.clientY); });
      row.addEventListener("mouseleave", hideTooltip);
      row.addEventListener("focus", function () {
        var r = row.getBoundingClientRect();
        showTooltip(tipText, r.left + r.width / 2, r.top);
      });
      row.addEventListener("blur", hideTooltip);

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

  buildLedger("payroll-chart", "payroll-table-body", PAYROLLS);
  buildLedger("deferral-chart", "deferral-table-body", DEFERRALS);

  /* ---------- animated counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reducedMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- scroll reveals ---------- */
  var counted = new WeakSet();

  function activate(el) {
    el.classList.add("in-view");
    el.querySelectorAll("[data-count]").forEach(function (c) {
      if (!counted.has(c)) { counted.add(c); animateCounter(c); }
    });
    var chart = el.querySelector(".ledger");
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
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(activate);
  }
})();
