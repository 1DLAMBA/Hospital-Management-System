"""
Converts a .dc.html artboard into a standalone animated page driven by
renderFrame(t), using a per-file cue list. The artboards already carry ids on
every animatable element, so nothing about the designs has to change.
"""
import re, json, sys, os, pathlib

SRC = pathlib.Path('../canvas')
OUT = pathlib.Path('.')

ENGINE = r"""
function initTimeline(spec) {
  var easeOut  = function (p) { return 1 - Math.pow(1 - p, 3); };
  var easeBack = function (p) { var c = 2.2; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var clamp    = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  function cue(t, a, b) { return clamp((t - a) / (b - a)); }

  // Styles that must differ from the static artboard (e.g. a chip that starts
  // un-selected so it can lock in later).
  (spec.init || []).forEach(function (i) {
    var e = document.getElementById(i.id);
    if (e) { for (var k in i.style) e.style[k] = i.style[k]; }
  });

  // Prepare any wave group for a draw-on.
  var waveSets = {};
  (spec.cues || []).filter(function (c) { return c.type === 'waves'; }).forEach(function (c) {
    var g = document.getElementById(c.id);
    if (!g) return;
    var paths = Array.prototype.slice.call(g.querySelectorAll('path'));
    paths.forEach(function (p) {
      var L = p.getTotalLength();
      p.setAttribute('stroke-dasharray', L);
      p.setAttribute('stroke-dashoffset', L);
      p.__len = L;
    });
    waveSets[c.id] = paths;
    g.style.opacity = 0;
  });

  var el = {};
  (spec.cues || []).forEach(function (c) { el[c.id] = el[c.id] || document.getElementById(c.id); });
  (spec.cues || []).forEach(function (c) {
    var e = el[c.id];
    if (e && c.type !== 'waves') { e.style.opacity = 0; e.style.willChange = 'opacity, transform'; }
  });

  window.renderFrame = function (t) {
    (spec.cues || []).forEach(function (c) {
      var e = el[c.id];
      if (!e) return;
      var p = easeOut(cue(t, c.a, c.b));

      if (c.type === 'rise') {
        e.style.opacity = p;
        e.style.transform = 'translateY(' + (1 - p) * (c.d || 28) + 'px)';

      } else if (c.type === 'slide') {
        e.style.opacity = p;
        e.style.transform = 'translateX(' + (1 - p) * (c.d || -30) + 'px)';

      } else if (c.type === 'fade') {
        e.style.opacity = p;

      } else if (c.type === 'pop') {
        var raw = cue(t, c.a, c.b);
        e.style.opacity = p;
        e.style.transform = 'scale(' + (raw > 0 ? easeBack(raw) : 0.6) + ')';

      } else if (c.type === 'waves') {
        e.style.opacity = p * (c.max || 0.5);
        var draw = easeOut(cue(t, c.a, c.b));
        (waveSets[c.id] || []).forEach(function (path) {
          path.setAttribute('stroke-dashoffset', String(path.__len * (1 - draw)));
        });

      } else if (c.type === 'lock') {
        // Enters dim with its siblings, then locks in with a bounce at c.a.
        var ip = easeOut(cue(t, c.ia, c.ib));
        var lp = cue(t, c.a, c.b);
        e.style.opacity = ip;
        var bounce = lp > 0 ? 1 + 0.10 * Math.sin(easeOut(lp) * Math.PI) : 1;
        e.style.transform = 'translateY(' + (1 - ip) * 20 + 'px) scale(' + bounce + ')';
        if (lp > 0.28) { for (var k in c.to) e.style[k] = c.to[k]; }
        else { for (var k2 in c.from) e.style[k2] = c.from[k2]; }
      }
    });
  };
  window.renderFrame(0);
}
"""

