import api from "./api";

const projectService = {
  // ── Agency ──
  getAgencyProjects: (agencyId, params = {}) =>
    api.get(`/projects/agency/${agencyId}`, { params }).then(r => r.data),

  getProject: (projectId) =>
    api.get(`/projects/${projectId}`).then(r => r.data),

  getAgencyMembers: (agencyId) =>
    api.get(`/projects/agency/${agencyId}/members`).then(r => r.data),

  getFlaggedPosts: (agencyId) =>
    api.get(`/projects/agency/${agencyId}/flagged-posts`).then(r => r.data),

  markFlaggedAsPitched: (agencyId, postId) =>
    api.patch(`/projects/agency/${agencyId}/flagged-posts/${postId}/pitched`).then(r => r.data),

  // ── Commercial ──
  flagPost: (agencyId, postId, memberId, memberName, note = "") =>
    api.post(`/projects/flag-post`, { agencyId, postId, memberId, memberName, note }).then(r => r.data),

  // ── Tasks ──
  createTask: (projectId, data) =>
    api.post(`/projects/${projectId}/tasks`, data).then(r => r.data),

  updateTask: (projectId, taskId, data) =>
    api.patch(`/projects/${projectId}/tasks/${taskId}`, data).then(r => r.data),

  assignMember: (projectId, data) =>
    api.post(`/projects/${projectId}/assign`, data).then(r => r.data),

  // ── Worker ──
  getMemberTasks: (memberId) =>
    api.get(`/projects/member/${memberId}/tasks`).then(r => r.data),
};

export default projectService;