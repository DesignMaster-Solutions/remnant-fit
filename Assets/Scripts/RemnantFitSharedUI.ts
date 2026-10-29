// RemnantFitSharedUI — shared UIKit composition helpers + the Specs type scale for every
// RemnantFit*UI.ts module. Owns no state and no scene roots; UI modules call these to
// build their own subtree. Must not be imported by non-UI scripts (Hard Rule 3).

import {FlexLayout} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexLayout"
import {FlexItem} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexItem"
import {FlexAlign, FlexDirection, FlexJustify} from "SpectaclesUIKit.lspkg/Scripts/Components/Layout2D/Flex/FlexTypes"
import {BackPlate} from "SpectaclesUIKit.lspkg/Scripts/BackPlate"
import {Button} from "SpectaclesUIKit.lspkg/Scripts/Components/Button/Button"
import {ElementContent} from "SpectaclesUIKit.lspkg/Scripts/Components/Content/ElementContent"

const imageMaterial = requireAsset("../Materials/ImageMaterial.mat") as Material

// ── Type scale (canonical: specs-build-ui references/patterns.md → Typography)
const FONT_SIZE_SCALE = 1.0
export type TextRole =
  | "Title1" | "Title2" | "HeadlineXL" | "Headline1" | "Headline2"
  | "Subheadline" | "Button" | "Callout" | "Body" | "Caption"
const TYPE_SCALE: Record<TextRole, {size: number; weight: number}> = {
  Title1: {size: 105, weight: 700}, Title2: {size: 93, weight: 700},
  HeadlineXL: {size: 62, weight: 700}, Headline1: {size: 54, weight: 700},
  Headline2: {size: 48, weight: 700}, Subheadline: {size: 41, weight: 700},
  Button: {size: 39, weight: 500}, Callout: {size: 39, weight: 700},
  Body: {size: 39, weight: 500}, Caption: {size: 38, weight: 500},
}
export function roleSize(role: TextRole, distanceCm: number = 110): number {
  return TYPE_SCALE[role].size * FONT_SIZE_SCALE * (distanceCm / 110)
}
export function applyTextRole(t: Text, role: TextRole, distanceCm: number = 110): void {
  t.size = roleSize(role, distanceCm)
  ;(t as Text & {weight?: number}).weight = TYPE_SCALE[role].weight
}

// Content on a Button face is lifted forward so the face doesn't occlude it.
const BUTTON_LABEL_Z = 0.08

export function obj(parent: SceneObject, name: string, position?: vec3): SceneObject {
  const so = global.scene.createSceneObject(name)
  so.setParent(parent)
  if (position) so.getTransform().setLocalPosition(position)
  return so
}

/** Static panel: BackPlate on `host`, a Content child (+0.6 z) with a column FlexLayout the plate hugs. */
export function backPlateColumn(host: SceneObject, widthCm: number, gap: number, pad: number): SceneObject {
  const plate = host.createComponent(BackPlate.getTypeName()) as BackPlate
  const content = obj(host, "Content", new vec3(0, 0, 0.6))
  const flex = content.createComponent(FlexLayout.getTypeName()) as FlexLayout
  flex.width = widthCm
  flex.height = -1
  flex.direction = FlexDirection.Column
  flex.justifyContent = FlexJustify.Start
  flex.alignItems = FlexAlign.Center
  flex.rowGap = gap
  flex.paddingTop = pad
  flex.paddingBottom = pad
  flex.paddingLeft = pad
  flex.paddingRight = pad
  flex.onLayoutComplete.add((r) => {
    plate.size = new vec2(r.containerWidth, r.containerHeight)
  })
  return content
}

/** Row/column container that is itself a FlexItem of its parent layout. */
export function flexBox(parent: SceneObject, name: string, direction: FlexDirection, w: number, h: number,
    gap: number): SceneObject {
  const so = obj(parent, name)
  const f = so.createComponent(FlexLayout.getTypeName()) as FlexLayout
  f.direction = direction
  f.width = w
  f.height = h
  f.alignItems = FlexAlign.Center
  f.justifyContent = FlexJustify.Center
  if (direction === FlexDirection.Row) f.columnGap = gap
  else f.rowGap = gap
  const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
  item.overrideWidth = w
  item.overrideHeight = h
  return so
}

/** Raw Text sized to a fixed rect, registered as a FlexItem. */
export function addText(parent: SceneObject, name: string, text: string, role: TextRole, widthCm: number,
    heightCm: number, distanceCm: number, color: vec4): Text {
  const so = obj(parent, name)
  const t = so.createComponent("Component.Text") as Text
  t.text = text
  t.depthTest = true
  applyTextRole(t, role, distanceCm)
  t.textFill.color = color
  t.horizontalAlignment = HorizontalAlignment.Center
  t.verticalAlignment = VerticalAlignment.Center
  t.horizontalOverflow = HorizontalOverflow.Overflow
  t.verticalOverflow = VerticalOverflow.Overflow
  t.layoutRect = Rect.create(-widthCm / 2, widthCm / 2, -heightCm / 2, heightCm / 2)
  const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
  item.overrideWidth = widthCm
  item.overrideHeight = heightCm
  return t
}

/** Icon image (cloned ImageMaterial), optionally tinted, registered as a FlexItem. */
export function addImage(parent: SceneObject, name: string, texture: Texture, sizeCm: number, tint?: vec4): Image {
  const so = obj(parent, name)
  const img = so.createComponent("Component.Image") as Image
  const mat = imageMaterial.clone()
  mat.mainPass.baseTex = texture
  mat.mainPass.depthTest = true
  mat.mainPass.depthWrite = false
  if (tint) mat.mainPass.baseColor = tint
  img.clearMaterials()
  img.addMaterial(mat)
  so.getTransform().setLocalScale(new vec3(sizeCm, sizeCm, 1))
  const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
  item.overrideWidth = sizeCm
  item.overrideHeight = sizeCm
  return img
}

/** UIKit Button whose whole face is one ElementContent (icon + label) — the sole-child case (R1). */
export function addIconButton(parent: SceneObject, name: string, label: string, icon: Texture | null,
    w: number, h: number, distanceCm: number): Button {
  const so = obj(parent, name)
  const btn = so.createComponent(Button.getTypeName()) as Button
  btn.size = new vec3(w, h, 1)
  const ec = so.createComponent(ElementContent.getTypeName()) as ElementContent
  ec.text = label
  ec.textSize = roleSize("Button", distanceCm)
  if (icon) {
    ec.leadingIcon = icon
    ec.leadingIconSize = h * 0.55
    ec.spacing = 0.6
  }
  const item = so.createComponent(FlexItem.getTypeName()) as FlexItem
  item.overrideWidth = w
  item.overrideHeight = h
  return btn
}

/** Container placed ON a Button face (lifted forward), holding a column of content. */
export function buttonFaceColumn(button: SceneObject, w: number, h: number, gap: number): SceneObject {
  const face = obj(button, "Face", new vec3(0, 0, BUTTON_LABEL_Z))
  const f = face.createComponent(FlexLayout.getTypeName()) as FlexLayout
  f.direction = FlexDirection.Column
  f.width = w
  f.height = h
  f.alignItems = FlexAlign.Center
  f.justifyContent = FlexJustify.Center
  f.rowGap = gap
  return face
}
