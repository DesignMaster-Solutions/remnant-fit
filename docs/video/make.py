# Builds the Remnant Fit demo (docs/demo.mp4) from continuous Lens Studio preview recordings + `say` narration.
# Footage: uncut.mp4 = one LEAF demo-step run (pause 4500) recorded from the Preview viewport;
#          leaf.mp4 = the LEAF panel while c1..c5 run. Both come from in-editor frame grabs (Widget.grab at ~15 fps,
#          timestamps in times.json); rebuild them with: python3 make.py --frames <dir> <out.mp4>
# Run: python3 docs/video/make.py  (scratch in /tmp/remnant-fit-video)
import json, pathlib, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

V = pathlib.Path(__file__).parent
OUT = V.parent / "demo.mp4"
TMP = pathlib.Path("/tmp/remnant-fit-video"); TMP.mkdir(exist_ok=True)
W, H, FPS = 1920, 1080, 30
F = "/System/Library/Fonts/HelveticaNeue.ttc"
TITLE, BODY, SMALL = ImageFont.truetype(F, 60, index=1), ImageFont.truetype(F, 38), ImageFont.truetype(F, 28)
LABEL, MONO = ImageFont.truetype(F, 34, index=1), ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", 30)
BG, INK, MUTED, GREEN, AMBER = "#1d1a17", "#f4efe8", "#bfb4a6", "#86efac", "#fbbf24"
VOICE = ["say", "-v", "Samantha", "-r", "178"]


def run(*a): subprocess.run([str(x) for x in a], check=True)


def frames_to_mp4(d, out):
    """Variable-rate grabs -> 30 fps CFR mp4, each frame held until the next grab's timestamp."""
    d = pathlib.Path(d); t = json.loads((d / "times.json").read_text())
    lines = []
    for i, ti in enumerate(t):
        lines += [f"file '{d / f'f{i:05d}.jpg'}'", f"duration {((t[i + 1] if i + 1 < len(t) else ti + 66) - ti) / 1000:.3f}"]
    lines.append(f"file '{d / f'f{len(t) - 1:05d}.jpg'}'")
    (TMP / "frames.txt").write_text("\n".join(lines) + "\n")
    run("ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", TMP / "frames.txt",
        "-vf", f"fps={FPS},scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", out)


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                                capture_output=True, text=True, check=True).stdout)


def voice(name, text):
    p = TMP / f"{name}.aiff"; run(*VOICE, "-o", p, text); return p


def card(name, title, body=(), mono=(), label=None, label_col=INK, video_x=None):
    """Background PNG: text on the left, the video goes in the frame on the right (x >= video_x)."""
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, W, 8], fill="#c8b59a")
    x0, y = 90, 80
    if label:
        tw = d.textlength(label, font=LABEL)
        d.rounded_rectangle([x0 - 4, y - 6, x0 + tw + 36, y + 52], 10, outline=label_col, width=3)
        d.text((x0 + 16, y + 4), label, font=LABEL, fill=label_col); y += 100
    d.text((x0, y), title, font=TITLE, fill=INK); y += 110
    for l in body: d.text((x0, y), l, font=BODY, fill=MUTED); y += 54
    y += 10
    for l in mono: d.text((x0, y), l, font=MONO, fill=GREEN if l.endswith("PASS") else INK); y += 48
    d.text((x0, H - 60), "Remnant Fit · Design Master Solutions LLC", font=SMALL, fill="#7d7266")
    if video_x: d.text((video_x, H - 34), "Lens Studio 5.24.1 preview · SPECS 27 · Interactive", font=SMALL, fill="#7d7266")
    p = TMP / f"{name}.png"; im.save(p); return p


def segment(name, bg, video, start, length, lines, speed=1.0, vh=1000, crop=None):
    """bg + video clip [start, start+length*speed) at `speed`, narration `lines` = [(t, text)], length seconds."""
    vids = ["-ss", f"{start:.2f}", "-t", f"{length * speed:.2f}", "-i", video] if video else []
    auds, mix = [], []
    for k, (t, txt) in enumerate(lines):
        auds += ["-i", voice(f"{name}_{k}", txt)]
        n = k + (2 if video else 1)
        mix.append(f"[{n}:a]adelay={int(t * 1000)}:all=1[a{k}]")
    cf = f"crop={crop}," if crop else ""
    fv = (f"[1:v]{cf}setpts=(PTS-STARTPTS)/{speed},scale=-2:{vh},tpad=stop_mode=clone:stop_duration=30[v];"
          f"[0:v][v]overlay=W-w-70:(H-h)/2-20:shortest=0[o]" if video else "[0:v]null[o]")
    fa = ";".join(mix) + ";" + "".join(f"[a{k}]" for k in range(len(lines))) + \
         f"amix=inputs={len(lines)}:normalize=0,apad[a]" if lines else "anullsrc=r=48000:cl=mono[a]"
    out = TMP / f"{name}.mp4"
    run("ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", FPS, "-i", bg, *vids, *auds,
        "-filter_complex", f"{fv};{fa}", "-map", "[o]", "-map", "[a]", "-t", f"{length:.2f}",
        "-r", FPS, "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-ar", "48000", "-ac", "2", out)
    return out


if __name__ == "__main__" and sys.argv[1:2] == ["--frames"]:
    frames_to_mp4(sys.argv[2], sys.argv[3]); print(sys.argv[3]); sys.exit()

