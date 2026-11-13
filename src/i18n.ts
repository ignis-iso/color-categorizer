import { useSyncExternalStore } from "react";

export type Lang = "pt" | "en" | "es";
export const LANGS: { code: Lang; label: string }[] = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

interface Dict {
  htmlLang: string;
  titleColors: string[];
  /** Título da aba/da imagem, com a cor no lugar de {c}. */
  titleTpl: (c: string) => string;
  // Intro
  introLead: (n: number) => string;
  howTitle: string;
  how: string[];
  beforeTitle: string;
  /** [parte em negrito, resto] */
  tips: [string, string][];
  start: string;
  resume: (done: number, total: number) => string;
  // Jogo
  counter: (pos: number, total: number, cats: number) => string;
  progressLabel: string;
  placeholder: string;
  next: string;
  finish: string;
  tooMany: (n: number) => string;
  back: string;
  seeResult: string;
  // Resultado
  resultTitle: string;
  resultLead: (cats: number, total: number) => string;
  edit: string;
  doneEditing: string;
  editHint: string;
  current: string;
  moveTo: string;
  newCategory: string;
  createMove: string;
  diagHint: string;
  shareImage: string;
  restart: string;
  // Compartilhar
  shareTitle: string;
  generating: string;
  previewAlt: string;
  shareNative: string;
  download: string;
  copyImage: string;
  copied: string;
  copyFail: string;
  close: string;
  imgSubtitle: string;
  imgFooter: string;
  shareText: string;
  language: string;
}

const pt: Dict = {
  htmlLang: "pt-BR",
  titleColors: ["vermelho", "azul", "verde", "amarelo"],
  titleTpl: (c) => `Seu ${c} é o meu ${c}?`,
  introLead: (n) =>
    `Faça esse teste desnecessariamente longo e descubra o seu gráfico de categorização de cor. São ${n} cores, o que pode demorar um pouco.`,
  howTitle: "Como funciona",
  how: [
    "Uma cor por vez aparece na tela, em um fundo cinza neutro, em ordem aleatória.",
    "Dê a ela o nome que quiser: “verde”, “roxo”, “salmão”… não existe resposta certa.",
    "No final, mostramos a grade de cores dividida pelas suas categorias.",
  ],
  beforeTitle: "Antes de começar",
  tips: [
    ["Use poucos nomes.", " Tente ficar com algo entre 6 e 12 categorias no total. Se der um nome diferente para cada tom, a grade final perde o sentido."],
    ["Prefira nomes de cor “básicos”", " (azul, verde, amarelo…) em vez de tons muito específicos (azul-petróleo-claro)."],
    ["", "Nomes que você já usou aparecem como botões — reaproveite-os sempre que a cor ainda couber neles."],
    ["", "Só crie um nome novo quando a cor realmente não combinar com nenhum dos anteriores."],
    ["", "Não pense demais: vale a primeira impressão."],
  ],
  start: "Começar",
  resume: (d, t) => `Continuar de onde parei (${d}/${t})`,
  counter: (p, t, c) => `Cor ${p} de ${t} · ${c} categoria${c === 1 ? "" : "s"} em uso`,
  progressLabel: "progresso",
  placeholder: "Que cor é essa?",
  next: "Próxima",
  finish: "Concluir",
  tooMany: (n) => `Você já tem ${n} categorias — tente reaproveitar uma delas.`,
  back: "← Voltar",
  seeResult: "Ver resultado",
  resultTitle: "Seu gráfico de cores",
  resultLead: (c, t) => `Estas são as ${c} categorias que você criou para as ${t} cores.`,
  edit: "Editar resultado",
  doneEditing: "Concluir edição",
  editHint: "Clique em um quadrado e escolha uma categoria ou crie uma nova.",
  current: "Atual",
  moveTo: "Mover para:",
  newCategory: "Nova categoria…",
  createMove: "Criar e mover",
  diagHint: "Pontilhado preto e branco ligando duas células = elas pertencem à mesma categoria, mesmo se tocando só pela diagonal.",
  shareImage: "Compartilhar imagem",
  restart: "Refazer o teste",
  shareTitle: "Compartilhar meu gráfico",
  generating: "Gerando imagem…",
  previewAlt: "Prévia da imagem para compartilhar",
  shareNative: "Compartilhar com a imagem…",
  download: "Baixar imagem",
  copyImage: "Copiar imagem",
  copied: "Imagem copiada!",
  copyFail: "Não consegui copiar a imagem; use Baixar.",
  close: "Fechar",
  imgSubtitle: "Este é o meu gráfico de categorização de cores",
  imgFooter: "Faça o seu:",
  shareText: "Este é o meu gráfico de categorização de cores. Seu vermelho é o meu vermelho? Faça o seu:",
  language: "Idioma",
};

