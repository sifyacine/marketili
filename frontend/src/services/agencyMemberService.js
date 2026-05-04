// frontend/src/services/agencyMemberService.js
import api from "./api";

// ✅ createMember was missing — added here
const createMember = (data) =>
  api.post("/agency-members/create", data);

const getMembers = () =>
  api.get("/agency-members");

const toggleMember = (id) =>
  api.patch(`/admin/users/agency_member/${id}/toggle`);

export default {
  createMember,
  getMembers,
  toggleMember,
};