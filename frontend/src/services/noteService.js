import api from "./api";

const noteService = {
  getNotes: () =>
    api.get("/notes").then(r => r.data),

  createNote: (data) =>
    api.post("/notes", data).then(r => r.data),

  updateNote: (id, data) =>
    api.patch(`/notes/${id}`, data).then(r => r.data),

  deleteNote: (id) =>
    api.delete(`/notes/${id}`).then(r => r.data),
};

export default noteService;
