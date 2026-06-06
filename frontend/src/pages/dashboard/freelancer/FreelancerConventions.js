
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pitchService from "../../../services/pitchService";
import uploadService from "../../../services/uploadService";

const STATUS_META = {
  pending:   { label: "En attente",  color: "#d97706", bg: "#fffbeb" },
  accepted:  { label: "Acceptée",    color: "#059669", bg: "#f0fdf4" },
  rejected:  { label: "Refusée",     color: "#dc2626", bg: "#fef2f2" },
  withdrawn: { label: "Retirée",     color: "#6b7280", bg: "#f9fafb" },
};

const FILTER_TABS = [
  { v: "all",      l: "Toutes"      },
  { v: "pending",  l: "En attente"  },
  { v: "accepted", l: "Acceptées"   },
  { v: "rejected", l: "Refusées"    },
];

const NETWORKS = {
  Instagram: "📸", TikTok: "🎵", YouTube: "▶️", LinkedIn: "💼",
  Twitter: "🐦", Facebook: "📘", Snapchat: "👻", Autre: "🔗",
};

const PAYMENT_LABELS = {
  virement: "Virement bancaire", cheque: "Chèque",
  especes: "Espèces", autre: "Autre",
};

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const Section = ({ title, children, accent = "#c0152a" }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{
      fontSize: "0.68rem", fontWeight: 800, color: accent,
      textTransform: "uppercase", letterSpacing: "0.08em",
      borderBottom: `1.5px solid ${accent}33`, paddingBottom: 5, marginBottom: 10,
    }}>
      {title}
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => value ? (
  <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: "0.84rem" }}>
    <span style={{ color: "#888", fontWeight: 600, minWidth: 140, flexShrink: 0 }}>{label} :</span>
    <span style={{ color: "#222", fontWeight: 500 }}>{value}</span>
  </div>
) : null;

const TextBlock = ({ text }) => text ? (
  <p style={{
    margin: 0, fontSize: "0.85rem", color: "#333", lineHeight: 1.65,
    background: "#fafafa", borderRadius: 8, padding: "10px 14px",
    border: "1px solid #f0f0f0",
  }}>
    {text}
  </p>
) : null;

