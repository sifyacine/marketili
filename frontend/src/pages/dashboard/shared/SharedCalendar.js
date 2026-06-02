import React, { useState, useEffect, useMemo } from "react";
import calendarService from "../../../services/calendarService";
import noteService from "../../../services/noteService";

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

const TYPE_LABEL = { project: "Projet", task: "Tâche", reminder: "Rappel" };
const TYPE_COLOR = { project: "#c0152a", task: "#7c3aed", reminder: "#8b5cf6" };

const fmt = (d) => d
  ? new Date(d).toLocaleDateString("fr-DZ", { day: "2-digit", month: "short", year: "numeric" })
  : "";

const SharedCalendar = ({ user, role }) => {
  const [events,   setEvents]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [current,  setCurrent]  = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [markingDone, setMarkingDone] = useState(null);

  const handleMarkReminderDone = async (e) => {
    if (!e.noteId) return;
    setMarkingDone(e.noteId);
    try {
      await noteService.updateNote(e.noteId, { isDone: true });
      setEvents(prev => prev.map(ev =>
        ev.noteId?.toString() === e.noteId?.toString() ? { ...ev, isDone: true } : ev
      ));
    } catch {}
    setMarkingDone(null);
  };

  useEffect(() => {
    setLoading(true);
    calendarService.getEvents(role, user._id)
      .then(d => setEvents(d.events || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id, role]);

  const year  = current.getFullYear();
  const month = current.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (!e.date) return;
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    return map;
  }, [events, year, month]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const selectedEvents = selected ? (eventsByDay[selected] || []) : [];

  const nav = (delta) => {
    setCurrent(new Date(year, month + delta, 1));
    setSelected(null);
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Calendrier</h2>
          <p style={{ color: "var(--d-muted)" }}>
            {events.length} événement{events.length !== 1 ? "s" : ""} au total
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="section-cta-btn"
            style={{ background: "transparent", color: "#9a6060",
              border: "1.5px solid #f0dede", boxShadow: "none" }}
            onClick={() => nav(-1)}>&#8592;</button>
          <span style={{ padding: "9px 16px", fontWeight: 700,
            fontSize: "0.9rem", color: "var(--d-ink)" }}>
            {MONTHS_FR[month]} {year}
          </span>
          <button className="section-cta-btn"
            style={{ background: "transparent", color: "#9a6060",
              border: "1.5px solid #f0dede", boxShadow: "none" }}
            onClick={() => nav(1)}>&#8594;</button>
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

          {/* Calendar grid */}
          <div className="card" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ padding: "16px 20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)",
                gap: 4, marginBottom: 8 }}>
                {DAYS_FR.map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: "0.72rem",
                    fontWeight: 700, color: "#9a6060", padding: "6px 0" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                {cells.map((day, i) => {
                  const isToday = day
                    && today.getDate() === day
                    && today.getMonth() === month
                    && today.getFullYear() === year;
                  const isSelected = day === selected;
                  const dayEvents = day ? (eventsByDay[day] || []) : [];

                  return (
                    <div key={i}
                      onClick={() => day && setSelected(isSelected ? null : day)}
                      style={{
                        minHeight: 72, padding: "6px",
                        border: `1.5px solid ${isSelected ? "#c0152a" : isToday ? "#fca5a5" : "#faeaea"}`,
                        borderRadius: 8,
                        background: isSelected ? "#fff5f5" : isToday ? "#fff0f0" : day ? "#fff" : "transparent",
                        opacity: day ? 1 : 0,
                        cursor: day ? "pointer" : "default",
                        transition: "border-color 0.15s, background 0.15s",
                      }}>
                      {day && (
                        <>
                          <div style={{
                            fontSize: "0.78rem",
                            fontWeight: isToday ? 800 : 600,
                            color: isToday ? "#c0152a" : "var(--d-ink)",
                            marginBottom: 4,
                          }}>
                            {day}
                          </div>
                          {dayEvents.slice(0, 3).map((e, ei) => (
                            <div key={ei} style={{
                              fontSize: "0.62rem", fontWeight: 600,
                              color: "#fff", borderRadius: 3,
                              padding: "2px 4px", marginBottom: 2,
                              overflow: "hidden", textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              background: e.color || TYPE_COLOR[e.type] || "#64748b",
                            }}>
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div style={{ fontSize: "0.6rem", color: "#9a6060" }}>
                              +{dayEvents.length - 3} autres
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #faeaea",
              display: "flex", gap: 16, flexWrap: "wrap" }}>
              {Object.entries(TYPE_COLOR).map(([t, c]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3,
                    background: c, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.72rem", color: "#9a6060" }}>
                    {TYPE_LABEL[t]}
                  </span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
                <span style={{ fontSize: "0.72rem", color: "#9a6060" }}>
                  Couleur = urgence de l'échéance
                </span>
              </div>
            </div>
          </div>

          {/* Day sidebar */}
          {selected && (
            <div className="card" style={{ width: 280, flexShrink: 0 }}>
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem",
                  color: "var(--d-ink)", marginBottom: 14 }}>
                  {selected} {MONTHS_FR[month]} {year}
                </div>

                {selectedEvents.length === 0 ? (
                  <div style={{ fontSize: "0.82rem", color: "var(--d-muted)",
                    textAlign: "center", padding: "24px 0" }}>
                    Aucun événement
                  </div>
                ) : (
                  selectedEvents.map((e, i) => (
                    <div key={i} style={{
                      padding: "10px 12px", borderRadius: 8, marginBottom: 8,
                      background: "var(--d-surface)",
                      border: "1px solid var(--d-border-soft)",
                      borderLeft: `3px solid ${e.color || TYPE_COLOR[e.type] || "#64748b"}`,
                      opacity: e.isDone ? 0.6 : 1,
                    }}>
                      <div style={{ display: "flex", alignItems: "center",
                        gap: 6, marginBottom: 4 }}>
                        {e.type === "reminder" && (
                          <span style={{ fontSize: "0.9rem" }}>🔔</span>
                        )}
                        <span style={{
                          fontSize: "0.65rem", fontWeight: 700,
                          padding: "2px 6px", borderRadius: 4,
                          background: TYPE_COLOR[e.type] || "#64748b",
                          color: "#fff",
                        }}>
                          {TYPE_LABEL[e.type] || e.type}
                        </span>
                        {e.isDone && (
                          <span style={{ fontSize: "0.65rem", color: "#10b981",
                            fontWeight: 600 }}>✓ Fait</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 600,
                        color: "var(--d-ink)", marginBottom: e.projectTitle ? 3 : 0,
                        lineHeight: 1.4,
                        textDecoration: e.isDone ? "line-through" : "none" }}>
                        {e.title}
                      </div>
                      {e.projectTitle && (
                        <div style={{ fontSize: "0.72rem", color: "var(--d-muted)" }}>
                          {e.projectTitle}
                        </div>
                      )}
                      {e.status && (
                        <div style={{ fontSize: "0.7rem", color: "var(--d-muted)",
                          marginTop: 3 }}>
                          Statut : {e.status}
                        </div>
                      )}
                      <div style={{ fontSize: "0.7rem", color: "var(--d-muted)",
                        marginTop: 3 }}>
                        {fmt(e.date)}
                      </div>
                      {e.type === "reminder" && !e.isDone && e.noteId && (
                        <button
                          onClick={() => handleMarkReminderDone(e)}
                          disabled={markingDone === e.noteId}
                          style={{
                            marginTop: 8, padding: "4px 10px", borderRadius: 6,
                            fontSize: "0.68rem", fontWeight: 700, cursor: "pointer",
                            border: "1.5px solid #8b5cf6", color: "#8b5cf6",
                            background: "transparent", fontFamily: "inherit",
                            opacity: markingDone === e.noteId ? 0.5 : 1,
                          }}>
                          {markingDone === e.noteId ? "..." : "Marquer comme fait"}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SharedCalendar;
