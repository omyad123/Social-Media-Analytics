import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const InstaKpi = ({ title, value, percent, color = "#1976d2", icon }) => {
  return (
    <Box
      sx={{
        flex: 1,
        padding: 2,
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        minWidth: "250px",
        border:"1px solid grey",boxShadow:"0 0px 10px #001027",
      }}
    >
      {icon && <Box>{icon}</Box>}

      <Box>
        {/* Title */}
        <Typography variant="subtitle2" sx={{ color: "#777" }}>
          {title}
        </Typography>

        {/* Value and Percentage in a row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h5" fontWeight="bold" color="black">
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color }}>
            {percent}%
          </Typography>
          <Box sx={{ mt: 1 }}>
          <CircularProgress
            variant="determinate"
            value={percent}
            size={48}
            sx={{ color }}
          />
        </Box>
        </Box>

        {/* Circular Progress shown below */}
      
      </Box>
    </Box>
  );
};

export default InstaKpi;
