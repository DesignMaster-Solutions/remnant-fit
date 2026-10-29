// RemnantFitLeafInteractor — shared LEAF steps for the Remnant Fit scenarios. Drives the lens
// only through SIK interactables (UIKit Buttons + the Slab), the same path a pinch takes.
// Every helper starts from whatever state the previous scenario left (scenarios share the lens).

import {DefaultLeafInteractor} from "Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor"
import {findInteractablesByName} from "Leaf.lspkg/Interactors/InteractableUtils"
import {findSceneObjectByName, sleep} from "Leaf.lspkg/Utils/common/Utils"

// From devpost/design-brief.md: cabinet top 91 x 56 cm, slab 3 cm thick.
export const TOP_W = 91
export const TOP_D = 56
export const SLAB_T = 3

export class RemnantFitLeafInteractor extends DefaultLeafInteractor {
  async tapButton(name: string): Promise<void> {
    const target = findInteractablesByName(name, undefined, true)[0]
    if (!target) throw new Error(`Interactable "${name}" not found or not enabled`)
    await this.trigger(target)
    await sleep(400)
  }

  async dragSlab(delta: vec3, durationMs: number): Promise<void> {
    const slab = findInteractablesByName("Slab", undefined, true)[0]
    if (!slab) throw new Error(`Interactable "Slab" not found or not enabled`)
    await this.drag(slab, delta, durationMs)
    await sleep(400)
  }

  /** Get past the stand-in step: press "Set top here" unless it was already pressed. */
  async ensureTopMarked(): Promise<void> {
    if (findSceneObjectByName("SetTopPrompt").enabled) await this.tapButton("SetTopButton")
  }

  /** Put remnant `index` on the cabinet, centered, unrotated (via "Change remnant" if one is placed). */
  async placeRemnant(index: number): Promise<void> {
    await this.ensureTopMarked()
    if (findSceneObjectByName("Slab").enabled) await this.tapButton("ChangeRemnantButton")
    await this.tapButton(`RemnantCard${index}`)
  }
}

export function statusText(): Text {
  return findSceneObjectByName("FitStatus").getComponent("Component.Text") as Text
}

/** World-space size (x = width, z = depth) of the slab as rendered. */
export function slabRenderedSize(): vec3 {
  const rmv = findSceneObjectByName("SlabVisual").getComponent("Component.RenderMeshVisual") as RenderMeshVisual
  return rmv.worldAabbMax().sub(rmv.worldAabbMin())
}

export function topSurfaceY(): number {
  return findSceneObjectByName("TopSurface").getTransform().getWorldPosition().y
}
