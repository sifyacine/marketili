
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from "./shared";
import projectService from "../../../services/projectService";
import { getDeadlineColor, getDeadlineLabel } from "../../../utils/deadlineColor";
import { IconBriefcase } from "../../../components/ui/Icons";

const STATUS_LABEL = {
  pending:          "En attente",
  pending_contract: "Contrat en attente",
  active:           "Actif",
  in_review:        "En révision",
  completed:        "Terminé",
  cancelled:        "Annulé",
};
const STATUS_COLOR = {
  pending:          "#f59e0b",
  pending_contract: "#f59e0b",
  active:           "#7c3aed",
  in_review:        "#0891b2",
  completed:        "#10b981",
  cancelled:        "#6b7280",
};


const ProjectDetail = ({ project: initial, user, onBack }) => {
  const [project,      setProject]      = useState(initial);
  const [deliverables, setDeliverables] = useState([]);
  const [dlLoading,    setDlLoading]    = useState(true);
  const [form,         setForm]         = useState({ fileUrl: "", fileName: "", description: "" });
  const [submitting,   setSubmitting]   = useState(false);
  const [marking,      setMarking]      = useState(null);
  const [msg,          setMsg]          = useState({ text: "", ok: true });

  useEffect(() => {
    Promise.all([
      projectService.getProject(initial._id).then(d => setProject(d.project || initial)),
      projectService.getDeliverables(initial._id).then(d => setDeliverables(d.deliverables || [])),
    ])
      .catch(() => {})
      .finally(() => setDlLoading(false));
    
  }, [initial._id]);

  const showMsg = (text, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fileUrl.trim() || !form.fileName.trim()) return;
    setSubmitting(true);
    try {
      const d = await projectService.addDeliverable(project._id, {
        fileUrl: form.fileUrl.trim(),
        fileName: form.fileName.trim(),
        description: form.description.trim(),
        submittedBy: user._id,
      });
      setDeliverables(d.project?.deliverables || []);
      setForm({ fileUrl: "", fileName: "", description: "" });
      showMsg("Livrable soumis avec succès");
    } catch (err) {
      showMsg(err.response?.data?.message || "Erreur lors de la soumission", false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (dl) => {
    setMarking(dl._id);
    try {
      const d = await projectService.updateDeliverable(project._id, dl._id, {
        isComplete: !dl.isComplete,
      });
      setDeliverables(d.deliverables || []);
      showMsg(!dl.isComplete ? "Livrable marqué comme complété ✓" : "Marquage annulé");
    } catch {
      showMsg("Erreur", false);
    } finally {
      setMarking(null);
    }
  };

  const dlColor = getDeadlineColor(project.deadline);
  const dlLabel = getDeadlineLabel(project.deadline);
  const isDone  = ["completed", "cancelled"].includes(project.projectStatus);

  const clientName =
    project.client?.companyName ||
    (project.client?.firstName
      ? `${project.client.firstName} ${project.client.lastName}`
      : null) ||
    "Client";

  return (
    <div>
      {}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack}
          style={{ background: "none", border: "1.5px solid var(--d-border-soft)",
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            fontSize: "0.82rem", color: "var(--d-muted)", fontFamily: "inherit", fontWeight: 600 }}>
          Retour
        </button>
        <div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--d-ink)" }}>
            {project.title}
          </h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 3 }}>
            <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
              background: (STATUS_COLOR[project.projectStatus] || "#6b7280") + "22",
              color: STATUS_COLOR[project.projectStatus] || "#6b7280" }}>
              {STATUS_LABEL[project.projectStatus] || project.projectStatus}
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--d-muted)" }}>
              Client : <strong style={{ color: "var(--d-ink)" }}>{clientName}</strong>
            </span>
          </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {msg.text && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14,
              background: msg.ok ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${msg.ok ? "#6ee7b7" : "#fecaca"}`,
              color: msg.ok ? "#065f46" : "#b91c1c", fontSize: "0.82rem" }}>
            {msg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <div className="card" style={{ padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--d-muted)",
          textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Avancement global
        </div>
        <ProgressBar value={project.progress || 0} />
        <div style={{ display: "flex", justifyContent: "space-between",
          fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 6 }}>
          <span>{project.progress || 0}% complété</span>
          {!isDone && project.deadline && (
            <span style={{ color: dlColor, fontWeight: 600 }}>
              {new Date(project.deadline).toLocaleDateString("fr-DZ")} — {dlLabel}
            </span>
          )}
        </div>
        {project.description && (
          <p style={{ fontSize: "0.82rem", color: "var(--d-muted)", marginTop: 12, lineHeight: 1.6 }}>
            {project.description}
          </p>
        )}
      </div>

      {}
      <div className="card">
        <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--d-border-soft)" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--d-ink)" }}>
            Livrables ({deliverables.length})
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", marginTop: 2 }}>
            Soumettez vos fichiers et marquez-les comme complétés
          </div>
        </div>

        {}
        {!isDone && (
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--d-border-soft)",
            background: "var(--d-surface)" }}>
            <form onSubmit={handleSubmit} className="dash-form">
              <div className="dash-form-row">
                <div className="dash-form-group" style={{ flex: 1 }}>
                  <label className="dash-form-label">Nom du fichier *</label>
                  <input className="dash-form-input" value={form.fileName} required
                    placeholder="Rapport_final.pdf"
                    onChange={e => setForm(f => ({ ...f, fileName: e.target.value }))} />
                </div>
                <div className="dash-form-group" style={{ flex: 2 }}>
                  <label className="dash-form-label">URL du fichier *</label>
                  <input className="dash-form-input" value={form.fileUrl} required
                    placeholder="https://drive.google.com/..."
                    onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} />
                </div>
              </div>
              <div className="dash-form-group">
                <label className="dash-form-label">Description (optionnel)</label>
                <textarea className="dash-form-textarea" rows={2} value={form.description}
                  placeholder="Notes sur ce livrable..."
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <button type="submit" className="section-cta-btn"
                style={{ fontSize: "0.82rem", padding: "8px 16px" }}
                disabled={submitting}>
                {submitting ? "Envoi..." : "+ Soumettre le livrable"}
              </button>
            </form>
          </div>
        )}

        {}
        {dlLoading ? (
          <div className="spinner-wrap" style={{ padding: 24 }}><div className="spinner" /></div>
        ) : deliverables.length === 0 ? (
          <div className="empty-state" style={{ padding: "28px 24px" }}>
            <div className="empty-state-title" style={{ fontSize: "0.88rem" }}>
              Aucun livrable soumis
            </div>
          </div>
        ) : (
          deliverables.map((dl, i) => (
            <div key={dl._id || i}
              style={{ display: "flex", alignItems: "flex-start", gap: 14,
                padding: "14px 22px",
                borderBottom: i < deliverables.length - 1 ? "1px solid var(--d-border-soft)" : "none",
                background: dl.isComplete ? "#f0fdf4" : "#fff",
                transition: "background 0.2s" }}>
              <button
                onClick={() => handleToggleComplete(dl)}
                disabled={marking === dl._id}
                title={dl.isComplete ? "Marquer comme incomplet" : "Marquer comme complété"}
                style={{ marginTop: 2, width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${dl.isComplete ? "#10b981" : "#d1d5db"}`,
                  background: dl.isComplete ? "#10b981" : "transparent",
                  cursor: marking === dl._id ? "wait" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s" }}>
                {dl.isComplete && (
                  <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 900, lineHeight: 1 }}>
                    ✓
                  </span>
                )}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <a href={dl.fileUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontWeight: 700, fontSize: "0.87rem",
                      color: dl.isComplete ? "#065f46" : "var(--d-ink)",
                      textDecoration: "none",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {dl.fileName}
                  </a>
                  {dl.isComplete && (
                    <span style={{ padding: "1px 8px", borderRadius: 20, fontSize: "0.68rem",
                      fontWeight: 700, background: "#d1fae5", color: "#065f46",
                      whiteSpace: "nowrap", flexShrink: 0 }}>
                      ✓ Complété
                    </span>
                  )}
                </div>
                {dl.description && (
                  <div style={{ fontSize: "0.78rem", color: "var(--d-muted)", lineHeight: 1.5 }}>
                    {dl.description}
                  </div>
                )}
                <div style={{ fontSize: "0.68rem", color: "#bbb", marginTop: 4 }}>
                  {dl.submittedAt
                    ? new Date(dl.submittedAt).toLocaleDateString("fr-DZ",
                        { day: "2-digit", month: "short", year: "numeric" })
                    : "—"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


const CommercialProjects = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    projectService.getMemberProjects(user._id)
      .then(d => setProjects(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  const sorted = [...projects].sort((a, b) => {
    const aDone = ["completed", "cancelled"].includes(a.projectStatus);
    const bDone = ["completed", "cancelled"].includes(b.projectStatus);
    if (aDone !== bDone) return aDone ? 1 : -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });

  if (selected) {
    return (
      <ProjectDetail
        project={selected}
        user={user}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes projets</h2>
          <p>{sorted.length} projet{sorted.length !== 1 ? "s" : ""} assigné{sorted.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : sorted.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon"><IconBriefcase size={20} /></div>
            <div className="empty-state-title">Aucun projet assigné</div>
            <div className="empty-state-desc">
              Vous apparaîtrez ici dès qu'un directeur vous assigne à un projet.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: 16 }}>
          {sorted.map((p, i) => {
            const isDone  = ["completed", "cancelled"].includes(p.projectStatus);
            const dlColor = isDone ? "#9e9e9e" : getDeadlineColor(p.deadline);
            const dlLabel = isDone ? null       : getDeadlineLabel(p.deadline);

            const clientName =
              p.client?.companyName ||
              (p.client?.firstName
                ? `${p.client.firstName} ${p.client.lastName}`
                : null) ||
              "Client";

            const doneDeliverables = (p.deliverables || []).filter(d => d.isComplete).length;
            const totalDeliverables = (p.deliverables || []).length;

            return (
              <motion.div key={p._id} className="card"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{ cursor: "pointer", borderLeft: `3px solid ${dlColor}`,
                  opacity: isDone ? 0.65 : 1 }}
                onClick={() => setSelected(p)}>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem",
                      color: "var(--d-ink)", flex: 1 }}>
                      {p.title}
                    </div>
                    <span style={{ padding: "3px 10px", borderRadius: 20,
                      fontSize: "0.7rem", fontWeight: 700, marginLeft: 8, whiteSpace: "nowrap",
                      background: (STATUS_COLOR[p.projectStatus] || "#6b7280") + "22",
                      color: STATUS_COLOR[p.projectStatus] || "#6b7280" }}>
                      {STATUS_LABEL[p.projectStatus] || p.projectStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--d-muted)", marginBottom: 10 }}>
                    Client : <strong style={{ color: "var(--d-ink)" }}>{clientName}</strong>
                  </div>

                  <ProgressBar value={p.progress || 0} />

                  <div style={{ display: "flex", justifyContent: "space-between",
                    fontSize: "0.72rem", color: "var(--d-muted)", marginTop: 6 }}>
                    <span>
                      {p.progress || 0}% global
                      {totalDeliverables > 0 && (
                        <span style={{ marginLeft: 8, color: "#0891b2", fontWeight: 600 }}>
                          · {doneDeliverables}/{totalDeliverables} livrable{totalDeliverables !== 1 ? "s" : ""}
                        </span>
                      )}
                    </span>
                    {dlLabel
                      ? <span style={{ color: dlColor, fontWeight: 600 }}>{dlLabel}</span>
                      : <span>Échéance : {p.deadline
                          ? new Date(p.deadline).toLocaleDateString("fr-DZ") : "—"}</span>
                    }
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CommercialProjects;
