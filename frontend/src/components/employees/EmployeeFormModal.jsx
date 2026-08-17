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
  Typography,
} from '@mui/material';
import employeeService from '../../services/employeeService';
import departmentService from '../../services/departmentService';
import ErrorMessage from '../common/ErrorMessage';

const DEFAULT_FORM = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'MALE',
  address: '',
  joiningDate: new Date().toISOString().split('T')[0],
  employmentStatus: 'ACTIVE',
  departmentId: '',
};

export default function EmployeeFormModal({ open, onClose, onSuccess, initialValues }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(initialValues && initialValues.id);

  useEffect(() => {
    if (open) {
      fetchDepartments();
      if (initialValues) {
        setFormData({
          employeeCode: initialValues.employeeCode || '',
          firstName: initialValues.firstName || '',
          lastName: initialValues.lastName || '',
          email: initialValues.email || '',
          phone: initialValues.phone || '',
          dateOfBirth: initialValues.dateOfBirth || '',
          gender: initialValues.gender || 'MALE',
          address: initialValues.address || '',
          joiningDate: initialValues.joiningDate || new Date().toISOString().split('T')[0],
          employmentStatus: initialValues.employmentStatus || 'ACTIVE',
          departmentId: initialValues.department?.id || initialValues.departmentId || '',
        });
      } else {
        setFormData(DEFAULT_FORM);
      }
      setError('');
    }
  }, [open, initialValues]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments({ page: 0, size: 100 });
      if (res.data && res.data.content) {
        setDepartments(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load departments for employee form:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend Basic Validations
    if (!formData.employeeCode || !formData.firstName || !formData.lastName || !formData.email || !formData.departmentId) {
      setError('Please fill in all required fields (Code, First Name, Last Name, Email, Department).');
      return;
    }

    const payload = {
      ...formData,
      departmentId: Number(formData.departmentId),
      dateOfBirth: formData.dateOfBirth || null,
      phone: formData.phone || null,
      address: formData.address || null,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await employeeService.updateEmployee(initialValues.id, payload);
      } else {
        await employeeService.createEmployee(payload);
      }
      onSuccess(isEdit ? 'Employee updated successfully' : 'Employee created successfully');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save employee record.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>
        {isEdit ? `Edit Employee #${initialValues.employeeCode}` : 'Create New Employee'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <ErrorMessage message={error} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="employeeCode"
                label="Employee Code *"
                fullWidth
                value={formData.employeeCode}
                onChange={handleChange}
                placeholder="e.g. EMP001"
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="dept-label">Department *</InputLabel>
                <Select
                  labelId="dept-label"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  label="Department *"
                >
                  {departments.length === 0 ? (
                    <MenuItem value="" disabled>
                      No departments available
                    </MenuItem>
                  ) : (
                    departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.departmentCode})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name *"
                fullWidth
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name *"
                fullWidth
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email Address *"
                type="email"
                fullWidth
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone Number"
                fullWidth
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  label="Gender"
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Employment Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  label="Employment Status"
                >
                  <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                  <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                  <MenuItem value="ON_LEAVE">ON_LEAVE</MenuItem>
                  <MenuItem value="TERMINATED">TERMINATED</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="joiningDate"
                label="Joining Date *"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ px: 3, fontWeight: 600 }}>
            {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
