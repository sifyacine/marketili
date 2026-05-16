import api from "./api";

const freelancerService = {
  getCollaborations: (id) =>
    api.get(`/freelancer/${id}/collaborations`).then(r => r.data),

  getProjects: (id, params = {}) =>
    api.get(`/freelancer/${id}/projects`, { params }).then(r => r.data),

  getPitches: (id, params = {}) =>
    api.get(`/freelancer/${id}/pitches`, { params }).then(r => r.data),
};

export default freelancerService;
