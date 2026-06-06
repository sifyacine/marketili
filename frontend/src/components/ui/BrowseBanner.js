import React, { useEffect, useState } from "react";
import adService     from "../../services/adService";
import uploadService from "../../services/uploadService";
import useAuth       from "../../hooks/useAuth";

const BrowseBanner = () => {
  const { user } = useAuth();
  const [ad, setAd] = useState(null);

  useEffect(() => {
    adService.getAds("banner", user?.role || "")
      .then(d => setAd(d.ads?.[0] || null))
      .catch(() => {});
  }, [user?.role]);

  if (!ad || !ad.imageUrl) return null;

  const imgSrc = uploadService.resolveUrl(ad.imageUrl);

  const inner = (
    <img
      src={imgSrc}
      alt={ad.title || "Annonce"}
      onError={e => { e.target.style.display = "none"; }}
      style={{
        width: "100%",
        maxHeight: 180,
        objectFit: "cover",
        display: "block",
        borderRadius: 12,
      }}
    />
  );

  return (
    <div style={{ marginBottom: 22 }}>
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noreferrer"
          style={{ display: "block", textDecoration: "none" }}>
          {inner}
        </a>
      ) : inner}
    </div>
  );
};

export default BrowseBanner;