UNCUT, LEAF = V / "uncut.mp4", V / "leaf.mp4"
# Seconds into uncut.mp4 (read off frame diffs + the driver's pause 4500 schedule): the scenario resets the
# lens at 7.8 and hides LEAF's log overlay at 9.5; set top 14.2, Calacatta 19.3, drag left 24.7-26.7,
# drag back 31.6-33.6, rotate 38.5, change remnant 43.6, Taj Mahal 48.6, end 60.2.
U0 = 9.6
ZOOM = "842:620:0:380"  # cabinet + slab + readout band of the 842x1155 preview
vx = lambda w: W - 70 - w  # left edge of a video of width w placed on the right

parts = [
    segment("s0", card("s0", "Remnant Fit", ["For anyone remodeling a bathroom", "with a cheap stone remnant:",
                                            "will this piece cover my vanity?"],
                       label="Lens running in the Lens Studio preview", label_col=GREEN, video_x=vx(729)),
            UNCUT, 18.8, 8.6,
            [(0.2, "Remodeling a bathroom with a stone remnant? Remnant Fit lays the real size slab on your vanity, "
                   "so you know if it fits before you buy.")]),
    segment("s1", card("s1", "One take, start to finish", ["1  Set top here", "2  Pinch Calacatta Quartz",
                                                           "3  Drag it: the readout turns amber", "4  Rotate",
                                                           "5  Change remnant: Taj Mahal", "",
                                                           "50 seconds, no edits.", "Driven by a LEAF scenario",
                                                           "through the Interaction Kit."],
                       label="Uncut · Lens Studio preview", label_col=AMBER, video_x=vx(729)),
            UNCUT, U0, dur(UNCUT) - U0,
            [(0.3, "One uncut take, in the Lens Studio preview. First, mark the vanity top."),
             (5.6, "Three remnant cards appear. Pinch Calacatta Quartz."),
             (10.0, "It lies flat on the top, at real size, and the readout is green: it covers."),
             (15.0, "Drag it left. The readout turns amber: short six centimeters on the right."),
             (22.0, "Slide it back, then rotate."),
             (29.3, "Rotated, it is short on both sides."),
             (34.3, "Change remnant. Taj Mahal Quartzite."),
             (39.5, "Just too small, one centimeter short on each side. The wrong piece, caught before the drive "
                    "to the stone yard.")]),
    segment("s2", card("s2", "Who it is for", ["A homeowner remodeling a bathroom,", "looking at a remnant: the leftover",
                                              "quartz or granite a fabricator", "sells cheap.", "",
                                              "Mark your vanity top, and the", "remnants appear as cards with",
                                              "their real size in cm and inches."], video_x=vx(729)),
            UNCUT, 13.6, 13.2,
            [(0.2, "Who is it for? A homeowner remodeling a bathroom, looking at a remnant: the leftover quartz or "
                   "granite a fabricator sells cheap. Mark your vanity top, and the remnants appear as cards, "
                   "with their real size.")]),
    segment("s3", card("s3", "Real size, on the top", ["The slab lies flat, 3 cm thick.", "",
                                                      "Green: it covers, with the", "backsplash margin.", "",
                                                      "Amber: an edge falls short,", "and that edge is outlined",
                                                      "on the cabinet."], video_x=vx(1032)),
            UNCUT, 19.0, 15.0,
            [(0.2, "Pinch a card and the slab lies on the top at real size, three centimeters thick. Green means it "
                   "covers, with ten centimeters left for a backsplash. Drag it, and when an edge falls short, the "
                   "readout turns amber and that edge is outlined on the cabinet.")], vh=760, crop=ZOOM),
    segment("s4", card("s4", "Rotate, compare", ["Rotate turns it 90 degrees.", "",
                                                 "Change remnant brings the", "cards back to try the next piece.", "",
                                                 "Taj Mahal Quartzite, 58 x 89 cm:", "1 cm short on each side."],
                       video_x=vx(1032)),
            UNCUT, 37.6, 10.2,
            [(0.2, "Rotate turns it ninety degrees, and Change remnant tries the next piece. Taj Mahal is one "
                   "centimeter short on each side. Skip it, and keep looking.")], speed=1.5, vh=760, crop=ZOOM),
    segment("s5", card("s5", "Tested with LEAF", ["Every done criterion from the plan", "is a LEAF scenario that drives",
                                                 "the Lens in the preview.", ""],
                       mono=["c1-set-top-shows-cards      PASS", "c2-pick-card-places-slab    PASS",
                             "c3-drag-slab-stays-flat     PASS", "c4-readout-cover-and-short  PASS",
                             "c5-rotate-updates-readout   PASS", "", "Built with CLAD + Lens Studio MCP,",
                             "SIK and UI Kit, all in cm."],
                       label="Real run, 2.6x speed", label_col=GREEN, video_x=vx(729)),
            LEAF, 0, 15.0,
            [(0.2, "Each done criterion from the plan is a LEAF test that drives the Lens through the Spectacles "
                   "Interaction Kit, right in the preview. All five pass. Built with CLAD and the Lens Studio M C P.")],
            speed=dur(LEAF) / 15.0),
    segment("s6", card("s6", "Remnant Fit", ["Open source, MIT:", "github.com/DesignMaster-Solutions/", "remnant-fit", "",
                                            "Design Master Solutions LLC,", "the team behind Stone Project,",
                                            "a marketplace for stone remnants."], video_x=vx(1032)),
            UNCUT, 50.0, 8.4,
            [(0.2, "Remnant Fit is open source on GitHub. Built by Design Master Solutions, the team behind Stone "
                   "Project. Thanks for watching.")], vh=760, crop=ZOOM),
]
(TMP / "list.txt").write_text("".join(f"file '{p}'\n" for p in parts))
run("ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", TMP / "list.txt",
    "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
    "-movflags", "+faststart", OUT)
print(OUT, round(dur(OUT), 1), "s")
