// frontend/src/services/projectService.js

import api from "./api";

const projectService = {
  // ── Agency ──
  getAgencyProjects: (agencyId, params = {}) =>
    api.get(`/projects/agency/${agencyId}`, { params }).then(r => r.data),

  getProject: (projectId) =>
    api.get(`/projects/${projectId}`).then(r => r.data),

  // Unified per-project timeline (status, deliverables, decisions, contract milestones)
  getHistory: (projectId) =>
    api.get(`/projects/${projectId}/history`).then(r => r.data),

  getAgencyMembers: (agencyId) =>
    api.get(`/projects/agency/${agencyId}/members`).then(r => r.data),

  getFlaggedPosts: (agencyId) =>
    api.get(`/projects/agency/${agencyId}/flagged-posts`).then(r => r.data),

  markFlaggedAsPitched: (agencyId, postId) =>
    api.patch(`/projects/agency/${agencyId}/flagged-posts/${postId}/pitched`).then(r => r.data),

  sendToStrategist: (agencyId, postId, data) =>
    api.patch(`/projects/agency/${agencyId}/flagged-posts/${postId}/send-to-strategist`, data).then(r => r.data),

  // ── Commercial ──
  flagPost: (agencyId, postId, memberId, memberName, note = "") =>
    api.post(`/projects/flag-post`, { agencyId, postId, memberId, memberName, note }).then(r => r.data),

  // ── Client ── ✅ NEW
  getClientProjects: (clientId, params = {}) =>
    api.get(`/projects/client/${clientId}`, { params }).then(r => r.data),

  updateProject: (projectId, data) =>
    api.patch(`/projects/${projectId}`, data).then(r => r.data),

  addDeliverable: (projectId, data) =>
    api.post(`/projects/${projectId}/deliverables`, data).then(r => r.data),

  addNote: (projectId, data) =>
    api.post(`/projects/${projectId}/notes`, data).then(r => r.data),

  getDeliverables: (projectId) =>
    api.get(`/projects/${projectId}/deliverables`).then(r => r.data),

  updateDeliverable: (projectId, deliverableId, data) =>
    api.patch(`/projects/${projectId}/deliverables/${deliverableId}`, data).then(r => r.data),

  // ── Tasks ──
  createTask: (projectId, data) =>
    api.post(`/projects/${projectId}/tasks`, data).then(r => r.data),

  getProjectTasks: (projectId) =>
    api.get(`/projects/${projectId}/tasks`).then(r => r.data),

  updateTask: (projectId, taskId, data) =>
    api.patch(`/projects/${projectId}/tasks/${taskId}`, data).then(r => r.data),

  addTaskComment: (projectId, taskId, data) =>
    api.post(`/projects/${projectId}/tasks/${taskId}/comments`, data).then(r => r.data),

  assignMember: (projectId, data) =>
    api.post(`/projects/${projectId}/assign`, data).then(r => r.data),

  // ── Worker / Team member ──
  getMemberTasks: (memberId) =>
    api.get(`/projects/member/${memberId}/tasks`).then(r => r.data),

  getMemberProjects: (memberId) =>
    api.get(`/projects/member/${memberId}/projects`).then(r => r.data),

  // ── Team ──
  getTeamProjects: (teamId, params = {}) =>
    api.get(`/projects/team/${teamId}`, { params }).then(r => r.data),

  getTeamMembers: (teamId) =>
    api.get(`/projects/team/${teamId}/members`).then(r => r.data),
};

export default projectService;