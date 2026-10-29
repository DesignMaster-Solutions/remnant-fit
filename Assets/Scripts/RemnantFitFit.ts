// RemnantFitFit — pure fit math: does the slab footprint cover the cabinet top, by how much is
// each edge short, and how much stone is left for a backsplash. No scene access.
// Footprints are axis-aligned rectangles on the top plane in world cm (x = left/right,
// z = back(-)/front(+), the user stands on +z).

export interface Footprint {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

export interface FitResult {
  covers: boolean
  coveragePct: number
  short: {left: number; right: number; front: number; back: number}
  backsplashCm: number
}

const EPS = 0.05 // cm; float noise from dragging is not a real gap

export function footprint(centerX: number, centerZ: number, widthX: number, depthZ: number): Footprint {
  return {minX: centerX - widthX / 2, maxX: centerX + widthX / 2, minZ: centerZ - depthZ / 2, maxZ: centerZ + depthZ / 2}
}

export function evaluateFit(top: Footprint, slab: Footprint): FitResult {
  const short = {
    left: Math.max(0, slab.minX - top.minX),
    right: Math.max(0, top.maxX - slab.maxX),
    back: Math.max(0, slab.minZ - top.minZ),
    front: Math.max(0, top.maxZ - slab.maxZ),
  }
  const ox = Math.max(0, Math.min(top.maxX, slab.maxX) - Math.max(top.minX, slab.minX))
  const oz = Math.max(0, Math.min(top.maxZ, slab.maxZ) - Math.max(top.minZ, slab.minZ))
  const topArea = (top.maxX - top.minX) * (top.maxZ - top.minZ)
  const covers = short.left <= EPS && short.right <= EPS && short.back <= EPS && short.front <= EPS
  // The backsplash is a strip the full width of the top, cut from the slab's extra depth.
  const backsplashCm = covers ? (slab.maxZ - slab.minZ) - (top.maxZ - top.minZ) : 0
  return {covers, coveragePct: covers ? 100 : (100 * ox * oz) / topArea, short, backsplashCm}
}

const EDGE_PHRASE: Record<string, string> = {left: "on the left", right: "on the right", front: "at the front",
  back: "at the back"}

/** Readout line, e.g. "Covers 100% · 10 cm left for backsplash" or "Short 6 cm on the left". */
export function describeFit(fit: FitResult): string {
  if (fit.covers) return `Covers 100% · ${Math.floor(fit.backsplashCm + EPS)} cm left for backsplash`
  const parts: string[] = []
  for (const edge of ["left", "right", "back", "front"]) {
    const cm = (fit.short as Record<string, number>)[edge]
    if (cm > EPS) parts.push(`${Math.ceil(cm - EPS)} cm ${EDGE_PHRASE[edge]}`)
  }
  return `Short ${parts.join(" and ")}`
}
