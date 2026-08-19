import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Button,
  Grid,
  Typography,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';
import DepartmentFormModal from '../components/departments/DepartmentFormModal';

import departmentService from '../services/departmentService';
import { useAuth } from '../hooks/useAuth';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const canManage = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_HR');

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await departmentService.getDepartments();
      if (res.data) {
        const payload = res.data.data !== undefined ? res.data.data : res.data;
        const list = Array.isArray(payload) ? payload : payload?.content || [];
        setDepartments(list);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const filteredDepartments = departments.filter((dept) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      dept.departmentCode?.toLowerCase().includes(term) ||
      dept.name?.toLowerCase().includes(term) ||
      dept.description?.toLowerCase().includes(term)
    );
  });

  const handleOpenCreate = () => {
    setEditDept(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditDept(dept);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await departmentService.deleteDepartment(deleteId);
      setSnackbar({ open: true, message: 'Department deleted successfully', severity: 'success' });
      fetchDepartments();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Cannot delete department. Make sure no employees are assigned to it.',
        severity: 'error',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormSuccess = (msg) => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
    fetchDepartments();
  };

  return (
    <>
      <PageHeader
        title="Department Management"
        subtitle="Organize company structure, teams, and department definitions"
        actionText={canManage ? 'Add Department' : undefined}
        onActionClick={handleOpenCreate}
        actionIcon={<AddIcon />}
      />

      <ErrorMessage message={error} />

      {/* Search Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              label="Search Departments"
              placeholder="Search by department code or name..."
              variant="outlined"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ClearIcon />}
              fullWidth
              onClick={() => setSearch('')}
              disabled={!search}
              sx={{ height: 40 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        {loading ? (
          <LoadingSpinner message="Loading departments..." />
        ) : filteredDepartments.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No departments found.
            </Typography>
            {search && (
              <Button variant="text" color="primary" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table aria-label="departments table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Department Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                  {canManage && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepartments.map((dept) => (
                  <TableRow hover key={dept.id}>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {dept.departmentCode}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{dept.name}</TableCell>
                    <TableCell color="textSecondary">{dept.description || 'No description provided'}</TableCell>
                    <TableCell>{dept.createdAt ? new Date(dept.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <Tooltip title="Edit Department">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEdit(dept)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Department">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(dept.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Form Modal */}
      <DepartmentFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialValues={editDept}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
