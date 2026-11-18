#!/usr/bin/env python3
"""Build counters.json for the stop60.no counter strip from real GoatCounter event counts.

Runs inside the Pages workflow (push + schedule). The GoatCounter API token comes from the
GOATCOUNTER_TOKEN repo secret and is only used here, server side; the site only gets the
three aggregate numbers. If the API fails, the last published counters.json is kept.
"""
import datetime as dt, json, os, re, sys, time, urllib.parse, urllib.request
from zoneinfo import ZoneInfo

API = "https://jtaczala-games.goatcounter.com/api/v0"
FIRST_DAY = dt.date(2026, 9, 1)  # before the first GoatCounter event on the site
CHUNK_DAYS = 14
OUT = sys.argv[1] if len(sys.argv) > 1 else "counters.json"
LIVE = "https://stop60.no/counters.json"
SKIP_PREFIX = ("home", "landing", "follow", "portfolio", "diag")

PLAY = re.compile(r"(^|-)start(-[a-z0-9]+)?$")
DAILY = re.compile(r"-start-daily$")
SHARE = re.compile(r"-share(-[a-z0-9]+)?$|-challenge-")


def api(path, q):
    url = API + path + "?" + urllib.parse.urlencode(q, doseq=True)
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + os.environ["GOATCOUNTER_TOKEN"],
                                               "Content-Type": "application/json"})
    last = None
    for i in range(6):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            last = e
            if e.code == 429:
                time.sleep(3 + 2 * i)
                continue
            raise
        except Exception as e:  # timeouts / disconnects
            last = e
            time.sleep(3 + 2 * i)
    raise last


def events_by_day(start, end):
    """{(day, path): visitors} for event paths in [start, end)."""
    out, exclude = {}, []
    while True:
        q = {"start": start.isoformat(), "end": end.isoformat(), "limit": 100}
        if exclude:
            q["exclude_paths"] = exclude
        r = api("/stats/hits", q)
        hits = r.get("hits") or []
        for h in hits:
            exclude.append(h["path_id"])
            if not h.get("event"):
                continue
            for s in h.get("stats") or []:
                if s.get("daily"):
                    out[(s["day"], h["path"])] = out.get((s["day"], h["path"]), 0) + s["daily"]
        if not r.get("more") or not hits:
            return out
        time.sleep(0.4)


def build():
    today = dt.datetime.now(ZoneInfo("Europe/Oslo")).date()
    end = today + dt.timedelta(days=1)
    ev, d = {}, FIRST_DAY
    while d < end:
        e = min(d + dt.timedelta(days=CHUNK_DAYS), end)
        ev.update(events_by_day(d, e))
        d = e
        time.sleep(0.4)
    plays = daily_today = shares = 0
    for (day, path), n in ev.items():
        if path.startswith(SKIP_PREFIX):
            continue
        if PLAY.search(path) and "demo" not in path:
            plays += n
        if SHARE.search(path):
            shares += n
        if DAILY.search(path) and day == today.isoformat():
            daily_today += n
    return {"plays": plays, "daily_today": daily_today, "shares": shares, "day": today.isoformat(),
            "updated": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "source": "GoatCounter events (unique visitors per day)"}


def main():
    try:
        data = build()
    except Exception as e:
        print("GoatCounter failed:", repr(e)[:200], file=sys.stderr)
        try:
            with urllib.request.urlopen(LIVE, timeout=20) as r:
                data = json.load(r)
            print("kept last published counters.json", file=sys.stderr)
        except Exception as e2:
            print("no previous counters.json either:", repr(e2)[:200], file=sys.stderr)
            return
    with open(OUT, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(json.dumps(data))


if __name__ == "__main__":
    main()
