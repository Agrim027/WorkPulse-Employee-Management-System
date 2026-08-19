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
  Paper,
  Typography,
} from '@mui/material';
import salaryService from '../../services/salaryService';
import employeeService from '../../services/employeeService';
import ErrorMessage from '../common/ErrorMessage';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_FORM = {
  employeeId: '',
  basicSalary: '',
  allowances: '0.00',
  deductions: '0.00',
  salaryMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
  paymentStatus: 'PENDING',
  paymentDate: '',
};

export default function SalaryFormModal({ open, onClose, onSuccess, initialValues }) {
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
          basicSalary: initialValues.basicSalary || '',
          allowances: initialValues.allowances || '0.00',
          deductions: initialValues.deductions || '0.00',
          salaryMonth: initialValues.salaryMonth || new Date().toISOString().substring(0, 7),
          paymentStatus: initialValues.paymentStatus || 'PENDING',
          paymentDate: initialValues.paymentDate || '',
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
      if (res.data) {
        const payload = res.data.data !== undefined ? res.data.data : res.data;
        const list = payload.content || (Array.isArray(payload) ? payload : []);
        setEmployees(list);
      }
    } catch (err) {
      console.error('Failed to load employees for salary form:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Preview calculation
  const basic = parseFloat(formData.basicSalary) || 0;
  const allow = parseFloat(formData.allowances) || 0;
  const deduct = parseFloat(formData.deductions) || 0;
  const netPreview = basic + allow - deduct;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeId || !formData.basicSalary || !formData.salaryMonth || !formData.paymentStatus) {
      setError('Please fill in all required fields (Employee, Basic Salary, Salary Month, Payment Status).');
      return;
    }

    if (basic < 0 || allow < 0 || deduct < 0) {
      setError('Monetary values cannot be negative.');
      return;
    }

    const payload = {
      ...formData,
      employeeId: Number(formData.employeeId),
      basicSalary: Number(formData.basicSalary),
      allowances: Number(formData.allowances || 0),
      deductions: Number(formData.deductions || 0),
      paymentDate: formData.paymentDate || null,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await salaryService.updateSalary(initialValues.id, payload);
      } else {
        await salaryService.createSalary(payload);
      }
      onSuccess(isEdit ? 'Salary slip updated successfully' : 'Salary record created successfully');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save salary record.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>
        {isEdit ? `Edit Salary Record #${initialValues.id}` : 'Create Salary Slip'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <ErrorMessage message={error} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={isEdit}>
                <InputLabel id="salary-emp-select-label">Select Employee *</InputLabel>
                <Select
                  labelId="salary-emp-select-label"
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
                name="salaryMonth"
                label="Salary Month (YYYY-MM) *"
                type="month"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.salaryMonth}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="pay-status-label">Payment Status *</InputLabel>
                <Select
                  labelId="pay-status-label"
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  label="Payment Status *"
                >
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="PAID">PAID</MenuItem>
                  <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="basicSalary"
                label="Basic Salary (₹) *"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                fullWidth
                value={formData.basicSalary}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="allowances"
                label="Allowances (₹)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                fullWidth
                value={formData.allowances}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                name="deductions"
                label="Deductions (₹)"
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                fullWidth
                value={formData.deductions}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                name="paymentDate"
                label="Payment Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.paymentDate}
                onChange={handleChange}
              />
            </Grid>

            {/* Net Salary Preview */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, borderColor: 'primary.light' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                    Estimated Net Salary Preview:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.dark">
                    {formatCurrency(netPreview)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
                  Note: Final Net Salary is authoritatively calculated on the backend (Basic + Allowances - Deductions).
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ px: 3, fontWeight: 600 }}>
            {loading ? 'Saving...' : isEdit ? 'Update Salary Slip' : 'Create Slip'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
