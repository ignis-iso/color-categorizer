export type Mode = "free" | "grid" | "rgb" | "paint" | "rainbow";
export const MODES: Mode[] = ["free", "grid", "rgb", "paint", "rainbow"];

/** Modos com um conjunto fixo de categorias. */
export const isFixed = (m: Mode) => m === "rgb" || m === "paint" || m === "rainbow";
export type Size = 256 | 128 | 64;
export const SIZES: Size[] = [256, 128, 64];

/** Cores de referência de cada categoria fixa (chave "@x" é guardada no save). */
export const CAT_COLORS: Record<string, string> = {
  "@red": "#e53935",
  "@orange": "#fb8c00",
  "@yellow": "#fbc02d",
  "@green": "#43a047",
  "@blue": "#1e63e9",
  "@indigo": "#4b3fb0",
  "@violet": "#9c3fc0",
};

const FIXED: Record<"rgb" | "paint" | "rainbow", string[]> = {
  rgb: ["@red", "@green", "@blue"],
  paint: ["@blue", "@red", "@green", "@yellow"],
  rainbow: ["@red", "@orange", "@yellow", "@green", "@blue", "@indigo", "@violet"],
};

/** Categorias disponíveis no modo (vazio no modo livre). */
export function modeCategories(mode: Mode): string[] {
  return isFixed(mode) ? FIXED[mode as "rgb"] : [];
}
