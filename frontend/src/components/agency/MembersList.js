import React, { useEffect, useState } from "react";
import agencyMemberService from "../../services/agencyMemberService";

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await agencyMemberService.getMembers();

      
      setMembers(res.data?.members || res.data || []);
    } catch (err) {
      console.error(err);
      setMembers([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleToggle = async (member) => {
    try {
      await agencyMemberService.toggleMember(member._id);
      fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: 30 }}>
      <h3>Team Members</h3>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 10 }}>
        <thead>
          <tr style={{ background: "#f5f5f5" }}>
            <th style={th}>Name</th>
            <th style={th}>Email</th>
            <th style={th}>Role</th>
            <th style={th}>Status</th>
            <th style={th}>Action</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                Loading...
              </td>
            </tr>
          ) : members.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: 20 }}>
                No members yet
              </td>
            </tr>
          ) : (
            members.map((m) => (
              <tr key={m._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>
                  {m.firstName} {m.lastName}
                </td>
                <td style={td}>{m.email}</td>
                <td style={td}>{m.jobTitle}</td>
                <td style={td}>
                  <span style={{ color: m.isActive ? "green" : "red" }}>
                    {m.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={td}>
                  <button
                    onClick={() => handleToggle(m)}
                    style={{
                      padding: "6px 10px",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: m.isActive ? "#ff4d4f" : "#52c41a",
                      color: "white",
                      fontSize: "0.8rem",
                    }}
                  >
                    {m.isActive ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const th = { padding: 10, textAlign: "left" };
const td = { padding: 10 };

export default MembersList;