import { COLORS, GRID_SIZE } from "./colors.ts";
import { diagonalLinks, findRegions } from "./regions.ts";
import { displayName, t } from "./i18n.ts";

const N = GRID_SIZE;
const W = 1080, H = 1350;
const CELL = 56, GX = (W - N * CELL) / 2, GY = 180;
const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

function avgColor(grid: string[], name: string): string {
  let r = 0, g = 0, b = 0, n = 0;
  grid.forEach((l, i) => {
    if (l !== name) return;
    const h = COLORS[i];
    r += parseInt(h.slice(1, 3), 16);
    g += parseInt(h.slice(3, 5), 16);
    b += parseInt(h.slice(5, 7), 16);
    n++;
  });
  return `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
}

export function renderShareCanvas(grid: string[]): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, W, H);

  // Título
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `800 58px ${FONT}`;
  const tr = t();
  ctx.fillText(tr.titleTpl(tr.titleColors[0]), W / 2, 80);
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(tr.imgSubtitle, W / 2, 134);

  // Células
  COLORS.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(GX + (i % N) * CELL, GY + Math.floor(i / N) * CELL, CELL + 1, CELL + 1);
  });

  // Bordas entre categorias
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 5;
  ctx.lineCap = "square";
  ctx.beginPath();
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const me = grid[r * N + c];
      const x = GX + c * CELL, y = GY + r * CELL;
      if (c + 1 < N && grid[r * N + c + 1] !== me) {
        ctx.moveTo(x + CELL, y);
        ctx.lineTo(x + CELL, y + CELL);
      }
      if (r + 1 < N && grid[(r + 1) * N + c] !== me) {
        ctx.moveTo(x, y + CELL);
        ctx.lineTo(x + CELL, y + CELL);
      }
    }
  }
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.strokeRect(GX, GY, N * CELL, N * CELL);

  // Ligações diagonais
  ctx.lineCap = "round";
  for (const l of diagonalLinks(grid)) {
    const x1 = GX + l.c1 * CELL + CELL / 2, y1 = GY + l.r1 * CELL + CELL / 2;
    const x2 = GX + l.c2 * CELL + CELL / 2, y2 = GY + l.r2 * CELL + CELL / 2;
    ctx.setLineDash([]);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.setLineDash([1, 10]);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Rótulos das regiões
  ctx.lineJoin = "round";
  for (const rg of findRegions(grid)) {
    const text = displayName(rg.name);
    const fit = (CELL * Math.max(rg.width, 1) * 0.92) / (Math.max(text.length, 1) * 0.6);
    const base = rg.size > 6 ? 32 : rg.size > 2 ? 22 : 16;
    const size = Math.max(11, Math.min(base, fit));
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.lineWidth = Math.max(4, size / 4.5);
    ctx.strokeStyle = "#000";
    const x = GX + rg.c * CELL + CELL / 2, y = GY + rg.r * CELL + CELL / 2;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, x, y);
  }

  // Legenda
  const count = new Map<string, number>();
  grid.forEach((g) => count.set(g, (count.get(g) ?? 0) + 1));
  const legend = [...count.entries()].sort((a, b) => b[1] - a[1]);
  const fs = legend.length > 14 ? 21 : 25, ch = fs + 18, gap = 10;
  ctx.font = `600 ${fs}px ${FONT}`;
  ctx.textAlign = "left";
  const rows: { name: string; n: number; w: number }[][] = [[]];
  let rowW = 0;
  for (const [name, n] of legend) {
    const w = ctx.measureText(`${displayName(name)} ${n}`).width + fs + 40;
    if (rowW + w > N * CELL && rows[rows.length - 1].length) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push({ name, n, w });
    rowW += w + gap;
  }
  let y = GY + N * CELL + 24;
  for (const row of rows) {
    const total = row.reduce((a, c) => a + c.w + gap, -gap);
    let x = (W - total) / 2;
    for (const it of row) {
      ctx.fillStyle = "#f2f2f2";
      ctx.beginPath();
      ctx.roundRect(x, y, it.w, ch, ch / 2);
      ctx.fill();
      ctx.fillStyle = avgColor(grid, it.name);
      ctx.beginPath();
      ctx.arc(x + 18 + fs / 2 - 4, y + ch / 2, fs / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#0005";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#1d1d1d";
      ctx.textBaseline = "middle";
      ctx.fillText(displayName(it.name), x + 18 + fs + 4, y + ch / 2 + 1);
      const nameW = ctx.measureText(displayName(it.name) + " ").width;
      ctx.fillStyle = "#1d1d1d88";
      ctx.fillText(String(it.n), x + 18 + fs + 4 + nameW, y + ch / 2 + 1);
      x += it.w + gap;
    }
    y += ch + gap;
  }

  // Rodapé
  ctx.fillStyle = "#ffffffcc";
  ctx.textAlign = "center";
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText(`${tr.imgFooter} ${location.host}${location.pathname}`, W / 2, H - 36);
  return canvas;
}

export const shareTitle = () => t().titleTpl(t().titleColors[0]);
export const shareUrl = () => location.origin + location.pathname;
export const shareText = () => t().shareText;
/** Legenda padrão: texto + link do site. */
export const defaultCaption = () => `${shareText()} ${shareUrl()}`;

export async function makeShareBlob(grid: string[]): Promise<Blob> {
  const canvas = renderShareCanvas(grid);
  return await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("toBlob falhou"))), "image/png")
  );
}

const FILE_NAME = "meu-grafico-de-cores.png";

/** Menu nativo de compartilhar (celulares): inclui Instagram, TikTok, WhatsApp etc. com a imagem. */
export function canShareFiles(blob: Blob): boolean {
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  const file = new File([blob], FILE_NAME, { type: "image/png" });
  return !!nav.canShare?.({ files: [file] });
}

export async function nativeShare(blob: Blob, text: string): Promise<boolean> {
  const file = new File([blob], FILE_NAME, { type: "image/png" });
  try {
    await navigator.share({
      files: [file],
      title: shareTitle(),
      text,
    });
    return true;
  } catch (e) {
    if ((e as DOMException).name === "AbortError") return true;
    return false;
  }
}

export function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = FILE_NAME;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function copyImage(blob: Blob): Promise<boolean> {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}
