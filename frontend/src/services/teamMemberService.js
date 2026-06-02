import api from "./api";

const teamMemberService = {
  createMember: (data) =>
    api.post("/team-members/create", data).then(r => r.data),

  getMembers: () =>
    api.get("/team-members").then(r => r.data),

  toggleMember: (id) =>
    api.patch(`/team-members/${id}/toggle`).then(r => r.data),

  changePassword: (newPassword) =>
    api.post("/team-members/change-password", { newPassword }).then(r => r.data),
};

export default teamMemberService;
