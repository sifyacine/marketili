import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import projectService from "../../../services/projectService";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";
import { ProgressBar, PriorityBadge } from "../agency/shared";
import { IconBriefcase, IconCheckSquare, IconUsers } from "../../../components/ui/Icons";
import ChatWindow from "../../../components/chat/ChatWindow";

const STATUS_META = {
  pending:    { label: "En attente",  color: "#f59e0b", bg: "#fffbeb" },
  active:     { label: "Actif",       color: "#7c3aed", bg: "#f3f0ff" },
  in_review:  { label: "En révision", color: "#0891b2", bg: "#e0f2fe" },
  completed:  { label: "Terminé",     color: "#10b981", bg: "#f0fdf4" },
  cancelled:  { label: "Annulé",      color: "#6b7280", bg: "#f9fafb" },
};

const TASK_STATUS = {
  todo:        { label: "À faire",    color: "#6b7280" },
  in_progress: { label: "En cours",  color: "#f59e0b" },
  in_review:   { label: "Révision",  color: "#0891b2" },
  done:        { label: "Terminé",   color: "#10b981" },
};

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
  : "—";

const STATUS_TABS = [
  { v: "all",       l: "Tous"       },
  { v: "active",    l: "Actifs"     },
  { v: "pending",   l: "En attente" },
  { v: "completed", l: "Terminés"   },
];

