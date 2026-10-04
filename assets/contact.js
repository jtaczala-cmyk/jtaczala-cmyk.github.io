/* Copyright (c) 2026 Stop60. All rights reserved. See LICENSE.
   E-mail links: the HTML shows "user&#64;domain" (visible without JS); the mailto: link is assembled here at
   runtime from data-u / data-d (light anti-spam). Labelled links (class "p") keep their label. */
document.querySelectorAll("a.em").forEach(function (a) {
  var m = a.dataset.u + String.fromCharCode(64) + a.dataset.d;
  a.href = "mailto:" + m;
  if (a.classList.contains("p")) a.setAttribute("aria-label", a.textContent.trim() + ": " + m);
  else a.textContent = m;
});
