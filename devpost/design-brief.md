---
status: approved
---

# Design brief: Remnant Fit

<!-- Filled in by plan-lens from the interview. Values the team didn't choose are marked (default). -->

## The one spatial moment
I'm standing at the bathroom vanity I want to re-top, hands free, looking down at the cabinet. A real-size stone remnant slab sits on top of it, and I can slide and turn it until I see whether it covers the top with enough left over for the backsplash, before I drive to the fabricator's yard.

## Why it belongs on glasses
- Uses: draws in the world (a real-size slab on the real cabinet), leaves your body free (tape measure in one hand, nothing to hold up).
- Why it's better than the phone version: on a phone I hold the phone, squint at a 2D photo of a slab and do the math with a tape measure. Here the slab is at 1:1 scale, where it will live, and I can walk around it and look at the overhang from the side like an installer would.

## Product or overlay
- Type: overlay: it responds to a real cabinet top.
- What the real version would sense: the cabinet top surface and its size.
- Stand-in for the preview: a virtual vanity cabinet at real size (91 x 56 cm top, 86 cm high (default), light wood color) placed 0.9 m in front of the user, with a big "Set top here" button that marks it as found. Everything after that is real logic.

## Where things live
- Where the user is looking during the main task: down at the cabinet top, about 0.9 m ahead and 0.8 m below eye level.
- Vanity cabinet (stand-in): 0.9 m in front of the user at start, on the floor, 91 x 56 cm top.
- Remnant slab: lies flat on the cabinet top at real size, 3 cm thick, light stone color (never black, the display is additive).
- Fit readout: a small light label floating 10 cm above the back edge of the slab: "Covers 100% · 18 cm left for backsplash" or "Short 6 cm on the left".
- Remnant picker: three big cards in a row, 25 cm wide each, standing 20 cm behind the cabinet at eye level minus 20 cm, showing name, color swatch and size in inches and cm.

## Hands and input
- Pick a remnant: pinch a card.
- Move the slab: grab and drag it across the cabinet top (stays flat, snaps to the top surface).
- Turn the slab 90 degrees: one big "Rotate" button on the readout label.
- Targets are big and highlight when aimed at.
- Voice: none.

## When things show
- Picker cards: show at start and after "Change remnant"; hide once a remnant is placed.
- Fit readout: shows only while a slab is on the cabinet; turns green when the slab covers the whole top, amber when it is short, with the short edge outlined in amber on the cabinet.
- "Change remnant": a small button under the readout.
- If something needs attention out of view: none (everything is inside the 0.9 m view).

## Done criteria
Each one can be checked in Lens Studio's preview.
1. Pressing "Set top here" shows the three remnant cards behind the cabinet.
2. Pinching a card places that remnant flat on the cabinet top at real size (the 66 x 102 cm card makes a slab visibly larger than the 56 x 91 cm top).
3. Dragging the slab moves it across the top and it stays flat on the top surface.
4. When the slab covers the whole top the readout turns green and says how many cm are left for the backsplash; when it doesn't, the readout turns amber and names the short edge.
5. Pressing "Rotate" turns the slab 90 degrees and the readout updates.

## Out of scope
- Recognizing a real cabinet or measuring a real room.
- Live inventory from a fabricator (the three remnants are hard-coded sample data).
- Prices, ordering, cut lines for a sink.

## Risks and open questions
- The cabinet is a stand-in; on real glasses the slab would need real surface detection. Feel unproven: whether a 3 cm slab at 0.9 m reads clearly on the additive display.

## Sample data (hard-coded)
| Remnant | Color | Size |
|---|---|---|
| Calacatta Quartz | warm white with gray veins | 66 x 102 cm (26 x 40 in) |
| Taj Mahal Quartzite | cream / beige | 58 x 89 cm (23 x 35 in) |
| River White Granite | white with burgundy flecks | 61 x 122 cm (24 x 48 in) |

## Build notes for CLAD
- Build for SPECS so it runs and can be demonstrated in Lens Studio's preview. No SPECS device is available.
- Use Spectacles Interaction Kit (SIK) and UI Kit for all interactions, so they work with the mouse in Interactive Preview and with LEAF.
- Build any stand-in exactly as described above, and keep it obvious in the scene.
- Use real-world scale in centimeters. Keep content inside the user's view during the main task.
- The display is additive: black renders as transparent. Don't rely on black or very dark content to be seen; keep text light and readable from where the user stands.
- Get the basic flow working first, then add detail.
- Write LEAF scenarios for each done criterion, run them in preview, and report which pass. Say which criteria have no test.
- Don't record, identify, or follow people.

## After the build: judge it
1. **Does it work?** Ask the agent which LEAF tests passed and which done criteria have no test.
2. **Walk around it.** Interactive Preview: WASD to move, Q and E down and up, right-drag to look around. Clicking acts as a pinch.
3. **Ask the three questions.** Does it use what I'm looking at? Does it put something in my space, where it belongs? Does it free my hands or let me keep my eyes up? Would it be just as good on a phone?
4. **Check comfort.** Everything in view during the task, controls within reach, text readable, things show when needed.
5. **Label what you know.** "logic proven" vs "feel unproven".
6. **Fix with design notes, not code.**
7. **Submit.** Video under 3 minutes, public on YouTube; public repo with the Lens Studio project and this `devpost/` folder.
