// LEAF — done criterion 2: pinching a card places that remnant flat on the cabinet top at real
// size (the 66 x 102 cm card makes a slab visibly larger than the 56 x 91 cm top).

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RemnantFitLeafInteractor, SLAB_T, slabRenderedSize, TOP_D, TOP_W, topSurfaceY} from "./RemnantFitLeafInteractor"

@component
export class PickCardPlacesSlabScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const it = new RemnantFitLeafInteractor()
    await it.placeRemnant(0) // Calacatta Quartz, 66 x 102 cm
    expect(findSceneObjectByName("Slab").enabled).toBe(true)
    expect(findSceneObjectByName("RemnantPicker").enabled).toBe(false)
    const size = slabRenderedSize()
    expect(size.x).toBeCloseTo(102, 0)
    expect(size.z).toBeCloseTo(66, 0)
    expect(size.y).toBeCloseTo(SLAB_T, 0)
    expect(size.x).toBeGreaterThan(TOP_W)
    expect(size.z).toBeGreaterThan(TOP_D)
    const slabY = findSceneObjectByName("Slab").getTransform().getWorldPosition().y
    expect(slabY).toBeCloseTo(topSurfaceY() + SLAB_T / 2, 1)
  }
}