const ConventionModal = ({ convention, userId, onClose, onRefresh }) => {
  const [rejectBox, setRejectBox] = useState(false);
  const [reason,    setReason]    = useState("");
  const [acting,    setActing]    = useState(false);
  const [localErr,  setLocalErr]  = useState("");

  const isPending  = convention.status === "pending";
  const agency     = convention.senderAgency || {};
  const agencyName = agency.agencyName || "Agence";
  const agencyLogo = agency.logo;
  const initials   = agencyName.slice(0, 2).toUpperCase();
  const meta       = STATUS_META[convention.status] || STATUS_META.pending;

  const proposed   = convention.proposedPrice || {};
  const timeline   = convention.timeline || {};
  const analysis   = convention.analysis || {};
  const networks   = analysis.socialNetworks || [];

  const handleAccept = async () => {
    if (!window.confirm("Accepter cette convention ?")) return;
    setActing(true); setLocalErr("");
    try {
      await pitchService.acceptConvention(convention._id, userId);
      onRefresh(); onClose();
    } catch (err) {
      setLocalErr(err?.response?.data?.message || "Erreur");
    } finally { setActing(false); }
  };

  const handleReject = async () => {
    setActing(true); setLocalErr("");
    try {
      await pitchService.rejectConvention(convention._id, userId, reason);
      onRefresh(); onClose();
    } catch (err) {
      setLocalErr(err?.response?.data?.message || "Erreur");
    } finally { setActing(false); }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 9000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
        display: "flex", flexDirection: "column",
      }}>

        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          padding: "18px 24px 14px", borderBottom: "1px solid #f0f0f0",
          background: "#fff", borderRadius: "16px 16px 0 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {agencyLogo ? (
              <img src={uploadService.resolveUrl(agencyLogo)} alt={agencyName}
                onError={e => { e.target.style.display = "none"; }}
                style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.9rem", fontWeight: 800, color: "#fff",
              }}>{initials}</div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: "1rem", color: "#111" }}>{agencyName}</div>
              <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 2 }}>
                Convention reçue le {fmt(convention.createdAt)}
              </div>
            </div>
            <span style={{
              padding: "3px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
              background: meta.bg, color: meta.color,
            }}>{meta.label}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
              fontSize: "1.1rem", color: "#999", padding: "2px 6px", marginLeft: 4 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "20px 24px", flex: 1 }}>

          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20,
          }}>
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "#faeaea",
              border: "1px solid #f5caca", fontSize: "0.82rem" }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#9a6060",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Agence (Partie A)</div>
              <div style={{ fontWeight: 700 }}>{agencyName}</div>
            </div>
            <div style={{ padding: "10px 14px", borderRadius: 10, background: "#f0f7ff",
              border: "1px solid #bfdbfe", fontSize: "0.82rem" }}>
              <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "#0369a1",
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Freelancer (Partie B)</div>
              <div style={{ fontWeight: 700 }}>Vous</div>
            </div>
          </div>

          <Section title="Art. 01 — Objet de la convention">
            <TextBlock text={convention.description} />
          </Section>

          <Section title="Art. 02 — Conditions d'exploitation">
            {convention.workRequirements
              ? <TextBlock text={convention.workRequirements} />
              : <p style={{ margin: 0, fontSize: "0.82rem", color: "#aaa", fontStyle: "italic" }}>
                  Non spécifiées.
                </p>}
          </Section>

          <Section title="Art. 03 — Obligations du freelancer">
            <TextBlock text={
              "Le freelancer s'engage à réaliser les prestations convenues avec sérieux et professionnalisme, " +
              "à respecter les délais fixés, à ne pas sous-traiter sans accord préalable de l'agence, " +
              "et à maintenir une image cohérente avec les valeurs du client."
            } />
            {analysis.artNote03 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: 4, fontWeight: 600 }}>
                  Conditions particulières :
                </div>
                <TextBlock text={analysis.artNote03} />
              </div>
            )}
          </Section>

          <Section title="Art. 04 — Obligations de l'agence">
            <TextBlock text={
              "L'agence s'engage à fournir au freelancer tous les éléments nécessaires à la réalisation de sa mission, " +
              "à le rémunérer dans les délais convenus, et à respecter sa créativité dans le cadre des directives établies."
            } />
            {analysis.artNote04 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: 4, fontWeight: 600 }}>
                  Engagements spécifiques :
                </div>
                <TextBlock text={analysis.artNote04} />
              </div>
            )}
          </Section>

          <Section title="Art. 05 — Rémunération">
            {proposed.amount > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4",
                  border: "1px solid #bbf7d0", textAlign: "center" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#059669" }}>
                    {Number(proposed.amount).toLocaleString()} {proposed.currency || "DZD"}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#888", marginTop: 2 }}>Rémunération</div>
                </div>
                {proposed.paymentMethod && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fafafa",
                    border: "1px solid #f0f0f0", textAlign: "center" }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#333" }}>
                      {PAYMENT_LABELS[proposed.paymentMethod] || proposed.paymentMethod}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#888", marginTop: 2 }}>Mode de paiement</div>
                  </div>
                )}
                {proposed.paymentSchedule && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fafafa",
                    border: "1px solid #f0f0f0", textAlign: "center" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#333" }}>
                      {proposed.paymentSchedule}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#888", marginTop: 2 }}>Calendrier</div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#aaa", fontStyle: "italic" }}>
                Aucune rémunération monétaire spécifiée.
              </p>
            )}
          </Section>

          <Section title="Art. 06 — Réseaux sociaux concernés">
            {networks.length > 0 ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {networks.map(n => (
                  <span key={n} style={{
                    padding: "5px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600,
                    background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ede9fe",
                  }}>
                    {NETWORKS[n] || ""} {n}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#aaa", fontStyle: "italic" }}>
                Non spécifiés.
              </p>
            )}
          </Section>

          <Section title="Art. 07 — Durée de la convention">
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {convention.contractType && (
                <div style={{ padding: "8px 14px", borderRadius: 8, background: "#fafafa",
                  border: "1px solid #f0f0f0", textAlign: "center" }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 800, textTransform: "uppercase",
                    color: "#c0152a" }}>{convention.contractType}</div>
                  <div style={{ fontSize: "0.68rem", color: "#888", marginTop: 2 }}>Type de contrat</div>
                </div>
              )}
              {timeline.startDate && (
                <div style={{ padding: "8px 14px", borderRadius: 8, background: "#fafafa",
                  border: "1px solid #f0f0f0", textAlign: "center" }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#333" }}>{fmt(timeline.startDate)}</div>
                  <div style={{ fontSize: "0.68rem", color: "#888", marginTop: 2 }}>Début</div>
                </div>
              )}
              {timeline.endDate ? (
                <div style={{ padding: "8px 14px", borderRadius: 8, background: "#fafafa",
                  border: "1px solid #f0f0f0", textAlign: "center" }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#333" }}>{fmt(timeline.endDate)}</div>
                  <div style={{ fontSize: "0.68rem", color: "#888", marginTop: 2 }}>Fin</div>
                </div>
              ) : (
                <div style={{ padding: "8px 14px", borderRadius: 8, background: "#f0fdf4",
                  border: "1px solid #bbf7d0", textAlign: "center" }}>
                  <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#059669" }}>Indéterminée</div>
                  <div style={{ fontSize: "0.68rem", color: "#888", marginTop: 2 }}>CDI</div>
                </div>
              )}
            </div>
          </Section>

          <Section title="Art. 08 — Confidentialité">
            <div style={{
              padding: "10px 14px", borderRadius: 8,
              background: analysis.confidentialityClause === false ? "#fff7ed" : "#f0fdf4",
              border: `1px solid ${analysis.confidentialityClause === false ? "#fed7aa" : "#bbf7d0"}`,
              fontSize: "0.85rem", fontWeight: 600,
              color: analysis.confidentialityClause === false ? "#9a3412" : "#166534",
            }}>
              {analysis.confidentialityClause === false
                ? "⚠ Sans clause de confidentialité"
                : "✓ Clause de confidentialité incluse"}
            </div>
          </Section>

          <Section title="Art. 09 — Litiges">
            <TextBlock text="Tout litige sera soumis à une tentative de règlement amiable. À défaut, les parties reconnaissent la compétence des tribunaux algériens compétents." />
          </Section>

          <Section title="Art. 10 — Avenants">
            <TextBlock text="Toute modification doit faire l'objet d'un avenant écrit, signé par les deux parties." />
            {analysis.amendments && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: "0.72rem", color: "#888", marginBottom: 4, fontWeight: 600 }}>
                  Avenants spécifiques :
                </div>
                <TextBlock text={analysis.amendments} />
              </div>
            )}
          </Section>

          {analysis.effectiveDate && (
            <Section title="Art. 11 — Date d'effet">
              <div style={{ padding: "8px 14px", borderRadius: 8, background: "#fafafa",
                border: "1px solid #f0f0f0", display: "inline-block" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "#333" }}>
                  {fmt(analysis.effectiveDate)}
                </span>
              </div>
            </Section>
          )}

          {convention.rejectionReason && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2",
              border: "1px solid #fecaca", fontSize: "0.84rem", color: "#dc2626",
              fontWeight: 500, marginBottom: 16 }}>
              Motif du refus : {convention.rejectionReason}
            </div>
          )}

          {localErr && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#fef2f2",
              border: "1px solid #fecaca", fontSize: "0.83rem", color: "#dc2626",
              marginBottom: 12 }}>
              {localErr}
            </div>
          )}

          {isPending && (
            <div style={{
              position: "sticky", bottom: 0,
              background: "#fff", borderTop: "1.5px solid #f0f0f0",
              padding: "16px 0 4px", marginTop: 8,
            }}>
              {!rejectBox ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleAccept} disabled={acting} style={{
                    flex: 1, padding: "12px 24px", borderRadius: 9, border: "none",
                    background: acting ? "#d1d5db" : "#059669", color: "#fff",
                    fontWeight: 700, fontSize: "0.9rem",
                    cursor: acting ? "default" : "pointer", fontFamily: "inherit",
                  }}>
                    {acting ? "..." : "✓ Accepter la convention"}
                  </button>
                  <button onClick={() => setRejectBox(true)} disabled={acting} style={{
                    padding: "12px 22px", borderRadius: 9,
                    border: "1.5px solid #ef4444", background: "#fff",
                    color: "#ef4444", fontWeight: 700, fontSize: "0.9rem",
                    cursor: "pointer", fontFamily: "inherit",
                  }}>
                    Refuser
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: "14px", borderRadius: 10, background: "#fef2f2",
                    border: "1px solid #fecaca" }}>
                  <div style={{ fontSize: "0.83rem", fontWeight: 600, color: "#dc2626", marginBottom: 8 }}>
                    Motif du refus (optionnel)
                  </div>
                  <textarea
                    value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Expliquez brièvement pourquoi vous refusez..."
                    rows={2}
                    style={{ width: "100%", fontFamily: "inherit", fontSize: "0.84rem",
                      borderRadius: 8, border: "1px solid #fca5a5", padding: "8px 10px",
                      resize: "vertical", boxSizing: "border-box", background: "#fff" }} />
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={handleReject} disabled={acting} style={{
                      padding: "9px 18px", borderRadius: 8, border: "none",
                      background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: "0.83rem",
                      cursor: acting ? "default" : "pointer", fontFamily: "inherit" }}>
                      {acting ? "..." : "Confirmer le refus"}
                    </button>
                    <button onClick={() => { setRejectBox(false); setReason(""); }} style={{
                      padding: "9px 14px", borderRadius: 8, border: "1px solid #ddd",
                      background: "#fff", color: "#555", fontWeight: 600, fontSize: "0.83rem",
                      cursor: "pointer", fontFamily: "inherit" }}>
                      Annuler
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConventionRow = ({ convention, onClick }) => {
  const meta       = STATUS_META[convention.status] || STATUS_META.pending;
  const agency     = convention.senderAgency || {};
  const agencyName = agency.agencyName || "Agence";
  const agencyLogo = agency.logo;
  const initials   = agencyName.slice(0, 2).toUpperCase();
  const proposed   = convention.proposedPrice || {};
  const isPending  = convention.status === "pending";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: 12, border: "1px solid #ebebeb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        borderLeft: `4px solid ${meta.color}`,
        padding: "16px 18px",
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 14,
        transition: "box-shadow 0.15s",
      }}
      whileHover={{ boxShadow: "0 4px 16px rgba(0,0,0,0.09)" }}>

      {agencyLogo ? (
        <img src={uploadService.resolveUrl(agencyLogo)} alt={agencyName}
          onError={e => { e.target.style.display = "none"; }}
          style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
      ) : (
        <div style={{
          width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, #7c3aed, #5b21b6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem", fontWeight: 800, color: "#fff",
        }}>{initials}</div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#111" }}>{agencyName}</span>
          <span style={{
            padding: "2px 9px", borderRadius: 20, fontSize: "0.65rem", fontWeight: 700,
            background: meta.bg, color: meta.color,
          }}>{meta.label}</span>
          {isPending && (
            <span style={{
              padding: "2px 9px", borderRadius: 20, fontSize: "0.65rem", fontWeight: 700,
              background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d",
            }}>En attente de votre réponse</span>
          )}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#999", marginTop: 3 }}>
          Reçue le {new Date(convention.createdAt).toLocaleDateString("fr-DZ")}
          {convention.respondedAt && ` · Répondue le ${new Date(convention.respondedAt).toLocaleDateString("fr-DZ")}`}
        </div>
        {convention.description && (
          <p style={{
            margin: "6px 0 0", fontSize: "0.8rem", color: "#666", lineHeight: 1.5,
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 1, WebkitBoxOrient: "vertical",
          }}>{convention.description}</p>
        )}
      </div>

      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {proposed.amount > 0 && (
          <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#059669" }}>
            {Number(proposed.amount).toLocaleString()} {proposed.currency || "DZD"}
          </div>
        )}
        <div style={{ fontSize: "0.72rem", color: "#c0152a", fontWeight: 600, marginTop: 4 }}>
          Lire la convention →
        </div>
      </div>
    </motion.div>
  );
};

