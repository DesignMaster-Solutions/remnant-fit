# Builds the Remnant Fit demo: Lens Studio preview captures (LEAF demo-step driver) + `say` narration -> mp4
# Run: python3 docs/video/make.py  (writes docs/demo.mp4; scratch files go to /tmp/remnant-fit-video)
import pathlib, subprocess
from PIL import Image, ImageDraw, ImageFont

V = pathlib.Path(__file__).parent
OUT = V.parent / "demo.mp4"
TMP = pathlib.Path("/tmp/remnant-fit-video"); TMP.mkdir(exist_ok=True)
W, H = 1920, 1080
F = "/System/Library/Fonts/HelveticaNeue.ttc"
TITLE, BODY, SMALL = ImageFont.truetype(F, 64, index=1), ImageFont.truetype(F, 38), ImageFont.truetype(F, 28)
MONO = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 30)
BG, INK, MUTED, GREEN, AMBER = "#1d1a17", "#f4efe8", "#bfb4a6", "#86efac", "#fbbf24"

# (title, body lines, mono lines, frames, readout zoom strip, readout color, narration)
S = [
 ("Remnant Fit", ["A Lens for SPECS that puts a real-size stone", "remnant on your vanity, so you know if it fits", "before you drive to the stone yard.", "",
   "Learn AR with SPECS · Design Master Solutions LLC"], None, ["f6.jpg"], None, None,
  "Remnant Fit. A Lens for SPECS that puts a real size stone remnant on your vanity, so you know if it fits before you drive to the stone yard."),
 ("The problem", ["Remodeling a bathroom, people buy remnants:", "the leftover quartz or granite a fabricator", "sells cheap.", "",
   "The question is always the same:", "will this piece cover my vanity top?", "", "Today: a tape measure, numbers on paper, hope."], None, ["f0.jpg"], None, None,
  "When people remodel a bathroom, many buy a remnant: the leftover piece of quartz or granite a fabricator sells cheap. The question is always the same. Will this piece cover my vanity top? Today that means a tape measure, numbers on paper, and hope."),
 ("1. Set top here", ["A stand-in vanity cabinet stands 0.9 m", "in front of you: 91 x 56 cm top, 86 cm high.", "", "Press \"Set top here\" to mark its top."], None,
  ["f0.jpg"], "r0.png", INK,
  "In the Lens, a stand in vanity cabinet, ninety one by fifty six centimeters, stands in front of you. Press Set top here to mark its top."),
 ("2. Pick a remnant", ["Three cards appear behind the cabinet:", "stone name, color swatch, real size", "in centimeters and inches.", "",
   "Calacatta Quartz       66 x 102 cm", "Taj Mahal Quartzite    58 x 89 cm", "River White Granite    61 x 122 cm"], None, ["f1.jpg"], None, None,
  "Three remnant cards appear behind the cabinet, each with the stone name, a color swatch, and the real size in centimeters and inches."),
 ("3. Real size, on the top", ["Pinch Calacatta Quartz: the slab lies flat", "on the cabinet, 3 cm thick, at real size.", "",
   "The readout floats above the back edge:"], None, ["f2.jpg", "f2b.jpg"], "r2.png", GREEN,
  "Pinch Calacatta Quartz. The slab lies flat on the cabinet at real size, three centimeters thick. The readout turns green: covers one hundred percent, ten centimeters left for a backsplash."),
 ("4. Drag it across the top", ["Grab the slab and drag it: it slides", "across the top and stays flat on it.", "",
   "Pushed 16 cm to the left, the readout turns", "amber and the short edge is outlined", "in amber on the cabinet."], None, ["f3.jpg", "f3b.jpg"], "r3.png", AMBER,
  "Grab the slab and drag it. It slides across the top and stays flat on it. Pushed sixteen centimeters to the left, the readout turns amber, short eleven centimeters on the right, and that edge is outlined in amber on the cabinet."),
 ("5. Rotate", ["\"Rotate\" turns the slab 90 degrees.", "Its 66 cm side now runs across the", "91 cm top, and the readout updates."], None,
  ["f4.jpg", "f4b.jpg"], "r4.png", AMBER,
  "Rotate turns the slab ninety degrees. Now its sixty six centimeter side runs across the ninety one centimeter top, and the readout updates: short on both sides."),
 ("6. Change remnant", ["\"Change remnant\" brings the cards back.", "", "Taj Mahal Quartzite, 58 x 89 cm,", "is just too small for this top."], None,
  ["f5.jpg", "f6.jpg"], "r6.png", AMBER,
  "Change remnant brings the cards back. Taj Mahal Quartzite, fifty eight by eighty nine, is just too small: short one centimeter on the left and one on the right."),
 ("How it was built", ["1. Devpost Learn plan-lens skill pack: idea, design", "   brief and five checkable done criteria (devpost/).",
   "2. CLAD, Snap's agent toolkit, built the Lens through", "   the Lens Studio MCP: SIK + UI Kit, everything in cm.",
   "3. Light colors only: the SPECS display is additive,", "   so black granite would be invisible.",
   "4. LEAF tests run every criterion in the preview,", "   no glasses needed."], None, None, None, None,
  "How it was built. The idea, the design brief and five checkable done criteria came from the Devpost Learn plan lens skill pack. Then CLAD, Snap's agent toolkit, built the Lens through the Lens Studio M C P, with the Spectacles Interaction Kit and UI Kit, everything in centimeters. Colors stay light, because the SPECS display is additive and black granite would be invisible. And LEAF tests run every criterion in the preview, no glasses needed."),
 ("Tested with LEAF", [], ["c1-set-top-shows-cards        PASS", "c2-pick-card-places-slab      PASS", "c3-drag-slab-stays-flat       PASS",
   "c4-readout-cover-and-short    PASS", "c5-rotate-updates-readout     PASS", "",
   "Found while recording this video:", "a sideways drag moved the slab 48 cm in depth.",
   "c3 now checks depth: FAIL (48.5 cm) -> fix -> PASS.", "The slab follows the hand ray on the top plane."], None, None, None,
  "Every done criterion has a LEAF test, and all five pass. Recording this video found a real bug: a sideways drag moved the slab almost half a meter in depth. We made the drag test check depth first, saw it fail, then made the slab follow the hand ray on the plane of the top, and the test passed."),
 ("Remnant Fit", ["Open source, MIT:", "github.com/DesignMaster-Solutions/remnant-fit", "",
   "Design Master Solutions LLC,", "the team behind Stone Project, a marketplace", "for fabricators' stone remnants."], None, ["f2.jpg"], None, None,
  "Remnant Fit is open source under M I T, at github dot com slash DesignMaster Solutions slash remnant fit. Built by Design Master Solutions, the team behind Stone Project. Thanks for watching."),
]

