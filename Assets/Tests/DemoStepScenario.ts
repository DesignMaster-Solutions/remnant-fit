// LEAF — demo driver (not a done criterion): the lens resets per run, so this plays the user flow
// up to step `upTo`, then hides LEAF's log overlay so the preview can be captured clean for the
// demo video. LEAF adds the drag vector every frame, so 0.3 cm over ~1 s slides the slab
// ~10 cm. Steps: 1 set top, 2 Calacatta card, 3 drag left, 4 drag back + rotate,
// 5 change remnant, 6 Taj Mahal card. `pause` (ms) > 0 = video mode: overlay hidden from the start,
// a pause before/between steps, and drags at half speed for twice as long (same distance).

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {ScenarioConfig} from "Leaf.lspkg/Scenarios/scenario/ScenarioConfig"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RemnantFitLeafInteractor} from "./RemnantFitLeafInteractor"

@component
export class DemoStepScenario extends Scenario {
  async run(config?: ScenarioConfig): Promise<void> {
    await sleep(1500)
    const upTo = Number(config?.get("upTo") ?? "6")
    const pause = Number(config?.get("pause") ?? "0")
    const slow = pause > 0 ? 2 : 1
    const it = new RemnantFitLeafInteractor()
    const overlay = findSceneObjectByName("LeafDebugUICamera")
    if (overlay && pause > 0) overlay.enabled = false
    const steps: (() => Promise<void>)[] = [
      () => it.tapButton("SetTopButton"),
      () => it.tapButton("RemnantCard0"),
      () => it.dragSlab(new vec3(Number(config?.get("dx") ?? "-0.3") / slow, 0, Number(config?.get("dz") ?? "0") / slow), 1000 * slow),
      async () => {
        await it.dragSlab(new vec3(0.3 / slow, 0, 0), 1000 * slow)
        if (pause > 0) await sleep(pause)
        await it.tapButton("RotateButton")
      },
      () => it.tapButton("ChangeRemnantButton"),
      () => it.tapButton("RemnantCard1"),
    ]
    for (const step of steps.slice(0, upTo)) {
      if (pause > 0) await sleep(pause)
      await step()
    }
    if (pause > 0) await sleep(pause)
    if (overlay) overlay.enabled = false
  }
}
