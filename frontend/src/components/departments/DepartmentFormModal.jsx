import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
} from '@mui/material';
import departmentService from '../../services/departmentService';
import ErrorMessage from '../common/ErrorMessage';

const DEFAULT_FORM = {
  departmentCode: '',
  name: '',
  description: '',
};

export default function DepartmentFormModal({ open, onClose, onSuccess, initialValues }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(initialValues && initialValues.id);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setFormData({
          departmentCode: initialValues.departmentCode || '',
          name: initialValues.name || '',
          description: initialValues.description || '',
        });
      } else {
        setFormData(DEFAULT_FORM);
      }
      setError('');
    }
  }, [open, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.departmentCode.trim() || !formData.name.trim()) {
      setError('Please fill in required fields (Department Code and Name).');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await departmentService.updateDepartment(initialValues.id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      onSuccess(isEdit ? 'Department updated successfully' : 'Department created successfully');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save department record.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>
        {isEdit ? `Edit Department #${initialValues.departmentCode}` : 'Create New Department'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <ErrorMessage message={error} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <TextField
                name="departmentCode"
                label="Department Code *"
                fullWidth
                value={formData.departmentCode}
                onChange={handleChange}
                placeholder="e.g. ENG, HR, FIN"
                required
              />
            </Grid>

            <Grid item xs={12} sm={7}>
              <TextField
                name="name"
                label="Department Name *"
                fullWidth
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Engineering"
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of department responsibilities..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ px: 3, fontWeight: 600 }}>
            {loading ? 'Saving...' : isEdit ? 'Update Department' : 'Create Department'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
