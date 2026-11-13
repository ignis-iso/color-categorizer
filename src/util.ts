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

/**
 * Ordem do teste: primeiro as cores da borda da grade (as mais "puras", fáceis de nomear),
 * em ordem aleatória; depois todas as demais, também aleatórias.
 */
export function outerFirstOrder(size: number): number[] {
  const all = Array.from({ length: size * size }, (_, i) => i);
  const isOuter = (i: number) => {
    const r = Math.floor(i / size), c = i % size;
    return r === 0 || c === 0 || r === size - 1 || c === size - 1;
  };
  return [...shuffle(all.filter(isOuter)), ...shuffle(all.filter((i) => !isOuter(i)))];
}
