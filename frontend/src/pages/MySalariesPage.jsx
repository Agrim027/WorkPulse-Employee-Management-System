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
  Typography,
} from '@mui/material';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';
import ErrorMessage from '../components/common/ErrorMessage';

import salaryService from '../services/salaryService';
import { formatCurrency } from '../utils/formatters';

export default function MySalariesPage() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const fetchMySalaries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { page, size: rowsPerPage };
      const res = await salaryService.getMySalaries(params);
      if (res.data) {
        setSalaries(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch personal salary slips.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchMySalaries();
  }, [fetchMySalaries]);

  return (
    <>
      <PageHeader title="My Salary Slips" subtitle="View personal compensation, allowances, deductions, and net salary history" />

      <ErrorMessage message={error} />

      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 3 }}>
        {loading ? (
          <LoadingSpinner message="Fetching salary slips..." />
        ) : salaries.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography variant="h6" color="textSecondary">
              No salary slips available for your profile yet.
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader aria-label="my salary table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Salary Month</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Basic Salary</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Allowances</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Deductions</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Net Salary</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Payment Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salaries.map((rec) => (
                    <TableRow hover key={rec.id}>
                      <TableCell sx={{ fontWeight: 700 }}>{rec.salaryMonth}</TableCell>
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
    </>
  );
}
