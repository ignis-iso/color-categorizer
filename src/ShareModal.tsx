import { useEffect, useState } from "react";
import {
  canShareFiles,
  copyImage,
  defaultCaption,
  downloadBlob,
  makeShareBlob,
  nativeShare,
} from "./shareImage.ts";

interface Props {
  grid: string[];
  onClose: () => void;
}

export default function ShareModal({ grid, onClose }: Props) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [msg, setMsg] = useState("");
  const caption = defaultCaption();

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

  // Menu nativo de compartilhar (celulares): já lista WhatsApp, Instagram, TikTok, Discord etc.
  const native = blob !== null && canShareFiles(blob);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Fechar">×</button>
        <h2>Compartilhar meu gráfico</h2>

        <div className="preview">
          {preview ? <img src={preview} alt="Prévia da imagem para compartilhar" /> : <p>Gerando imagem…</p>}
        </div>

        <div className="share-actions">
          {native && (
            <button className="primary" onClick={() => blob && nativeShare(blob, caption)}>
              Compartilhar com a imagem…
            </button>
          )}
          <button onClick={() => blob && downloadBlob(blob)}>Baixar imagem</button>
          <button
            onClick={async () =>
              blob && setMsg((await copyImage(blob)) ? "Imagem copiada!" : "Não consegui copiar a imagem; use Baixar.")}
          >
            Copiar imagem
          </button>
        </div>

        {msg && <p className="share-note">{msg}</p>}
      </div>
    </div>
  );
}
