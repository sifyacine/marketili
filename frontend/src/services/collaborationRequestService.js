// frontend/src/services/collaborationRequestService.js

import api from "./api";

const collaborationRequestService = {
  sendRequest: (data) =>
    api.post("/collaboration-requests", data).then(r => r.data),

  getMine: (params = {}) =>
    api.get("/collaboration-requests/mine", { params }).then(r => r.data),

  getIncoming: (params = {}) =>
    api.get("/collaboration-requests/incoming", { params }).then(r => r.data),

  respond: (id, action, declineReason = "") =>
    api.patch(`/collaboration-requests/${id}/respond`, { action, declineReason }).then(r => r.data),

  withdraw: (id) =>
    api.patch(`/collaboration-requests/${id}/withdraw`).then(r => r.data),
};

export default collaborationRequestService;
