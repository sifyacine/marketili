import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import useFileBlob from "../../hooks/useFileBlob";

const FileViewerModal = ({ url, filename, onClose }) => {
  const { blobUrl, type, loading, error } = useFileBlob(url);

  
  
  const nameIsImage = /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(filename || "");
  const nameIsPdf = /\.pdf$/i.test(filename || "");
  const isImage = type ? type.startsWith("image/") : nameIsImage;
  const isPdf = type ? type === "application/pdf" : nameIsPdf;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.78)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 980, height: "90vh",
          display: "flex", flexDirection: "column",
          background: "#1a1a2e", borderRadius: 12, overflow: "hidden",
          boxShadow: "0 24px 72px rgba(0,0,0,0.55)",
        }}
      >
        {}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          background: "#16213e",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0, gap: 12,
        }}>
          <span style={{
            fontSize: "0.82rem", fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            flex: 1,
          }}>
            {filename || "Document"}
          </span>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleDownload}
              disabled={!blobUrl}
              style={{
                padding: "5px 13px", borderRadius: 6,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff", fontSize: "0.78rem", fontWeight: 600,
                cursor: blobUrl ? "pointer" : "not-allowed",
                opacity: blobUrl ? 1 : 0.5,
              }}
            >
              ↓ Télécharger
            </button>
            <button
              onClick={() => blobUrl && window.open(blobUrl, "_blank")}
              disabled={!blobUrl}
              style={{
                padding: "5px 13px", borderRadius: 6,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff", fontSize: "0.78rem", fontWeight: 600,
                cursor: blobUrl ? "pointer" : "not-allowed",
                opacity: blobUrl ? 1 : 0.5,
              }}
            >
              ⎙ Ouvrir
            </button>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff", fontSize: "1rem", fontWeight: 700,
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {}
        <div style={{
          flex: 1, overflow: "hidden",
          background: "#0f0f23",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", textAlign: "center",
          padding: 16,
        }}>
          {loading ? (
            <div>
              <div className="spinner" style={{ margin: "0 auto 12px" }} />
              Chargement du document…
            </div>
          ) : error || !blobUrl ? (
            <div style={{ maxWidth: 360 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>⚠️</div>
              Impossible de charger ce document.
              <br />
              Vérifiez votre connexion puis réessayez.
            </div>
          ) : isImage ? (
            <img
              src={blobUrl} alt={filename}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          ) : isPdf ? (
            <iframe
              src={blobUrl}
              title={filename}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          ) : (
            <div style={{ maxWidth: 360 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>📄</div>
              Aperçu indisponible pour ce type de fichier.
              <br />
              <button
                onClick={handleDownload}
                style={{
                  marginTop: 12, padding: "7px 16px", borderRadius: 6,
                  background: "#c0152a", border: "none", color: "#fff",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                }}
              >
                ↓ Télécharger le fichier
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FileViewerModal;
