

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import analyticsService from "../../../services/analyticsService";

const JOB_LABEL = {
  director: "Directeur", commercial: "Commercial", chef_de_projet: "Chef de projet",
  strategist: "Stratège", designer: "Designer", editor: "Éditeur",
  smm: "SMM", community_manager: "Community Manager",
};

const KpiCard = ({ label, value, sub, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="stat-card" style={{ "--stat-color": color }}>
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
    </div>
    <div className="stat-card-value">{value}</div>
    {sub && <div className="stat-card-sub">{sub}</div>}
  </motion.div>
);

const PITCH_COLORS = {
  accepted:  "#10b981",
  pending:   "#f59e0b",
  rejected:  "#ef4444",
  withdrawn: "#6b7280",
};
const PITCH_LABELS = {
  accepted: "Acceptées", pending: "En attente", rejected: "Refusées", withdrawn: "Retirées",
};

const DirectorAnalytics = ({ user }) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!user?._id) return;
    analyticsService.getAgencyAnalytics(user._id)
      .then(d => setData(d))
      .catch(err => setError(err.response?.data?.message || "Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [user?._id]);

  if (loading) return (
    <div className="spinner-wrap" style={{ padding: 80 }}><div className="spinner" /></div>
  );
  if (error) return (
    <div className="card" style={{ padding: 32, textAlign: "center", color: "#ef4444" }}>{error}</div>
  );
  if (!data) return null;

  const { pitches, projects, tasks, revenue, members } = data;

  
  const donutData = [
    { name: PITCH_LABELS.accepted,  value: pitches.accepted,  color: PITCH_COLORS.accepted  },
    { name: PITCH_LABELS.pending,   value: pitches.pending,   color: PITCH_COLORS.pending   },
    { name: PITCH_LABELS.rejected,  value: pitches.rejected,  color: PITCH_COLORS.rejected  },
    { name: PITCH_LABELS.withdrawn, value: pitches.withdrawn, color: PITCH_COLORS.withdrawn },
  ].filter(d => d.value > 0);

  const projectBarData = [
    { name: "Actifs",       value: projects.active,    fill: "#7c3aed" },
    { name: "En révision",  value: projects.inReview,  fill: "#0891b2" },
    { name: "En attente",   value: projects.pending,   fill: "#f59e0b" },
    { name: "Terminés",     value: projects.completed, fill: "#10b981" },
    { name: "Annulés",      value: projects.cancelled, fill: "#6b7280" },
  ];

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Analytique</h2>
          <p>Vue d'ensemble des performances de votre agence</p>
        </div>
      </div>

      {}
      <div className="stats-row" style={{ marginBottom: 24 }}>
        <KpiCard label="Pitches envoyés"     value={pitches.total}         sub="au total"         color="#7c3aed" />
        <KpiCard label="Taux de conversion"  value={`${pitches.winRate}%`} sub="pitches acceptés" color="#10b981" />
        <KpiCard label="Projets complétés"   value={projects.completed}    sub={`sur ${projects.total}`} color="#0891b2" />
        <KpiCard label="Tâches en retard"    value={tasks.overdue}         sub="à régulariser"    color="#ef4444" />
      </div>

      {}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            Pitches par mois
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={pitches.perMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0dede" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9a6060" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9a6060" }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Pitches"
                stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            Répartition des pitches
          </div>
          {donutData.length === 0 ? (
            <div style={{ textAlign: "center", color: "#bbb", padding: 40, fontSize: "0.82rem" }}>
              Aucun pitch envoyé
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {donutData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ fontSize: "0.72rem" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            Projets par statut
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projectBarData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0dede" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9a6060" }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#9a6060" }} width={80} />
              <Tooltip />
              <Bar dataKey="value" name="Projets" radius={[0, 4, 4, 0]}>
                {projectBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#9a6060",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 16 }}>
            Revenus contractualisés
          </div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10b981" }}>
              {revenue.total.toLocaleString("fr-DZ")}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#9a6060" }}>DZD — projets terminés</div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={revenue.perMonth}>
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9a6060" }} />
              <Tooltip formatter={(v) => [`${v.toLocaleString()} DZD`, "Revenus"]} />
              <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="card">
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #faeaea" }}>
          <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1a0a0a" }}>
            Productivité des membres
          </div>
          <div style={{ fontSize: "0.78rem", color: "#9a6060", marginTop: 2 }}>
            Top {members.length} membres par nombre de tâches assignées
          </div>
        </div>
        {members.length === 0 ? (
          <div style={{ padding: "32px 24px", textAlign: "center", color: "#9a6060", fontSize: "0.82rem" }}>
            Aucun membre assigné à des tâches
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #faeaea" }}>
                  {["Membre", "Rôle", "Tâches assignées", "Terminées", "En retard"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left",
                      fontWeight: 700, color: "#9a6060", fontSize: "0.72rem",
                      textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, i) => (
                  <tr key={m._id} style={{
                    borderBottom: i < members.length - 1 ? "1px solid #faeaea" : "none",
                  }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a0a0a" }}>
                      {m.name}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#9a6060" }}>
                      {JOB_LABEL[m.jobTitle] || m.jobTitle}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1a0a0a" }}>
                      {m.total}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>{m.done}</span>
                      {m.total > 0 && (
                        <span style={{ color: "#9a6060", fontSize: "0.72rem", marginLeft: 6 }}>
                          ({Math.round(m.done / m.total * 100)}%)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {m.overdue > 0 ? (
                        <span style={{ color: "#ef4444", fontWeight: 700 }}>{m.overdue}</span>
                      ) : (
                        <span style={{ color: "#10b981" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectorAnalytics;
