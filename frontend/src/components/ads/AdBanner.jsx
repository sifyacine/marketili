import React, { useState, useEffect } from "react";
import adService from "../../services/adService";
import uploadService from "../../services/uploadService";
import useAuth from "../../hooks/useAuth";

const AdBanner = () => {
  const { user } = useAuth();
  const [ad, setAd] = useState(null);

  useEffect(() => {
    if (!user?.role || user.role === "admin") return;
    adService.getAds("banner", user.role)
      .then(d => setAd((d.ads || [])[0] || null))
      .catch(() => {});
  }, [user?.role]);

  if (!ad) return null;

  return (
    <div style={{
      margin: "0 0 16px 0", borderRadius: 10, overflow: "hidden",
      background: "#1a0a0a", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "10px 20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.10)", gap: 16,
    }}>
      {ad.imageUrl && (
        <img src={uploadService.resolveUrl(ad.imageUrl)} alt={ad.title}
          style={{ height: 36, objectFit: "contain", borderRadius: 4, flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {ad.title}
        </div>
      </div>
      {ad.linkUrl && (
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer"
          style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 6, fontSize: "0.78rem",
            fontWeight: 700, background: "#c0152a", color: "#fff",
            textDecoration: "none", whiteSpace: "nowrap" }}>
          En savoir plus
        </a>
      )}
      <button onClick={() => setAd(null)}
        style={{ width: 20, height: 20, borderRadius: "50%", border: "none",
          background: "rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer",
          fontSize: "0.75rem", display: "flex", alignItems: "center",
          justifyContent: "center", flexShrink: 0, padding: 0 }}>
        ×
      </button>
    </div>
  );
};

export default AdBanner;
