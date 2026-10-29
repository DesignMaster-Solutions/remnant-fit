// LEAF — done criterion 4: when the slab covers the whole top the readout turns green and says
// how many cm are left for the backsplash; when it doesn't, it turns amber, names the short edge
// and the short edge is outlined on the cabinet.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RemnantFitLeafInteractor, statusText} from "./RemnantFitLeafInteractor"

@component
export class ReadoutCoverAndShortScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const it = new RemnantFitLeafInteractor()
    await it.placeRemnant(0) // 66 x 102 centered on 56 x 91 → covers, 10 cm of spare depth
    const covered = statusText()
    expect(covered.text).toBe("Covers 100% · 10 cm left for backsplash")
    expect(covered.textFill.color.g).toBeGreaterThan(covered.textFill.color.r)

    await it.placeRemnant(1) // 58 x 89 → 2 cm too narrow, 1 cm per side when centered
    const short = statusText()
    expect(short.text.startsWith("Short")).toBe(true)
    expect(short.text.includes("on the left")).toBe(true)
    expect(short.text.includes("on the right")).toBe(true)
    expect(short.textFill.color.r).toBeGreaterThan(short.textFill.color.b)
    expect(findSceneObjectByName("EdgeLeft").enabled).toBe(true)
    expect(findSceneObjectByName("EdgeRight").enabled).toBe(true)
    expect(findSceneObjectByName("EdgeFront").enabled).toBe(false)
  }
}
