import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';

export default function StatCard({ title, value, icon, color = 'primary.main', subtitle, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: '0 8px 25px 0 rgba(0,0,0,0.12)',
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="textSecondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary" fontWeight={500}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Avatar
            sx={{
              bgcolor: color,
              width: 52,
              height: 52,
              boxShadow: '0 4px 12px 0 rgba(0,0,0,0.15)',
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}
