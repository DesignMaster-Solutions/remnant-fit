# Remnant Fit

A Lens for SPECS that puts a real-size countertop remnant on your vanity, so you can see if it fits before you drive to the stone yard.

Built for [Learn AR with SPECS](https://learn-specs.devpost.com/) by Design Master Solutions LLC, the team behind Stone Project (Remnant Finder), a marketplace for fabricators' stone remnants.

- `devpost/design-brief.md`: the design brief written with the Devpost Learn `plan-lens` skill pack.
- `devpost/planning-notes.md`: why this idea and the decisions taken while planning.
- The Lens Studio project (Lens Studio 5.24.1, SPECS Base Template, built by CLAD through the Lens Studio MCP).

## How it works

1. A stand-in vanity cabinet (91 x 56 cm top, 86 cm high, light wood) stands 0.9 m in front of you. Press **Set top here** to mark its top.
2. Three remnant cards appear behind the cabinet (Calacatta Quartz, Taj Mahal Quartzite, River White Granite), each with name, color swatch and size in cm and inches. Pinch one.
3. The remnant lies flat on the cabinet top at real size (3 cm thick). Grab and drag it: it slides across the top and stays flat on it. It tints light blue while you aim at it.
4. A readout floats above the slab's back edge: green "Covers 100% · 10 cm left for backsplash" when the slab covers the whole top, amber "Short 1 cm on the left and 1 cm on the right" when it doesn't, with the short edges outlined in amber on the cabinet.
5. **Rotate** turns the slab 90 degrees and the readout updates. **Change remnant** brings the cards back.

Everything is in centimeters, light colors only (the SPECS display is additive), UI built with UI Kit and every interaction through SIK, so it runs with the mouse in Interactive Preview and with LEAF.

## Status (29/10/2026)

Runs in Lens Studio's preview (SPECS 27 device, Interactive). No SPECS glasses needed.

LEAF scenarios (`Assets/Tests/`, registered in `LeafIndex`, run in the Preview with the LEAF panel):

| Done criterion (design brief) | LEAF scenario | Result |
|---|---|---|
| 1. "Set top here" shows the three cards behind the cabinet | `c1-set-top-shows-cards` | PASS |
| 2. Pinching a card places the remnant flat at real size (66 x 102 slab larger than the 56 x 91 top) | `c2-pick-card-places-slab` | PASS |
| 3. Dragging moves the slab across the top and it stays flat on it | `c3-drag-slab-stays-flat` | PASS |
| 4. Covers → green + cm left for backsplash; short → amber + names the short edge | `c4-readout-cover-and-short` | PASS |
| 5. "Rotate" turns the slab 90 degrees and the readout updates | `c5-rotate-updates-readout` | PASS |

All five done criteria have a test and all five pass. The tests were also seen failing: with the readout text deliberately broken, `c4` failed with `Expected "Covers 100% · 10 cm left for backsplash" - Received "... left for splash"`, then passed again once restored.

Not covered by a test: the light-blue hover highlight on the slab, and reachability with the IK interactor (the cards sit 1.4 m away by design, so they are pinched with the far-field ray, not a direct poke).

Logic proven: fit math, real-size placement, flat drag, rotation, readout colors and edge outlines. Feel unproven: whether a 3 cm slab at 0.9 m reads clearly on the additive display, and how the cards feel at that distance on real glasses.

## Project layout

- `Assets/Scripts/RemnantFitMain.ts` flow (set top → pick → place → readout), `RemnantFitSlabController.ts` slab drag/rotate, `RemnantFitFit.ts` fit math, `RemnantFitData.ts` the three sample remnants.
- `Assets/Scripts/RemnantFit*UI.ts` UI Kit modules: set-top prompt, picker cards, fit readout.
- `Assets/Tests/` LEAF scenarios and `LeafIndex`.
- Packages: SpectaclesInteractionKit 2.0, SpectaclesUIKit 2.0, Leaf 2.0.2 (the LEAF line that matches SIK 2.0).

License: MIT
