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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ErrorMessage from '../components/common/ErrorMessage';
import SalaryFormModal from '../components/salaries/SalaryFormModal';

import salaryService from '../services/salaryService';
import employeeService from '../services/employeeService';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/formatters';

export default function SalariesPage() {
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const canManage = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_HR');

  const [salaryRecords, setSalaryRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [selectedEmp, setSelectedEmp] = useState('');
  const [salaryMonth, setSalaryMonth] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchSalaries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size: rowsPerPage,
        employeeId: selectedEmp || undefined,
        salaryMonth: salaryMonth || undefined,
        paymentStatus: paymentStatus || undefined,
      };

      const res = await salaryService.getSalaries(params);
      if (res.data) {
        setSalaryRecords(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load salary records.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedEmp, salaryMonth, paymentStatus]);

  const fetchEmployeesList = async () => {
    try {
      const res = await employeeService.getEmployees({ page: 0, size: 100 });
      if (res.data && res.data.content) {
        setEmployees(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load employees for salary filter:', err);
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  useEffect(() => {
    fetchSalaries();
  }, [fetchSalaries]);

  const handleClearFilters = () => {
    setSelectedEmp('');
    setSalaryMonth('');
    setPaymentStatus('');
    setPage(0);
  };

  const handleOpenCreate = () => {
    setEditRecord(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditRecord(record);
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await salaryService.deleteSalary(deleteId);
      setSnackbar({ open: true, message: 'Salary record deleted successfully', severity: 'success' });
      fetchSalaries();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete salary record.',
        severity: 'error',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormSuccess = (msg) => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
    fetchSalaries();
  };

  return (
    <>
      <PageHeader
        title="Salary & Payroll Management"
        subtitle="Manage employee basic salary, allowances, deductions, and payment status"
        actionText={canManage ? 'Create Slip' : undefined}
        onActionClick={handleOpenCreate}
        actionIcon={<AddIcon />}
      />

      <ErrorMessage message={error} />

      {/* Filter Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="salary-emp-filter-label">Filter by Employee</InputLabel>
              <Select
                labelId="salary-emp-filter-label"
                value={selectedEmp}
                label="Filter by Employee"
                onChange={(e) => {
                  setSelectedEmp(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Employees</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.employeeCode} — {emp.firstName} {emp.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <TextField
              label="Salary Month"
              type="month"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={salaryMonth}
              onChange={(e) => {
                setSalaryMonth(e.target.value);
                setPage(0);
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="pay-status-filter-label">Payment Status</InputLabel>
              <Select
                labelId="pay-status-filter-label"
                value={paymentStatus}
                label="Payment Status"
                onChange={(e) => {
                  setPaymentStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="PAID">PAID</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
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

      {/* Data Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        {loading ? (
          <LoadingSpinner message="Loading payroll slips..." />
        ) : salaryRecords.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No salary slips found matching filter criteria.
            </Typography>
            <Button variant="text" color="primary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="salary table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Month</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Basic Salary</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Allowances</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Deductions</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Net Salary</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Date</TableCell>
                    {canManage && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaryRecords.map((rec) => (
                    <TableRow hover key={rec.id}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {rec.employee?.employeeCode || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{rec.salaryMonth}</TableCell>
                      <TableCell>{formatCurrency(rec.basicSalary)}</TableCell>
                      <TableCell color="success.main">{formatCurrency(rec.allowances)}</TableCell>
                      <TableCell color="error.main">{formatCurrency(rec.deductions)}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>
                        {formatCurrency(rec.netSalary)}
                      </TableCell>
                      <TableCell>
                        <StatusChip label={rec.paymentStatus} statusKey={rec.paymentStatus} />
                      </TableCell>
                      <TableCell>{rec.paymentDate || '—'}</TableCell>
                      {canManage && (
                        <TableCell align="right">
                          <Tooltip title="Edit Salary Slip">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(rec)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Salary Slip">
                            <IconButton size="small" color="error" onClick={() => setDeleteId(rec.id)}>
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
      <SalaryFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialValues={editRecord}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Salary Record"
        message="Are you sure you want to delete this salary slip? This action cannot be undone."
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