parts = []
for i, (title, body, mono, frames, zoom, zcol, narr) in enumerate(S):
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 8], fill="#c8b59a")
    x0 = 100
    if frames:  # preview captures on the right, portrait, side by side
        fw = 430 if len(frames) == 2 else 660
        x = W - 70
        for f in reversed(frames):
            p = Image.open(V / f).convert("RGB"); p.thumbnail((fw, 960))
            x -= p.width
            im.paste(p, (x, 70)); d.rectangle([x - 2, 68, x + p.width + 1, 71 + p.height], outline="#5c5247", width=2)
            x -= 24
        d.text((x + 24, 1040), "Lens Studio 5.24.1 preview · SPECS 27 · Interactive", font=SMALL, fill="#7d7266")
        textw = x - x0
    d.text((x0, 90), title, font=TITLE, fill=INK)
    y = 210
    for l in body: d.text((x0, y), l, font=BODY, fill=MUTED); y += 56
    if mono:
        for l in mono:
            col = GREEN if "PASS" in l and "FAIL" not in l else AMBER if "FAIL" in l else INK
            d.text((x0, y), l, font=MONO, fill=col); y += 52
    if zoom:  # readout strip cropped from the full-size capture, scaled up so it reads on a phone
        z = Image.open(V / zoom).convert("RGB")
        z = z.resize((700, int(z.height * 700 / z.width)), Image.LANCZOS)
        zy = max(y + 30, 600)
        im.paste(z, (x0, zy)); d.rectangle([x0 - 3, zy - 3, x0 + z.width + 2, zy + z.height + 2], outline=zcol, width=3)
    d.text((x0, H - 60), "Remnant Fit · Design Master Solutions LLC", font=SMALL, fill="#7d7266")
    png, aiff, mp4 = TMP / f"s{i}.png", TMP / f"s{i}.aiff", TMP / f"s{i}.mp4"
    im.save(png)
    subprocess.run(["say", "-v", "Samantha", "-r", "178", "-o", aiff, narr], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", png, "-i", aiff, "-af", "apad=pad_dur=0.7",
                    "-shortest", "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "30",
                    "-c:a", "aac", "-ar", "48000", mp4], check=True)
    parts.append(mp4)
(TMP / "list.txt").write_text("".join(f"file '{p}'\n" for p in parts))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", TMP / "list.txt",
                "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                "-movflags", "+faststart", OUT], check=True)
print(OUT)
