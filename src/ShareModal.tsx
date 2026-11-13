import { useEffect, useState } from "react";
import {
  canShareFiles,
  copyImage,
  downloadBlob,
  makeShareBlob,
  nativeShare,
  shareText,
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

  const text = encodeURIComponent(shareText());
  const link = encodeURIComponent(shareUrl());
  const both = encodeURIComponent(`${shareText()} ${shareUrl()}`);

  const links = [
    { name: "WhatsApp", color: "#25d366", href: `https://wa.me/?text=${both}` },
    { name: "X / Twitter", color: "#111", href: `https://twitter.com/intent/tweet?text=${text}&url=${link}` },
    { name: "Facebook", color: "#1877f2", href: `https://www.facebook.com/sharer/sharer.php?u=${link}` },
    { name: "Telegram", color: "#2aabee", href: `https://t.me/share/url?url=${link}&text=${text}` },
  ];

  const native = blob !== null && canShareFiles(blob);

  // Instagram e TikTok não aceitam postagem por link: usa o menu nativo (celular)
  // ou baixa a imagem para o usuário postar no app.
  const viaApp = async (app: string) => {
    if (!blob) return;
    if (native && (await nativeShare(blob))) return;
    downloadBlob(blob);
    setMsg(`Imagem baixada! Abra o ${app} e publique a imagem salva.`);
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Fechar">×</button>
        <h2>Compartilhar meu gráfico</h2>

        <div className="preview">
          {preview ? <img src={preview} alt="Prévia da imagem para compartilhar" /> : <p>Gerando imagem…</p>}
        </div>

        <div className="share-grid">
          {native && (
            <button className="primary wide" onClick={() => blob && nativeShare(blob)}>
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
        </div>

        <div className="share-grid small">
          <button onClick={() => blob && downloadBlob(blob)}>Baixar imagem</button>
          <button onClick={async () => blob && setMsg((await copyImage(blob)) ? "Imagem copiada!" : "Não consegui copiar a imagem; use Baixar.")}>
            Copiar imagem
          </button>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(shareUrl());
                setMsg("Link copiado!");
              } catch {
                setMsg(shareUrl());
              }
            }}
          >
            Copiar link
          </button>
        </div>

        <p className="share-note">
          {msg || "Os botões de rede abrem com o texto e o link. Para anexar a imagem, baixe-a ou use o menu do celular."}
        </p>
      </div>
    </div>
  );
}
