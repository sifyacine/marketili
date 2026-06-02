import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import noteService from "../../../services/noteService";

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
  : "";

const NoteCard = ({ note, onToggleDone, onTogglePin, onDelete, busy }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    style={{
      padding: "12px 16px",
      borderRadius: 10,
      background: note.isPinned ? "#fefce8" : "#fff",
      border: `1px solid ${note.isPinned ? "#fde68a" : "var(--d-border-soft)"}`,
      opacity: note.isDone ? 0.55 : 1,
      marginBottom: 10,
    }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      {/* Done toggle */}
      <button
        onClick={() => onToggleDone(note)}
        style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 2,
          border: `2px solid ${note.isDone ? "#10b981" : "#d1d5db"}`,
          background: note.isDone ? "#10b981" : "transparent",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", padding: 0 }}>
        {note.isDone && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: "0.85rem", lineHeight: 1.5, wordBreak: "break-word",
          textDecoration: note.isDone ? "line-through" : "none",
          color: note.isDone ? "var(--d-muted)" : "var(--d-ink)",
        }}>
          {note.text}
        </div>
        {note.isReminder && note.reminderDate && (
          <div style={{ fontSize: "0.7rem", color: "#8b5cf6", marginTop: 3, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 4 }}>
            <span>📅</span>
            <span>Rappel : {fmt(note.reminderDate)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button onClick={() => onTogglePin(note)} title={note.isPinned ? "Désépingler" : "Épingler"}
          style={{ width: 24, height: 24, border: "none", background: "none", cursor: "pointer",
            fontSize: "0.85rem", color: note.isPinned ? "#f59e0b" : "#ccc",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          ☆
        </button>
        <button onClick={() => onDelete(note._id)} disabled={busy === note._id}
          style={{ width: 24, height: 24, border: "none", background: "none",
            cursor: "pointer", color: "#f87171", fontSize: "1rem",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: busy === note._id ? 0.4 : 1 }}>
          ×
        </button>
      </div>
    </div>
  </motion.div>
);

const PersonalNotes = () => {
  const [notes,    setNotes]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [text,     setText]     = useState("");
  const [reminder, setReminder] = useState("");
  const [isPin,    setIsPin]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [busy,     setBusy]     = useState(null);

  useEffect(() => {
    noteService.getNotes()
      .then(d => setNotes(d.notes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSaving(true);
    try {
      const d = await noteService.createNote({
        text: text.trim(),
        isPinned:   isPin,
        isReminder: !!reminder,
        reminderDate: reminder || undefined,
      });
      setNotes(prev => [d.note, ...prev]
        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0)));
      setText("");
      setReminder("");
      setIsPin(false);
    } catch {}
    setSaving(false);
  };

  const handleToggleDone = async (note) => {
    setBusy(note._id);
    try {
      const d = await noteService.updateNote(note._id, { isDone: !note.isDone });
      setNotes(prev => prev.map(n => n._id === note._id ? d.note : n));
    } catch {}
    setBusy(null);
  };

  const handleTogglePin = async (note) => {
    setBusy(note._id);
    try {
      const d = await noteService.updateNote(note._id, { isPinned: !note.isPinned });
      setNotes(prev =>
        prev.map(n => n._id === note._id ? d.note : n)
          .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      );
    } catch {}
    setBusy(null);
  };

  const handleDelete = async (id) => {
    setBusy(id);
    try {
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch {}
    setBusy(null);
  };

  const pinned   = notes.filter(n => n.isPinned);
  const unpinned = notes.filter(n => !n.isPinned);

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Mes notes</h2>
          <p style={{ color: "var(--d-muted)" }}>
            {notes.length} note{notes.length !== 1 ? "s" : ""} · {pinned.length} épinglée{pinned.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Add form */}
      <div className="card" style={{ padding: "18px 20px", marginBottom: 24 }}>
        <form onSubmit={handleAdd}>
          <textarea
            className="dash-form-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Nouvelle note, rappel, idée..."
            rows={3}
            style={{ resize: "vertical", fontFamily: "inherit", marginBottom: 10 }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6,
              fontSize: "0.8rem", color: "var(--d-muted)", cursor: "pointer" }}>
              <input type="checkbox" checked={isPin} onChange={e => setIsPin(e.target.checked)} />
              Épingler
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 6,
              fontSize: "0.8rem", color: "var(--d-muted)" }}>
              <span>Rappel :</span>
              <input type="date" className="dash-form-input"
                value={reminder} onChange={e => setReminder(e.target.value)}
                style={{ padding: "4px 8px", fontSize: "0.78rem", width: "auto" }} />
            </div>
            <button type="submit" className="section-cta-btn"
              disabled={saving || !text.trim()} style={{ marginLeft: "auto" }}>
              {saving ? "Ajout..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : notes.length === 0 ? (
        <div className="card" style={{ padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Aucune note</div>
          <div style={{ fontSize: "0.8rem", color: "var(--d-muted)" }}>
            Ajoutez votre première note ci-dessus
          </div>
        </div>
      ) : (
        <AnimatePresence>
          {pinned.length > 0 && (
            <motion.div key="pinned">
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#f59e0b",
                letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
                Épinglées ({pinned.length})
              </div>
              {pinned.map(n => (
                <NoteCard key={n._id} note={n}
                  onToggleDone={handleToggleDone}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  busy={busy} />
              ))}
            </motion.div>
          )}

          {unpinned.length > 0 && (
            <motion.div key="unpinned">
              {pinned.length > 0 && (
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--d-muted)",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  marginTop: 16, marginBottom: 10 }}>
                  Notes ({unpinned.length})
                </div>
              )}
              {unpinned.map(n => (
                <NoteCard key={n._id} note={n}
                  onToggleDone={handleToggleDone}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                  busy={busy} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default PersonalNotes;
