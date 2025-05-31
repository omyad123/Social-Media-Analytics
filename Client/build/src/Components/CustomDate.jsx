
import React from 'react';
import { Box, Typography } from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const CustomDate = ({ range, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="subtitle1">Select Date Range:</Typography>
        <DateRangePicker
          calendars={2}
          value={range}
          onChange={onChange}
          format="MMM D, YYYY"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default CustomDate;
