// LEAF — demo driver (not a done criterion): the lens resets per run, so this plays the user flow
// up to step `upTo`, then hides LEAF's log overlay so the preview can be captured clean for the
// demo video. LEAF adds the drag vector every frame, so 0.3 cm over ~1 s slides the slab
// ~10 cm. Steps: 1 set top, 2 Calacatta card, 3 drag left, 4 drag back + rotate,
// 5 change remnant, 6 Taj Mahal card.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {ScenarioConfig} from "Leaf.lspkg/Scenarios/scenario/ScenarioConfig"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RemnantFitLeafInteractor} from "./RemnantFitLeafInteractor"

@component
export class DemoStepScenario extends Scenario {
  async run(config?: ScenarioConfig): Promise<void> {
    await sleep(1500)
    const upTo = Number(config?.get("upTo") ?? "6")
    const it = new RemnantFitLeafInteractor()
    const steps: (() => Promise<void>)[] = [
      () => it.tapButton("SetTopButton"),
      () => it.tapButton("RemnantCard0"),
      () => it.dragSlab(new vec3(Number(config?.get("dx") ?? "-0.3"), 0, Number(config?.get("dz") ?? "0")), 1000),
      async () => {
        await it.dragSlab(new vec3(0.3, 0, 0), 1000)
        await it.tapButton("RotateButton")
      },
      () => it.tapButton("ChangeRemnantButton"),
      () => it.tapButton("RemnantCard1"),
    ]
    for (const step of steps.slice(0, upTo)) await step()
    const overlay = findSceneObjectByName("LeafDebugUICamera")
    if (overlay) overlay.enabled = false
  }
}
