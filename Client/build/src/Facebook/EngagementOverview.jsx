import React from 'react';
import { Card, Typography, Grid } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const EngagementOverview = ({ data }) => {
  const engagementData = data.filter(item => item.metric === "page_post_engagements");
  const followsData = data.filter(item => item.metric === "page_fan_adds");

  const totalEngagement = engagementData.reduce((acc, item) => acc + item.value, 0);
  const totalDailyFollows = followsData.reduce((acc, item) => acc + item.value, 0);

  const hasData = totalEngagement > 0 || totalDailyFollows > 0;

  const chartData = hasData
    ? [
        { name: 'Total Engagement', value: totalEngagement },
        { name: 'Daily Follows', value: totalDailyFollows },
      ]
    : [
        { name: 'No Data', value: 1 },
        { name: 'No Data', value: 1 },
      ];

  const COLORS = hasData ? ['#0088FE', '#00C49F'] : ['#ccc', '#ddd'];

  const renderCustomLabel = ({ name, cx, cy, midAngle, outerRadius, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx;
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const dy = index === 0 ? -10 : 20;

    return hasData ? (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fill="#fff"
        fontSize={12}
        dy={dy}
      >
        {name}
      </text>
    ) : null;
  };

  return (
    <div >
    <Card sx={{  borderRadius: "8px", background: "transparent", height:"400px", border:"1px solid grey",boxShadow:"0 0px 10px #001027" }}>
      <h5 className='text-center  mt-4' style={{color:"gray"}}>Engagement Overview</h5>
      <Grid container justifyContent="center" mt={4}>
        <Grid item xs={12} display="flex" justifyContent="center">
          <PieChart width={300} height={300}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              labelLine={false}
              label={renderCustomLabel}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) =>
                hasData ? [value, name] : ['No data available', '']
              }
            />
            <Legend />
          </PieChart>
        </Grid>

        {!hasData && (
          <Grid item xs={12} display="flex" justifyContent="center" mt={2}>
            <Typography variant="body2" color="white">
              No data available for this filter.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Card>
    </div>
  );
};

export default EngagementOverview;
