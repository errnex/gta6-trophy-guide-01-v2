[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/errnex/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/errnex/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Platinum — GTA VI Trophy Guide & Tracker

An offline, open-source web app that guides you through all **55 Grand Theft Auto VI trophies on PlayStation 5** (1 platinum, 2 gold, 6 silver, 46 bronze) and tracks your progress toward the platinum. Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01).

## What it does

- **Checklist tracker** — every trophy with its official name, description and grade, ticked off in the browser and saved in `localStorage`. Export your progress to a file and import it back.
- **Guides in our own words** — each trophy has a guide that cites its sources (Exophase and PSNProfiles, who agree on every official name, description and grade). Where the official description does not state a location, count or method, the guide says so instead of inventing one.
- **Platinum roadmap** — six stages built from the official descriptions: story first, contact strands, exploring Leonida, activities and skills, crime and money, then clean-up and 100%.
- **Missable flags** — PlayStation marks no trophy as missable, so this guide invents none: three trophies are flagged *possibly missable* because their descriptions describe a single story choice or one-off moment.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade, and by search.
- **Spoiler-free mode** — hides story trophy names and descriptions until you earn them.

## Run it offline

Serve `app/` with any static server and open `index.html` — for example:

```
cd app && python3 -m http.server 8080
```

No build step, no network requests at run time: every file the app loads lives under `app/`.

## Repo layout

- `app/index.html`, `app/app.js`, `app/style.css` — the guide itself.
- `app/data/trophies.json` — the 55 official trophies with guides, kinds and missable flags.
- `screenshots/` — 4 captures of the running app (the first is the cover).
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to `/output` and writes `dossier.json`.

## License

MIT — see `LICENSE`. Unofficial fan guide, not affiliated with Rockstar Games or PlayStation, and it uses no Rockstar artwork, logo or game screenshots.
