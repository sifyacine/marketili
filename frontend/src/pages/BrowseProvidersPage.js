
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import profileService from "../services/profileService";
import uploadService  from "../services/uploadService";
import useAuth from "../hooks/useAuth";
import CollaborationRequestModal from "../components/collaborations/CollaborationRequestModal";
import { IconSearch } from "../components/ui/Icons";
import BrowseBanner  from "../components/ui/BrowseBanner";

const TYPE_TABS = [
  { v: "all",        l: "Tous"        },
  { v: "agency",     l: "Agences"     },
  { v: "team",       l: "Équipes"     },
  { v: "freelancer", l: "Freelancers" },
];

const SPECIALTIES = [
  "Events", "360 Marketing", "ATL", "BTL", "Production", "Brand Marketing",
  "Digital", "Influence & Réseaux sociaux", "Relations presse", "Brand Strategy",
];

const WILAYAS = [
  "Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Béjaïa","Biskra",
  "Béchar","Blida","Bouira","Tamanrasset","Tébessa","Tlemcen","Tiaret",
  "Tizi Ouzou","Alger","Djelfa","Jijel","Sétif","Saïda","Skikda",
  "Sidi Bel Abbès","Annaba","Guelma","Constantine","Médéa","Mostaganem",
  "M'Sila","Mascara","Ouargla","Oran","El Bayadh","Illizi","Bordj Bou Arréridj",
  "Boumerdès","El Tarf","Tindouf","Tissemsilt","El Oued","Khenchela",
  "Souk Ahras","Tipaza","Mila","Aïn Defla","Naâma","Aïn Témouchent",
  "Ghardaïa","Relizane",
];

const ROLE_META = {
  agency:     { color: "#7c3aed", bg: "#f5f3ff", label: "Agence" },
  team:       { color: "#0891b2", bg: "#e0f2fe", label: "Équipe" },
  freelancer: { color: "#c0152a", bg: "#fef2f2", label: "Freelancer" },
};

