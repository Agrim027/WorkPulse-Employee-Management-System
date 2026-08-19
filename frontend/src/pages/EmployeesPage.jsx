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
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Button,
  Grid,
  Typography,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';
import EmployeeFormModal from '../components/employees/EmployeeFormModal';

import employeeService from '../services/employeeService';
import departmentService from '../services/departmentService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function EmployeesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userRoles = user?.roles || [];
  const canManage = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_HR');

  // State
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size: rowsPerPage,
        search: search || undefined,
        departmentId: selectedDept || undefined,
        status: selectedStatus || undefined,
      };

      const res = await employeeService.getEmployees(params);
      if (res.data) {
        const payload = res.data.data !== undefined ? res.data.data : res.data;
        setEmployees(payload.content || (Array.isArray(payload) ? payload : []));
        setTotalElements(payload.totalElements || (payload.content ? payload.content.length : 0));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load employee list.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, selectedDept, selectedStatus]);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getDepartments({ page: 0, size: 100 });
      if (res.data) {
        const payload = res.data.data !== undefined ? res.data.data : res.data;
        const list = Array.isArray(payload) ? payload : payload.content || [];
        setDepartments(list);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedDept('');
    setSelectedStatus('');
    setPage(0);
  };

  const handleOpenCreate = () => {
    setEditEmployee(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (emp) => {
    setEditEmployee(emp);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await employeeService.deleteEmployee(deleteId);
      setSnackbar({ open: true, message: 'Employee deactivated (TERMINATED) successfully', severity: 'success' });
      fetchEmployees();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to deactivate employee',
        severity: 'error',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormSuccess = (msg) => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
    fetchEmployees();
  };

  return (
    <>
      <PageHeader
        title="Employee Management"
        subtitle="View, search, filter, create, and manage organization employee records"
        actionText={canManage ? 'Add Employee' : undefined}
        onActionClick={handleOpenCreate}
        actionIcon={<AddIcon />}
      />

      <ErrorMessage message={error} />

      {/* Filter Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              label="Search Employees"
              placeholder="Search by code, name, or email..."
              variant="outlined"
              size="small"
              fullWidth
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="dept-filter-label">Filter by Department</InputLabel>
              <Select
                labelId="dept-filter-label"
                value={selectedDept}
                label="Filter by Department"
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="status-filter-label">Filter by Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={selectedStatus}
                label="Filter by Status"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                <MenuItem value="ON_LEAVE">ON_LEAVE</MenuItem>
                <MenuItem value="TERMINATED">TERMINATED</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2} md={2}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ClearIcon />}
              fullWidth
              onClick={handleClearFilters}
              sx={{ height: 40 }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table Container */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        {loading ? (
          <LoadingSpinner message="Loading employee directory..." />
        ) : employees.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No employees found matching your criteria.
            </Typography>
            <Button variant="text" color="primary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="employee table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Joining Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow hover key={emp.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{emp.employeeCode}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {emp.firstName} {emp.lastName}
                      </TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.department?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <StatusChip label={emp.employmentStatus} statusKey={emp.employmentStatus} />
                      </TableCell>
                      <TableCell>{emp.joiningDate || 'N/A'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Profile">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => navigate(`/employees/${emp.id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {canManage && (
                          <>
                            <Tooltip title="Edit Employee">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEdit(emp)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Deactivate Employee">
                              <IconButton
                                size="small"
                                color="error"
                                disabled={emp.employmentStatus === 'TERMINATED'}
                                onClick={() => setDeleteId(emp.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      {/* Form Modal */}
      <EmployeeFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialValues={editEmployee}
      />

      {/* Confirmation Dialog for Soft Delete */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Deactivate Employee Profile"
        message="Are you sure you want to deactivate this employee? Their status will be set to TERMINATED to preserve referential integrity for attendance and payroll history."
        confirmText="Deactivate"
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
