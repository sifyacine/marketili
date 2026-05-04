import React, { useState } from "react";
import agencyMemberService from "../../services/agencyMemberService";

const roles = [
  "strategist",
  "designer",
  "editor",
  "smm",
  "community_manager",
  "commercial",
];

const CreateMemberForm = ({ onCreated }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    jobTitle: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await agencyMemberService.createMember(form);

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        jobTitle: "",
        phone: "",
      });

      onCreated && onCreated();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <h3>Create Team Member</h3>

      <div style={{ display: "flex", gap: 10 }}>
        <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} required />
        <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} required />
      </div>

      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="password" placeholder="Password" type="password" value={form.password} onChange={handleChange} required />

      <select name="jobTitle" value={form.jobTitle} onChange={handleChange} required>
        <option value="">Select role</option>
        {roles.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} />

      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Member"}
      </button>
    </form>
  );
};

export default CreateMemberForm;