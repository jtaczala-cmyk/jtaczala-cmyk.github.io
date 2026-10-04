# Stop60 – landing page

Static site (HTML/CSS; JS only for self-hosted GoatCounter `count.js`, lazy video `assets/media.js` and click-to-reveal e-mail `assets/contact.js`).
- `/` Norwegian (default) · `/en/` English · `/pl/` Polish
- `assets/` logo.svg, favicon.svg, hero-*.webp (from game title art), og-{no,en,pl}.jpg (1200×630)
- `src/build.py` regenerates the three `index.html` + sitemap/robots. After DNS is live: `STOP60_BASE=https://stop60.no/ python3 src/build.py`.
- Short redirects: `/spill` → `/strom/`, `/play` → `/power/`, `/graj` → `/prad/`.
- Sponsor section hidden for now (`SHOW_SPONSOR = False` in `src/build.py`). The STRØM sponsor demo was withdrawn on
  2026-10-04 (removed from the strom repo, `/strom/demo/` returns 404; copy in git history). The `/demo` redirect page was
  deleted; the `/sponsor` → `#sponsor` redirect page is parked in `src/hidden/sponsor/` (not deployed).
  To restore: put `demo/` back in the strom repo, set `SHOW_SPONSOR = True`, move `src/hidden/sponsor` back to the root, re-add a `/demo` redirect if wanted, rebuild.
- Deployed by GitHub Actions (`.github/workflows/pages.yml`); the games are separate project sites (`strom`, `prad`, `power`) served under the same host. Do not add folders with those names here.
- Contact addresses are shown as `user@stop60.no` (written as `user&#64;stop60.no` in the HTML); `assets/contact.js` builds the `mailto:` link at runtime.
- `src/make_logo.py` regenerates the SVG logo (needs fonttools), `src/og.html` is the share-image template.

Local preview: `python3 -m http.server 8060` in this folder → http://127.0.0.1:8060/

## Gameplay media (`media/`)
Real gameplay recorded 2026-10-01 from the live games (Playwright + Chromium, iPhone 13 viewport, headless).
During recording, Supabase (leaderboard) and GoatCounter were blocked three ways: a Playwright route abort on
`*.supabase.co`, `*.goatcounter.com` and `gc.zgo.at`; `config.js` replaced with empty leaderboard/analytics configs
and `count.js` served empty; an in-page override of fetch/XHR/sendBeacon/WebSocket/img for those hosts. Service workers
were blocked. No request to those hosts was made and no score was sent (the leaderboard shown is the local one in the
test browser). Clips: 3 cut segments (start + first slogan, second slogan, end card) at 30 fps, 390×664, muted.
`assets/media.js` loads clips only near the viewport, autoplays muted only when visible, pauses off-screen,
and under prefers-reduced-motion shows the poster with a play button (no video download until pressed).
Recorder/encoder scripts: /workspace/stop60_shot/ (record.js, common.js, make_clips.py).
