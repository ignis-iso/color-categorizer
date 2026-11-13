import { useSyncExternalStore } from "react";
import { capitalize } from "./util.ts";
import type { Mode } from "./modes.ts";

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
  // Modos e tamanho
  modeTitle: string;
  modes: Record<Mode, { name: string; desc: string; long: string }>;
  sizeTitle: string;
  sizeOpt: (n: number) => string;
  fixedTip: string;
  inferNote: (n: number) => string;
  editHintFixed: string;
  catNames: Record<string, string>;
  recommended: string;
  // Modo grade
  gridTip: string;
  paintHint: string;
  selectedCount: (n: number) => string;
  classifiedCount: (n: number, total: number) => string;
  apply: string;
  clearSelection: string;
  selectUnclassified: string;
  nameArea: string;
  unclassifiedLeft: (n: number) => string;
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
  shareText: "Essas são as cores pra mim! 🎨 Será que seu vermelho é o meu vermelho? Faz o seu:",
  language: "Idioma",
  modeTitle: "Modo de classificação",
  modes: {
    free: { name: "Cor a cor", desc: "Uma cor por vez, com o nome que quiser", long: "As cores aparecem uma por vez, em ordem aleatória, para que a cor anterior não contamine a sua percepção da seguinte. Você dá a cada uma o nome que quiser, sem lista pronta, e o resultado mostra como você mesmo divide o espectro." },
    grid: { name: "Grade", desc: "Escolha as cores na grade e dê nomes às áreas", long: "Aqui você vê todas as cores juntas na grade e nomeia áreas inteiras de uma vez. Como as cores ficam lado a lado, uma pode influenciar a percepção da vizinha — é justamente o contraste com o modo aleatório. Você mesmo desenha as fronteiras." },
    rgb: { name: "Primárias RGB", desc: "Vermelho, verde e azul", long: "Para cada cor, escolha qual das três primárias da luz (vermelho, verde ou azul) ela mais lembra. As cores aparecem em ordem aleatória para não viciar o olhar. Mostra onde você coloca as fronteiras entre elas." },
    paint: { name: "Primárias de tinta", desc: "Azul, vermelho, verde e amarelo", long: "Para cada cor, escolha entre as quatro cores básicas que muita gente aprende como “primárias” de tinta: azul, vermelho, verde e amarelo. A ordem é aleatória para que uma cor não influencie a próxima." },
    rainbow: { name: "Arco-íris", desc: "As 7 cores do arco-íris", long: "Para cada cor, escolha em qual das 7 faixas do arco-íris ela cai, de vermelho a violeta. A ordem aleatória evita que a cor anterior contamine a sua percepção da seguinte." },
  },
  sizeTitle: "Tamanho do teste",
  sizeOpt: (n) => `${n} cores`,
  fixedTip: "Para cada cor, escolha a categoria mais próxima. Não existe resposta certa!",
  inferNote: (n) => `Com ${n} cores testadas, as demais foram preenchidas pela cor testada mais próxima.`,
  editHintFixed: "Clique em um quadrado e escolha a categoria.",
  recommended: "Recomendado",
  catNames: { red: "Vermelho", green: "Verde", blue: "Azul", yellow: "Amarelo", orange: "Laranja", indigo: "Anil", violet: "Violeta" },
  gridTip: "Selecione cores na grade e dê um nome a cada área.",
  paintHint: "Toque ou arraste sobre os quadrados para selecioná-los, escolha um nome e aplique. Faça isso até classificar todas as cores.",
  selectedCount: (n) => `${n} selecionada${n === 1 ? "" : "s"}`,
  classifiedCount: (n, total) => `${n} de ${total} classificadas`,
  apply: "Aplicar nome",
  clearSelection: "Limpar seleção",
  selectUnclassified: "Selecionar não classificadas",
  nameArea: "Nome da área…",
  unclassifiedLeft: (n) => `Faltam ${n} cores sem nome`,
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
  shareText: "These are the colors to me! 🎨 Is your red my red? Take yours:",
  language: "Language",
  modeTitle: "Classification mode",
  modes: {
    free: { name: "One by one", desc: "One color at a time, any name you like", long: "Colors appear one at a time, in random order, so the previous color doesn’t bias how you see the next one. You give each the name you like, with no preset list, and the result shows how you divide the spectrum yourself." },
    grid: { name: "Grid", desc: "Pick colors on the grid and name the areas", long: "Here you see all the colors together on the grid and name whole areas at once. Because the colors sit side by side, one can influence how you see its neighbor — that’s the contrast with the random-order modes. You draw the boundaries yourself." },
    rgb: { name: "RGB primaries", desc: "Red, green and blue", long: "For each color, pick which of the three light primaries (red, green or blue) it most resembles. Colors appear in random order so your eye isn’t primed. It shows where you put the borders between them." },
    paint: { name: "Paint primaries", desc: "Blue, red, green and yellow", long: "For each color, choose among the four basic colors many people learn as paint “primaries”: blue, red, green and yellow. The order is random so one color doesn’t influence the next." },
    rainbow: { name: "Rainbow", desc: "The 7 colors of the rainbow", long: "For each color, pick which of the 7 rainbow bands it falls into, from red to violet. The random order keeps the previous color from biasing how you see the next one." },
  },
  sizeTitle: "Test size",
  sizeOpt: (n) => `${n} colors`,
  fixedTip: "For each color, pick the closest category. There is no right answer!",
  inferNote: (n) => `With ${n} colors tested, the others were filled in from the closest tested color.`,
  editHintFixed: "Click a square and pick the category.",
  recommended: "Recommended",
  catNames: { red: "Red", green: "Green", blue: "Blue", yellow: "Yellow", orange: "Orange", indigo: "Indigo", violet: "Violet" },
  gridTip: "Select colors on the grid and give each area a name.",
  paintHint: "Tap or drag over the squares to select them, choose a name and apply it. Keep going until every color is classified.",
  selectedCount: (n) => `${n} selected`,
  classifiedCount: (n, total) => `${n} of ${total} classified`,
  apply: "Apply name",
  clearSelection: "Clear selection",
  selectUnclassified: "Select unclassified",
  nameArea: "Area name…",
  unclassifiedLeft: (n) => `${n} colors still without a name`,
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
  shareText: "¡Estos son los colores para mí! 🎨 ¿Tu rojo es mi rojo? Haz el tuyo:",
  language: "Idioma",
  modeTitle: "Modo de clasificación",
  modes: {
    free: { name: "Una a una", desc: "Un color a la vez, con el nombre que quieras", long: "Los colores aparecen uno a uno, en orden aleatorio, para que el color anterior no contamine tu percepción del siguiente. Le pones a cada uno el nombre que quieras, sin lista previa, y el resultado muestra cómo divides tú el espectro." },
    grid: { name: "Cuadrícula", desc: "Elige colores en la cuadrícula y nombra las áreas", long: "Aquí ves todos los colores juntos en la cuadrícula y nombras áreas enteras a la vez. Al estar uno junto a otro, un color puede influir en cómo ves al vecino: ese es el contraste con los modos aleatorios. Tú mismo dibujas las fronteras." },
    rgb: { name: "Primarios RGB", desc: "Rojo, verde y azul", long: "Para cada color, elige a cuál de los tres primarios de la luz (rojo, verde o azul) se parece más. Los colores aparecen en orden aleatorio para no condicionar tu mirada. Muestra dónde pones las fronteras entre ellos." },
    paint: { name: "Primarios de pintura", desc: "Azul, rojo, verde y amarillo", long: "Para cada color, elige entre los cuatro colores básicos que mucha gente aprende como “primarios” de pintura: azul, rojo, verde y amarillo. El orden es aleatorio para que un color no influya en el siguiente." },
    rainbow: { name: "Arcoíris", desc: "Los 7 colores del arcoíris", long: "Para cada color, elige en cuál de las 7 franjas del arcoíris cae, de rojo a violeta. El orden aleatorio evita que el color anterior contamine tu percepción del siguiente." },
  },
  sizeTitle: "Tamaño de la prueba",
  sizeOpt: (n) => `${n} colores`,
  fixedTip: "Para cada color, elige la categoría más cercana. ¡No hay respuesta correcta!",
  inferNote: (n) => `Con ${n} colores probados, el resto se completó con el color probado más cercano.`,
  editHintFixed: "Haz clic en un cuadrado y elige la categoría.",
  recommended: "Recomendado",
  catNames: { red: "Rojo", green: "Verde", blue: "Azul", yellow: "Amarillo", orange: "Naranja", indigo: "Índigo", violet: "Violeta" },
  gridTip: "Selecciona colores en la cuadrícula y ponle nombre a cada área.",
  paintHint: "Toca o arrastra sobre los cuadrados para seleccionarlos, elige un nombre y aplícalo. Sigue hasta clasificar todos los colores.",
  selectedCount: (n) => `${n} seleccionado${n === 1 ? "" : "s"}`,
  classifiedCount: (n, total) => `${n} de ${total} clasificados`,
  apply: "Aplicar nombre",
  clearSelection: "Borrar selección",
  selectUnclassified: "Seleccionar sin clasificar",
  nameArea: "Nombre del área…",
  unclassifiedLeft: (n) => `Faltan ${n} colores sin nombre`,
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

/** Nome exibido de uma categoria: chaves "@x" (modos fixos) são traduzidas; o resto é capitalizado. */
export function displayName(label: string): string {
  return label.startsWith("@") ? (t().catNames[label.slice(1)] ?? label) : capitalize(label);
}
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
