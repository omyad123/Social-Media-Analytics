import { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const styles = {
  container: {
    fontFamily: 'Inter, system-ui, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    color: '#333',
  },
  head_p: {
    color: 'rgb(15 15 15)',
    marginBottom: '24px',
    background: 'azure',
    padding: '6px',
    border: '1px solid grey',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '24px',
  },
  header: {
    marginBottom: '24px',
  },
  drop_div: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  subtitle: {
    fontSize: '16px',
    color: '#fd0e0ebd',
    marginBottom: '24px',
  },
  dropdownWrapper: {
    position: 'relative',
    width: '250px',
    marginBottom: '24px',
  },
  dropdown: {
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    width: '100%',
    padding: '10px 40px 10px 16px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    fontSize: '15px',
    fontWeight: 500,
    color: '#1c1c1c',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'border 0.2s ease',
  },
  dropdownIcon: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    fontSize: '12px',
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    marginTop: '32px',
    color: '#374151',
  },
  flexContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    justifyContent: 'space-between',
    marginBottom: '36px',
  },
  chartBox: {
    flex: '1',
    minWidth: '300px',
    padding: '20px',
    borderRadius:"8px",
    border:"1px solid grey",
    boxShadow:"0 0px 10px #001027",
    color:"#ffffff96"
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
    color: '#4b5563',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#4b5563',
    borderBottom: '1px solid #e5e7eb',
  },
  tableCell: {
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    height: '8px',
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: '0',
    top: '0',
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '4px',
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '16px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '12px',
    fontSize: '14px',
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    marginRight: '6px',
  },
  noData: {
    textAlign: 'center',
    padding: '40px 0',
    color: '#6b7280',
    fontStyle: 'italic',
  },
};

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FF8042', '#FFBB28', '#9C27B0', '#FF6384', '#36A2EB'];
const GENDER_COLORS = {
  M: '#36A2EB',
  F: '#FF6384',
  Unknown: '#FFBB28',
};

