// RemnantFitMain — orchestrates the Remnant Fit flow: "Set top here" → pick a remnant card →
// slab on the cabinet top → live fit readout (green covers / amber short + edge outline).
// Owns the flow state (top marked, which remnant). @inputs: the three UI modules, the slab
// controller, the cabinet top anchor and the four amber edge outlines. Draws no UI itself.

import {RemnantFitSetTopUI} from "./RemnantFitSetTopUI"
import {RemnantFitPickerUI} from "./RemnantFitPickerUI"
import {RemnantFitReadoutUI} from "./RemnantFitReadoutUI"
import {RemnantFitSlabController} from "./RemnantFitSlabController"
import {REMNANTS} from "./RemnantFitData"
import {describeFit, evaluateFit, footprint, Footprint} from "./RemnantFitFit"

// Half the readout panel's height, so its lower edge (not its center) sits readoutLiftCm up.
const READOUT_HALF_HEIGHT_CM = 6

@component
export class RemnantFitMain extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RemnantFitMain – flow orchestration</span>')
  @ui.separator
  @ui.group_start("References")
  @input
  @hint("'Set top here' prompt")
  setTopUI!: RemnantFitSetTopUI
  @input
  @hint("Remnant picker cards")
  pickerUI!: RemnantFitPickerUI
  @input
  @hint("Fit readout above the slab")
  readoutUI!: RemnantFitReadoutUI
  @input
  @hint("Slab controller on the Slab SceneObject")
  slab!: RemnantFitSlabController
  @input
  @hint("Empty anchor at the center of the cabinet top surface")
  topSurface!: SceneObject
  @input
  @hint("Amber outline along the cabinet top's left edge")
  edgeLeft!: SceneObject
  @input
  @hint("Amber outline along the right edge")
  edgeRight!: SceneObject
  @input
  @hint("Amber outline along the front edge (user side)")
  edgeFront!: SceneObject
  @input
  @hint("Amber outline along the back edge")
  edgeBack!: SceneObject
  @ui.group_end
  @ui.group_start("Settings")
  @input
  @hint("Cabinet top width, left to right (cm)")
  topWidthCm: number = 91
  @input
  @hint("Cabinet top depth, front to back (cm)")
  topDepthCm: number = 56
  @input
  @hint("Gap between the slab and the readout's lower edge (cm)")
  @widget(new SliderWidget(0, 30, 1))
  readoutLiftCm: number = 10
  @ui.group_end

  private topMarked = false
  private current = -1

  onAwake() {
    const missing = ["setTopUI", "pickerUI", "readoutUI", "slab", "topSurface", "edgeLeft", "edgeRight",
      "edgeFront", "edgeBack"].filter((k) => isNull((this as unknown as Record<string, object>)[k]))
    if (missing.length > 0) {
      print(`RemnantFitMain: @input not wired: ${missing.join(", ")}`)
      return
    }
    this.createEvent("OnStartEvent").bind(() => this.start())
  }

  private start(): void {
    this.slab.hide()
    this.showEdges(null)
    this.setTopUI.onSetTop.add(() => this.markTop())
    this.pickerUI.onPick.add((i) => this.placeRemnant(i))
    this.readoutUI.onRotate.add(() => this.slab.rotate90())
    this.readoutUI.onChangeRemnant.add(() => this.changeRemnant())
    this.slab.onMoved.add(() => this.refresh())
  }

  get isTopMarked(): boolean { return this.topMarked }
  get currentRemnant(): number { return this.current }

  private get top(): Footprint {
    const c = this.topSurface.getTransform().getWorldPosition()
    return footprint(c.x, c.z, this.topWidthCm, this.topDepthCm)
  }

  private markTop(): void {
    this.topMarked = true
    this.setTopUI.hide()
    this.pickerUI.show()
  }

  private placeRemnant(index: number): void {
    const r = REMNANTS[index]
    if (!this.topMarked || !r) return
    this.current = index
    this.pickerUI.hide()
    const c = this.topSurface.getTransform().getWorldPosition()
    this.slab.place(r.widthCm, r.depthCm, r.color, c.x, c.z, c.y, this.top)
    this.readoutUI.show()
    this.refresh()
  }

  private changeRemnant(): void {
    this.current = -1
    this.slab.hide()
    this.readoutUI.hide()
    this.showEdges(null)
    this.pickerUI.show()
  }

  private refresh(): void {
    if (this.current < 0) return
    const slabFp = this.slab.footprint
    const fit = evaluateFit(this.top, slabFp)
    this.readoutUI.setStatus(REMNANTS[this.current].name, describeFit(fit), fit.covers)
    this.showEdges(fit.covers ? null : fit.short)
    const y = this.topSurface.getTransform().getWorldPosition().y + this.slab.thicknessCm + this.readoutLiftCm +
      READOUT_HALF_HEIGHT_CM
    this.readoutUI.getSceneObject().getTransform()
      .setWorldPosition(new vec3((slabFp.minX + slabFp.maxX) / 2, y, slabFp.minZ))
  }

  private showEdges(short: {left: number; right: number; front: number; back: number} | null): void {
    const on = (cm: number | undefined) => short !== null && (cm ?? 0) > 0.05
    this.edgeLeft.enabled = on(short?.left)
    this.edgeRight.enabled = on(short?.right)
    this.edgeFront.enabled = on(short?.front)
    this.edgeBack.enabled = on(short?.back)
  }
}
