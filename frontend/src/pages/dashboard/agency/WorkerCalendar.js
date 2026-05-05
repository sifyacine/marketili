// src/pages/dashboard/agency/WorkerCalendar.jsx
import React, { useState, useEffect, useMemo } from "react";
import projectService from "../../../services/projectService";

const PRIORITY_COLOR = {
  low: "#10b981", medium: "#f59e0b", high: "#f97316", urgent: "#ef4444",
};
const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const DAYS_FR = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];

const WorkerCalendar = ({ user }) => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(new Date());

  useEffect(() => {
    projectService.getMemberTasks(user._id)
      .then(d => setTasks(d.tasks || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user._id]);

  const year  = current.getFullYear();
  const month = current.getMonth();
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach(t => {
      if (!t.dueDate) return;
      const d = new Date(t.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(t);
      }
    });
    return map;
  }, [tasks, year, month]);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Calendrier</h2>
          <p>Tâches par date d'échéance</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="section-cta-btn"
            style={{ background: "transparent", color: "#9a6060",
              border: "1.5px solid #f0dede", boxShadow: "none" }}
            onClick={() => setCurrent(new Date(year, month - 1, 1))}>←</button>
          <span style={{ padding: "9px 16px", fontWeight: 700,
            fontSize: "0.9rem", color: "#1a0a0a" }}>
            {MONTHS_FR[month]} {year}
          </span>
          <button className="section-cta-btn"
            style={{ background: "transparent", color: "#9a6060",
              border: "1.5px solid #f0dede", boxShadow: "none" }}
            onClick={() => setCurrent(new Date(year, month + 1, 1))}>→</button>
        </div>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <div className="card">
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
                const isToday = day && today.getDate() === day
                  && today.getMonth() === month && today.getFullYear() === year;
                const dayTasks = day ? (tasksByDay[day] || []) : [];
                return (
                  <div key={i} style={{ minHeight: 80, padding: "6px",
                    border: "1px solid #faeaea", borderRadius: 8,
                    background: isToday ? "#fff0f0" : day ? "#fff" : "transparent",
                    opacity: day ? 1 : 0 }}>
                    {day && (
                      <>
                        <div style={{ fontSize: "0.78rem",
                          fontWeight: isToday ? 800 : 600,
                          color: isToday ? "#c0152a" : "#1a0a0a", marginBottom: 4 }}>
                          {day}
                        </div>
                        {dayTasks.slice(0, 3).map((t, ti) => (
                          <div key={ti} style={{ fontSize: "0.65rem", fontWeight: 600,
                            color: "#fff", borderRadius: 4, padding: "2px 5px",
                            marginBottom: 2, overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                            background: PRIORITY_COLOR[t.priority] || "#7c3aed" }}>
                            {t.title}
                          </div>
                        ))}
                        {dayTasks.length > 3 && (
                          <div style={{ fontSize: "0.62rem", color: "#9a6060" }}>
                            +{dayTasks.length - 3} autres
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #faeaea",
            display: "flex", gap: 16, flexWrap: "wrap" }}>
            {Object.entries(PRIORITY_COLOR).map(([p, c]) => (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3,
                  background: c, flexShrink: 0 }} />
                <span style={{ fontSize: "0.72rem", color: "#9a6060" }}>
                  {{ low:"Bas", medium:"Moyen", high:"Haut", urgent:"Urgent" }[p]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerCalendar;