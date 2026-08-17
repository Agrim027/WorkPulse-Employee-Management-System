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
import AttendanceFormModal from '../components/attendance/AttendanceFormModal';

import attendanceService from '../services/attendanceService';
import employeeService from '../services/employeeService';
import { useAuth } from '../hooks/useAuth';

export default function AttendancePage() {
  const { user } = useAuth();
  const userRoles = user?.roles || [];
  const canManage = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_HR');

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  // Modals & Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        size: rowsPerPage,
        employeeId: selectedEmp || undefined,
        date: selectedDate || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: selectedStatus || undefined,
      };

      const res = await attendanceService.getAttendance(params);
      if (res.data) {
        setAttendanceRecords(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedEmp, selectedDate, startDate, endDate, selectedStatus]);

  const fetchEmployeesList = async () => {
    try {
      const res = await employeeService.getEmployees({ page: 0, size: 100 });
      if (res.data && res.data.content) {
        setEmployees(res.data.content);
      }
    } catch (err) {
      console.error('Failed to load employees for filter:', err);
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleClearFilters = () => {
    setSelectedEmp('');
    setSelectedDate('');
    setStartDate('');
    setEndDate('');
    setSelectedStatus('');
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
      await attendanceService.deleteAttendance(deleteId);
      setSnackbar({ open: true, message: 'Attendance record deleted successfully', severity: 'success' });
      fetchAttendance();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete attendance record.',
        severity: 'error',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleFormSuccess = (msg) => {
    setSnackbar({ open: true, message: msg, severity: 'success' });
    fetchAttendance();
  };

  return (
    <>
      <PageHeader
        title="Attendance Management"
        subtitle="Manage company daily check-ins, check-outs, and attendance logs"
        actionText={canManage ? 'Add Log' : undefined}
        onActionClick={handleOpenCreate}
        actionIcon={<AddIcon />}
      />

      <ErrorMessage message={error} />

      {/* Filter Bar */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="emp-filter-label">Filter by Employee</InputLabel>
              <Select
                labelId="emp-filter-label"
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

          <Grid item xs={12} sm={4} md={2}>
            <TextField
              label="Single Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setPage(0);
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextField
              label="Start Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <TextField
              label="End Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={2}>
            <FormControl size="small" fullWidth>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={selectedStatus}
                label="Status"
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="PRESENT">PRESENT</MenuItem>
                <MenuItem value="ABSENT">ABSENT</MenuItem>
                <MenuItem value="HALF_DAY">HALF_DAY</MenuItem>
                <MenuItem value="LEAVE">LEAVE</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4} md={1}>
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
          <LoadingSpinner message="Loading attendance logs..." />
        ) : attendanceRecords.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No attendance records found matching filter criteria.
            </Typography>
            <Button variant="text" color="primary" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="attendance table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check-In</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check-Out</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                    {canManage && <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.map((rec) => (
                    <TableRow hover key={rec.id}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {rec.employee ? `${rec.employee.firstName} ${rec.employee.lastName}` : 'N/A'}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {rec.employee?.employeeCode || 'N/A'}
                      </TableCell>
                      <TableCell>{rec.attendanceDate}</TableCell>
                      <TableCell>
                        <StatusChip label={rec.status} statusKey={rec.status} />
                      </TableCell>
                      <TableCell>{rec.checkIn || '—'}</TableCell>
                      <TableCell>{rec.checkOut || '—'}</TableCell>
                      <TableCell color="textSecondary">{rec.remarks || '—'}</TableCell>
                      {canManage && (
                        <TableCell align="right">
                          <Tooltip title="Edit Record">
                            <IconButton size="small" color="primary" onClick={() => handleOpenEdit(rec)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete Record">
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
      <AttendanceFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        initialValues={editRecord}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance log? This action cannot be undone."
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
