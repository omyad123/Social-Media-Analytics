import { colors } from '@mui/material';
import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

// Main component
export default function IgAdsData({ data }) {
  // State for selected campaign
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  
  // Filter data based on selected campaign
  const filteredData = selectedCampaign === 'all' 
    ? data 
    : data.filter(item => item.campaign_name === selectedCampaign);
  
  // Get unique campaign names for filter dropdown
  const campaigns = ['all', ...new Set(data.map(item => item.campaign_name))];
  
  // Calculate total metrics
  const totalMetrics = filteredData.reduce((acc, curr) => {
    return {
      impressions: acc.impressions + curr.metrics.impressions,
      clicks: acc.clicks + curr.metrics.clicks,
      spend: acc.spend + curr.metrics.spend,
      reach: acc.reach + curr.metrics.reach
    };
  }, { impressions: 0, clicks: 0, spend: 0, reach: 0 });
  
  // Calculate average CTR and CPC
  const avgCTR = totalMetrics.clicks / totalMetrics.impressions || 0;
  const avgCPC = totalMetrics.spend / totalMetrics.clicks || 0;
  
  // Prepare data for campaign comparison chart
  const campaignComparisonData = campaigns
    .filter(campaign => campaign !== 'all')
    .map(campaign => {
      const campaignData = data.filter(item => item.campaign_name === campaign);
      const totalSpend = campaignData.reduce((sum, item) => sum + item.metrics.spend, 0);
      const totalClicks = campaignData.reduce((sum, item) => sum + item.metrics.clicks, 0);
      
      return {
        name: campaign,
        spend: totalSpend,
        clicks: totalClicks,
        ctr: campaignData.reduce((sum, item) => sum + item.metrics.ctr, 0) / campaignData.length
      };
    });
  
  // Data for pie chart
  const spendDistributionData = campaigns
    .filter(campaign => campaign !== 'all')
    .map(campaign => {
      const campaignData = data.filter(item => item.campaign_name === campaign);
      return {
        name: campaign,
        value: campaignData.reduce((sum, item) => sum + item.metrics.spend, 0)
      };
    });
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0 }}>{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {`${entry.name}: ${entry.name === 'ctr' ? `${(entry.value * 100).toFixed(2)}%` : entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Styles for the dashboard
  const dashboardStyles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      color:'black'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      color:'grey'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0
    },
    filterContainer: {
      display: 'flex',
      alignItems: 'center'
    },
    filterLabel: {
      marginRight: '10px',
      fontWeight: 'bold'
    },
    select: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      backgroundColor: 'white'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '15px',
      marginBottom: '20px'
    },
    metricCard: {
      padding: '15px',
      borderRadius: '8px',
     color: 'rgba(255, 255, 255, 0.54)',
      textAlign: 'center',
      boxShadow: 'rgb(0, 16, 39) 0px 0px 10px'
    },
    metricValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '5px 0'
    },
    metricLabel: {
      color: '#666',
      fontSize: '14px',
      margin: 0
    },
    chartContainer: {
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      border:'1px solid gray',
      background:'transparent',
      color:'white'
    },
    chartTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '15px',
      textAlign: 'center',
      color: 'gray',
    },
    twoColumnGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    }
  };

  return (
    <div style={dashboardStyles.container}>
      <div style={dashboardStyles.header}>
        <h1 style={dashboardStyles.title}>Ad Performance Dashboard</h1>
        <div style={dashboardStyles.filterContainer}>
          <span style={dashboardStyles.filterLabel}>Filter by Campaign:</span>
          <select 
            style={dashboardStyles.select}
            value={selectedCampaign} 
            onChange={(e) => setSelectedCampaign(e.target.value)}
          >
            {campaigns.map(campaign => (
              <option key={campaign} value={campaign}>
                {campaign === 'all' ? 'All Campaigns' : campaign}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div style={dashboardStyles.metricsGrid}>
        <div style={dashboardStyles.metricCard}>
          <p style={dashboardStyles.metricLabel}>Total Impressions</p>
          <p style={dashboardStyles.metricValue}>{totalMetrics.impressions.toLocaleString()}</p>
        </div>
        <div style={dashboardStyles.metricCard}>
          <p style={dashboardStyles.metricLabel}>Total Spend</p>
          <p style={dashboardStyles.metricValue}>${totalMetrics.spend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div style={dashboardStyles.metricCard}>
          <p style={dashboardStyles.metricLabel}>Total Clicks</p>
          <p style={dashboardStyles.metricValue}>{totalMetrics.clicks.toLocaleString()}</p>
        </div>
        <div style={dashboardStyles.metricCard}>
          <p style={dashboardStyles.metricLabel}>Average CTR</p>
          <p style={dashboardStyles.metricValue}>{(avgCTR * 100).toFixed(2)}%</p>
        </div>
        <div style={dashboardStyles.metricCard}>
          <p style={dashboardStyles.metricLabel}>Average CPC</p>
          <p style={dashboardStyles.metricValue}>${avgCPC.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Campaign Performance Comparison */}
      <div style={dashboardStyles.chartContainer}>
        <h5 style={dashboardStyles.chartTitle}>Campaign Performance Comparison</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={campaignComparisonData}>
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="clicks" name="Clicks" fill="#8884d8" />
            <Bar yAxisId="right" dataKey="spend" name="Spend ($)" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Two column layout for Pie and CTR charts */}
      <div style={dashboardStyles.twoColumnGrid}>
        {/* Spend Distribution */}
        <div style={dashboardStyles.chartContainer}>
          <h5 style={dashboardStyles.chartTitle}>Spend Distribution</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendDistributionData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {spendDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* CTR by Campaign */}
        <div style={dashboardStyles.chartContainer}>
          <h5 style={dashboardStyles.chartTitle}>CTR by Campaign</h5>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={campaignComparisonData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="ctr" name="CTR" stroke="#ff7300" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Ad Sets Table */}
      <div style={dashboardStyles.chartContainer}>
        <h2 style={dashboardStyles.chartTitle}>Ad Sets Performance</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid #ddd' }}>Ad Set</th>
                <th style={{ textAlign: 'right', padding: '10px', borderBottom: '2px solid #ddd' }}>Impressions</th>
                <th style={{ textAlign: 'right', padding: '10px', borderBottom: '2px solid #ddd' }}>Clicks</th>
                <th style={{ textAlign: 'right', padding: '10px', borderBottom: '2px solid #ddd' }}>Spend</th>
                <th style={{ textAlign: 'right', padding: '10px', borderBottom: '2px solid #ddd' }}>CTR</th>
                <th style={{ textAlign: 'right', padding: '10px', borderBottom: '2px solid #ddd' }}>CPC</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item._id}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{item.adset_name}</td>
                  <td style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>{item.metrics.impressions.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>{item.metrics.clicks.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>${item.metrics.spend.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>{(item.metrics.ctr * 100).toFixed(2)}%</td>
                  <td style={{ textAlign: 'right', padding: '10px', borderBottom: '1px solid #ddd' }}>${item.metrics.cpc.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}