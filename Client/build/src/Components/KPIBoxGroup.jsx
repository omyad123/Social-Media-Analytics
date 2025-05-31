import React from 'react';
import KPIBox from './KPIBox';

const KPIBoxGroup = ({ title, metrics, data, colors }) => {

    //UTILITY 
    const getTotalForMetric = (data, metric) => {
        return data.reduce((sum, item) => sum + (item[metric] ?? 0), 0);
    };
    //   -------------------
    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', borderBottom: '2px solid #ccc', paddingBottom: '0.5rem' }}>
                {title}
            </h3>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                {(metrics || []).map((metric) => (
                    <KPIBox
                        key={metric}
                        label={metric.replace(/_/g, ' ')}
                        value={getTotalForMetric(data || [], metric)}
                        color={colors[metric] || '#999'}
                    />
                ))}
            </div>
        </div>
    );
};
export default KPIBoxGroup;