def convert(stem, spec, out_name):
    src = (SRC / (stem + '.dc.html')).read_text()
    helmet = re.search(r'<helmet>(.*?)</helmet>', src, re.S).group(1)
    body = src.split('</helmet>', 1)[1].split('</x-dc>', 1)[0].strip()
    # Assets sit in ../canvas relative to this folder.
    body = body.replace('src="phoenix-mark.svg"', 'src="../canvas/phoenix-mark.svg"')
    html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Phoenix - {stem}</title>
{helmet}
<style>
  html, body {{ width: 1080px; height: 1920px; overflow: hidden; margin: 0; background: #060d26; }}
</style>
</head>
<body>
{body}
<script>{ENGINE}</script>
<script>initTimeline({json.dumps(spec)});</script>
</body>
</html>
"""
    (OUT / out_name).write_text(html)
    print('built', out_name)

# ---- per-file timelines -------------------------------------------------

FACT = lambda: {
  "cues": [
    {"id": "eyebrow", "type": "rise",  "a": 0.55, "b": 1.05, "d": 18},
    {"id": "claim",   "type": "rise",  "a": 0.90, "b": 1.80, "d": 44},
    {"id": "waves",   "type": "waves", "a": 1.20, "b": 3.50, "max": 0.5},
    {"id": "chip",    "type": "pop",   "a": 2.00, "b": 2.50},
    {"id": "body",    "type": "rise",  "a": 2.55, "b": 3.25, "d": 26},
    {"id": "foot",    "type": "rise",  "a": 3.80, "b": 4.45, "d": 20},
  ]
}

TIMELINES = {
  'FactSocial':     ('phoenix-social-story.mp4',     FACT()),
  'FactPhysio':     ('phoenix-physio-story.mp4',     FACT()),
  'FactPharmacist': ('phoenix-pharmacy-story.mp4',   FACT()),

  'ValueQuestions': ('phoenix-questions-story.mp4', {
    "cues": [
      {"id": "eyebrow", "type": "rise",  "a": 0.55, "b": 1.05, "d": 18},
      {"id": "claim",   "type": "rise",  "a": 0.90, "b": 1.85, "d": 46},
      {"id": "waves",   "type": "waves", "a": 1.20, "b": 3.50, "max": 0.42},
      {"id": "q1",      "type": "rise",  "a": 2.10, "b": 2.60, "d": 30},
      {"id": "q2",      "type": "rise",  "a": 2.50, "b": 3.00, "d": 30},
      {"id": "q3",      "type": "rise",  "a": 2.90, "b": 3.40, "d": 30},
      {"id": "foot",    "type": "rise",  "a": 3.95, "b": 4.55, "d": 20},
    ]}),

  'ValueEmergency': ('phoenix-difference-story.mp4', {
    "cues": [
      {"id": "eyebrow", "type": "rise",  "a": 0.55, "b": 1.05, "d": 18},
      {"id": "claim",   "type": "rise",  "a": 0.90, "b": 1.90, "d": 46},
      {"id": "waves",   "type": "waves", "a": 1.20, "b": 3.50, "max": 0.4},
      {"id": "panelA",  "type": "slide", "a": 2.15, "b": 2.80, "d": -46},
      {"id": "panelB",  "type": "slide", "a": 2.80, "b": 3.45, "d":  46},
      {"id": "foot",    "type": "rise",  "a": 4.00, "b": 4.60, "d": 20},
    ]}),

  'Assistant': ('phoenix-which-doctor-story.mp4', {
    # chipPick starts looking like every other chip, then locks in.
    "init": [{"id": "chipPick", "style": {
        "border": "1px solid rgba(255,255,255,0.22)",
        "background": "rgba(255,255,255,0.06)",
        "color": "rgba(255,255,255,0.6)",
        "fontWeight": "400"}}],
    "cues": [
      {"id": "eyebrow", "type": "rise", "a": 0.50, "b": 1.00, "d": 18},
      {"id": "h1a",     "type": "rise", "a": 0.75, "b": 1.45, "d": 44},
      {"id": "h1b",     "type": "rise", "a": 1.10, "b": 1.80, "d": 44},
      {"id": "sub",     "type": "rise", "a": 1.70, "b": 2.30, "d": 24},
      {"id": "chip1",   "type": "rise", "a": 2.45, "b": 2.80, "d": 20},
      {"id": "chip2",   "type": "rise", "a": 2.60, "b": 2.95, "d": 20},
      {"id": "chip3",   "type": "rise", "a": 2.90, "b": 3.25, "d": 20},
      {"id": "chip4",   "type": "rise", "a": 3.05, "b": 3.40, "d": 20},
      {"id": "chip5",   "type": "rise", "a": 3.20, "b": 3.55, "d": 20},
      {"id": "chipPick","type": "lock", "ia": 2.75, "ib": 3.10, "a": 3.85, "b": 4.45,
         "from": {"border": "1px solid rgba(255,255,255,0.22)",
                  "background": "rgba(255,255,255,0.06)",
                  "color": "rgba(255,255,255,0.6)", "fontWeight": "400"},
         "to":   {"border": "1px solid #8fbaff", "background": "#8fbaff",
                  "color": "#10193a", "fontWeight": "600"}},
      {"id": "cta",     "type": "rise", "a": 4.85, "b": 5.45, "d": 28},
      {"id": "url",     "type": "rise", "a": 5.25, "b": 5.80, "d": 16},
    ]}),
}

for stem, (mp4, spec) in TIMELINES.items():
    convert(stem, spec, 'anim-' + stem + '.html')
json.dump({k: v[0] for k, v in TIMELINES.items()}, open('_outputs.json', 'w'))
