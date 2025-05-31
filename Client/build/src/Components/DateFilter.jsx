
import React, { useState } from 'react';
import { Box, MenuItem, Select, Typography, Button } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const DateFilter = ({ onFilter }) => {
  const [type, setType] = useState('last7days');
  const [date, setDate] = useState(dayjs());
  const [start, setStart] = useState(dayjs().subtract(7, 'day'));
  const [end, setEnd] = useState(dayjs());

  const handleApply = () => {
    const params = { type };

    if (type === 'day') params.value = date.format('YYYY-MM-DD');
    else if (type === 'month') params.value = date.format('YYYY-MM');
    else if (type === 'year') params.value = date.format('YYYY');
    else if (type === 'range') {
      params.start = start.format('YYYY-MM-DD');
      params.end = end.format('YYYY-MM-DD');
    }

    onFilter(params);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        {/* <Typography variant="h6" className=" border px-3 py-1 rounded d-flex align-items-center">  Filter By: </Typography> */}
        <Select value={type} onChange={(e) => setType(e.target.value)} size="small" style={{background:"white", border:"2px solid #001027 !important"}}>
          <MenuItem  className=" border px-3 py-1  rounded d-flex align-items-center" value="last7days">Last 7 Days 📅</MenuItem>
          <MenuItem value="last30days">Last 30 Days</MenuItem>
          <MenuItem value="currentMonth">Current Month</MenuItem>
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
          <MenuItem value="range">Custom Range</MenuItem>
        </Select>

        {(type === 'day' || type === 'month' || type === 'year') && (
          <DatePicker
            views={type === 'month' ? ['year', 'month'] : type === 'year' ? ['year'] : undefined}
            label={`Select ${type}`}
            value={date}
            onChange={setDate}  sx={{
              input: { color: 'white' },
              svg: { color: 'white' }, // calendar icon
              label: { color: 'white' }, // label color
              '.MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
            }}
          />
        )}

        {type === 'range' && (
          <>
            <DatePicker label="Start" value={start} onChange={setStart}  sx={{
    input: { color: 'white' },
    svg: { color: 'white' }, // calendar icon
    label: { color: 'white' }, // label color
    '.MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
    },
  }} />
            <DatePicker label="End" value={end} onChange={setEnd}  sx={{
    input: { color: 'white' },
    svg: { color: 'white' },
    label: { color: 'white' }, 
    '.MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white',
      },
      '&:hover fieldset': {
        borderColor: 'white',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
    },
  }} />
          </>
        )}

        <Button variant="contained" onClick={handleApply}>Apply</Button>
      </Box>
    </LocalizationProvider>
  );
};

export default DateFilter;
