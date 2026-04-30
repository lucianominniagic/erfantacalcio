export const autosizeOptions = {
  includeHeaders: true,
  includeOutliers: true,
  expand: true,
}

export function createSkeletonRows(count: number): { id: string }[] {
  return Array.from({ length: count }, (_, i) => ({ id: `skeleton-${i}` }))
}
