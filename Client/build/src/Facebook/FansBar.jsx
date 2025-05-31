import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import CustomTooltip from '../Components/CustomTooltip';

const FansBar = ({ data }) => {

    // const sampleData = [
    //     {
    //       metric: "page_fan_adds",
    //       value: 10,
    //       end_time: "2025-04-22T12:00:00.000Z"
    //     },
    //     {
    //       metric: "page_fan_adds",
    //       value: 5,
    //       end_time: "2025-04-23T12:00:00.000Z"
    //     },
    //     {
    //       metric: "page_fan_adds",
    //       value: 8,
    //       end_time: "2025-04-24T12:00:00.000Z"
    //     },
    //     {
    //       metric: "page_fan_removes",
    //       value: 3,
    //       end_time: "2025-04-22T12:00:00.000Z"
    //     },
    //     {
    //       metric: "page_fan_removes",
    //       value: 2,
    //       end_time: "2025-04-23T12:00:00.000Z"
    //     },
    //     {
    //       metric: "page_fan_removes",
    //       value: 4,
    //       end_time: "2025-04-24T12:00:00.000Z"
    //     },
    //   ];



  // data = sampleData;

  // Filter data for page_fan_adds and page_fan_removes
  const pageFanAddsEntry = data.filter(item => item.metric === "page_fan_adds");
  const pageFanRemovesEntry = data.filter(item => item.metric === "page_fan_removes");

  // Grouping data by date
  const pageFanAddsGroupedByDate = pageFanAddsEntry.reduce((acc, item) => {
    const date = new Date(item.end_time).toISOString().split("T")[0]; // Format date as YYYY-MM-DD
    if (!acc[date]) acc[date] = 0;
    acc[date] += item.value;
    return acc;
  }, {});

  const pageFanRemovesGroupedByDate = pageFanRemovesEntry.reduce((acc, item) => {
    const date = new Date(item.end_time).toISOString().split("T")[0]; // Format date as YYYY-MM-DD
    if (!acc[date]) acc[date] = 0;
    acc[date] += item.value;
    return acc;
  }, {});

  // Prepare the chart data by merging the adds and removes data by date
  const chartData = Object.keys(pageFanAddsGroupedByDate).map(date => {
    const adds = pageFanAddsGroupedByDate[date];
    const removes = pageFanRemovesGroupedByDate[date] || 0;
    const netLikes = adds - removes;  // Calculate net likes
    return {
      date,
      adds,
      removes,
      netLikes
    };
  });

  // Sorting chart data by date (optional)
  chartData.sort((a, b) => new Date(a.date) - new Date(b.date));



  return (
    <div className='' style={{borderRadius:"8px", height:"400px",width:"65%",  marginLeft:"10px",marginRight:"10px",border:"1px solid grey",boxShadow:"0 0px 10px #001027"}}>
    <div className="w-full p-4 rounded-xl shadow-md">
      <h5 className="text-2xl  mb-4 text-center" style={{color:"gray"}}>Audience Growth Comparison</h5>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="adds" fill="#4CAF50" name="Adds" />
          <Bar dataKey="removes" fill="#F44336" name="Removes" />
          <Bar dataKey="netLikes" fill="#2196F3" name="Net Likes"/>
        </BarChart>
      </ResponsiveContainer>
    </div>
    </div>
  );
};

export default FansBar;
