import api from './api';

export const dashboardService = {
  getAdminSummary: () => api.get('/dashboard/summary'),
  getEmployeeSummary: () => api.get('/dashboard/my-summary'),
};

export default dashboardService;
