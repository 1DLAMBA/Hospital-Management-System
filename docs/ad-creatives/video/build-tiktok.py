"""
TikTok-native cuts. Deliberately unlike the story ads:
  - the hook is on screen at frame 0, no brand intro
  - beats HARD CUT rather than crossfade - fades read as advertising
  - content sits inside TikTok's safe box (x 70-880, y 210-1430); the app's
    caption, handle and action rail cover everything outside it
  - branding arrives only on the end card
"""
import json, pathlib

ENGINE = r"""
function initTikTok(spec) {
  var beats = spec.beats, end = spec.end;
  var nodes = beats.map(function (b, i) { return document.getElementById('beat' + i); });
  var endEl = document.getElementById('endcard');
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  var easeOut = function (p) { return 1 - Math.pow(1 - p, 3); };

  var starts = [], acc = 0;
  beats.forEach(function (b) { starts.push(acc); acc += b.d; });
  var endStart = acc;

  window.renderFrame = function (t) {
    var active = -1;
    for (var i = 0; i < beats.length; i++) {
      if (t >= starts[i] && t < starts[i] + beats[i].d) { active = i; break; }
    }
    nodes.forEach(function (n, i) {
      if (!n) return;
      if (i === active) {
        // Snap in over ~4 frames, then hold dead still. No exit fade: cut.
        var p = easeOut(clamp((t - starts[i]) / 0.13));
        n.style.opacity = 1;
        n.style.transform = 'scale(' + (0.955 + 0.045 * p) + ')';
      } else {
        n.style.opacity = 0;
      }
    });
    if (endEl) {
      var ep = easeOut(clamp((t - endStart) / 0.35));
      endEl.style.opacity = t >= endStart ? ep : 0;
      endEl.style.transform = 'translateY(' + (1 - ep) * 24 + 'px)';
    }
  };
  window.renderFrame(0);
}
"""

TPL = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Phoenix TikTok - {name}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 1080px; height: 1920px; overflow: hidden; background: #0B0F1A; }}
  .frame {{
    width: 1080px; height: 1920px; position: relative; overflow: hidden;
    background: radial-gradient(circle at 50% 38%, #16224a 0%, #0B0F1A 62%);
    font-family: 'IBM Plex Sans', system-ui, sans-serif;
  }}
  /* TikTok safe box - everything outside is covered by app UI */
  .safe {{ position: absolute; left: 70px; top: 240px; width: 810px; height: 1240px;
           display: flex; align-items: center; justify-content: center; }}
  .beat {{ position: absolute; width: 100%; text-align: center; opacity: 0;
           font-weight: 700; font-size: 104px; line-height: 1.1; color: #fff;
           letter-spacing: -0.025em; text-wrap: balance; will-change: opacity, transform; }}
  .beat.sm {{ font-size: 82px; }}
  .hl {{ color: #7FC4FF; }}
  .endcard {{ position: absolute; left: 70px; top: 240px; width: 810px; height: 1240px;
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              gap: 40px; opacity: 0; }}
  .endcard img {{ width: 112px; height: 112px; border-radius: 30px; }}
  .endcard .line {{ font-size: 78px; line-height: 1.12; font-weight: 700; color: #fff; text-align: center; letter-spacing: -0.02em; }}
  .endcard .url {{ font-family: 'IBM Plex Mono', monospace; font-size: 34px; color: #7FC4FF; }}
</style>
</head>
<body>
<div class="frame">
  <div class="safe">
{beats}
  </div>
  <div class="endcard" id="endcard">
    <img src="../canvas/phoenix-mark.svg" alt="Phoenix">
    <div class="line">{endline}</div>
    <div class="url">phoenixmed.online</div>
  </div>
</div>
<script>{engine}</script>
<script>initTikTok({spec});</script>
</body>
</html>
"""

PIECES = {
 'tiktok-consult-list': dict(
   name='What you can consult', endline='All of them. One app.', endDur=2.4,
   beats=[("Things you didn&rsquo;t know<br>you could <span class='hl'>consult</span>", 1.9, False),
          ("A pharmacist.", 1.25, False),
          ("A physiotherapist.", 1.25, False),
          ("An occupational<br>therapist.", 1.45, False),
          ("A nutritionist.", 1.25, False),
          ("A medical<br>social worker.", 1.45, False),
          ("All of them are<br>on <span class='hl'>Phoenix</span>.", 1.9, False)]),

 'tiktok-ot': dict(
   name='Occupational therapy', endline='Occupational therapists<br>are on Phoenix.', endDur=2.6,
   beats=[("Nobody knows what an<br>occupational therapist<br>actually does.", 2.3, True),
          ("So here it is.", 1.3, False),
          ("They help you get<br>dressed again.", 1.8, False),
          ("Cook. Write.<br>Hold a spoon.", 1.8, False),
          ("Go back to <span class='hl'>work</span>.", 1.6, False),
          ("After a stroke, an injury,<br>or surgery.", 2.1, True)]),

 'tiktok-clinic-closed': dict(
   name='Clinic closed', endline='Phoenix is open.', endDur=2.4,
   beats=[("The clinic closed at 5.", 1.8, False),
          ("Your question <span class='hl'>didn&rsquo;t</span>.", 1.8, False),
          ("So you wait till morning.", 1.7, False),
          ("Then queue.", 1.3, False),
          ("Then get told<br>&ldquo;come back tomorrow.&rdquo;", 2.1, True),
          ("Or you open <span class='hl'>Phoenix</span><br>and book a time.", 2.2, True)]),

 'tiktok-quiz': dict(
   name='Who handles hair loss', endline='Your assistant<br>points you to the right one.', endDur=2.6,
   beats=[("Quick:<br>who handles <span class='hl'>hair loss</span>?", 2.0, False),
          ("Most people say<br>a general doctor.", 1.9, True),
          ("Wrong.", 1.4, False),
          ("It&rsquo;s a <span class='hl'>dermatologist</span>.", 1.9, False),
          ("Nails and scalp too.", 1.7, False),
          ("Picking the wrong one<br>costs you a week.", 2.1, True)]),
}

out = pathlib.Path('.')
for key, cfg in PIECES.items():
    beats_html = "\n".join(
        '    <div class="beat{cls}" id="beat{i}">{t}</div>'.format(
            cls=' sm' if small else '', i=i, t=text)
        for i, (text, d, small) in enumerate(cfg['beats']))
    spec = {"beats": [{"d": d} for _, d, _ in cfg['beats']], "endDur": cfg['endDur']}
    (out / (key + '.html')).write_text(TPL.format(
        name=cfg['name'], beats=beats_html, endline=cfg['endline'],
        engine=ENGINE, spec=json.dumps(spec)))
    dur = sum(d for _, d, _ in cfg['beats']) + cfg['endDur']
    print('%-26s %4.1fs  (%d beats)' % (key, dur, len(cfg['beats'])))
