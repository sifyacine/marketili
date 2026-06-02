// frontend/src/services/analyticsService.js

import api from "./api";

const analyticsService = {
  getAgencyAnalytics: (agencyId) =>
    api.get(`/analytics/agency/${agencyId}`).then(r => r.data),
};

export default analyticsService;
