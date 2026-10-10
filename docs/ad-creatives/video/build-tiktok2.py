"""
TikTok batch 2 - three formats, each a different native shape:

  notes  light paper, lines land one at a time and STAY, caret blinking at
         the end. Reads as something being written, not an ad.
  chat   a two-person thread, bubbles popping in with a typing beat between.
         Generic bubble layout - not a copy of any one messaging app.
  block  full-bleed colour that FLIPS per beat, condensed display type.
         Loud, poster-like, the opposite of the calm ones.

All three keep content inside TikTok's safe box (y 240-1480).
"""
import json, pathlib

ENGINE = r"""
function initTT2(spec) {
  var easeOut  = function (p) { return 1 - Math.pow(1 - p, 3); };
  var easeBack = function (p) { var c = 2.0; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };
  var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
  function cue(t, a, b) { return clamp((t - a) / (b - a)); }

  var items = spec.items.map(function (it) {
    return { el: document.getElementById(it.id), at: it.at, mode: it.mode || 'up' };
  });
  var endEl = document.getElementById('endcard');
  var caret = document.getElementById('caret');
  var frame = document.getElementById('frame');
  var typing = spec.typing ? document.getElementById(spec.typing.id) : null;

  items.forEach(function (i) { if (i.el) i.el.style.opacity = 0; });
  if (endEl) endEl.style.opacity = 0;
  if (typing) typing.style.opacity = 0;

  window.renderFrame = function (t) {
    // Beats stay on screen once they land (notes, chat) or replace each
    // other (block) - spec.swap decides which.
    var active = -1;
    for (var i = 0; i < items.length; i++) if (t >= items[i].at) active = i;

    items.forEach(function (it, i) {
      if (!it.el) return;
      if (spec.swap) {
        if (i !== active) { it.el.style.opacity = 0; return; }
        var sp = easeOut(clamp((t - it.at) / 0.14));
        it.el.style.opacity = 1;
        it.el.style.transform = 'scale(' + (0.95 + 0.05 * sp) + ')';
        return;
      }
      var p = clamp((t - it.at) / 0.34);
      var e = easeOut(p);
      it.el.style.opacity = e;
      if (it.mode === 'pop') it.el.style.transform = 'scale(' + (p > 0 ? easeBack(p) : 0.7) + ')';
      else it.el.style.transform = 'translateY(' + (1 - e) * 22 + 'px)';
    });

    // Background flip for the block format.
    if (spec.grounds && frame) {
      var g = spec.grounds[active < 0 ? 0 : active] || spec.grounds[spec.grounds.length - 1];
      if (t >= spec.endAt && spec.endGround) g = spec.endGround;
      frame.style.background = g.bg;
      frame.style.color = g.fg;
    }

    if (typing) {
      var on = t >= spec.typing.from && t < spec.typing.to;
      typing.style.opacity = on ? 1 : 0;
      typing.style.display = on ? 'flex' : 'none';
      if (on) {
        var dots = typing.querySelectorAll('i');
        for (var d = 0; d < dots.length; d++) {
          var ph = (t * 3.1 + d * 0.22) % 1;
          dots[d].style.transform = 'translateY(' + (-Math.sin(ph * Math.PI) * 7) + 'px)';
          dots[d].style.opacity = 0.4 + 0.6 * Math.sin(ph * Math.PI);
        }
      }
    }

    if (caret) caret.style.opacity = (t < spec.endAt && Math.floor(t * 1.7) % 2 === 0) ? 1 : 0;

    if (endEl) {
      var ep = easeOut(clamp((t - spec.endAt) / 0.4));
      endEl.style.opacity = t >= spec.endAt ? ep : 0;
      endEl.style.transform = 'translateY(' + (1 - ep) * 20 + 'px)';
      if (spec.hideOnEnd && t >= spec.endAt) {
        items.forEach(function (it) { if (it.el) it.el.style.opacity = 0; });
        if (caret) caret.style.opacity = 0;
      }
    }
  };
  window.renderFrame(0);
}
"""

