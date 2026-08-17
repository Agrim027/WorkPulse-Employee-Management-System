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
import roleService from '../../services/roleService';
import ErrorMessage from '../common/ErrorMessage';

const DEFAULT_FORM = {
  name: 'ROLE_EMPLOYEE',
  description: '',
};

export default function RoleFormModal({ open, onClose, onSuccess, initialValues }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(initialValues && initialValues.id);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        setFormData({
          name: initialValues.name || 'ROLE_EMPLOYEE',
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

    if (!formData.name) {
      setError('Please select a system role name.');
      return;
    }

    try {
      setLoading(true);
      if (isEdit) {
        await roleService.updateRole(initialValues.id, formData);
      } else {
        await roleService.createRole(formData);
      }
      onSuccess(isEdit ? 'Role updated successfully' : 'Role created successfully');
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save role record.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>
        {isEdit ? `Edit Role #${initialValues.name}` : 'Create New System Role'}
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent dividers>
          <ErrorMessage message={error} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="role-name-label">Role Name *</InputLabel>
                <Select
                  labelId="role-name-label"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Role Name *"
                >
                  <MenuItem value="ROLE_ADMIN">ROLE_ADMIN</MenuItem>
                  <MenuItem value="ROLE_HR">ROLE_HR</MenuItem>
                  <MenuItem value="ROLE_EMPLOYEE">ROLE_EMPLOYEE</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="description"
                label="Role Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe access privileges and permissions..."
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ px: 3, fontWeight: 600 }}>
            {loading ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
