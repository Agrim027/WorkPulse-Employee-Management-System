import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Avatar,
  Divider,
  Button,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmployeeFormModal from '../components/employees/EmployeeFormModal';

import employeeService from '../services/employeeService';
import { useAuth } from '../hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const userRoles = user?.roles || [];
  const canManage = userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_HR');

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchEmployeeDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await employeeService.getEmployeeById(id);
      if (res.data) {
        setEmployee(res.data);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('403 Access Denied: You do not have permission to view this employee profile.');
      } else if (err.response?.status === 404) {
        setError('404 Not Found: Employee profile does not exist.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch employee details.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [fetchEmployeeDetails]);

  const handleConfirmDelete = async () => {
    try {
      await employeeService.deleteEmployee(id);
      fetchEmployeeDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate employee.');
    } finally {
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching employee profile..." />;
  }

  if (error) {
    return (
      <Box py={4}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          Go Back
        </Button>
        <ErrorMessage title="Error" message={error} />
      </Box>
    );
  }

  if (!employee) return null;

  return (
    <>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employees')} sx={{ fontWeight: 600 }}>
          Back to Employee List
        </Button>

        {canManage && (
          <Box display="flex" gap={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => setEditOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              Edit Profile
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              disabled={employee.employmentStatus === 'TERMINATED'}
              onClick={() => setDeleteOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              Deactivate
            </Button>
          </Box>
        )}
      </Box>

      {/* Main Profile Header Card */}
      <Paper sx={{ p: 4, mb: 4, borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 90,
                height: 90,
                fontSize: '2.5rem',
                fontWeight: 700,
                boxShadow: 3,
              }}
            >
              {employee.firstName?.charAt(0).toUpperCase() || 'E'}
            </Avatar>
          </Grid>

          <Grid item xs>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Typography variant="h4" fontWeight={700}>
                {employee.firstName} {employee.lastName}
              </Typography>
              <StatusChip label={employee.employmentStatus} statusKey={employee.employmentStatus} />
            </Box>
            <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 0.5 }}>
              Employee Code: <strong>{employee.employeeCode}</strong> — {employee.department?.name || 'Unassigned'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Details Sections */}
      <Grid container spacing={3}>
        {/* Personal Details */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <PersonIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Personal Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Full Name:</Typography>
                  <Typography fontWeight={600}>{employee.firstName} {employee.lastName}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Email Address:</Typography>
                  <Typography fontWeight={600}>{employee.email}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Phone Number:</Typography>
                  <Typography fontWeight={600}>{employee.phone || 'N/A'}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Date of Birth:</Typography>
                  <Typography fontWeight={600}>{employee.dateOfBirth || 'N/A'}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Gender:</Typography>
                  <Typography fontWeight={600}>{employee.gender || 'N/A'}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Address:</Typography>
                  <Typography fontWeight={600}>{employee.address || 'N/A'}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Employment & Organizational Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <WorkIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Employment Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Employee Code:</Typography>
                  <Typography fontWeight={600}>{employee.employeeCode}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Department:</Typography>
                  <Typography fontWeight={600}>
                    {employee.department ? `${employee.department.name} (${employee.department.departmentCode})` : 'N/A'}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Joining Date:</Typography>
                  <Typography fontWeight={600}>{employee.joiningDate || 'N/A'}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between">
                  <Typography color="textSecondary">Employment Status:</Typography>
                  <StatusChip label={employee.employmentStatus} statusKey={employee.employmentStatus} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Linked User Account (if available) */}
        {employee.user && (
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <AccountCircleIcon color="secondary" />
                  <Typography variant="h6" fontWeight={700}>
                    Linked User Account
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography color="textSecondary">Username:</Typography>
                    <Typography fontWeight={600}>{employee.user.username}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography color="textSecondary">Account Email:</Typography>
                    <Typography fontWeight={600}>{employee.user.email}</Typography>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Typography color="textSecondary">Assigned Roles:</Typography>
                    <Box display="flex" gap={0.5} mt={0.5}>
                      {employee.user.roles?.map((role) => (
                        <Chip key={role} label={role.replace('ROLE_', '')} size="small" color="secondary" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Edit Form Modal */}
      <EmployeeFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          fetchEmployeeDetails();
        }}
        initialValues={employee}
      />

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        open={deleteOpen}
        title="Deactivate Employee Profile"
        message={`Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}? Their status will be set to TERMINATED.`}
        confirmText="Deactivate"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}
