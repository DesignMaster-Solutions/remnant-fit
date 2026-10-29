// LEAF — done criterion 1: pressing "Set top here" shows the three remnant cards behind the cabinet.
// Needs a fresh preview: the prompt only exists before it is pressed.

import {Scenario} from "Leaf.lspkg/Scenarios/scenario/Scenario"
import {expect} from "Leaf.lspkg/Utils/common/Expect"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"
import {RemnantFitLeafInteractor, TOP_D} from "./RemnantFitLeafInteractor"

@component
export class SetTopShowsCardsScenario extends Scenario {
  async run(): Promise<void> {
    await sleep(1500)
    const it = new RemnantFitLeafInteractor()
    expect(findSceneObjectByName("SetTopPrompt").enabled).toBe(true)
    expect(findSceneObjectByName("RemnantPicker").enabled).toBe(false)
    await it.tapButton("SetTopButton")
    expect(findSceneObjectByName("SetTopPrompt").enabled).toBe(false)
    expect(findSceneObjectByName("RemnantPicker").enabled).toBe(true)
    for (const i of [0, 1, 2]) {
      expect(findInteractablesByName(`RemnantCard${i}`, undefined, true).length).toBe(1)
    }
    // "behind the cabinet": the cards are farther away (more negative z) than the top's back edge
    const cardsZ = findSceneObjectByName("RemnantPicker").getTransform().getWorldPosition().z
    const topZ = findSceneObjectByName("TopSurface").getTransform().getWorldPosition().z
    expect(cardsZ).toBeLessThan(topZ - TOP_D / 2)
  }
}
