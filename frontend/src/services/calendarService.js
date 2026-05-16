import api from "./api";

const calendarService = {
  getEvents: (role, id) =>
    api.get(`/calendar/${role}/${id}`).then(r => r.data),
};

export default calendarService;
