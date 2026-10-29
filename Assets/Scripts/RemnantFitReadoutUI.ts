// RemnantFitReadoutUI — the fit readout floating above the slab's back edge: status line
// (green when the slab covers the top, amber when short), a big "Rotate" button and a small
// "Change remnant" button. Passive view: setStatus() pushes text + state in; onRotate /
// onChangeRemnant report intent out. Main owns where it floats (moves this SceneObject).

import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {Billboard} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import {FlexDirection} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {addIconButton, addText, backPlateColumn, flexBox} from "./RemnantFitSharedUI"

const ICON_ROTATE = requireAsset("../Icons/rotate_right.png") as Texture
const ICON_SWAP = requireAsset("../Icons/swap_horiz.png") as Texture

@component
export class RemnantFitReadoutUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RemnantFitReadoutUI – fit readout</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input("vec4", "{0.45, 0.95, 0.55, 1}")
  @hint("Status color when the slab covers the whole top")
  @widget(new ColorWidget())
  coversColor: vec4 = new vec4(0.45, 0.95, 0.55, 1)
  @input("vec4", "{1, 0.72, 0.25, 1}")
  @hint("Status color when the slab is short")
  @widget(new ColorWidget())
  shortColor: vec4 = new vec4(1, 0.72, 0.25, 1)
  @input
  @hint("Viewing distance used to scale text (cm)")
  @widget(new SliderWidget(40, 200, 5))
  viewDistanceCm: number = 120
  @ui.group_end

  private _onRotate = new Event<void>()
  get onRotate(): PublicApi<void> { return this._onRotate.publicApi() }
  private _onChangeRemnant = new Event<void>()
  get onChangeRemnant(): PublicApi<void> { return this._onChangeRemnant.publicApi() }

  private statusText!: Text
  private titleText!: Text
  private wantVisible = false
  private pendingInits = 2
  private covers = false

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const bb = this.sceneObject.createComponent(Billboard.getTypeName()) as Billboard
    bb.xAxisEnabled = true
    const d = this.viewDistanceCm
    const content = backPlateColumn(this.sceneObject, 36, 1.0, 1.4)
    this.titleText = addText(content, "RemnantTitle", "River White Granite", "Caption", 32, 2.0, d,
      new vec4(1, 1, 1, 0.7))
    this.statusText = addText(content, "FitStatus", "Covers 100% · 18 cm left for backsplash", "Subheadline",
      34, 2.6, d, this.coversColor)
    const row = flexBox(content, "Actions", FlexDirection.Row, 33, 4.6, 1.5)
    const rotate: Button = addIconButton(row, "RotateButton", "Rotate", ICON_ROTATE, 14, 4.6, d)
    const change: Button = addIconButton(row, "ChangeRemnantButton", "Change remnant", ICON_SWAP, 17, 3.4, d)
    rotate.onTriggerUp.add(() => this._onRotate.invoke())
    change.onTriggerUp.add(() => this._onChangeRemnant.invoke())
    for (const b of [rotate, change]) {
      b.onInitialized.add(() => {
        this.pendingInits--
        if (this.pendingInits === 0) this.sceneObject.enabled = this.wantVisible
      })
    }
  }

  /** Push the latest fit result in. `covers` picks green vs amber. */
  setStatus(title: string, message: string, covers: boolean): void {
    this.covers = covers
    if (!this.statusText) return
    this.titleText.text = title
    this.statusText.text = message
    this.statusText.textFill.color = covers ? this.coversColor : this.shortColor
  }

  get statusMessage(): string { return this.statusText ? this.statusText.text : "" }
  get isCovering(): boolean { return this.covers }

  show(): void {
    this.wantVisible = true
    this.sceneObject.enabled = true
  }

  hide(): void {
    this.wantVisible = false
    if (this.pendingInits === 0) this.sceneObject.enabled = false
  }
}