// ── Project detail ────────────────────────────────────────────────────────────
const ProjectDetail = ({ project: p, onBack }) => {
  const [activeTab,   setActiveTab]   = useState("detail");
  const [notes,       setNotes]       = useState(p.notes || []);
  const [noteText,    setNoteText]    = useState("");
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError,   setNoteError]   = useState("");
  const st = STATUS_META[p.projectStatus] || STATUS_META.active;
  const clientName = p.client
    ? (p.client.accountType === "company"
        ? p.client.companyName
        : `${p.client.firstName} ${p.client.lastName}`)
    : "Client inconnu";

  const submitNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNoteLoading(true); setNoteError("");
    try {
      const data = await projectService.addNote(p._id, { text: noteText.trim() });
      setNotes(data.notes || []);
      setNoteText("");
    } catch (err) {
      setNoteError(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally { setNoteLoading(false); }
  };

  return (
    <div>
      <button onClick={onBack}
        style={{ background: "none", border: "none", cursor: "pointer",
          fontSize: "0.82rem", color: "var(--d-muted)", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
        ← Retour aux projets
      </button>

      {/* ── Tab bar ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
        {[
          { id: "detail",     label: "Détail du projet" },
          { id: "notes",      label: `Notes${notes.length ? ` (${notes.length})` : ""}` },
          { id: "messagerie", label: "Messagerie" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 20px", borderRadius: 8, fontFamily: "inherit",
              fontWeight: 700, fontSize: "0.82rem", cursor: "pointer",
              border: activeTab === tab.id ? "2px solid #c0152a" : "1.5px solid var(--d-border-soft)",
              background: activeTab === tab.id ? "#c0152a" : "transparent",
              color: activeTab === tab.id ? "#fff" : "var(--d-muted)",
              transition: "all 0.15s",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "messagerie" && <ChatWindow projectId={p._id} />}

      {activeTab === "notes" && (
        <div>
          <div className="card" style={{ padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--d-muted)",
              textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>
              Laisser une note
            </div>
            <form onSubmit={submitNote}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Note sur ce projet..."
                rows={4}
                style={{ width: "100%", borderRadius: 9, border: "1.5px solid var(--d-border-soft)",
                  padding: "10px 14px", fontSize: "0.85rem", fontFamily: "inherit",
                  resize: "vertical", boxSizing: "border-box", outline: "none",
                  transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "#c0152a"}
                onBlur={e => e.target.style.borderColor = "var(--d-border-soft)"}
              />
              {noteError && (
                <div style={{ color: "#c0152a", fontSize: "0.78rem", marginTop: 6 }}>{noteError}</div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                <button type="submit" disabled={noteLoading || !noteText.trim()}
                  style={{ padding: "9px 22px", borderRadius: 9, border: "none",
                    background: noteText.trim() ? "#c0152a" : "var(--d-border-soft)",
                    color: noteText.trim() ? "#fff" : "var(--d-muted)",
                    fontWeight: 700, fontSize: "0.85rem",
                    cursor: noteText.trim() ? "pointer" : "not-allowed",
                    fontFamily: "inherit", transition: "all 0.15s" }}>
                  {noteLoading ? "Envoi…" : "Envoyer la note"}
                </button>
              </div>
            </form>
          </div>
          {notes.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: "40px 24px" }}>
                <div className="empty-state-title">Aucune note pour l'instant</div>
                <div className="empty-state-desc">Ajoutez des notes de suivi sur ce projet.</div>
              </div>
            </div>
          ) : (
            <div className="card">
              {[...notes].reverse().map((n, i) => (
                <div key={n._id || i} style={{ padding: "14px 22px",
                  borderBottom: i < notes.length - 1 ? "1px solid var(--d-border-soft)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--d-ink)" }}>
                      {n.authorName}
                      <span style={{ fontWeight: 400, color: "var(--d-muted)", marginLeft: 6,
                        fontSize: "0.72rem" }}>{n.authorRole}</span>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--d-muted)", whiteSpace: "nowrap" }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString("fr-DZ") : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "var(--d-ink)", lineHeight: 1.5 }}>
                    {n.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "detail" && <>

      <div className="card" style={{ padding: "24px 26px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 16, gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800 }}>{p.title}</h2>
            <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 4 }}>
              Client : {clientName}
            </div>
          </div>
          <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem",
            fontWeight: 700, whiteSpace: "nowrap", background: st.bg, color: st.color }}>
            {st.label}
          </span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <ProgressBar value={p.progress || 0} />
          <div style={{ fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 4 }}>
            Progression : {p.progress || 0}%
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap",
          fontSize: "0.78rem", color: "#555" }}>
          {p.deadline && (
            <div>Échéance : <strong style={{ color: getDeadlineColor(p.deadline) }}>
              {fmt(p.deadline)}
            </strong></div>
          )}
          <div>Tâches : <strong>{(p.tasks || []).length}</strong></div>
          <div>Membres assignés : <strong>{(p.assignedMembers || []).length}</strong></div>
        </div>
      </div>

      {/* Assigned members */}
      {(p.assignedMembers || []).length > 0 && (
        <div className="card" style={{ padding: 0, marginBottom: 20 }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--d-border-soft)",
            fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
            <IconUsers size={14} /> Membres assignés
          </div>
          <div style={{ display: "flex", gap: 12, padding: "16px 20px", flexWrap: "wrap" }}>
            {p.assignedMembers.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 8,
                border: "1px solid var(--d-border-soft)",
                background: "var(--d-surface)" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%",
                  background: "#059669", color: "#fff", fontSize: "0.62rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700 }}>
                  {m.memberName?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>{m.memberName}</div>
                  {m.role && <div style={{ fontSize: "0.68rem", color: "var(--d-muted)" }}>{m.role}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks */}
      {(p.tasks || []).length > 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid var(--d-border-soft)",
            fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
            <IconCheckSquare size={14} /> Tâches ({p.tasks.length})
          </div>
          {p.tasks.map((t, i) => {
            const tMeta = TASK_STATUS[t.status] || TASK_STATUS.todo;
            return (
              <div key={t._id || i}
                style={{ padding: "12px 20px", borderBottom: "1px solid var(--d-border-soft)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  borderLeft: `3px solid ${tMeta.color}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{t.title}</div>
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <PriorityBadge priority={t.priority} />
                    {t.dueDate && (
                      <span style={{ fontSize: "0.72rem", color: getDeadlineColor(t.dueDate), fontWeight: 600 }}>
                        {getDeadlineLabel(t.dueDate)}
                      </span>
                    )}
                    {(t.assignedTo || []).length > 0 && (
                      <span style={{ fontSize: "0.7rem", color: "var(--d-muted)" }}>
                        {t.assignedTo.length} assigné{t.assignedTo.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: "0.68rem", fontWeight: 700,
                  color: tMeta.color, whiteSpace: "nowrap", marginLeft: 12 }}>
                  {tMeta.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ padding: "32px 20px", textAlign: "center",
          color: "var(--d-muted)", fontSize: "0.82rem" }}>
          Aucune tâche dans ce projet
        </div>
      )}
      </> /* end detail tab */}
    </div>
  );
};

// ── Project card ──────────────────────────────────────────────────────────────
const ProjectCard = ({ project: p, index, onClick }) => {
  const isDone  = ["completed", "cancelled"].includes(p.projectStatus);
  const dlColor = isDone ? "#9e9e9e" : getDeadlineColor(p.deadline);
  const st      = STATUS_META[p.projectStatus] || STATUS_META.active;

  const clientName = p.client
    ? (p.client.accountType === "company"
        ? p.client.companyName
        : `${p.client.firstName} ${p.client.lastName}`)
    : "Client inconnu";

  return (
    <motion.div className="card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
      onClick={onClick}
      style={{ padding: "20px 22px", borderLeft: `3px solid ${dlColor}`,
        opacity: isDone ? 0.65 : 1, cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, fontSize: "0.92rem", flex: 1, paddingRight: 8 }}>
          {p.title}
        </div>
        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.68rem",
          fontWeight: 700, background: st.bg, color: st.color, whiteSpace: "nowrap" }}>
          {st.label}
        </span>
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--d-muted)", marginBottom: 12 }}>
        Client : {clientName}
      </div>
      <ProgressBar value={p.progress || 0} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10,
        fontSize: "0.72rem", color: "var(--d-muted)" }}>
        <span style={{ color: dlColor, fontWeight: 600 }}>
          {isDone ? fmt(p.deadline) : getDeadlineLabel(p.deadline)}
        </span>
        <span>{(p.tasks || []).length} tâche{(p.tasks || []).length !== 1 ? "s" : ""}</span>
      </div>
    </motion.div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const TeamLeadProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    if (!user?._id) return;
    setLoading(true);
    const params = filter !== "all" ? { status: filter } : {};
    projectService.getTeamProjects(user._id, params)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?._id, filter]);

  useEffect(() => { load(); }, [load]);

  if (selected) {
    return <ProjectDetail project={selected} onBack={() => setSelected(null)} />;
  }

  const active = projects.filter(p => p.projectStatus === "active").length;
  const done   = projects.filter(p => p.projectStatus === "completed").length;

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Projets</h2>
          <p style={{ color: "var(--d-muted)" }}>
            {active} actif{active !== 1 ? "s" : ""} · {done} terminé{done !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_TABS.map(tab => (
          <button key={tab.v} onClick={() => setFilter(tab.v)}
            style={{ padding: "6px 16px", borderRadius: 20, fontSize: "0.78rem",
              fontWeight: 600, cursor: "pointer", border: "none",
              background: filter === tab.v ? "#059669" : "#f3f4f6",
              color: filter === tab.v ? "#fff" : "#555",
              transition: "background 0.15s, color 0.15s" }}>
            {tab.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ color: "#ccc", marginBottom: 12 }}><IconBriefcase size={24} /></div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucun projet</div>
          <div style={{ fontSize: "0.8rem", color: "var(--d-muted)" }}>
            Vos projets apparaîtront ici lorsque des offres seront acceptées
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={filter}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}>
            <div style={{ display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
              {projects.map((p, i) => (
                <ProjectCard key={p._id} project={p} index={i} onClick={() => setSelected(p)} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default TeamLeadProjects;
