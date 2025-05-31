import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Colors
const COLORS = ["#9C27B0", "#E91E63"];

const Demographics = ({ insights }) => {
  // 1. Extract Gender Data
  const genderMetric = insights?.find(insight => insight.metric === "page_fans_gender_age");
  const genderValue = genderMetric?.value || {};

  let maleCount = 0;
  let femaleCount = 0;
  const ageMap = {};

  for (const key in genderValue) {
    const [gender, age] = key.split(".");
    if (gender === "M") {
      maleCount += genderValue[key];
    } else if (gender === "F") {
      femaleCount += genderValue[key];
    }

    if (!ageMap[age]) {
      ageMap[age] = { ageGroup: age, Women: 0, Men: 0 };
    }

    if (gender === "M") ageMap[age].Men += genderValue[key];
    if (gender === "F") ageMap[age].Women += genderValue[key];
  }

  const totalGender = maleCount + femaleCount;
  const genderData = totalGender > 0
    ? [
        { name: "Men", value: parseFloat(((maleCount / totalGender) * 100).toFixed(1)) },
        { name: "Women", value: parseFloat(((femaleCount / totalGender) * 100).toFixed(1)) },
      ]
    : [];

  const ageGenderData = Object.values(ageMap).sort((a, b) =>
    parseInt(a.ageGroup.split("-")[0]) - parseInt(b.ageGroup.split("-")[0])
  );

  // 2. Extract Top Cities
  const cityMetric = insights?.find(insight => insight.metric === "page_fans_city");
  const cityValue = cityMetric?.value || {};

  const cityTotal = Object.values(cityValue).reduce((sum, val) => sum + val, 0);
  const topCities = cityTotal > 0
    ? Object.entries(cityValue)
        .map(([city, count]) => ({
          city,
          percent: parseFloat(((count / cityTotal) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 5)
    : [];

  // Placeholder Chart Component
  const PlaceholderChart = ({ width, height }) => (
    <div style={{ width, height, backgroundColor: "#f0f0f0", display: "flex", justifyContent: "center", alignItems: "center", color: "gray", fontSize: "16px" }}>
      <span>No Data Available</span>
    </div>
  );

  return (
    <div className="card p-4 mb-4 mt-4" style={{ borderRadius: '8px', border: "1px solid grey", boxShadow: "0 0px 10px #001027", color: "white", background: "transparent" }}>
      <h5 className="h4 mb-4 text-center" style={{ color: "gray" }}>Age & Gender</h5>

      <div className="age_gender" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap", gap: "2rem" }}>
        {/* Gender Donut Chart */}
        <div className="d-flex flex-column align-items-center mb-5" style={{ width: "30%" }}>
          <div style={{ width: 200, height: 200 }}>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <PlaceholderChart width="100%" height="100%" />
            )}
          </div>

          {/* Legend */}
          {genderData.length > 0 && (
            <div className="d-flex gap-4 mt-3">
              {genderData.map((item, index) => (
                <div key={index} className="d-flex align-items-center gap-2" style={{ fontSize: '14px' }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: COLORS[index],
                      marginRight: "8px",
                    }}
                  ></div>
                  <span>{item.name} {item.value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Age Bar Chart */}
        <div style={{ width: '60%', height: 300 }}>
          {ageGenderData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGenderData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="ageGroup" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Women" fill="#9C27B0" />
                <Bar dataKey="Men" fill="#E91E63" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <PlaceholderChart width="100%" height="100%" />
          )}
        </div>
      </div>

      {/* Top Cities */}
      <h6 className="h5 mb-3" style={{ color: "grey" }}>Top Cities</h6>
      <div className="d-flex flex-column gap-3">
        {topCities.length > 0 ? topCities.map((city, index) => (
          <div key={index}>
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '14px' }}>
              <span>{city.city}</span>
              <span>{city.percent}%</span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-info"
                role="progressbar"
                style={{ width: `${city.percent}%` }}
              ></div>
            </div>
          </div>
        )) : (
          <p className="text-center" style={{ color: "gray" }}>No city data available for this page.</p>
        )}
      </div>
    </div>
  );
};

export default Demographics;
