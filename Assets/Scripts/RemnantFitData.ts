// RemnantFitData — the hard-coded sample remnants from devpost/design-brief.md (out of scope:
// live inventory). Pure data, no scene access. Read by the picker (to draw cards) and Main.
// depth = front-to-back when placed unrotated, width = left-to-right, both in cm.

export interface Remnant {
  name: string
  colorName: string
  color: vec4 // light stone tone; never dark (additive display)
  depthCm: number
  widthCm: number
  depthIn: number
  widthIn: number
}

export const REMNANTS: Remnant[] = [
  {name: "Calacatta Quartz", colorName: "warm white, gray veins", color: new vec4(0.96, 0.94, 0.9, 1),
    depthCm: 66, widthCm: 102, depthIn: 26, widthIn: 40},
  {name: "Taj Mahal Quartzite", colorName: "cream / beige", color: new vec4(0.93, 0.85, 0.7, 1),
    depthCm: 58, widthCm: 89, depthIn: 23, widthIn: 35},
  {name: "River White Granite", colorName: "white, burgundy flecks", color: new vec4(0.94, 0.9, 0.9, 1),
    depthCm: 61, widthCm: 122, depthIn: 24, widthIn: 48},
]

export function sizeLabelCm(r: Remnant): string {
  return `${r.depthCm} x ${r.widthCm} cm`
}

export function sizeLabelIn(r: Remnant): string {
  return `${r.depthIn} x ${r.widthIn} in`
}
