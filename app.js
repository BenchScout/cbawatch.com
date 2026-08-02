/* CBA Watch — countdown, scroll reveals, animated counters, charts */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- countdown to CBA expiration: Dec 1, 2026, 11:59 PM ET (04:59 UTC Dec 2) ---------- */
  var EXPIRY = Date.UTC(2026, 11, 2, 4, 59, 0);
  var cd = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs")
  };

  function pad(n) { return String(n).padStart(2, "0"); }

  function setNum(el, text) {
    if (el.textContent === text) return;
    el.textContent = text;
    if (!reducedMotion) {
      el.classList.remove("tick");
      void el.offsetWidth; /* restart the animation */
      el.classList.add("tick");
    }
  }

  function updateCountdown() {
    var ms = EXPIRY - Date.now();
    if (ms <= 0) {
      var box = document.querySelector(".countdown");
      if (box) box.classList.add("expired");
      setNum(cd.days, "00"); setNum(cd.hours, "00"); setNum(cd.mins, "00"); setNum(cd.secs, "00");
      var cap = document.querySelector(".countdown-caption");
      if (cap) cap.textContent = "The CBA has expired. Lockout mode: engaged.";
      return;
    }
    var s = Math.floor(ms / 1000);
    setNum(cd.days, String(Math.floor(s / 86400)));
    setNum(cd.hours, pad(Math.floor(s / 3600) % 24));
    setNum(cd.mins, pad(Math.floor(s / 60) % 60));
    setNum(cd.secs, pad(s % 60));
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ---------- charts ---------- */
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

  function buildBarChart(containerId, tableBodyId, data) {
    var container = document.getElementById(containerId);
    var tbody = document.getElementById(tableBodyId);
    if (!container) return;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }));

    data.forEach(function (d) {
      var pct = (d.value / max) * 100;
      /* leave room on the right for the value label */
      var w = Math.max(2, pct * 0.86);

      var row = document.createElement("div");
      row.className = "bar-row" + (d.hero ? " is-hero" : "") + (d.median ? " is-median" : "");
      row.tabIndex = 0;
      row.setAttribute("aria-label", d.name + ": approximately " + d.value + " million dollars");
      row.style.setProperty("--w", w + "%");

      var name = document.createElement("span");
      name.className = "bar-name";
      name.textContent = d.name;

      var track = document.createElement("div");
      track.className = "bar-track";
      var fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.setProperty("--w", w + "%");
      var val = document.createElement("span");
      val.className = "bar-value";
      val.textContent = fmtMillions(d.value);
      track.appendChild(fill);
      track.appendChild(val);

      row.appendChild(name);
      row.appendChild(track);
      container.appendChild(row);

      var tipText = d.name + " — " + fmtMillions(d.value) + " (approx.)";
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

  buildBarChart("payroll-chart", "payroll-table-body", PAYROLLS);
  buildBarChart("deferral-chart", "deferral-table-body", DEFERRALS);

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
  var revealed = new WeakSet();

  function activate(el) {
    el.classList.add("in-view");
    el.querySelectorAll("[data-count]").forEach(function (c) {
      if (!revealed.has(c)) { revealed.add(c); animateCounter(c); }
    });
    var chart = el.querySelector(".barchart");
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
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(activate);
  }
})();
