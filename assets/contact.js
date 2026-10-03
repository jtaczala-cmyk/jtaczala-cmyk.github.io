/* Copyright (c) 2026 Jacek Mariusz Taczała. All rights reserved. See LICENSE.
   Anti-spam: addresses are written as "user [at] domain" in the HTML; the real address is assembled on the first click. */
document.querySelectorAll("a.em").forEach(function (a) {
  a.addEventListener("click", function (ev) {
    if (a.dataset.on) return;
    ev.preventDefault();
    var m = a.dataset.u + String.fromCharCode(64) + a.dataset.d;
    a.href = "mailto:" + m;
    if (!a.classList.contains("p")) a.textContent = m; else a.setAttribute("aria-label", m);
    a.dataset.on = "1";
    if (a.classList.contains("p")) { var n = document.createElement("span"); n.className = "shown"; n.textContent = m; a.after(n); }
  });
});
