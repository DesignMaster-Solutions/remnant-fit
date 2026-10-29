import {scenariosIndex} from "Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator"
import {ScenarioMetadata} from "Leaf.lspkg/Scenarios/scenario/ScenarioMetadata"
import {SetTopShowsCardsScenario} from "./SetTopShowsCardsScenario"
import {PickCardPlacesSlabScenario} from "./PickCardPlacesSlabScenario"
import {DragSlabStaysFlatScenario} from "./DragSlabStaysFlatScenario"
import {ReadoutCoverAndShortScenario} from "./ReadoutCoverAndShortScenario"
import {RotateUpdatesReadoutScenario} from "./RotateUpdatesReadoutScenario"
import {DemoStepScenario} from "./DemoStepScenario"

// Registers one scenario per done criterion (devpost/design-brief.md, "Done criteria" 1-5).
@component
export class LeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex: ScenarioMetadata[] = [
    {id: "c1-set-top-shows-cards", typename: SetTopShowsCardsScenario.getTypeName()},
    {id: "c2-pick-card-places-slab", typename: PickCardPlacesSlabScenario.getTypeName()},
    {id: "c3-drag-slab-stays-flat", typename: DragSlabStaysFlatScenario.getTypeName()},
    {id: "c4-readout-cover-and-short", typename: ReadoutCoverAndShortScenario.getTypeName()},
    {id: "c5-rotate-updates-readout", typename: RotateUpdatesReadoutScenario.getTypeName()},
    {id: "demo-step", typename: DemoStepScenario.getTypeName(), parameters: {upTo: "6", dx: "-0.3", dz: "0"}},
  ]
}
