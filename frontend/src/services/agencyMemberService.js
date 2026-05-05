import api from "./api";

const agencyMemberService = {
  createMember: (data) =>
    api.post("/agency-members/create", data).then(r => r.data),

  getMembers: () =>
    api.get("/agency-members").then(r => r.data),

  changePassword: (newPassword) =>
    api.post("/agency-members/change-password", { newPassword }).then(r => r.data),

  toggleMember: (id) =>
    api.patch(`/agency-members/${id}/toggle`).then(r => r.data),
};

export default agencyMemberService;