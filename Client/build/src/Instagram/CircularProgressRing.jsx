import React from 'react';

const RING_WIDTH = 18;
const CENTER = 100;

const CircularProgressRing = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className="relative w-[220px] h-[220px]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
        <div className="svg-box"    style={{
          backgroundColor: "#03264D",
          borderRadius: "50%",
          boxShadow: "0 0 10px #020535e6",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",

        }}>
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
      >
        {/* Rings */}
        {data.map((item, index) => {
          const radius = CENTER - (index + 1) * (RING_WIDTH + 4);
          const circumference = 2 * Math.PI * radius;
          const dash = (item.value / total) * circumference;

          return (
            <circle
              key={index}
              cx={CENTER}
              cy={CENTER}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={RING_WIDTH}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset="0"
              strokeLinecap="butt"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          );
        })}

        {/* Percentage Labels (based on value) */}
        {data.map((item, index) => {
          const radius = CENTER - (index + 1) * (RING_WIDTH + 4);
          const angle = 45;
          const x = CENTER + radius * Math.cos((angle * Math.PI) / 180);
          const y = CENTER + radius * Math.sin((angle * Math.PI) / 180);
          const percentage = ((item.value / total) * 100).toFixed(0);

          return (
            <text
              key={index}
              x={x}
              y={y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="10"
              fill="white"
              fontWeight="bold"
            >
              {`${percentage}%`}
            </text>
          );
        })}
      </svg>
      </div>
      {/* Metric labels below */}
      <div className="d-flex p-4" style={{ width: "300px", gap: "10px", flexWrap: 'wrap', justifyContent: 'center' }}>
        {data.map((item, index) => (
          <div key={index} className="text-[12px] font-medium text-white">
            <span style={{ color: item.color }}>●</span> {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircularProgressRing;
