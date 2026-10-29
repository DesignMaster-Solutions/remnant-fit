// LEAF — done criterion 3: dragging the slab moves it across the top and it stays flat on the
// top surface.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RemnantFitLeafInteractor, SLAB_T, topSurfaceY} from "./RemnantFitLeafInteractor"

@component
export class DragSlabStaysFlatScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const it = new RemnantFitLeafInteractor()
    await it.placeRemnant(2) // River White Granite
    const t = findSceneObjectByName("Slab").getTransform()
    const before = t.getWorldPosition()
    await it.dragSlab(new vec3(-0.3, 0, 0), 800)
    const after = t.getWorldPosition()
    expect(Math.abs(after.x - before.x)).toBeGreaterThan(3)
    expect(Math.abs(after.z - before.z)).toBeLessThan(5) // a sideways drag must not jump in depth
    expect(after.y).toBeCloseTo(topSurfaceY() + SLAB_T / 2, 1)
    expect(t.up.y).toBeCloseTo(1, 2)
  }
}
