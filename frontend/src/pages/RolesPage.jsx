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
import StatusChip from '../components/common/StatusChip';
import RoleFormModal from '../components/roles/RoleFormModal';

import roleService from '../services/roleService';
import { useAuth } from '../hooks/useAuth';

export default function RolesPage() {
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const isAdmin = userRoles.includes('ROLE_ADMIN');

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await roleService.getRoles();
      if (res.data) {
        const payload = res.data.data !== undefined ? res.data.data : res.data;
        const list = Array.isArray(payload) ? payload : payload?.content || [];
        setRoles(list);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('403 Access Denied: Only Administrators are authorized to view or manage system roles.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch system roles.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const filteredRoles = roles.filter((role) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      role.name?.toLowerCase().includes(term) ||
      role.description?.toLowerCase().includes(term)
    );
  });

  const handleOpenCreate = () => {
    setEditRole(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditRole(role);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await roleService.deleteRole(deleteId);
      setSnackbar({ open: true, message: 'Role deleted successfully', severity: 'success' });
      fetchRoles();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Cannot delete role. Make sure no users are assigned to it.',
        severity: 'error',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormSuccess = (msg) => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
    fetchRoles();
  };

  return (
    <>
      <PageHeader
        title="Role & Security Management"
        subtitle="Manage system roles, security authorities, and user access levels"
        actionText={isAdmin ? 'Add Role' : undefined}
        onActionClick={handleOpenCreate}
        actionIcon={<AddIcon />}
      />

      <ErrorMessage message={error} />

      {/* Search Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              label="Search Roles"
              placeholder="Search by role name or description..."
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
          <LoadingSpinner message="Loading system roles..." />
        ) : filteredRoles.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No roles found.
            </Typography>
            {search && (
              <Button variant="text" color="primary" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table aria-label="roles table">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created Date</TableCell>
                  {isAdmin && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow hover key={role.id}>
                    <TableCell>
                      <StatusChip label={role.name?.replace('ROLE_', '') || role.name} statusKey={role.name} />
                    </TableCell>
                    <TableCell color="textSecondary">{role.description || 'No description provided'}</TableCell>
                    <TableCell>{role.createdAt ? new Date(role.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <Tooltip title="Edit Role">
                          <IconButton size="small" color="primary" onClick={() => handleOpenEdit(role)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete Role">
                          <IconButton size="small" color="error" onClick={() => setDeleteId(role.id)}>
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
      <RoleFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialValues={editRole}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete System Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
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
