// RemnantFitSlabController — the remnant slab on the cabinet top. Owns the slab's size,
// rotation and drag: SIK Interactable drag events slide it on the top plane (where the hand ray
// meets the top), with the slab re-seated flat on the top surface every frame. Emits onMoved when its footprint changes.
// @inputs: visual (child box, scaled to slab size — the root stays unit-scale and owns the
// collider, Hard Rule 6). Must not touch UI or fit math.

import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {Interactor} from "SpectaclesInteractionKit.lspkg/Core/Interactor/Interactor"
import Event, {PublicApi} from "SpectaclesInteractionKit.lspkg/Utils/Event"
import {footprint, Footprint} from "./RemnantFitFit"

const MIN_OVERLAP_CM = 10

@component
export class RemnantFitSlabController extends BaseScriptComponent {
  @ui.label('<span style="color: #60A5FA;">RemnantFitSlabController – draggable slab</span>')
  @ui.separator
  @ui.group_start("References")
  @input
  @hint("Child SceneObject with the slab box RenderMeshVisual (scaled to the slab size)")
  visual!: SceneObject
  @ui.group_end
  @ui.group_start("Settings")
  @input
  @hint("Slab thickness (cm); the brief asks for 3 cm")
  @widget(new SliderWidget(1, 6, 0.5))
  thicknessCm: number = 3
  @input
  @hint("Box mesh edge length at scale 1 (cm) — BoxMeshPreset is a 1 cm cube")
  boxMeshSizeCm: number = 1
  @input("vec4", "{0.72, 0.86, 1, 1}")
  @hint("Tint mixed into the stone while the slab is aimed at (hover highlight)")
  @widget(new ColorWidget())
  hoverTint: vec4 = new vec4(0.72, 0.86, 1, 1)
  @ui.group_end
  @ui.group_start("Debug")
  @input
  @hint("Draw the slab collider wireframe")
  debugColliders: boolean = false
  @ui.group_end

  private _onMoved = new Event<void>()
  get onMoved(): PublicApi<void> { return this._onMoved.publicApi() }

  private widthCm = 100
  private depthCm = 60
  private rotated = false
  private surfaceY = 0
  private limit: Footprint = {minX: -1e4, maxX: 1e4, minZ: -1e4, maxZ: 1e4}
  private collider!: ColliderComponent
  private shape!: BoxShape
  private material!: Material
  private last = new vec3(0, 0, 0)
  private yaw = 0
  private stoneColor = new vec4(1, 1, 1, 1)
  private dragFrom: vec3 | null = null // slab position at drag start
  private hitFrom: vec3 | null = null // hand ray on the top plane at drag start

  onAwake() {
    if (isNull(this.visual)) {
      print("RemnantFitSlabController: 'visual' @input not wired")
      return
    }
    const rmv = this.visual.getComponent("Component.RenderMeshVisual") as RenderMeshVisual
    this.material = rmv.mainMaterial.clone()
    rmv.mainMaterial = this.material

    this.collider = this.sceneObject.createComponent("Physics.ColliderComponent") as ColliderComponent
    this.shape = Shape.createBoxShape()
    this.collider.shape = this.shape
    this.collider.debugDrawEnabled = this.debugColliders
    const interactable = this.sceneObject.createComponent(Interactable.getTypeName()) as Interactable

    this.createEvent("OnStartEvent").bind(() => {
      interactable.onHoverEnter.add(() => this.setHover(true))
      interactable.onHoverExit.add(() => this.setHover(false))
      // InteractableManipulation with Y locked drifted the slab ~45 cm in depth on a sideways
      // drag; following the ray's hit on the top plane moves it exactly with the hand.
      interactable.onDragStart.add((e) => {
        this.hitFrom = this.rayOnTop(e.interactor)
        this.dragFrom = this.sceneObject.getTransform().getWorldPosition()
      })
      interactable.onDragUpdate.add((e) => this.dragTo(e.interactor))
      interactable.onDragEnd.add(() => { this.hitFrom = null; this.dragFrom = null })
    })

    // Keep the slab flat, on the top, and in range.
    this.createEvent("LateUpdateEvent").bind(() => this.seat())
  }

