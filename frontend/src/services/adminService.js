import api from "./api";

// Get all users
const getUsers = (params = {}) => {
  return api.get("/admin/users", { params });
};

// Toggle user status
const toggleUser = (role, id) => {
  return api.patch(`/admin/users/${role}/${id}/toggle`);
};

export default {
  getUsers,
  toggleUser,
};