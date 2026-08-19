import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Chip,
  Skeleton,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PaymentsIcon from '@mui/icons-material/Payments';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import PageHeader from '../components/common/PageHeader';
import StatCard from '../components/dashboard/StatCard';
import StatusChip from '../components/common/StatusChip';
import ErrorMessage from '../components/common/ErrorMessage';

import dashboardService from '../services/dashboardService';
import attendanceService from '../services/attendanceService';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userRoles = user?.roles || [];
  const isAdminOrHr = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_HR') || user?.username?.toLowerCase() === 'admin';

  const [adminSummary, setAdminSummary] = useState(null);
  const [employeeSummary, setEmployeeSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      if (isAdminOrHr) {
        const res = await dashboardService.getAdminSummary();
        if (res.data) setAdminSummary(res.data);
      } else {
        const res = await dashboardService.getEmployeeSummary();
        if (res.data) setEmployeeSummary(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  }, [isAdminOrHr]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      await attendanceService.checkIn();
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      await attendanceService.checkOut();
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box p={2}>
        <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={130} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (error) {
    return (
      <Box py={4}>
        <ErrorMessage title="Dashboard Load Error" message={error} />
        <Button variant="outlined" color="primary" onClick={fetchDashboardData} sx={{ mt: 2 }}>
          Retry Loading Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.username || 'User'}!`}
        subtitle={
          isAdminOrHr
            ? "Here is your organization's high-level operational overview"
            : 'Here is your personal attendance and payroll overview'
        }
      />

      {/* ADMIN / HR DASHBOARD VIEW */}
      {isAdminOrHr && adminSummary && (
        <>
          {/* Top Metric Cards */}
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Employees"
                value={adminSummary.employees?.total || 0}
                icon={<PeopleIcon />}
                color="primary.main"
                subtitle={`${adminSummary.employees?.active || 0} Active / ${adminSummary.employees?.terminated || 0} Terminated`}
                onClick={() => navigate('/employees')}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Departments"
                value={adminSummary.departments?.total || 0}
                icon={<BusinessIcon />}
                color="info.main"
                subtitle="Registered Company Departments"
                onClick={() => navigate('/departments')}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Today's Attendance"
                value={adminSummary.attendance?.present || 0}
                icon={<EventAvailableIcon />}
                color="success.main"
                subtitle={`${adminSummary.attendance?.absent || 0} Absent / ${adminSummary.attendance?.leave || 0} On Leave`}
                onClick={() => navigate('/attendance')}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Payroll"
                value={formatCurrency(adminSummary.salary?.totalPayroll || 0)}
                icon={<PaymentsIcon />}
                color="warning.main"
                subtitle={`Paid: ${formatCurrency(adminSummary.salary?.paidAmount || 0)}`}
                onClick={() => navigate('/salaries')}
              />
            </Grid>
          </Grid>

          {/* Detailed Summaries */}
          <Grid container spacing={3}>
            {/* Today's Attendance Breakdown */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Today's Attendance Summary ({adminSummary.attendance?.date})
                    </Typography>
                    <Button
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                      onClick={() => navigate('/attendance')}
                    >
                      Manage Logs
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Box display="flex" flexDirection="column" gap={2.5}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          Present ({adminSummary.attendance?.present || 0})
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {adminSummary.employees?.total
                            ? Math.round((adminSummary.attendance?.present / adminSummary.employees?.total) * 100)
                            : 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          adminSummary.employees?.total
                            ? (adminSummary.attendance?.present / adminSummary.employees?.total) * 100
                            : 0
                        }
                        color="success"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          Absent ({adminSummary.attendance?.absent || 0})
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          adminSummary.employees?.total
                            ? (adminSummary.attendance?.absent / adminSummary.employees?.total) * 100
                            : 0
                        }
                        color="error"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          Half Day ({adminSummary.attendance?.halfDay || 0})
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          adminSummary.employees?.total
                            ? (adminSummary.attendance?.halfDay / adminSummary.employees?.total) * 100
                            : 0
                        }
                        color="warning"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>

                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" fontWeight={600}>
                          On Leave ({adminSummary.attendance?.leave || 0})
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          adminSummary.employees?.total
                            ? (adminSummary.attendance?.leave / adminSummary.employees?.total) * 100
                            : 0
                        }
                        color="info"
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Overall Payroll Breakdown */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Overall Payroll Summary (INR)
                    </Typography>
                    <Button
                      endIcon={<ArrowForwardIcon />}
                      size="small"
                      onClick={() => navigate('/salaries')}
                    >
                      Payroll Slips
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 3 }} />

                  <Box display="flex" flexDirection="column" gap={2}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography color="textSecondary" variant="body2">Total Payroll Recorded</Typography>
                      <Typography variant="h5" fontWeight={700} color="primary.main">
                        {formatCurrency(adminSummary.salary?.totalPayroll || 0)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Total Slips Issued: {adminSummary.salary?.totalRecords || 0}
                      </Typography>
                    </Paper>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'success.light' }}>
                          <Typography color="textSecondary" variant="caption">Total Paid</Typography>
                          <Typography variant="h6" fontWeight={700} color="success.main">
                            {formatCurrency(adminSummary.salary?.paidAmount || 0)}
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'warning.light' }}>
                          <Typography color="textSecondary" variant="caption">Total Pending</Typography>
                          <Typography variant="h6" fontWeight={700} color="warning.main">
                            {formatCurrency(adminSummary.salary?.pendingAmount || 0)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* EMPLOYEE SELF-SERVICE DASHBOARD VIEW */}
      {!isAdminOrHr && employeeSummary && (
        <Grid container spacing={3}>
          {/* Employee Profile Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb=
{2}>
                  <AccountCircleIcon color="primary" fontSize="large" />
                  <Typography variant="h6" fontWeight={700}>
                    Employee Profile
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">Name:</Typography>
                    <Typography fontWeight={600}>
                      {employeeSummary.profile?.firstName} {employeeSummary.profile?.lastName}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">Employee Code:</Typography>
                    <Typography fontWeight={600}>{employeeSummary.profile?.employeeCode}</Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">Department:</Typography>
                    <Typography fontWeight={600}>
                      {employeeSummary.profile?.department?.name || 'Unassigned'}
                    </Typography>
                  </Box>

                  <Box display="flex" justifyContent="space-between">
                    <Typography color="textSecondary">Status:</Typography>
                    <StatusChip
                      label={employeeSummary.profile?.employmentStatus}
                      statusKey={employeeSummary.profile?.employmentStatus}
                    />
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/employees/${employeeSummary.profile?.id}`)}
                  >
                    View Full Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Attendance Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <EventAvailableIcon color="success" fontSize="large" />
                  <Typography variant="h6" fontWeight={700}>
                    Today's Attendance
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                {employeeSummary.todayAttendance ? (
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography color="textSecondary">Status:</Typography>
                      <StatusChip
                        label={employeeSummary.todayAttendance.status}
                        statusKey={employeeSummary.todayAttendance.status}
                      />
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography color="textSecondary">Check-In Time:</Typography>
                      <Typography fontWeight={600}>{employeeSummary.todayAttendance.checkIn || '—'}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography color="textSecondary">Check-Out Time:</Typography>
                      <Typography fontWeight={600}>{employeeSummary.todayAttendance.checkOut || '—'}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Typography color="textSecondary" sx={{ my: 2 }}>
                    No check-in record logged for today yet.
                  </Typography>
                )}

                <Box display="flex" gap={1} mt={3}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LoginIcon />}
                    fullWidth
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                  >
                    Check In
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<LogoutIcon />}
                    fullWidth
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                  >
                    Check Out
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Latest Salary Card */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <PaymentsIcon color="warning" fontSize="large" />
                  <Typography variant="h6" fontWeight={700}>
                    Latest Salary Slip
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                {employeeSummary.latestSalary ? (
                  <Box display="flex" flexDirection="column" gap={1.5}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography color="textSecondary">Salary Month:</Typography>
                      <Typography fontWeight={600}>{employeeSummary.latestSalary.salaryMonth}</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between">
                      <Typography color="textSecondary">Net Salary:</Typography>
                      <Typography fontWeight={700} color="primary.main">
                        {formatCurrency(employeeSummary.latestSalary.netSalary)}
                      </Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography color="textSecondary">Payment Status:</Typography>
                      <StatusChip
                        label={employeeSummary.latestSalary.paymentStatus}
                        statusKey={employeeSummary.latestSalary.paymentStatus}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Typography color="textSecondary" sx={{ my: 2 }}>
                    No salary slips issued yet.
                  </Typography>
                )}

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={() => navigate('/my-salaries')}
                >
                  View All Salary Slips
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  );
}
