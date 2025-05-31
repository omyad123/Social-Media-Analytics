import React from 'react';
import dayjs from 'dayjs';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      fontSize: '14px',
      lineHeight: '1.6',
    }}>
      <p style={{ margin: 0, fontWeight: 600, color: '#555' }}>
        📅 {dayjs(label).format('DD MMM YYYY')}
      </p>
      <hr style={{ margin: '8px 0' }} />
      {payload.map((entry, index) => (
        <div key={`item-${index}`} style={{ color: entry.color, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 500 }}>
            {entry.name.replace(/_/g, ' ')}
          </span>
          <span style={{ fontWeight: 600 }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomTooltip;
