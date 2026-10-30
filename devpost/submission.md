# Devpost submission: Remnant Fit

Submitted 29/10/2026 21:09 BRT: https://devpost.com/software/remnant-fit (editable until 09/11/2026 19:00 BRT).

**Project name:** Remnant Fit

**Elevator pitch (200 chars):** See if a stone remnant fits your vanity before you drive to the stone yard: a SPECS Lens that lays the real-size slab on the cabinet and tells you, in cm, where it covers and where it falls short.

**Video:** https://youtu.be/koaLjpCnlvY

**Repo:** https://github.com/DesignMaster-Solutions/remnant-fit

**Built with:** lens-studio, specs, spectacles-interaction-kit, spectacles-ui-kit, typescript, clad, leaf, claude-code

## About the project

### Inspiration
We run Stone Project, a marketplace where countertop fabricators sell their remnants: the leftover pieces of quartz and granite from bigger jobs. Homeowners redoing a bathroom love remnants because they cost a fraction of a full slab, but every buyer asks the same question: will this piece cover my vanity top? Today that is a tape measure, numbers on paper and a drive to the yard to find out.

### What it does
Remnant Fit puts the remnant on your vanity at real size.
1. A stand-in vanity cabinet (91 x 56 cm top) stands in front of you. Press **Set top here** to mark its top.
2. Three remnant cards appear behind the cabinet (Calacatta Quartz, Taj Mahal Quartzite, River White Granite), each with name, color swatch and size in cm and inches. Pinch one.
3. The slab lies flat on the top at real size, 3 cm thick. Grab it and drag it: it slides across the top and stays on it.
4. A readout floats above the slab's back edge: green "Covers 100% · 10 cm left for backsplash", or amber "Short 11 cm on the right", with the short edges outlined in amber on the cabinet.
5. **Rotate** turns the slab 90 degrees and the readout updates. **Change remnant** brings the cards back.

### How we built it
- Planned with the Devpost Learn **plan-lens** skill pack: design brief, planning notes and five checkable done criteria are in the repo's `devpost/` folder.
- Built by an AI coding agent through **CLAD** and the **Lens Studio MCP** on the SPECS Base Template (Lens Studio 5.24.1): TypeScript components, Spectacles Interaction Kit 2.0 for every interaction, UI Kit 2.0 for the cards, buttons and readout.
- Everything in centimeters, the fit math in its own module, and only light colors: the SPECS display is additive, so a black granite would be invisible.
- Every done criterion has a **LEAF** scenario that drives the Lens through SIK in the preview. All five pass. The demo video was captured from the Lens Studio preview with a LEAF driver that plays the flow step by step.

### Challenges we ran into
Recording the demo found a real bug: SIK's InteractableManipulation with Y translation locked moved the slab about 45 cm in depth on a purely sideways drag. We made the drag test check depth first and watched it fail (48.5 cm), then made the slab follow the hand ray where it meets the plane of the top. The test passed and the other four stayed green.

### Accomplishments that we're proud of
A Lens that answers a real buying question in centimeters, with tests that prove each behavior without glasses.

### What we learned
Design for an additive display (no dark stone, no dark UI), keep the hands free (far-field pinch on cards 1.4 m away, one ray to drag), and write the done criteria first so the agent and the tests aim at the same thing.

### What's next for Remnant Fit
Real remnants from Stone Project's inventory with their photos and sizes, World Query to snap to the real vanity instead of the stand-in, and a sink cut-out check.

## Additional info
Organization / Design Master Solutions LLC / United States.
