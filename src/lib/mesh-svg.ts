// The warped grid of LZ.Band, built with the same math as the design system bundle.
// Rendered as a static SVG (works without JS); src/scripts/mesh.ts animates it on pointer move.

export const MESH_W = 1100;
export const MESH_H = 140;

export const meshPaths: string[] = (() => {
  const paths: string[] = [];
  const rows = 16, cols = 40;
  const line = (pts: number[][]) => pts.map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  for (let r = 0; r <= rows; r++) {
    const y0 = (r * MESH_H) / rows, row: number[][] = [];
    for (let a = 0; a <= 44; a++) {
      const x = (a * MESH_W) / 44;
      row.push([x, y0 + 5 * Math.sin((x / MESH_W) * Math.PI * 3 + r * 0.35) * Math.sin((Math.PI * r) / rows + 0.3)]);
    }
    paths.push(line(row));
  }
  for (let c = 0; c <= cols; c++) {
    const x0 = (c * MESH_W) / cols, col: number[][] = [];
    for (let b = 0; b <= 12; b++) {
      const y = (b * MESH_H) / 12;
      const bend = 16 * Math.sin((y / MESH_H) * Math.PI + (x0 / MESH_W) * Math.PI * 2.2);
      col.push([x0 + bend * Math.sin((x0 / MESH_W) * Math.PI), y]);
    }
    paths.push(line(col));
  }
  return paths;
})();

export function meshSvg(cls: string): string {
  return `<svg class="${cls}" viewBox="0 0 ${MESH_W} ${MESH_H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">${meshPaths.map((d) => `<path d="${d}" vector-effect="non-scaling-stroke"></path>`).join('')}</svg>`;
}