def page(title, head_css, body, spec, fonts):
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Phoenix TikTok - {title}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?{fonts}&display=swap">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  html, body {{ width:1080px; height:1920px; overflow:hidden; }}
{head_css}
</style>
</head>
<body>
{body}
<script>{ENGINE}</script>
<script>initTT2({json.dumps(spec)});</script>
</body>
</html>
"""
print("engine ready")

# ---------------------------------------------------------------- NOTES style
NOTES_CSS = """
  body { background:#0E1014; }
  #frame { width:1080px; height:1920px; position:relative; background:#0E1014;
           font-family:"Public Sans", system-ui, sans-serif; }
  .sheet { position:absolute; left:64px; top:240px; width:952px; height:1240px;
           background:#FCFBF7; border-radius:34px; padding:70px 62px;
           display:flex; flex-direction:column; }
  .meta { font-size:26px; color:#9A9689; letter-spacing:0.01em; margin-bottom:34px; }
  .ttl { font-size:72px; font-weight:800; color:#16150F; letter-spacing:-0.025em;
         line-height:1.08; margin-bottom:12px; }
  .sub { font-size:34px; color:#7E7A6E; margin-bottom:44px; }
  .line { display:flex; gap:20px; align-items:flex-start; margin-bottom:30px; opacity:0; }
  .bul { flex-shrink:0; width:13px; height:13px; border-radius:50%; background:#0F4E9C; margin-top:16px; }
  .line b { font-weight:700; color:#16150F; }
  .line span { font-size:38px; line-height:1.34; color:#3A382F; }
  #caret { display:inline-block; width:4px; height:40px; background:#0F4E9C;
           vertical-align:-6px; margin-left:4px; }
  .endcard { position:absolute; left:64px; top:240px; width:952px; height:1240px;
             background:#0F4E9C; border-radius:34px; display:flex; flex-direction:column;
             align-items:center; justify-content:center; gap:36px; opacity:0; }
  .endcard img { width:120px; height:120px; border-radius:28px; }
  .endcard .l { font-size:60px; font-weight:800; color:#fff; text-align:center;
                letter-spacing:-0.02em; line-height:1.14; padding:0 60px; }
  .endcard .u { font-family:"IBM Plex Mono", monospace; font-size:32px; color:#BBD6FF; }
"""

def notes(key, title, sub, lines, endline):
    body_lines = "\n".join(
        f'      <div class="line" id="n{i}"><span class="bul"></span><span>{txt}</span></div>'
        for i, txt in enumerate(lines))
    body = f'''<div id="frame">
  <div class="sheet">
    <div class="meta">Notes</div>
    <div class="ttl" id="n-ttl">{title}</div>
    <div class="sub" id="n-sub">{sub}</div>
{body_lines}
    <div><i id="caret"></i></div>
  </div>
  <div class="endcard" id="endcard">
    <img src="../canvas/phoenix-mark.svg" alt="Phoenix">
    <div class="l">{endline}</div>
    <div class="u">phoenixmed.online</div>
  </div>
</div>'''
    items = [{"id":"n-ttl","at":0.25},{"id":"n-sub","at":0.75}]
    at = 1.5
    for i in range(len(lines)):
        items.append({"id": f"n{i}", "at": round(at,2)}); at += 1.45
    end = round(at + 1.1, 2)
    spec = {"items": items, "endAt": end, "hideOnEnd": True}
    open(key + '.html','w').write(page(key, NOTES_CSS, body, spec,
        "family=Public+Sans:wght@400;700;800&family=IBM+Plex+Mono:wght@500"))
    return round(end + 2.5, 2)

D = {}
D['tt2-notes-consult'] = notes('tt2-notes-consult',
  "People you can consult",
  "that nobody tells you about",
  ["<b>Pharmacist</b> &mdash; what your medicines do together",
   "<b>Physiotherapist</b> &mdash; back pain, not just sport",
   "<b>Occupational therapist</b> &mdash; getting dressed again",
   "<b>Nutritionist</b> &mdash; not just about weight",
   "<b>Medical social worker</b> &mdash; the non-medical parts"],
  "All of them.<br>One app.")

D['tt2-notes-before'] = notes('tt2-notes-before',
  "Before your consultation",
  "four things to have ready",
  ["What you&rsquo;re feeling, and since when",
   "Any medication you&rsquo;re taking",
   "Results from tests you&rsquo;ve done",
   "The questions you don&rsquo;t want to forget"],
  "Your records live<br>in the app.")
print("notes built")

# ----------------------------------------------------------------- CHAT style
CHAT_CSS = """
  body { background:#EDEFF3; }
  #frame { width:1080px; height:1920px; position:relative; background:#EDEFF3;
           font-family:"Public Sans", system-ui, sans-serif; }
  .thread { position:absolute; left:64px; top:250px; width:952px; height:1220px;
            display:flex; flex-direction:column; gap:22px; }
  .b { max-width:700px; padding:30px 36px; font-size:39px; line-height:1.33; opacity:0;
       border-radius:34px; }
  .them { align-self:flex-start; background:#fff; color:#161A22;
          border-bottom-left-radius:10px; box-shadow:0 2px 10px rgba(20,26,40,.07); }
  .me   { align-self:flex-end; background:#0F4E9C; color:#fff;
          border-bottom-right-radius:10px; }
  .typing { align-self:flex-start; display:flex; gap:12px; padding:34px 38px; background:#fff;
            border-radius:34px; border-bottom-left-radius:10px; opacity:0;
            box-shadow:0 2px 10px rgba(20,26,40,.07); }
  .typing i { width:16px; height:16px; border-radius:50%; background:#8E95A4; display:block; }
  .endcard { position:absolute; left:64px; top:250px; width:952px; height:1220px;
             display:flex; flex-direction:column; align-items:center; justify-content:center;
             gap:36px; opacity:0; background:#EDEFF3; }
  .endcard img { width:124px; height:124px; border-radius:29px; }
  .endcard .l { font-size:62px; font-weight:800; color:#161A22; text-align:center;
                letter-spacing:-0.025em; line-height:1.14; padding:0 50px; }
  .endcard .u { font-family:"IBM Plex Mono", monospace; font-size:32px; color:#5A6274; }
"""

def chat(key, msgs, typing_before, endline):
    """msgs: list of (side, text). typing_before: index a typing beat precedes."""
    body_msgs = "\n".join(
        f'    <div class="b {side}" id="m{i}">{txt}</div>' for i, (side, txt) in enumerate(msgs))
    body = f'''<div id="frame">
  <div class="thread">
{body_msgs}
    <div class="typing" id="typing"><i></i><i></i><i></i></div>
  </div>
  <div class="endcard" id="endcard">
    <img src="../canvas/phoenix-mark.svg" alt="Phoenix">
    <div class="l">{endline}</div>
    <div class="u">phoenixmed.online</div>
  </div>
</div>'''
    items, at = [], 0.35
    typ = None
    for i in range(len(msgs)):
        if i == typing_before:
            typ = {"id": "typing", "from": round(at, 2), "to": round(at + 0.95, 2)}
            at += 1.05
        items.append({"id": f"m{i}", "at": round(at, 2), "mode": "pop"})
        at += 1.55
    end = round(at + 0.7, 2)
    spec = {"items": items, "endAt": end, "hideOnEnd": True}
    if typ: spec["typing"] = typ
    open(key + '.html','w').write(page(key, CHAT_CSS, body, spec,
        "family=Public+Sans:wght@400;700;800&family=IBM+Plex+Mono:wght@500"))
    return round(end + 2.5, 2)

D['tt2-chat-mum'] = chat('tt2-chat-mum', [
  ("them","mummy still hasn&rsquo;t gone to the clinic"),
  ("them","she&rsquo;s been saying since Monday"),
  ("me","she can see someone from the house"),
  ("me","pick a doctor, pick a time"),
  ("them","real doctors?"),
  ("me","licensed and verified. every one."),
], typing_before=2, endline="See a doctor<br>from the house.")

D['tt2-chat-specialist'] = chat('tt2-chat-specialist', [
  ("them","which doctor do I even see for this"),
  ("them","i don&rsquo;t want to waste another saturday"),
  ("me","you don&rsquo;t have to guess"),
  ("me","describe it and your assistant points you to the right one"),
  ("them","then?"),
  ("me","you book whoever&rsquo;s free."),
], typing_before=2, endline="Stop guessing<br>which doctor.")
print("chat built")

# ---------------------------------------------------------------- BLOCK style
BLOCK_CSS = """
  body { background:#0F4E9C; }
  #frame { width:1080px; height:1920px; position:relative; background:#0F4E9C; color:#fff;
           font-family:"Anton", Impact, sans-serif; transition:none; }
  .safe { position:absolute; left:70px; top:250px; width:800px; height:1220px;
          display:flex; align-items:center; justify-content:center; }
  .beat { position:absolute; width:100%; text-align:center; opacity:0;
          font-size:128px; line-height:1.04; letter-spacing:-0.012em;
          text-transform:uppercase; text-wrap:balance; }
  .beat.q { font-size:112px; text-transform:none; font-family:"Public Sans", sans-serif;
            font-weight:800; letter-spacing:-0.03em; }
  .endcard { position:absolute; left:70px; top:250px; width:800px; height:1220px;
             display:flex; flex-direction:column; align-items:center; justify-content:center;
             gap:38px; opacity:0; }
  .endcard img { width:132px; height:132px; border-radius:31px; }
  .endcard .l { font-family:"Anton", Impact, sans-serif; font-size:76px; text-align:center;
                text-transform:uppercase; line-height:1.06; letter-spacing:-0.01em; }
  .endcard .u { font-family:"IBM Plex Mono", monospace; font-size:32px; opacity:.8;
                text-transform:none; }
"""
BLUE  = {"bg":"#0F4E9C","fg":"#FFFFFF"}
PAPER = {"bg":"#F3F1EC","fg":"#12141A"}
INK   = {"bg":"#12141A","fg":"#FFFFFF"}

def block(key, beats, endline):
    """beats: list of (text, ground, quoted)"""
    body_beats = "\n".join(
        f'    <div class="beat{" q" if q else ""}" id="b{i}">{txt}</div>'
        for i, (txt, g, q) in enumerate(beats))
    body = f'''<div id="frame">
  <div class="safe">
{body_beats}
  </div>
  <div class="endcard" id="endcard">
    <img src="../canvas/phoenix-mark.svg" alt="Phoenix">
    <div class="l">{endline}</div>
    <div class="u">phoenixmed.online</div>
  </div>
</div>'''
    items, at = [], 0.0
    for i, (txt, g, q) in enumerate(beats):
        items.append({"id": f"b{i}", "at": round(at, 2)})
        at += 1.6
    end = round(at, 2)
    spec = {"items": items, "endAt": end, "swap": True, "hideOnEnd": True,
            "grounds": [g for _, g, _ in beats], "endGround": BLUE}
    open(key + '.html','w').write(page(key, BLOCK_CSS, body, spec,
        "family=Anton&family=Public+Sans:wght@800&family=IBM+Plex+Mono:wght@500"))
    return round(end + 2.6, 2)

D['tt2-block-clinic'] = block('tt2-block-clinic', [
  ("Things you&rsquo;ve heard<br>at a clinic", BLUE, False),
  ("&ldquo;Come back<br>tomorrow.&rdquo;", PAPER, True),
  ("&ldquo;Doctor is<br>not on seat.&rdquo;", INK, True),
  ("&ldquo;Nothing till<br>next week.&rdquo;", PAPER, True),
  ("Or &mdash;", INK, False),
  ("Pick a time<br>that exists.", BLUE, False),
], endline="Book a<br>consultation")

D['tt2-block-fee'] = block('tt2-block-fee', [
  ("How much<br>is it?", INK, False),
  ("You see the fee<br>before you book.", BLUE, False),
  ("&#8358;0 booking<br>charge.", PAPER, False),
  ("Nothing added<br>at the end.", INK, False),
  ("Free to create<br>an account.", BLUE, False),
], endline="No surprises")

import json as _j
_j.dump(D, open('_tt2.json','w'), indent=1)
print("block built")
for k, v in D.items(): print(" ", k, v, "s")
