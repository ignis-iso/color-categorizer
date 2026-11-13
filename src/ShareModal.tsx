import { useEffect, useState } from "react";
import {
  canShareFiles,
  copyImage,
  defaultCaption,
  downloadBlob,
  makeShareBlob,
  nativeShare,
  shareUrl,
} from "./shareImage.ts";

interface Props {
  grid: string[];
  onClose: () => void;
}

export default function ShareModal({ grid, onClose }: Props) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("");
  const [caption, setCaption] = useState(defaultCaption);

  useEffect(() => {
    let url = "";
    makeShareBlob(grid).then((b) => {
      setBlob(b);
      url = URL.createObjectURL(b);
      setPreview(url);
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      if (url) URL.revokeObjectURL(url);
      removeEventListener("keydown", onKey);
    };
  }, [grid, onClose]);

  const both = encodeURIComponent(caption);
  const link = encodeURIComponent(shareUrl());
  // X e Telegram recebem o link separado; tira-o do texto para não duplicar.
  const textOnly = encodeURIComponent(caption.replace(shareUrl(), "").trim());

  const links = [
    { name: "WhatsApp", color: "#25d366", href: `https://wa.me/?text=${both}` },
    { name: "X / Twitter", color: "#111", href: `https://twitter.com/intent/tweet?text=${textOnly}&url=${link}` },
    { name: "Facebook", color: "#1877f2", href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
    { name: "Telegram", color: "#2aabee", href: `https://t.me/share/url?url=${link}&text=${textOnly}` },
  ];

  const native = blob !== null && canShareFiles(blob);

  // Instagram e TikTok não aceitam postagem por link: usa o menu nativo (celular)
  // ou baixa a imagem para o usuário postar no app.
  const viaApp = async (app: string) => {
    if (!blob) return;
    if (native && (await nativeShare(blob, caption))) return;
    downloadBlob(blob);
    let copied = false;
    try {
      await navigator.clipboard.writeText(caption);
      copied = true;
    } catch { /* ignore */ }
    setMsg(
      `Imagem baixada${copied ? " e legenda copiada" : ""}! Abra o ${app}, publique a imagem${copied ? " e cole a legenda" : ""}.`,
    );
  };

  // Discord não tem link de compartilhamento: no celular usa o menu nativo; no computador
  // copia a imagem para colar (Ctrl+V) no chat e abre o Discord.
  const viaDiscord = async () => {
    if (!blob) return;
    if (native && (await nativeShare(blob, caption))) return;
    window.open("https://discord.com/channels/@me", "_blank", "noopener,noreferrer");
    if (await copyImage(blob)) {
      setMsg("Imagem copiada! No Discord, escolha o chat e cole com Ctrl+V. Use “Copiar texto” para a legenda.");
    } else {
      downloadBlob(blob);
      setMsg("Imagem baixada! No Discord, anexe a imagem salva ao chat.");
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Fechar">×</button>
        <h2>Compartilhar meu gráfico</h2>

        <div className="preview">
          {preview ? <img src={preview} alt="Prévia da imagem para compartilhar" /> : <p>Gerando imagem…</p>}
        </div>

        <label className="caption">
          Texto da publicação (com o link do site)
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} />
        </label>

        <div className="share-grid">
          {native && (
            <button className="primary wide" onClick={() => blob && nativeShare(blob, caption)}>
              Compartilhar com a imagem…
            </button>
          )}
          {links.map((l) => (
            <a key={l.name} href={l.href} target="_blank" rel="noopener noreferrer" style={{ background: l.color }}>
              {l.name}
            </a>
          ))}
          <button style={{ background: "linear-gradient(45deg,#feda75,#d62976,#4f5bd5)", color: "#fff" }} onClick={() => viaApp("Instagram")}>
            Instagram
          </button>
          <button style={{ background: "#000", color: "#fff" }} onClick={() => viaApp("TikTok")}>
            TikTok
          </button>
          <button style={{ background: "#5865f2", color: "#fff" }} onClick={viaDiscord}>
            Discord
          </button>
        </div>

        <div className="share-grid small">
          <button onClick={() => blob && downloadBlob(blob)}>Baixar imagem</button>
          <button onClick={async () => blob && setMsg((await copyImage(blob)) ? "Imagem copiada!" : "Não consegui copiar a imagem; use Baixar.")}>
            Copiar imagem
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(caption);
                setMsg("Texto copiado!");
              } catch {
                setMsg("Não consegui copiar; selecione o texto acima.");
              }
            }}
          >
            Copiar texto
          </button>
        </div>

        <p className="share-note">
          {msg || "Os botões de rede abrem com o texto acima. Para anexar a imagem, baixe-a ou use o menu do celular."}
        </p>
      </div>
    </div>
  );
}
