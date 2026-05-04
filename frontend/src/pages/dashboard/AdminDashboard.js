// frontend/src/pages/dashboard/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import useAuth         from "../../hooks/useAuth";
import adminService    from "../../services/adminService";
import "../../styles/Dashboard.css";

const roles = ["", "client", "agency", "agency_member", "team", "team_member", "freelancer"];

const AdminDashboard = () => {
  const { user, role, token } = useAuth();

  // Guard: if not logged in as admin, redirect
  if (!token || role !== "admin") {
    window.location.href = "/login";
    return null;
  }

  return (
    <DashboardLayout
      role="admin"
      user={user}
      navItems={[
        { label: "Utilisateurs", icon: "👥", path: "/admin" },
      ]}
      topbarTitle="Admin Dashboard"
    >
      <UsersPanel />
    </DashboardLayout>
  );
};

const UsersPanel = () => {
  const [users,   setUsers]   = useState([]);
  const [role,    setRole]    = useState("");
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getUsers({ role, search });
      const list = res.data?.users || res.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("fetchUsers error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [role]);

  const handleSearch = (e) => { e.preventDefault(); fetchUsers(); };

  const handleToggle = async (u) => {
    try {
      await adminService.toggleUser(u._roleLabel || u.role, u._id);
      fetchUsers();
    } catch (err) {
      console.error("toggleUser error:", err.response?.data || err.message);
    }
  };

  return (
    <div>
      <div className="section-header">
        <div className="section-header-left">
          <h2>Utilisateurs</h2>
          <p>{users.length} comptes enregistrés</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select className="dash-form-input" value={role}
          onChange={(e) => setRole(e.target.value)} style={{ flex: 1, maxWidth: 200 }}>
          {roles.map((r) => (
            <option key={r} value={r}>{r || "Tous les rôles"}</option>
          ))}
        </select>

        <form onSubmit={handleSearch} style={{ display: "flex", gap: 10, flex: 2 }}>
          <input className="dash-form-input" type="text"
            placeholder="Rechercher par nom ou email..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }} />
          <button type="submit" className="section-cta-btn">Rechercher</button>
        </form>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
          padding: "12px 16px", marginBottom: 16, color: "#b91c1c", fontSize: "0.84rem" }}>
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : users.length === 0 ? (
          <div className="empty-state" style={{ padding: "64px 24px" }}>
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-title">Aucun utilisateur trouvé</div>
            <div className="empty-state-desc">Essayez d'ajuster les filtres</div>
          </div>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u._id || i}>
                  <td>
                    {u.firstName || u.agencyName || u.teamName || "—"}
                    {u.lastName ? ` ${u.lastName}` : ""}
                  </td>
                  <td>{u.email}</td>
                  <td><span className="status-badge">{u._roleLabel || u.role}</span></td>
                  <td>
                    <span className={u.isActive !== false ? "status-active" : "status-inactive"}>
                      {u.isActive !== false ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleToggle(u)} className="section-cta-btn"
                      style={{ padding: "6px 12px", fontSize: "0.75rem",
                        background: u.isActive !== false ? "#ef4444" : "#10b981" }}>
                      {u.isActive !== false ? "Désactiver" : "Activer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;