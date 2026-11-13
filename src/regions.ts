import { GRID_SIZE } from "./colors.ts";
const N = GRID_SIZE;

export interface Region {
  name: string;
  size: number;
  r: number;
  c: number;
  width: number; // largura em células do retângulo envolvente
}

const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

/** Regiões = componentes conexos (8 vizinhos) de cada categoria; cada uma ganha um rótulo. */
export function findRegions(grid: string[]): Region[] {
  const seen = new Array<boolean>(grid.length).fill(false);
  const regions: Region[] = [];
  for (let s = 0; s < grid.length; s++) {
    if (seen[s]) continue;
    const name = grid[s];
    const stack = [s];
    const cells: number[] = [];
    seen[s] = true;
    while (stack.length) {
      const cur = stack.pop()!;
      cells.push(cur);
      const r = Math.floor(cur / N), c = cur % N;
      for (const [dr, dc] of DIRS8) {
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        const n = rr * N + cc;
        if (!seen[n] && grid[n] === name) {
          seen[n] = true;
          stack.push(n);
        }
      }
    }
    const mr = cells.reduce((a, x) => a + Math.floor(x / N), 0) / cells.length;
    const mc = cells.reduce((a, x) => a + (x % N), 0) / cells.length;
    let pick = cells[0], d = Infinity;
    for (const x of cells) {
      const dd = (Math.floor(x / N) - mr) ** 2 + ((x % N) - mc) ** 2;
      if (dd < d) { d = dd; pick = x; }
    }
    const cols = cells.map((x) => x % N);
    regions.push({
      name,
      size: cells.length,
      r: Math.floor(pick / N),
      c: pick % N,
      width: Math.max(...cols) - Math.min(...cols) + 1,
    });
  }
  return regions;
}

/**
 * Ligações diagonais necessárias: pares da mesma categoria que só se tocam pela quina
 * E que ainda não estão conectados (por lados) em outro lugar. Se já fazem parte do
 * mesmo bloco contínuo, a ligação seria redundante e não é desenhada.
 */
export function diagonalLinks(grid: string[]) {
  const parent = Array.from({ length: grid.length }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (a: number, b: number) => { parent[find(a)] = find(b); };
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const i = r * N + c;
      if (c + 1 < N && grid[i] === grid[i + 1]) union(i, i + 1);
      if (r + 1 < N && grid[i] === grid[i + N]) union(i, i + N);
    }
  }
  const links: { r1: number; c1: number; r2: number; c2: number }[] = [];
  for (let r = 0; r + 1 < N; r++) {
    for (let c = 0; c < N; c++) {
      const a = grid[r * N + c];
      for (const dc of [1, -1]) {
        const c2 = c + dc;
        if (c2 < 0 || c2 >= N) continue;
        if (grid[(r + 1) * N + c2] !== a) continue;
        if (grid[r * N + c2] === a || grid[(r + 1) * N + c] === a) continue;
        const i1 = r * N + c, i2 = (r + 1) * N + c2;
        if (find(i1) === find(i2)) continue;
        union(i1, i2);
        links.push({ r1: r, c1: c, r2: r + 1, c2 });
      }
    }
  }
  return links;
}

