// RemnantFitPickerUI — the remnant picker: three big cards in a row behind the cabinet.
// Each card is a UIKit Button (name, color swatch, size in cm and in). Passive view: draws the
// static sample list from RemnantFitData and emits onPick(index); show()/hide() toggle it.
// Card SceneObjects are named "RemnantCard0..2" (LEAF scenarios look them up by name).

import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {REMNANTS, sizeLabelCm, sizeLabelIn} from "./RemnantFitData"
import {addImage, addText, buttonFaceColumn, obj} from "./RemnantFitSharedUI"

const ICON_SWATCH = requireAsset("../Icons/square.png") as Texture

@component
export class RemnantFitPickerUI extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RemnantFitPickerUI – remnant cards</span>')
  @ui.separator
  @ui.group_start("Settings")
  @input
  @hint("Card width (cm); the brief asks for 25 cm")
  @widget(new SliderWidget(15, 35, 0.5))
  cardWidthCm: number = 25
  @input
  @hint("Card height (cm)")
  @widget(new SliderWidget(10, 30, 0.5))
  cardHeightCm: number = 19
  @input
  @hint("Gap between cards (cm)")
  @widget(new SliderWidget(0, 8, 0.5))
  cardGapCm: number = 2.5
  @input
  @hint("Viewing distance used to scale text (cm)")
  @widget(new SliderWidget(60, 220, 5))
  viewDistanceCm: number = 140
  @input("vec4", "{1, 1, 1, 0.6}")
  @hint("Color of the secondary (size) lines")
  @widget(new ColorWidget())
  secondaryColor: vec4 = new vec4(1, 1, 1, 0.6)
  @ui.group_end

  private _onPick = new Event<number>()
  get onPick(): PublicApi<number> { return this._onPick.publicApi() }

  private wantVisible = false
  private pendingInits = REMNANTS.length

  onAwake() {
    this.sceneObject.createComponent("Component.Canvas")
    const row = obj(this.sceneObject, "Cards")
    const flex = row.createComponent(FlexLayout.getTypeName()) as FlexLayout
    flex.direction = FlexDirection.Row
    flex.width = -1
    flex.height = this.cardHeightCm
    flex.columnGap = this.cardGapCm
    flex.alignItems = FlexAlign.Center
    flex.justifyContent = FlexJustify.Center
    REMNANTS.forEach((r, i) => this.addCard(row, i))
  }

  private addCard(row: SceneObject, index: number): void {
    const r = REMNANTS[index]
    const w = this.cardWidthCm
    const h = this.cardHeightCm
    const d = this.viewDistanceCm
    const card = obj(row, `RemnantCard${index}`)
    const btn = card.createComponent(Button.getTypeName()) as Button
    btn.size = new vec3(w, h, 1)
    const item = card.createComponent(FlexItem.getTypeName()) as FlexItem
    item.overrideWidth = w
    item.overrideHeight = h

    const face = buttonFaceColumn(card, w - 1, h - 1, 0.5)
    addText(face, "Name", r.name, "Subheadline", w - 2, 2.6, d, new vec4(1, 1, 1, 1))
    addImage(face, "Swatch", ICON_SWATCH, 5, r.color)
    addText(face, "SizeCm", sizeLabelCm(r), "Body", w - 2, 2.2, d, new vec4(1, 1, 1, 0.9))
    addText(face, "SizeIn", sizeLabelIn(r), "Caption", w - 2, 2.0, d, this.secondaryColor)

    btn.onTriggerUp.add(() => this._onPick.invoke(index))
    btn.onInitialized.add(() => {
      this.pendingInits--
      if (this.pendingInits === 0) this.sceneObject.enabled = this.wantVisible
    })
  }

  show(): void {
    this.wantVisible = true
    this.sceneObject.enabled = true
  }

  hide(): void {
    this.wantVisible = false
    if (this.pendingInits === 0) this.sceneObject.enabled = false
  }
}
