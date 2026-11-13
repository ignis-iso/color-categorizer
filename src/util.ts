/** Normaliza o nome: minúsculas, sem acentos, espaços aparados. */
export function normalize(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cor estável por categoria para o contorno/legenda do resultado. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const N = 16;

/** Células usadas conforme o tamanho: 256 = todas, 128 = xadrez, 64 = grade 8x8 espaçada (inclui as bordas). */
export function sampleIndices(size: number): number[] {
  const all = Array.from({ length: N * N }, (_, i) => i);
  if (size >= 256) return all;
  if (size >= 128) return all.filter((i) => (Math.floor(i / N) + (i % N)) % 2 === 0);
  const pts = Array.from({ length: 8 }, (_, k) => Math.round((k * (N - 1)) / 7));
  return all.filter((i) => pts.includes(Math.floor(i / N)) && pts.includes(i % N));
}

/**
 * Ordem do teste: primeiro as cores da borda da grade (as mais "puras", fáceis de nomear),
 * em ordem aleatória; depois todas as demais, também aleatórias.
 */
export function startOrder(size: number): number[] {
  const cells = sampleIndices(size);
  const isOuter = (i: number) => {
    const r = Math.floor(i / N), c = i % N;
    return r === 0 || c === 0 || r === N - 1 || c === N - 1;
  };
  return [...shuffle(cells.filter(isOuter)), ...shuffle(cells.filter((i) => !isOuter(i)))];
}

/** Grade completa: células não testadas herdam a categoria da célula testada mais próxima. */
export function fillGrid(labels: Record<number, string>): string[] {
  const known = Object.keys(labels).map(Number);
  return Array.from({ length: N * N }, (_, i) => {
    if (labels[i] !== undefined) return labels[i];
    if (known.length === 0) return "?";
    const r = Math.floor(i / N), c = i % N;
    let best = known[0], bd = Infinity;
    for (const k of known) {
      const d = (Math.floor(k / N) - r) ** 2 + ((k % N) - c) ** 2;
      if (d < bd) { bd = d; best = k; }
    }
    return labels[best];
  });
}