const en: Dict = {
  htmlLang: "en",
  titleColors: ["red", "blue", "green", "yellow"],
  titleTpl: (c) => `Is your ${c} my ${c}?`,
  introLead: (n) =>
    `Take this needlessly long test and find out your own color categorization chart. There are ${n} colors, so it may take a while.`,
  howTitle: "How it works",
  how: [
    "One color at a time appears on a neutral gray background, in random order.",
    "Give it any name you like: “green”, “purple”, “salmon”… there are no wrong answers.",
    "At the end, we show the color grid divided by your own categories.",
  ],
  beforeTitle: "Before you start",
  tips: [
    ["Use few names.", " Try to end up with roughly 6 to 12 categories in total. If every shade gets its own name, the final chart loses its meaning."],
    ["Prefer “basic” color names", " (blue, green, yellow…) over very specific shades (light-petrol-blue)."],
    ["", "Names you have already used show up as buttons — reuse them whenever the color still fits."],
    ["", "Only create a new name when the color really doesn't match any of the previous ones."],
    ["", "Don't overthink it: first impressions count."],
  ],
  start: "Start",
  resume: (d, t) => `Continue where I left off (${d}/${t})`,
  counter: (p, t, c) => `Color ${p} of ${t} · ${c} categor${c === 1 ? "y" : "ies"} in use`,
  progressLabel: "progress",
  placeholder: "What color is this?",
  next: "Next",
  finish: "Finish",
  tooMany: (n) => `You already have ${n} categories — try reusing one of them.`,
  back: "← Back",
  seeResult: "See result",
  resultTitle: "Your color chart",
  resultLead: (c, t) => `These are the ${c} categories you created for the ${t} colors.`,
  edit: "Edit result",
  doneEditing: "Done editing",
  editHint: "Click a square and pick a category or create a new one.",
  current: "Current",
  moveTo: "Move to:",
  newCategory: "New category…",
  createMove: "Create and move",
  diagHint: "Black-and-white dotted line joining two cells = they belong to the same category, even if they only touch diagonally.",
  shareImage: "Share image",
  restart: "Retake the test",
  shareTitle: "Share my chart",
  generating: "Generating image…",
  previewAlt: "Preview of the image to share",
  shareNative: "Share with the image…",
  download: "Download image",
  copyImage: "Copy image",
  copied: "Image copied!",
  copyFail: "Couldn't copy the image; use Download.",
  close: "Close",
  imgSubtitle: "This is my color categorization chart",
  imgFooter: "Take yours:",
  shareText: "This is my color categorization chart. Is your red my red? Take yours:",
  language: "Language",
};

const es: Dict = {
  htmlLang: "es",
  titleColors: ["rojo", "azul", "verde", "amarillo"],
  titleTpl: (c) => `¿Tu ${c} es mi ${c}?`,
  introLead: (n) =>
    `Haz esta prueba innecesariamente larga y descubre tu propio gráfico de categorización de colores. Son ${n} colores, así que puede tardar un poco.`,
  howTitle: "Cómo funciona",
  how: [
    "Aparece un color a la vez sobre un fondo gris neutro, en orden aleatorio.",
    "Ponle el nombre que quieras: “verde”, “morado”, “salmón”… no hay respuestas incorrectas.",
    "Al final, mostramos la cuadrícula de colores dividida según tus categorías.",
  ],
  beforeTitle: "Antes de empezar",
  tips: [
    ["Usa pocos nombres.", " Intenta quedarte con entre 6 y 12 categorías en total. Si das un nombre distinto a cada tono, el gráfico final pierde sentido."],
    ["Prefiere nombres de color “básicos”", " (azul, verde, amarillo…) en lugar de tonos muy específicos (azul-petróleo-claro)."],
    ["", "Los nombres que ya usaste aparecen como botones — reutilízalos siempre que el color aún encaje."],
    ["", "Crea un nombre nuevo solo cuando el color realmente no encaje con ninguno de los anteriores."],
    ["", "No lo pienses demasiado: vale la primera impresión."],
  ],
  start: "Empezar",
  resume: (d, t) => `Continuar donde lo dejé (${d}/${t})`,
  counter: (p, t, c) => `Color ${p} de ${t} · ${c} categoría${c === 1 ? "" : "s"} en uso`,
  progressLabel: "progreso",
  placeholder: "¿Qué color es este?",
  next: "Siguiente",
  finish: "Terminar",
  tooMany: (n) => `Ya tienes ${n} categorías — intenta reutilizar una de ellas.`,
  back: "← Atrás",
  seeResult: "Ver resultado",
  resultTitle: "Tu gráfico de colores",
  resultLead: (c, t) => `Estas son las ${c} categorías que creaste para los ${t} colores.`,
  edit: "Editar resultado",
  doneEditing: "Terminar edición",
  editHint: "Haz clic en un cuadrado y elige una categoría o crea una nueva.",
  current: "Actual",
  moveTo: "Mover a:",
  newCategory: "Nueva categoría…",
  createMove: "Crear y mover",
  diagHint: "Línea punteada blanca y negra que une dos celdas = pertenecen a la misma categoría, aunque solo se toquen en diagonal.",
  shareImage: "Compartir imagen",
  restart: "Repetir la prueba",
  shareTitle: "Compartir mi gráfico",
  generating: "Generando imagen…",
  previewAlt: "Vista previa de la imagen para compartir",
  shareNative: "Compartir con la imagen…",
  download: "Descargar imagen",
  copyImage: "Copiar imagen",
  copied: "¡Imagen copiada!",
  copyFail: "No pude copiar la imagen; usa Descargar.",
  close: "Cerrar",
  imgSubtitle: "Este es mi gráfico de categorización de colores",
  imgFooter: "Haz el tuyo:",
  shareText: "Este es mi gráfico de categorización de colores. ¿Tu rojo es mi rojo? Haz el tuyo:",
  language: "Idioma",
};

const DICTS: Record<Lang, Dict> = { pt, en, es };
const KEY = "color-categorizer:lang";

function detect(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "pt" || saved === "en" || saved === "es") return saved;
  } catch { /* ignore */ }
  const nav = (navigator.language || "pt").slice(0, 2).toLowerCase();
  return nav === "en" || nav === "es" ? nav : "pt";
}

let current: Lang = detect();
const listeners = new Set<() => void>();
document.documentElement.lang = DICTS[current].htmlLang;

export function setLang(l: Lang) {
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch { /* ignore */ }
  document.documentElement.lang = DICTS[l].htmlLang;
  listeners.forEach((f) => f());
}

export const getLang = () => current;
/** Dicionário do idioma atual (use useT() dentro de componentes para reagir à troca). */
export const t = (): Dict => DICTS[current];

export function useT(): Dict {
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
  return DICTS[current];
}