const FreelancerConventions = ({ user }) => {
  const [conventions, setConventions] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [selected,    setSelected]    = useState(null);

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const data = await pitchService.getReceivedConventions(user._id);
      setConventions(data.conventions || []);
    } catch (err) {
      console.error("getReceivedConventions:", err?.response?.data || err?.message || err);
    } finally { setLoading(false); }
  }, [user?._id]);

  useEffect(() => { load(); }, [load]);

  const pending   = conventions.filter(c => c.status === "pending").length;
  const displayed = filter === "all"
    ? conventions
    : conventions.filter(c => c.status === filter);

  return (
    <div>
      {selected && (
        <ConventionModal
          convention={selected}
          userId={user._id}
          onClose={() => setSelected(null)}
          onRefresh={() => { load(); setSelected(null); }}
        />
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: "0 0 4px", fontWeight: 800, fontSize: "1.3rem", color: "#111" }}>
              Conventions reçues
            </h2>
            <p style={{ margin: 0, fontSize: "0.83rem", color: "#888" }}>
              Propositions de collaboration des agences · Cliquez pour lire et répondre
            </p>
          </div>
          {pending > 0 && (
            <div style={{
              padding: "8px 16px", borderRadius: 10, background: "#fffbeb",
              border: "1.5px solid #fcd34d", fontSize: "0.83rem", fontWeight: 700, color: "#92400e",
            }}>
              {pending} en attente de réponse
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {FILTER_TABS.map(t => {
          const active = filter === t.v;
          const count  = t.v === "all" ? conventions.length
            : conventions.filter(c => c.status === t.v).length;
          return (
            <button key={t.v} onClick={() => setFilter(t.v)} style={{
              padding: "7px 16px", borderRadius: 20, fontFamily: "inherit",
              fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
              border: "1.5px solid " + (active ? "#7c3aed" : "#e5e5e5"),
              background: active ? "#7c3aed" : "#fff",
              color: active ? "#fff" : "#666",
            }}>
              {t.l} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div className="spinner" />
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 16px" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📋</div>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#333", marginBottom: 8 }}>
            {filter === "all" ? "Aucune convention reçue" : "Aucune convention dans cette catégorie"}
          </div>
          <div style={{ fontSize: "0.83rem", color: "#aaa" }}>
            Les agences peuvent vous envoyer des conventions depuis votre profil.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AnimatePresence>
            {displayed.map(conv => (
              <ConventionRow
                key={conv._id}
                convention={conv}
                onClick={() => setSelected(conv)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FreelancerConventions;
