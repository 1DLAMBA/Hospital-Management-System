# Phoenix ad creatives

Eight ready-to-post graphics in `png/`. All are exact platform sizes, under the
4MB Meta upload limit, and use the brand navy, EB Garamond headline, and IBM
Plex Sans body from the live site.

## What to post where

| File | Size | Use it for |
|------|------|-----------|
| `patients-feed-a.png` | 1080×1080 | Facebook + Instagram feed, patients. **Start here.** |
| `patients-feed-b.png` | 1080×1080 | A/B partner for A — same audience, speed hook, product shot |
| `patients-story.png` | 1080×1920 | Instagram/Facebook Stories and Reels, patients |
| `patients-link.png` | 1200×628 | Facebook link ads, Google Display, LinkedIn, OG preview |
| `pros-feed-a.png` | 1080×1080 | Feed, health professionals. **Start here.** |
| `pros-feed-b.png` | 1080×1080 | A/B partner for A — control/earnings hook, product shot |
| `pros-story.png` | 1080×1920 | Stories and Reels, professionals |
| `pros-link.png` | 1200×628 | Link ads, Google Display, LinkedIn |

Run the two `-feed-a` and `-feed-b` variants against each other in the same ad
set. They carry different hooks (trust vs speed for patients, earnings vs
control for professionals), so whichever wins tells you something you can reuse
in the next round.

## Landing pages to point them at

Patients → `https://phoenixmed.online/consult`
Professionals → `https://phoenixmed.online/practice`

Always add UTMs. Tagged examples are in [`../ad-campaigns.md`](../ad-campaigns.md),
which also has the matching ad copy (headlines and descriptions already checked
against Google's and Meta's character limits).

## Story safe zones

The 1080×1920 frames keep all copy between roughly 250px and 1400px from the
top, clear of the Instagram profile row and the bottom UI. Do not add stickers
or text over the lower third when you post.

## Editing and re-rendering

Source is plain HTML/CSS — no design tool needed.

- `patients.html`, `professionals.html` — one `.creative` block per graphic
- `_base.css` — shared brand styling
- `render.js` — rasterises every `.creative` to `png/<id>.png` at its exact size

To change copy, edit the HTML and re-render:

```bash
cd Hospital-Management-System/docs/ad-creatives && NODE_PATH=../../node_modules node render.js
```

Photography comes from `src/assets/` (`heroimg.png`, `logdoctor.png`,
`mockup.png`), so the ads and the site stay visually in step.

## Before you post

Healthcare is a restricted advertising category on both Google and Meta, and
approval rules vary by country. Copy here talks about the service, never about
the viewer's health, which is the line Meta enforces — keep it that way if you
rewrite it.
