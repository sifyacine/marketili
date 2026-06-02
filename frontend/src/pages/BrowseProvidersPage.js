// frontend/src/pages/BrowseProvidersPage.js
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import profileService from "../services/profileService";
import uploadService  from "../services/uploadService";
import useAuth from "../hooks/useAuth";
import CollaborationRequestModal from "../components/collaborations/CollaborationRequestModal";
import { IconSearch } from "../components/ui/Icons";

// ── Constants ──────────────────────────────────────────────────────────────────
const TYPE_TABS = [
  { v: "all",        l: "Tous"        },
  { v: "agency",     l: "Agences"     },
  { v: "team",       l: "Équipes"     },
  { v: "freelancer", l: "Freelancers" },
];

const ROLE_COLORS = {
  agency:     "#7c3aed",
  team:       "#0891b2",
  freelancer: "#d97706",
};

const ROLE_LABELS = {
  agency:     "Agence",
  team:       "Équipe",
  freelancer: "Freelancer",
};

// ── Provider card ─────────────────────────────────────────────────────────────
const ProviderCard = ({ provider, index, onCollab, isFreelancer }) => {
  const navigate = useNavigate();
  const role     = provider._role;
  const color    = ROLE_COLORS[role] || "#6b7280";

  const name = provider.agencyName || provider.teamName ||
    (provider.firstName ? `${provider.firstName} ${provider.lastName}` : "—");
  const avatarSrc   = provider.logo || provider.avatar || null;
  const initials    = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const specialties = provider.specialties || provider.skills || provider.categories || [];
  const locationStr = provider.address?.region || provider.location?.region || "";
  const membersCount = Array.isArray(provider.members) ? provider.members.length : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/profile/${role}/${provider._id}`)}
      style={{
        borderRadius: 14, border: "1px solid #eee", background: "#fff",
        padding: "18px 18px 16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        cursor: "pointer", transition: "box-shadow 0.18s, transform 0.18s",
        borderLeft: `3px solid ${color}`,
      }}
      whileHover={{ boxShadow: "0 6px 22px rgba(0,0,0,0.10)", y: -2 }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        {avatarSrc ? (
          <img src={uploadService.resolveUrl(avatarSrc)} alt={name}
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", fontWeight: 800, color: "#fff" }}>
            {initials}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1a1a1a",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </span>
            <span style={{ padding: "1px 8px", borderRadius: 10, fontSize: "0.65rem",
              fontWeight: 700, background: color + "18", color, flexShrink: 0 }}>
              {ROLE_LABELS[role]}
            </span>
          </div>
          {locationStr && (
            <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 2 }}>{locationStr}</div>
          )}
        </div>
      </div>

      {/* Bio */}
      {provider.bio && (
        <p style={{ fontSize: "0.78rem", color: "#666", lineHeight: 1.5, margin: "0 0 10px",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden" }}>
          {provider.bio}
        </p>
      )}

      {/* Tags */}
      {specialties.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
          {specialties.slice(0, 4).map((s, i) => (
            <span key={i} style={{ padding: "2px 8px", borderRadius: 10, fontSize: "0.65rem",
              fontWeight: 600, background: "#f3f0ff", color: "#7c3aed" }}>
              {s}
            </span>
          ))}
          {specialties.length > 4 && (
            <span style={{ fontSize: "0.65rem", color: "#aaa", alignSelf: "center" }}>
              +{specialties.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Stats footer */}
      <div style={{ display: "flex", gap: 14, borderTop: "1px solid #f0f0f0", paddingTop: 10,
        marginTop: 4, justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 14 }}>
          {membersCount !== null && (
            <div style={{ fontSize: "0.72rem", color: "#888" }}>
              <span style={{ fontWeight: 700, color: color }}>{membersCount}</span> membres
            </div>
          )}
          {provider.followersCount > 0 && (
            <div style={{ fontSize: "0.72rem", color: "#888" }}>
              <span style={{ fontWeight: 700, color: "#d97706" }}>
                {provider.followersCount?.toLocaleString()}
              </span> abonnés
            </div>
          )}
        </div>
        {isFreelancer && (role === "agency" || role === "team") && (
          <button
            onClick={e => { e.stopPropagation(); onCollab(provider); }}
            style={{ padding: "5px 12px", borderRadius: 8, fontSize: "0.72rem", fontWeight: 700,
              border: "1.5px solid #7c3aed", background: "#f3f0ff", color: "#7c3aed",
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            + Collaborer
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// ROOT
// ═════════════════════════════════════════════════════════════════════════════
const BrowseProvidersPage = () => {
  const { user } = useAuth();
  const isFreelancer = user?.role === "freelancer";

  const [providers,   setProviders]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [type,        setType]        = useState("all");
  const [search,      setSearch]      = useState("");
  const [specialty,   setSpecialty]   = useState("");
  const [region,      setRegion]      = useState("");
  const [page,        setPage]        = useState(1);
  const [pages,       setPages]       = useState(1);
  const [total,       setTotal]       = useState(0);
  const [collabTarget, setCollabTarget] = useState(null);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { type, page: pg, limit: 12 };
      if (search.trim())   params.search    = search.trim();
      if (specialty.trim()) params.specialty = specialty.trim();
      if (region.trim())   params.region    = region.trim();

      const data = await profileService.browseProviders(params);
      setProviders(data.providers || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  }, [type, search, specialty, region]);

  useEffect(() => { load(1); }, [type]); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.4rem", margin: "0 0 4px" }}>
          Explorer les prestataires
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#888", margin: 0 }}>
          Découvrez des agences, équipes et freelancers — {total} résultat{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Type tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {TYPE_TABS.map(t => (
          <button key={t.v}
            onClick={() => setType(t.v)}
            style={{
              padding: "7px 16px", borderRadius: 20, fontFamily: "inherit",
              fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
              border: "1.5px solid " + (type === t.v ? "#7c3aed" : "#e5e5e5"),
              background: type === t.v ? "#7c3aed" : "#fff",
              color: type === t.v ? "#fff" : "#555",
              transition: "all 0.15s",
            }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <form onSubmit={handleSearch}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 2, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 10, top: "50%",
            transform: "translateY(-50%)", color: "#aaa", display: "flex", pointerEvents: "none" }}>
            <IconSearch size={14} />
          </span>
          <input
            style={{ paddingLeft: 32, width: "100%", padding: "9px 12px 9px 32px",
              borderRadius: 9, border: "1px solid #ddd", fontFamily: "inherit",
              fontSize: "0.85rem", background: "#fff", boxSizing: "border-box" }}
            placeholder="Nom, bio, spécialité..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <input
          style={{ flex: 1, minWidth: 130, padding: "9px 12px", borderRadius: 9,
            border: "1px solid #ddd", fontFamily: "inherit", fontSize: "0.85rem" }}
          placeholder="Spécialité..."
          value={specialty} onChange={e => setSpecialty(e.target.value)} />
        <input
          style={{ flex: 1, minWidth: 130, padding: "9px 12px", borderRadius: 9,
            border: "1px solid #ddd", fontFamily: "inherit", fontSize: "0.85rem" }}
          placeholder="Région..."
          value={region} onChange={e => setRegion(e.target.value)} />
        <button type="submit"
          style={{ padding: "9px 18px", borderRadius: 9, border: "none",
            background: "#1a1a1a", color: "#fff", fontFamily: "inherit",
            fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
          Chercher
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
          <div className="spinner" />
        </div>
      ) : providers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 16px", color: "#aaa" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>◎</div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#555" }}>
            Aucun prestataire trouvé
          </div>
          <div style={{ fontSize: "0.82rem", marginTop: 6 }}>
            Essayez d'autres filtres.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
            <AnimatePresence>
              {providers.map((p, i) => (
                <ProviderCard key={p._id} provider={p} index={i}
                  isFreelancer={isFreelancer}
                  onCollab={setCollabTarget} />
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => load(p)}
                  style={{ padding: "7px 14px", borderRadius: 8,
                    border: "1.5px solid " + (p === page ? "#7c3aed" : "#e5e5e5"),
                    background: p === page ? "#7c3aed" : "#fff",
                    color: p === page ? "#fff" : "#555",
                    fontFamily: "inherit", fontSize: "0.82rem", fontWeight: 700,
                    cursor: "pointer" }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <AnimatePresence>
        {collabTarget && (
          <CollaborationRequestModal
            target={collabTarget}
            onClose={() => setCollabTarget(null)}
            onSuccess={() => setCollabTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrowseProvidersPage;
