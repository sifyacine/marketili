// frontend/src/services/contractService.js

import api from "./api";

const contractService = {
  // ── Create a draft contract (agency director) ──
  create: (data) =>
    api.post("/contracts", data).then(r => r.data),

  // ── List contracts for a party ──
  // partyType: "Agency" | "Client" | "Freelancer" | "Team"
  getAll: (partyId, partyType, params = {}) =>
    api.get("/contracts", { params: { partyId, partyType, ...params } }).then(r => r.data),

  // ── Get contract linked to a project ──
  getByProject: (projectId) =>
    api.get(`/contracts/project/${projectId}`).then(r => r.data),

  // ── Get single contract ──
  getById: (id) =>
    api.get(`/contracts/${id}`).then(r => r.data),

  // ── Edit draft ──
  update: (id, data) =>
    api.patch(`/contracts/${id}`, data).then(r => r.data),

  // ── Workflow steps ──
  generatePdf:    (id, formData)           => api.post(`/contracts/${id}/generate-pdf`,      formData).then(r => r.data),
  send:           (id, sentBy)              => api.patch(`/contracts/${id}/send`,            { sentBy }).then(r => r.data),
  uploadReceipt:  (id, data)               => api.patch(`/contracts/${id}/receipt`,          data).then(r => r.data),
  sendBDC:        (id, data)               => api.patch(`/contracts/${id}/bon-de-commande`,  data).then(r => r.data),
  resiliate:      (id, initiatedBy, reason)=> api.patch(`/contracts/${id}/resiliation`,      { initiatedBy, reason }).then(r => r.data),
  confirmAndStart:(id, confirmedBy)        => api.patch(`/contracts/${id}/confirm-start`,   { confirmedBy }).then(r => r.data),
  skipContract:   (id, skippedBy)          => api.patch(`/contracts/${id}/skip`,            { skippedBy   }).then(r => r.data),
};


export default contractService;