import api from './api';

export const attendanceService = {
  getAttendance: (params) => api.get('/attendance', { params }),
  getMyAttendance: (params) => api.get('/attendance/my-attendance', { params }),
  getAttendanceById: (id) => api.get(`/attendance/${id}`),
  createAttendance: (data) => api.post('/attendance', data),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
  checkIn: () => api.post('/attendance/check-in'),
  checkOut: () => api.post('/attendance/check-out'),
};

export default attendanceService;
