import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import postService from "../../services/postService";
import { getDeadlineColor } from "../../utils/deadlineColor";

/**
 * PostsDataGrid — reusable filterable/sortable table for posts.
 *
 * Props:
 *   posts       — array of post objects
 *   loading     — boolean
 *   onRefetch   — callback to reload data
 *   clientId    — needed for status-change actions
 *   showActions — show Close / Reactivate / Delete buttons (client view only)
 *   onRowClick  — callback when a row is clicked
 */
const STATUS_LABELS = {
  open:        { label: "Ouvert",       class: "open"        },
  in_progress: { label: "En cours",     class: "in_progress" },
  closed:      { label: "Fermé",        class: "closed"      },
  reactivated: { label: "Réactivé",     class: "reactivated" },
};

const deadlineClass = (dateStr) => {
  if (!dateStr) return "";
  const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (days < 0)  return "deadline-red";
  if (days <= 7)  return "deadline-red";
  if (days <= 14) return "deadline-orange";
  if (days <= 30) return "deadline-yellow";
  return "deadline-green";
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" });

const PostsDataGrid = ({ posts = [], loading, onRefetch, clientId, showActions = true, onRowClick }) => {
  const [search,     setSearch]     = useState("");
  const [statusF,    setStatusF]    = useState("all");
  const [categoryF,  setCategoryF]  = useState("all");
  const [sortField,  setSortField]  = useState("createdAt");
  const [sortDir,    setSortDir]    = useState("desc");
  const [actionLoad, setActionLoad] = useState(null); // postId being actioned

  // ── Client-side filtering + sorting ──
  const filtered = useMemo(() => {
    let data = [...posts];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    if (statusF !== "all")   data = data.filter(p => p.status   === statusF);
    if (categoryF !== "all") data = data.filter(p => p.categories?.includes(categoryF));

    data.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === "deadline" || sortField === "createdAt") {
        av = new Date(av); bv = new Date(bv);
      }
      if (sortField === "pitchCount") { av = a.pitchCount || 0; bv = b.pitchCount || 0; }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

    return data;
  }, [posts, search, statusF, categoryF, sortField, sortDir]);

  const allCategories = useMemo(() => {
    const cats = new Set();
    posts.forEach(p => (p.categories || []).forEach(c => cats.add(c)));
    return [...cats];
  }, [posts]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }) => (
    <span style={{ fontSize: "0.65rem", marginLeft: 4, opacity: sortField === field ? 1 : 0.3 }}>
      {sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  );

  // ── Actions ──
  const doClose = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("Fermer ce post ? Les offres en attente seront rejetées automatiquement.")) return;
    setActionLoad(postId);
    try {
      await postService.close(postId, clientId);
      onRefetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActionLoad(null);
    }
  };

  const doReactivate = async (e, postId) => {
    e.stopPropagation();
    setActionLoad(postId);
    try {
      await postService.reactivate(postId, clientId);
      onRefetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActionLoad(null);
    }
  };

  const doDelete = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer définitivement ce post ?")) return;
    setActionLoad(postId);
    try {
      await postService.delete(postId, clientId);
      onRefetch();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    } finally {
      setActionLoad(null);
    }
  };

  return (
    <div>
      {/* Filters bar */}
      <div className="filters-bar">
        <input
          className="filter-input"
          placeholder="🔍  Rechercher un post..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={statusF}
          onChange={e => setStatusF(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="open">Ouvert</option>
          <option value="in_progress">En cours</option>
          <option value="reactivated">Réactivé</option>
          <option value="closed">Fermé</option>
        </select>

        {allCategories.length > 0 && (
          <select
            className="filter-select"
            value={categoryF}
            onChange={e => setCategoryF(e.target.value)}
          >
            <option value="all">Toutes catégories</option>
            {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        <span style={{ fontSize: "0.76rem", color: "#9a6060", marginLeft: "auto", whiteSpace: "nowrap" }}>
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">Aucun post trouvé</div>
          <div className="empty-state-desc">Essayez d'autres filtres ou créez un nouveau besoin.</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "auto" }}>
          <table className="data-grid">
            <thead>
              <tr>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("title")}>
                  Titre <SortIcon field="title" />
                </th>
                <th>Statut</th>
                <th>Catégories</th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("pitchCount")}>
                  Offres <SortIcon field="pitchCount" />
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("deadline")}>
                  Échéance <SortIcon field="deadline" />
                </th>
                <th style={{ cursor: "pointer" }} onClick={() => handleSort("createdAt")}>
                  Créé le <SortIcon field="createdAt" />
                </th>
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((post, i) => (
                  <motion.tr
                    key={post._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => onRowClick && onRowClick(post)}
                    style={{
                      cursor: onRowClick ? "pointer" : "default",
                      borderLeft: `3px solid ${getDeadlineColor(post.deadline)}`,
                    }}
                  >
                    <td>
                      <div className="td-title">{post.title}</div>
                      {post.location?.region && (
                        <div className="td-muted">📍 {post.location.region}</div>
                      )}
                    </td>

                    <td>
                      <span className={`status-badge ${STATUS_LABELS[post.status]?.class || post.status}`}>
                        {STATUS_LABELS[post.status]?.label || post.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(post.categories || []).slice(0, 2).map(c => (
                          <span key={c} style={{
                            fontSize: "0.68rem", fontWeight: 600,
                            background: "#fff0f0", color: "#c0152a",
                            padding: "2px 8px", borderRadius: 20,
                          }}>{c}</span>
                        ))}
                        {(post.categories || []).length > 2 && (
                          <span style={{ fontSize: "0.68rem", color: "#9a6060" }}>
                            +{post.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700 }}>{post.pitchCount || 0}</span>
                        {post.acceptedPitchCount > 0 && (
                          <span style={{
                            fontSize: "0.68rem", background: "#d1fae5", color: "#065f46",
                            padding: "1px 6px", borderRadius: 20, fontWeight: 600,
                          }}>
                            {post.acceptedPitchCount} accepté{post.acceptedPitchCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className={deadlineClass(post.deadline)}>
                        {formatDate(post.deadline)}
                      </span>
                    </td>

                    <td className="td-muted">{formatDate(post.createdAt)}</td>

                    {showActions && (
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 5 }}>
                          {/* Close button — only for open/in_progress/reactivated */}
                          {["open", "in_progress", "reactivated"].includes(post.status) && (
                            <button
                              onClick={e => doClose(e, post._id)}
                              disabled={actionLoad === post._id}
                              style={actionBtn("#fef3c7", "#92400e")}
                              title="Fermer"
                            >
                              🔒
                            </button>
                          )}

                          {/* Reactivate — only for closed */}
                          {post.status === "closed" && (
                            <button
                              onClick={e => doReactivate(e, post._id)}
                              disabled={actionLoad === post._id}
                              style={actionBtn("#dbeafe", "#1e40af")}
                              title="Réactiver"
                            >
                              🔄
                            </button>
                          )}

                          {/* Delete — only if no pitches */}
                          {(post.pitchCount || 0) === 0 && (
                            <button
                              onClick={e => doDelete(e, post._id)}
                              disabled={actionLoad === post._id}
                              style={actionBtn("#fee2e2", "#991b1b")}
                              title="Supprimer"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Helper for icon action buttons
const actionBtn = (bg, color) => ({
  padding: "5px 8px", borderRadius: 6, border: "none",
  background: bg, color, cursor: "pointer", fontSize: "0.85rem",
  transition: "opacity 0.15s",
});

export default PostsDataGrid;