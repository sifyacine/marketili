import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import postService from "../../services/postService";
import { getDeadlineColor, getDeadlineLabel } from "../../utils/deadlineColor";
import { IconSearch, IconClipboard } from "../ui/Icons";

const STATUS_META = {
  open:        { label: "Ouvert",   cls: "open"        },
  in_progress: { label: "En cours", cls: "in_progress" },
  closed:      { label: "Fermé",    cls: "closed"      },
  reactivated: { label: "Réactivé", cls: "reactivated" },
};

const COLLAB_FR = {
  service:     "Service",
  partnership: "Partenariat",
  sponsorship: "Sponsoring",
  exposure:    "Exposition",
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });

const PostsDataGrid = ({ posts = [], loading, onRefetch, clientId, showActions = true, onRowClick }) => {
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("all");
  const [sortField, setSortField] = useState("deadline");
  const [sortDir,   setSortDir]   = useState("asc");
  const [actionLoad,setActionLoad]= useState(null);

  const filtered = useMemo(() => {
    let data = [...posts];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (statusF !== "all") data = data.filter(p => p.status === statusF);

    data.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === "deadline" || sortField === "createdAt") { av = new Date(av); bv = new Date(bv); }
      if (sortField === "pitchCount") { av = a.pitchCount || 0; bv = b.pitchCount || 0; }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    return data;
  }, [posts, search, statusF, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIndicator = ({ field }) => (
    <span style={{ fontSize: "0.62rem", marginLeft: 3, opacity: sortField === field ? 1 : 0.3 }}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  const doClose = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("Fermer ce post ? Les offres en attente seront rejetées.")) return;
    setActionLoad(postId);
    try { await postService.close(postId, clientId); onRefetch(); }
    catch (err) { alert(err.response?.data?.message || "Erreur"); }
    finally { setActionLoad(null); }
  };

  const doReactivate = async (e, postId) => {
    e.stopPropagation();
    setActionLoad(postId);
    try { await postService.reactivate(postId, clientId); onRefetch(); }
    catch (err) { alert(err.response?.data?.message || "Erreur"); }
    finally { setActionLoad(null); }
  };

  const doDelete = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer définitivement ce post ?")) return;
    setActionLoad(postId);
    try { await postService.delete(postId, clientId); onRefetch(); }
    catch (err) { alert(err.response?.data?.message || "Erreur"); }
    finally { setActionLoad(null); }
  };

  return (
    <div>
      {/* ── Filter row ── */}
      <div className="filters-bar">
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            color: "var(--d-muted)", pointerEvents: "none", display: "flex",
          }}>
            <IconSearch size={14} />
          </span>
          <input
            className="filter-input"
            style={{ paddingLeft: 32 }}
            placeholder="Rechercher un post..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Status tabs */}
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { v: "all",        l: "Tous" },
            { v: "open",       l: "Ouverts" },
            { v: "in_progress",l: "En cours" },
            { v: "closed",     l: "Fermés" },
          ].map(o => (
            <button key={o.v}
              className={`filter-btn${statusF === o.v ? " active" : ""}`}
              onClick={() => setStatusF(o.v)}
              style={{ padding: "7px 12px", fontSize: "0.78rem" }}>
              {o.l}
            </button>
          ))}
        </div>

        <span style={{ fontSize: "0.73rem", color: "var(--d-muted)", marginLeft: "auto", whiteSpace: "nowrap" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><IconClipboard size={20} /></div>
            <div className="empty-state-title">Aucun post trouvé</div>
            <div className="empty-state-desc">
              {search ? "Essayez d'autres termes de recherche." : "Créez votre premier brief."}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="data-grid">
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                  Titre <SortIndicator field="title" />
                </th>
                <th>Statut</th>
                <th>Type</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("pitchCount")}>
                  Offres <SortIndicator field="pitchCount" />
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("deadline")}>
                  Échéance <SortIndicator field="deadline" />
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("createdAt")}>
                  Créé le <SortIndicator field="createdAt" />
                </th>
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((post, i) => {
                  const dlColor = getDeadlineColor(post.deadline);
                  const dlLabel = getDeadlineLabel(post.deadline);
                  const meta    = STATUS_META[post.status] || {};
                  return (
                    <motion.tr
                      key={post._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => onRowClick && onRowClick(post)}
                      style={{
                        cursor: onRowClick ? "pointer" : "default",
                        borderLeft: `3px solid ${dlColor}`,
                      }}
                    >
                      {/* Title + location */}
                      <td data-label="Titre">
                        <div className="td-title">{post.title}</div>
                        {post.location?.region && (
                          <div className="td-sub">
                            <span style={{ color: "var(--d-muted)", fontSize: "0.7rem" }}>◎</span>
                            {post.location.region}
                          </div>
                        )}
                      </td>

                      {/* Status badge */}
                      <td data-label="Statut">
                        <span className={`status-badge ${meta.cls || post.status}`}>
                          {meta.label || post.status}
                        </span>
                      </td>

                      {/* Marketing type + collab type */}
                      <td data-label="Type">
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {post.marketingType && (
                            <span style={{
                              fontSize: "0.7rem", fontWeight: 600,
                              color: "var(--d-ink-soft)",
                            }}>{post.marketingType}</span>
                          )}
                          {post.collaborationType && (
                            <span style={{
                              fontSize: "0.68rem", color: "var(--d-muted)",
                            }}>{COLLAB_FR[post.collaborationType] || post.collaborationType}</span>
                          )}
                          {!post.marketingType && !post.collaborationType && (
                            <span className="td-muted">—</span>
                          )}
                        </div>
                      </td>

                      {/* Offer count */}
                      <td data-label="Offres">
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                            {post.pitchCount || 0}
                          </span>
                          {post.acceptedPitchCount > 0 && (
                            <span style={{
                              fontSize: "0.67rem", background: "#d1fae5",
                              color: "#065f46", padding: "2px 7px",
                              borderRadius: 20, fontWeight: 600,
                            }}>
                              {post.acceptedPitchCount} acc.
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Deadline with urgency */}
                      <td data-label="Échéance">
                        <div style={{ fontWeight: 600, fontSize: "0.8rem", color: dlColor }}>
                          {post.deadline ? fmt(post.deadline) : "—"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: dlColor, opacity: 0.8 }}>
                          {post.deadline ? dlLabel : ""}
                        </div>
                      </td>

                      <td data-label="Créé le" className="td-muted">{fmt(post.createdAt)}</td>

                      {showActions && (
                        <td data-label="" onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 4 }}>
                            {["open","in_progress","reactivated"].includes(post.status) && (
                              <ActionBtn
                                onClick={e => doClose(e, post._id)}
                                disabled={actionLoad === post._id}
                                bg="#fef3c7" color="#92400e" title="Fermer"
                                label="Fermer"
                              />
                            )}
                            {post.status === "closed" && (
                              <ActionBtn
                                onClick={e => doReactivate(e, post._id)}
                                disabled={actionLoad === post._id}
                                bg="#dbeafe" color="#1e40af" title="Réactiver"
                                label="Réactiver"
                              />
                            )}
                            {(post.pitchCount || 0) === 0 && (
                              <ActionBtn
                                onClick={e => doDelete(e, post._id)}
                                disabled={actionLoad === post._id}
                                bg="#fee2e2" color="#991b1b" title="Supprimer"
                                label="Sup."
                              />
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ActionBtn = ({ onClick, disabled, bg, color, title, label }) => (
  <button onClick={onClick} disabled={disabled} title={title} style={{
    padding: "4px 10px", borderRadius: 6, border: "none",
    background: bg, color, cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.72rem", fontWeight: 600,
    opacity: disabled ? 0.5 : 1,
    fontFamily: "inherit",
    transition: "opacity 0.13s",
  }}>
    {label}
  </button>
);

export default PostsDataGrid;
