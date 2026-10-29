// RemnantFitSetTopUI — the stand-in "Set top here" prompt over the vanity cabinet.
// Passive view: emits onSetTop when pressed; show()/hide() toggle it. Holds no fit state.
// Expects no @input refs; tunables only.

import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {Billboard} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Billboard/Billboard"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {addIconButton, addText, backPlateColumn} from "./RemnantFitSharedUI"

const ICON_TOP = requireAsset("../Icons/countertops.png") as Texture

@component
export class RemnantFitSetTopUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RemnantFitSetTopUI – "Set top here" prompt</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Hint line shown above the button")
  hintText: string = "Stand-in cabinet: mark its top"
  @input
  @hint("Button label")
  buttonLabel: string = "Set top here"
  @input
  @hint("Viewing distance used to scale text (cm)")
  @widget(new SliderWidget(40, 200, 5))
  viewDistanceCm: number = 80
  @ui.group_end

  private _onSetTop = new Event<void>()
  get onSetTop(): PublicApi<void> { return this._onSetTop.publicApi() }

  private wantVisible = true
  private ready = false

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    this.sceneObject.createComponent(Billboard.getTypeName())
    const content = backPlateColumn(this.sceneObject, 30, 1.2, 1.6)
    addText(content, "SetTopHint", this.hintText, "Body", 26, 2.4, this.viewDistanceCm, new vec4(1, 1, 1, 0.75))
    const btn: Button = addIconButton(content, "SetTopButton", this.buttonLabel, ICON_TOP, 24, 6, this.viewDistanceCm)
    btn.onTriggerUp.add(() => this._onSetTop.invoke())
    btn.onInitialized.add(() => {
      this.ready = true
      this.sceneObject.enabled = this.wantVisible
    })
  }

  show(): void {
    this.wantVisible = true
    this.sceneObject.enabled = true
  }

  hide(): void {
    this.wantVisible = false
    if (this.ready) this.sceneObject.enabled = false
  }
}
