import React from 'react';
import { Chip } from '@mui/material';

const statusColors = {
  ACTIVE: 'success',
  INACTIVE: 'default',
  ON_LEAVE: 'info',
  TERMINATED: 'error',
  PRESENT: 'success',
  ABSENT: 'error',
  HALF_DAY: 'warning',
  LEAVE: 'info',
  PAID: 'success',
  PENDING: 'warning',
  CANCELLED: 'error',
  ROLE_ADMIN: 'error',
  ROLE_HR: 'secondary',
  ROLE_EMPLOYEE: 'primary',
};

export default function StatusChip({ label, statusKey }) {
  const key = statusKey || label;
  const color = statusColors[key] || 'default';

  return (
    <Chip
      label={label}
      color={color}
      size="small"
      sx={{ fontWeight: 600, fontSize: '0.75rem', px: 0.5 }}
    />
  );
}
