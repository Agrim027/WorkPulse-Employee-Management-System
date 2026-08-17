import api from './api';

export const salaryService = {
  getSalaries: (params) => api.get('/salaries', { params }),
  getMySalaries: (params) => api.get('/salaries/my-salaries', { params }),
  getSalaryById: (id) => api.get(`/salaries/${id}`),
  createSalary: (data) => api.post('/salaries', data),
  updateSalary: (id, data) => api.put(`/salaries/${id}`, data),
  deleteSalary: (id) => api.delete(`/salaries/${id}`),
};

export default salaryService;
