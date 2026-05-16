import api from "./api";

const agencyMemberService = {
  createMember: (data) =>
    api.post("/agency-members/create", data).then(r => r.data),

  getMembers: () =>
    api.get("/agency-members").then(r => r.data),

  changePassword: (newPassword) =>
    api.post("/agency-members/change-password", { newPassword }).then(r => r.data),

  setMemberStatus: (id, status) =>
    api.patch(`/agency-members/${id}/status`, { status }).then(r => r.data),

  attachFreelancer: (data) =>
    api.patch("/agency-members/attach-freelancer", data).then(r => r.data),

  detachFreelancer: (agencyId, freelancerId) =>
    api.patch("/agency-members/detach-freelancer", { agencyId, freelancerId }).then(r => r.data),

  getFreelancers: () =>
    api.get("/agency-members/freelancers").then(r => r.data),
};

export default agencyMemberService;