  /** Lay a slab of `depthCm` x `widthCm` flat on the surface at (x, surfaceY, z), unrotated. */
  place(widthCm: number, depthCm: number, color: vec4, x: number, z: number, surfaceY: number, limit: Footprint): void {
    this.widthCm = widthCm
    this.depthCm = depthCm
    this.surfaceY = surfaceY
    this.limit = limit
    this.rotated = false
    this.yaw = 0
    this.stoneColor = color
    this.setHover(false)
    this.applySize()
    this.sceneObject.enabled = true
    this.sceneObject.getTransform().setWorldPosition(new vec3(x, surfaceY + this.thicknessCm / 2, z))
    this.seat()
    this._onMoved.invoke()
  }

  /** Turn the slab 90 degrees about the vertical axis, in place. */
  rotate90(): void {
    this.rotated = !this.rotated
    this.yaw = this.rotated ? 90 : 0
    this.seat()
    this._onMoved.invoke()
  }

  hide(): void {
    this.sceneObject.enabled = false
  }

  get isRotated(): boolean { return this.rotated }
  get yawDegrees(): number { return this.yaw }

  /** World-space footprint on the top plane (rotation swaps the extents). */
  get footprint(): Footprint {
    const p = this.sceneObject.getTransform().getWorldPosition()
    return this.rotated ? footprint(p.x, p.z, this.depthCm, this.widthCm) : footprint(p.x, p.z, this.widthCm, this.depthCm)
  }

  /** Brief: targets highlight when aimed at — tint the stone while hovered. */
  private setHover(on: boolean): void {
    const c = this.stoneColor
    this.material.mainPass.baseColor = on
      ? new vec4((c.x + this.hoverTint.x) / 2, (c.y + this.hoverTint.y) / 2, (c.z + this.hoverTint.z) / 2, 1)
      : c
  }

  private applySize(): void {
    const s = this.boxMeshSizeCm
    this.visual.getTransform().setLocalScale(new vec3(this.widthCm / s, this.thicknessCm / s, this.depthCm / s))
    this.shape.size = new vec3(this.widthCm, this.thicknessCm, this.depthCm)
    this.collider.shape = this.shape
  }

  /** Where the interactor's ray meets the horizontal plane of the slab; null if it can't. */
  private rayOnTop(interactor: Interactor): vec3 | null {
    const o = interactor.startPoint
    const d = interactor.direction
    if (!o || !d || Math.abs(d.y) < 1e-3) return null
    const t = (this.surfaceY + this.thicknessCm - o.y) / d.y
    return t > 0 ? o.add(d.uniformScale(t)) : null
  }

  private dragTo(interactor: Interactor): void {
    const hit = this.rayOnTop(interactor)
    if (!hit || !this.hitFrom || !this.dragFrom) return
    const p = this.dragFrom.add(hit.sub(this.hitFrom))
    this.sceneObject.getTransform().setWorldPosition(new vec3(p.x, this.dragFrom.y, p.z))
    this.seat()
  }

  private seat(): void {
    if (!this.sceneObject.enabled) return
    const t = this.sceneObject.getTransform()
    const p = t.getWorldPosition()
    const halfX = (this.rotated ? this.depthCm : this.widthCm) / 2
    const halfZ = (this.rotated ? this.widthCm : this.depthCm) / 2
    // Keep at least MIN_OVERLAP_CM of slab over the top so it can't be dragged off the cabinet.
    const m = MIN_OVERLAP_CM
    const x = Math.min(Math.max(p.x, this.limit.minX - halfX + m), this.limit.maxX + halfX - m)
    const z = Math.min(Math.max(p.z, this.limit.minZ - halfZ + m), this.limit.maxZ + halfZ - m)
    const seated = new vec3(x, this.surfaceY + this.thicknessCm / 2, z)
    t.setWorldPosition(seated)
    t.setWorldRotation(quat.fromEulerAngles(0, this.yaw * MathUtils.DegToRad, 0))
    if (seated.distance(this.last) > 0.01) {
      this.last = seated
      this._onMoved.invoke()
    }
  }
}