export default function InstaDemographics({ InstaDemographics }) {
  const [selectedMetric, setSelectedMetric] = useState('follower_demographics');
  const [processedData, setProcessedData] = useState({
    genderData: [],
    ageGenderData: [],
    cityData: [],
    countryData: [],
  });

  // Process the data whenever the selected metric changes
  useEffect(() => {
    if (!InstaDemographics || !Array.isArray(InstaDemographics) || InstaDemographics.length === 0) {
      console.warn("No demographics data available");
      return;
    }

    const filteredData = InstaDemographics.filter(item => item.metric === selectedMetric);

    // Process age_gender data
    const ageGenderData = filteredData.find(item => item.demographic_type === 'age_gender')?.value || {};

    // Extract gender totals and calculate percentages
    let maleTotal = 0;
    let femaleTotal = 0;
    let unknownTotal = 0;

    // Process age_gender data for bar chart
    const ageGroups = {};
    const ageGenderChartData = [];

    Object.entries(ageGenderData).forEach(([key, value]) => {
      const [ageRange, gender] = key.split('_');

      if (gender === 'M') {
        maleTotal += value;
      } else if (gender === 'F') {
        femaleTotal += value;
      } else {
        unknownTotal += value;
      }

      // Group by age for the bar chart
      if (!ageGroups[ageRange]) {
        ageGroups[ageRange] = { ageRange, M: 0, F: 0, Unknown: 0 };
      }
      ageGroups[ageRange][gender] = value;
    });

    Object.values(ageGroups).forEach(group => {
      ageGenderChartData.push(group);
    });

    // Sort age groups
    ageGenderChartData.sort((a, b) => {
      const aAge = parseInt(a.ageRange.split('-')[0]);
      const bAge = parseInt(b.ageRange.split('-')[0]);
      return aAge - bAge;
    });

    // Create gender data for pie chart
    const genderData = [
      { name: 'Male', value: maleTotal },
      { name: 'Female', value: femaleTotal }
    ];

    if (unknownTotal > 0) {
      genderData.push({ name: 'Unknown', value: unknownTotal });
    }

    const cityData = filteredData.find(item => item.demographic_type === 'city')?.value || {};
    const cityChartData = Object.entries(cityData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 cities

    // Calculate total for percentages
    const cityTotal = cityChartData.reduce((sum, item) => sum + item.value, 0);
    cityChartData.forEach(item => {
      item.percentage = (item.value / cityTotal * 100).toFixed(1);
    });

    // Process country data
    const countryData = filteredData.find(item => item.demographic_type === 'country')?.value || {};
    const countryChartData = Object.entries(countryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 countries

    // Calculate total for percentages
    const countryTotal = countryChartData.reduce((sum, item) => sum + item.value, 0);
    countryChartData.forEach(item => {
      item.percentage = (item.value / countryTotal * 100).toFixed(1);
    });

    setProcessedData({
      genderData,
      ageGenderData: ageGenderChartData,
      cityData: cityChartData,
      countryData: countryChartData,
    });

  }, [selectedMetric, InstaDemographics]);

  // Helper to get readable metric name for display
  // const getMetricDisplayName = (metric) => {
  //   switch(metric) {
  //     case 'follower_demographics':
  //       return 'Follower Demographics';
  //     case 'reach_audience_demographics':
  //       return 'Reach Audience Demographics';
  //     case 'engaged_audience_demographics':
  //       return 'Engaged Audience Demographics';
  //     default:
  //       return metric;
  //   }
  // };

  // Country code to name mapping (simplified)
  const countryCodeToName = {
    'NP': 'Nepal',
    'BD': 'Bangladesh',
    'FI': 'Finland',
    'RU': 'Russia',
    'TZ': 'Tanzania',
    'US': 'United States',
    'IN': 'India',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'BR': 'Brazil',
    'JP': 'Japan',
    'CN': 'China',
  };

  // Format country names for display
  const formatCountryName = (code) => {
    return countryCodeToName[code] || code;
  };

  // Check if we have data to display
  const hasData = InstaDemographics && Array.isArray(InstaDemographics) && InstaDemographics.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.drop_div}>
        <div style={styles.dropdownWrapper}>
          <select
            style={styles.dropdown}
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            disabled={!hasData}
          >
            <option value="follower_demographics">Follower Demographics</option>
            <option value="reach_audience_demographics">Reach Audience</option>
            <option value="engaged_audience_demographics">Engaged Audience</option>
          </select>
          <span style={styles.dropdownIcon}>▼</span>
        </div>
        <p style={styles.head_p}>
          Explore your audience demographics across different metrics
        </p>
      </div>

      {!hasData ? (
        <div style={styles.noData}>
          No demographic data available for this Page.
        </div>
      ) : (
        <>
          <div style={styles.flexContainer}>
            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>Gender Distribution</h3>
              {processedData.genderData.filter(d => d.value > 0).length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={processedData.genderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {processedData.genderData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.name === 'Male' ? GENDER_COLORS.M :
                              entry.name === 'Female' ? GENDER_COLORS.F :
                                GENDER_COLORS.Unknown}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={styles.legendContainer}>
                    {processedData.genderData.map((entry, index) => (
                      <div key={`legend-${index}`} style={styles.legendItem}>
                        <div
                          style={{
                            ...styles.legendColor,
                            backgroundColor: entry.name === 'Male' ? GENDER_COLORS.M :
                              entry.name === 'Female' ? GENDER_COLORS.F :
                                GENDER_COLORS.Unknown
                          }}
                        />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={styles.noData}>No gender data available</div>
              )}
            </div>

            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>Age Distribution by Gender</h3>
              {processedData.ageGenderData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={processedData.ageGenderData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis dataKey="ageRange" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="M" name="Male" stackId="a" fill={GENDER_COLORS.M} />
                    <Bar dataKey="F" name="Female" stackId="a" fill={GENDER_COLORS.F} />
                    {processedData.ageGenderData.some(d => d.Unknown > 0) && (
                      <Bar dataKey="Unknown" stackId="a" fill={GENDER_COLORS.Unknown} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={styles.noData}>No age-gender data available</div>
              )}
            </div>
          </div>

          <h2 style={styles.sectionTitle}>Geographic Distribution</h2>
          <div style={styles.flexContainer}>
            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>Top 5 Cities</h3>
              {processedData.cityData.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>City</th>
                      <th style={styles.tableHeader}>Count</th>
                      <th style={styles.tableHeader}>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.cityData.map((city, index) => (
                      <tr key={`city-${index}`}>
                        <td style={styles.tableCell}>{city.name}</td>
                        <td style={styles.tableCell}>{city.value}</td>
                        <td style={styles.tableCell}>
                          <div style={styles.progressBarContainer}>
                            <div
                              style={{
                                ...styles.progressBar,
                                width: `${city.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '12px', marginTop: '4px' }}>
                            {city.percentage}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.noData}>No city data available</div>
              )}
            </div>

            <div style={styles.chartBox}>
              <h3 style={styles.chartTitle}>Top 5 Countries</h3>
              {processedData.countryData.length > 0 ? (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Country</th>
                      <th style={styles.tableHeader}>Count</th>
                      <th style={styles.tableHeader}>Distribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedData.countryData.map((country, index) => (
                      <tr key={`country-${index}`}>
                        <td style={styles.tableCell}>{formatCountryName(country.name)}</td>
                        <td style={styles.tableCell}>{country.value}</td>
                        <td style={styles.tableCell}>
                          <div style={styles.progressBarContainer}>
                            <div
                              style={{
                                ...styles.progressBar,
                                width: `${country.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '12px', marginTop: '4px' }}>
                            {country.percentage}%
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={styles.noData}>No country data available</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}