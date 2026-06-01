import api from "./api";

const activityService2 = {
  getMy: (params = {}) =>
    api.get("/activity/me", { params }).then(r => r.data),
};

export default activityService2;
