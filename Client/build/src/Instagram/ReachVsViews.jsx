import React from 'react';
import { Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import dayjs from 'dayjs';

const ReachVsViews = ({ compareData = [] }) => {

  const filteredData = compareData.filter(item =>
    item.metric === 'views' || item.metric === 'reach'
  );

  // Group by end_time (as string), with reach and views in each object
  const groupedByDate = {};

  filteredData.forEach(item => {
    const date = dayjs(item.end_time).format('YYYY-MM-DD');
    if (!groupedByDate[date]) {
      groupedByDate[date] = { name: date, views: 0, reach: 0 };
    }
    groupedByDate[date][item.metric] = item.value;
  });

  const chartData = Object.values(groupedByDate);

  return (
    <div style={{borderRadius:"8px",width:"50%",height:"420px",marginLeft:"30px",marginRight:"30px",border:"1px solid grey",boxShadow:"0 0px 10px #001027"}}>
      <Typography variant="h5" sx={{ color: "grey", mt: 6, mb: 2,textAlign:"center"  }}>
        Views vs Reach Over Time
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <XAxis dataKey="name" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Legend />
          <Bar dataKey="views" fill="#8884d8" name="Views" />
          <Bar dataKey="reach" fill="#00C49F" name="Reach" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReachVsViews;
