import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
} from '@mui/material';
import attendanceService from '../../services/attendanceService';
import employeeService from '../../services/employeeService';
import ErrorMessage from '../common/ErrorMessage';

const DEFAULT_FORM = {
  employeeId: '',
  attendanceDate: new Date().toISOString().split('T')[0],
  status: 'PRESENT',
  checkIn: '09:00',
  checkOut: '17:00',
  remarks: '',
};

export default function AttendanceFormModal({ open, onClose, onSuccess, initialValues }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(initialValues && initialValues.id);

  useEffect(() => {
    if (open) {
      fetchEmployees();
      if (initialValues) {
        setFormData({
          employeeId: initialValues.employee?.id || initialValues.employeeId || '',
          attendanceDate: initialValues.attendanceDate || new Date().toISOString().split('T')[0],
          status: initialValues.status || 'PRESENT',
          checkIn: initialValues.checkIn ? initialValues.checkIn.substring(0, 5) : '',
          checkOut: initialValues.checkOut ? initialValues.checkOut.substring(0, 5) : '',
          remarks: initialValues.remarks || '',
        });
      } else {
        setFormData(DEFAULT_FORM);
      }
      setError('');
    }
  }, [open, initialValues]);

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getEmployees({ page: 0, size: 100 });
      if (res.data && res.data.content) {
        setEmployees(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load employees for attendance form:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeId || !formData.attendanceDate || !formData.status) {
      setError('Please fill in required fields (Employee, Date, and Status).');
      return;
    }

    if (formData.checkIn && formData.checkOut && formData.checkOut < formData.checkIn) {
      setError('Check-out time cannot be earlier than check-in time.');
      return;
    }

    const payload = {
      ...formData,
      employeeId: Number(formData.employeeId),
      checkIn: formData.checkIn ? `${formData.checkIn}:00` : null,
      checkOut: formData.checkOut ? `${formData.checkOut}:00` : null,
      remarks: formData.remarks || null,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await attendanceService.updateAttendance(initialValues.id, payload);
      } else {
        await attendanceService.createAttendance(payload);
      }
      onSuccess(isEdit ? 'Attendance updated successfully' : 'Attendance record created successfully');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save attendance record.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>
        {isEdit ? `Edit Attendance Log #${initialValues.id}` : 'Create Attendance Log'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <ErrorMessage message={error} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={isEdit}>
                <InputLabel id="emp-select-label">Select Employee *</InputLabel>
                <Select
                  labelId="emp-select-label"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  label="Select Employee *"
                >
                  {employees.length === 0 ? (
                    <MenuItem value="" disabled>
                      No employees available
                    </MenuItem>
                  ) : (
                    employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.employeeCode} — {emp.firstName} {emp.lastName}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="attendanceDate"
                label="Attendance Date *"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.attendanceDate}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="status-select-label">Status *</InputLabel>
                <Select
                  labelId="status-select-label"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status *"
                >
                  <MenuItem value="PRESENT">PRESENT</MenuItem>
                  <MenuItem value="ABSENT">ABSENT</MenuItem>
                  <MenuItem value="HALF_DAY">HALF_DAY</MenuItem>
                  <MenuItem value="LEAVE">LEAVE</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="checkIn"
                label="Check-In Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.checkIn}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="checkOut"
                label="Check-Out Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.checkOut}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="remarks"
                label="Remarks"
                fullWidth
                multiline
                rows={2}
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Optional notes or remarks..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ px: 3, fontWeight: 600 }}>
            {loading ? 'Saving...' : isEdit ? 'Update Attendance' : 'Create Record'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
