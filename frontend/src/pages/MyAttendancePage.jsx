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
  Button,
  Typography,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';
import ErrorMessage from '../components/common/ErrorMessage';

import attendanceService from '../services/attendanceService';

export default function MyAttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchMyAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, size: rowsPerPage };
      const res = await attendanceService.getMyAttendance(params);
      if (res.data) {
        const payload = res.data.data !== undefined ? res.data.data : res.data;
        setRecords(payload.content || (Array.isArray(payload) ? payload : []));
        setTotalElements(payload.totalElements || (payload.content ? payload.content.length : 0));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch personal attendance logs.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchMyAttendance();
  }, [fetchMyAttendance]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await attendanceService.checkIn();
      setSnackbar({ open: true, message: 'Checked in successfully for today!', severity: 'success' });
      fetchMyAttendance();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to check in.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await attendanceService.checkOut();
      setSnackbar({ open: true, message: 'Checked out successfully for today!', severity: 'success' });
      fetchMyAttendance();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to check out.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="My Attendance" subtitle="View personal attendance logs, check-in, and check-out for today" />

      <ErrorMessage message={error} />

      {/* Action Cards for Self Check-In / Check-Out */}
      <Card sx={{ mb: 3, borderRadius: 3, p: 1 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} sm={8}>
              <Typography variant="h6" fontWeight={700}>
                Daily Attendance Action
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Today is {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4} display="flex" gap={1.5} justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<LoginIcon />}
                onClick={handleCheckIn}
                disabled={actionLoading}
                sx={{ px: 3, fontWeight: 600 }}
              >
                Check In
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={<LogoutIcon />}
                onClick={handleCheckOut}
                disabled={actionLoading}
                sx={{ px: 3, fontWeight: 600 }}
              >
                Check Out
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* History Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        {loading ? (
          <LoadingSpinner message="Fetching attendance history..." />
        ) : records.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="textSecondary">
              No attendance records found for your profile. Use Check In to log today's attendance.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="my attendance table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Attendance Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check-In Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Check-Out Time</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((rec) => (
                    <TableRow hover key={rec.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{rec.attendanceDate}</TableCell>
                      <TableCell>
                        <StatusChip label={rec.status} statusKey={rec.status} />
                      </TableCell>
                      <TableCell>{rec.checkIn || '—'}</TableCell>
                      <TableCell>{rec.checkOut || '—'}</TableCell>
                      <TableCell color="textSecondary">{rec.remarks || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
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