const ProviderCard = ({ provider, index, onCollab, isFreelancer }) => {
  const navigate = useNavigate();
  const role  = provider._role;
  const meta  = ROLE_META[role] || { color: "#6b7280", bg: "#f3f4f6", label: role };

  const name = provider.agencyName || provider.teamName ||
    (provider.firstName ? `${provider.firstName} ${provider.lastName}` : "—");
  const avatarSrc    = provider.logo || provider.avatar || null;
  const initials     = name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  const specialties  = provider.specialties || provider.skills || provider.categories || [];
  const locationStr  = provider.address?.region || provider.location?.region || "";
  const membersCount = Array.isArray(provider.members) ? provider.members.length : null;

  const goProfile = () => navigate(`/profile/${role}/${provider._id}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      style={{
        borderRadius: 16,
        border: "1px solid #ebebeb",
        background: "#fff",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow 0.18s, transform 0.18s",
      }}
      whileHover={{ boxShadow: "0 8px 28px rgba(0,0,0,0.10)", y: -3 }}>

      <div style={{
        height: 6, background: meta.color, opacity: 0.7, flexShrink: 0,
      }} />

      <div style={{ padding: "18px 18px 0", flex: 1 }}>
        <div style={{ display: "flex", gap: 13, alignItems: "flex-start", marginBottom: 12 }}>
          {avatarSrc ? (
            <img src={uploadService.resolveUrl(avatarSrc)} alt={name}
              style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover",
                flexShrink: 0, border: `2px solid ${meta.color}22` }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.05rem", fontWeight: 800, color: "#fff",
              border: `2px solid ${meta.color}33` }}>
              {initials}
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: "0.93rem", color: "#111",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                {name}
              </span>
              <span style={{
                padding: "2px 9px", borderRadius: 20, fontSize: "0.63rem",
                fontWeight: 800, background: meta.bg, color: meta.color,
                letterSpacing: "0.04em", textTransform: "uppercase", flexShrink: 0,
              }}>
                {meta.label}
              </span>
            </div>
            {locationStr && (
              <div style={{ fontSize: "0.72rem", color: "#999", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: "0.7rem" }}>📍</span> {locationStr}
              </div>
            )}
          </div>
        </div>

        {provider.bio && (
          <p style={{
            fontSize: "0.79rem", color: "#666", lineHeight: 1.55, margin: "0 0 12px",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {provider.bio}
          </p>
        )}

        {specialties.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
            {specialties.slice(0, 3).map((s, i) => (
              <span key={i} style={{
                padding: "3px 9px", borderRadius: 20, fontSize: "0.63rem", fontWeight: 600,
                background: meta.bg, color: meta.color,
              }}>
                {s}
              </span>
            ))}
            {specialties.length > 3 && (
              <span style={{ fontSize: "0.63rem", color: "#bbb", alignSelf: "center" }}>
                +{specialties.length - 3}
              </span>
            )}
          </div>
        )}

        {(membersCount !== null || provider.followersCount > 0) && (
          <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
            {membersCount !== null && (
              <div style={{ fontSize: "0.72rem", color: "#888" }}>
                <span style={{ fontWeight: 700, color: meta.color }}>{membersCount}</span> membres
              </div>
            )}
            {provider.followersCount > 0 && (
              <div style={{ fontSize: "0.72rem", color: "#888" }}>
                <span style={{ fontWeight: 700, color: meta.color }}>
                  {provider.followersCount?.toLocaleString()}
                </span> abonnés
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        padding: "12px 18px",
        borderTop: "1px solid #f0f0f0",
        display: "flex", gap: 8, background: "#fafafa",
      }}>
        <button onClick={goProfile}
          style={{
            flex: 1, padding: "9px 14px", borderRadius: 9,
            border: `1.5px solid ${meta.color}`, background: meta.color,
            color: "#fff", fontWeight: 700, fontSize: "0.8rem",
            cursor: "pointer", fontFamily: "inherit",
          }}>
          Voir le profil
        </button>
        {isFreelancer && (role === "agency" || role === "team") && (
          <button
            onClick={e => { e.stopPropagation(); onCollab(provider); }}
            style={{
              padding: "9px 13px", borderRadius: 9, fontSize: "0.8rem", fontWeight: 700,
              border: `1.5px solid ${meta.color}`, background: "#fff", color: meta.color,
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
            }}>
            + Collaborer
          </button>
        )}
      </div>
    </motion.div>
  );
};

const BrowseProvidersPage = () => {
  const { user } = useAuth();
  const isFreelancer = user?.role === "freelancer";

  const [providers,    setProviders]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [type,         setType]         = useState("all");
  const [search,       setSearch]       = useState("");
  const [specialty,    setSpecialty]    = useState("");
  const [region,       setRegion]       = useState("");
  const [page,         setPage]         = useState(1);
  const [pages,        setPages]        = useState(1);
  const [total,        setTotal]        = useState(0);
  const [collabTarget, setCollabTarget] = useState(null);

  const load = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { type, page: pg, limit: 12 };
      if (search.trim())    params.search    = search.trim();
      if (specialty.trim()) params.specialty = specialty.trim();
      if (region.trim())    params.region    = region.trim();

      const data = await profileService.browseProviders(params);
      setProviders(data.providers || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  }, [type, search, specialty, region]);

  useEffect(() => { load(1); }, [type, specialty, region]);

  const handleSearch = (e) => { e.preventDefault(); load(1); };

  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 20px 48px" }}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontWeight: 900, fontSize: "1.5rem", margin: "0 0 4px", color: "#111" }}>
          Explorer les prestataires
        </h2>
        <p style={{ fontSize: "0.83rem", color: "#888", margin: 0 }}>
          {loading ? "Chargement…" : `${total} prestataire${total !== 1 ? "s" : ""} disponible${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      <BrowseBanner />

      <div style={{
        display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, marginTop: 20,
      }}>
        {TYPE_TABS.map(t => {
          const active = type === t.v;
          return (
            <button key={t.v} onClick={() => setType(t.v)}
              style={{
                padding: "7px 18px", borderRadius: 22, fontFamily: "inherit",
                fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
                border: "1.5px solid " + (active ? "#c0152a" : "#e5e5e5"),
                background: active ? "#c0152a" : "#fff",
                color: active ? "#fff" : "#666",
                transition: "all 0.14s",
              }}>
              {t.l}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSearch}
        style={{
          display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28,
          padding: "14px 16px", borderRadius: 14, background: "#f9f9f9",
          border: "1px solid #ebebeb",
        }}>
        <div style={{ position: "relative", flex: "2 1 200px" }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: "#bbb", display: "flex", pointerEvents: "none",
          }}>
            <IconSearch size={15} />
          </span>
          <input
            style={{
              paddingLeft: 34, width: "100%", padding: "9px 12px 9px 34px",
              borderRadius: 9, border: "1.5px solid #ddd", fontFamily: "inherit",
              fontSize: "0.84rem", background: "#fff", boxSizing: "border-box",
              outline: "none", color: "#1a1a1a",
            }}
            placeholder="Rechercher par nom, bio, spécialité..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <select
          value={specialty} onChange={e => setSpecialty(e.target.value)}
          style={{
            flex: "1 1 150px", padding: "9px 12px", borderRadius: 9,
            border: "1.5px solid #ddd", fontFamily: "inherit", fontSize: "0.84rem",
            background: "#fff", color: specialty ? "#111" : "#999", cursor: "pointer", outline: "none",
          }}>
          <option value="">Toutes spécialités</option>
          {SPECIALTIES.map(s => <option key={s} value={s} style={{ color: "#111" }}>{s}</option>)}
        </select>

        <select
          value={region} onChange={e => setRegion(e.target.value)}
          style={{
            flex: "1 1 150px", padding: "9px 12px", borderRadius: 9,
            border: "1.5px solid #ddd", fontFamily: "inherit", fontSize: "0.84rem",
            background: "#fff", color: region ? "#111" : "#999", cursor: "pointer", outline: "none",
          }}>
          <option value="">Toutes wilayas</option>
          {WILAYAS.map(w => <option key={w} value={w} style={{ color: "#111" }}>{w}</option>)}
        </select>

        <button type="submit"
          style={{
            padding: "9px 22px", borderRadius: 9, border: "none",
            background: "#111", color: "#fff", fontFamily: "inherit",
            fontSize: "0.84rem", fontWeight: 700, cursor: "pointer", flexShrink: 0,
          }}>
          Chercher
        </button>
      </form>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
          <div className="spinner" />
        </div>
      ) : providers.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 16px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 14 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#333", marginBottom: 8 }}>
            Aucun prestataire trouvé
          </div>
          <div style={{ fontSize: "0.83rem", color: "#aaa" }}>
            Essayez d'autres filtres ou une recherche plus large.
          </div>
        </div>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 18,
          }}>
            <AnimatePresence>
              {providers.map((p, i) => (
                <ProviderCard key={p._id} provider={p} index={i}
                  isFreelancer={isFreelancer} onCollab={setCollabTarget} />
              ))}
            </AnimatePresence>
          </div>

          {pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => load(p)}
                  style={{
                    width: 36, height: 36, borderRadius: 9, fontFamily: "inherit",
                    fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                    border: "1.5px solid " + (p === page ? "#c0152a" : "#e5e5e5"),
                    background: p === page ? "#c0152a" : "#fff",
                    color: p === page ? "#fff" : "#555",
                  }}>
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
