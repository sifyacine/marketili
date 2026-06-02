import api from "./api";

const isBrowserFile = (value) =>
  typeof File !== "undefined" && value instanceof File;

const buildFormData = (data) => {
  const formData = new FormData();

  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    if (key === "file" && isBrowserFile(value)) {
      formData.append("file", value);
      return;
    }

    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

const pitchService = {
  send: (data) => {
    const hasFile = isBrowserFile(data?.file);
    const payload = hasFile ? buildFormData(data) : data;

    return api
      .post("/pitches", payload, hasFile ? { headers: { "Content-Type": "multipart/form-data" } } : undefined)
      .then((r) => r.data);
  },

  getForPost: (postId, clientId) =>
    api.get(`/pitches/post/${postId}`, { params: { clientId } }).then((r) => r.data),

  getMy: (senderId, senderType, params = {}) =>
    api
      .get("/pitches/my", { params: { senderId, senderType, ...params } })
      .then((r) => r.data),

  getById: (id) => api.get(`/pitches/${id}`).then((r) => r.data),

  getForClient: (clientId, params = {}) =>
    api.get(`/pitches/client/${clientId}`, { params }).then((r) => r.data),

  accept: (id, clientId, withContract = false) =>
    api.patch(`/pitches/${id}/accept`, { clientId, withContract }).then((r) => r.data),

  reject: (id, clientId, reason = "") =>
    api.patch(`/pitches/${id}/reject`, { clientId, reason }).then((r) => r.data),

  withdraw: (id, senderId, senderType) =>
    api.patch(`/pitches/${id}/withdraw`, { senderId, senderType }).then((r) => r.data),

  setInternalStatus: (id, newStatus, actorJobTitle, internalNotes) =>
    api.patch(`/pitches/${id}/internal-status`, { newStatus, actorJobTitle, internalNotes }).then((r) => r.data),
};

export default pitchService;