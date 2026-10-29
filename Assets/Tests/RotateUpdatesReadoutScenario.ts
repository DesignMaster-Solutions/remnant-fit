// LEAF — done criterion 5: pressing "Rotate" turns the slab 90 degrees and the readout updates.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RemnantFitLeafInteractor, slabRenderedSize, statusText} from "./RemnantFitLeafInteractor"

@component
export class RotateUpdatesReadoutScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const it = new RemnantFitLeafInteractor()
    await it.placeRemnant(0) // covers when unrotated
    const before = statusText().text
    expect(before.startsWith("Covers")).toBe(true)
    await it.tapButton("RotateButton")
    const size = slabRenderedSize()
    expect(size.x).toBeCloseTo(66, 0) // the 102 cm length now runs front-to-back
    expect(size.z).toBeCloseTo(102, 0)
    expect(Math.abs(findSceneObjectByName("Slab").getTransform().right.z)).toBeCloseTo(1, 2)
    const after = statusText().text
    expect(after).not.toBe(before)
    expect(after.startsWith("Short")).toBe(true)
  }
}
