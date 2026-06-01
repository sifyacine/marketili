import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import uploadService from "../../services/uploadService";

const FileViewerModal = ({ url, filename, onClose }) => {
  const resolvedUrl = uploadService.resolveUrl(url);
  const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(filename || "");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
        {/* Toolbar */}
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
            <a
              href={`${resolvedUrl}?download=1`}
              style={{
                padding: "5px 13px", borderRadius: 6,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff", fontSize: "0.78rem", fontWeight: 600,
                textDecoration: "none", display: "inline-block",
              }}
            >
              ↓ Télécharger
            </a>
            <button
              onClick={() => window.open(resolvedUrl, "_blank")}
              style={{
                padding: "5px 13px", borderRadius: 6,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#fff", fontSize: "0.78rem", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ⎙ Imprimer
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

        {/* Content */}
        <div style={{
          flex: 1, overflow: "hidden",
          background: "#0f0f23",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isImage ? (
            <img
              src={resolvedUrl} alt={filename}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          ) : (
            <iframe
              src={resolvedUrl}
              title={filename}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FileViewerModal;
