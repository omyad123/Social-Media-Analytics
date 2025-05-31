import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(
  ArcElement,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const gaugeLabelPlugin = {
  id: "gaugeLabelPlugin",
  beforeDraw: (chart) => {
    const { width, height, ctx } = chart;
    const value = chart.config.data.datasets[0].data[0];
    const displayValue = value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value;

    ctx.save();
    ctx.font = "bold 22px sans-serif";
    ctx.fillStyle = "#1877F2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const x = width / 2;
    const y = height * 0.85; 

    ctx.fillText(displayValue, x, y);
    ctx.restore();
  },
};

const BrandAwareness = ({ insights }) => {
  const impressionsData = insights
    .filter((item) => item.metric === "page_impressions")
    .sort((a, b) => new Date(a.end_time) - new Date(b.end_time));

  const reachData = insights
    .filter((item) => item.metric === "page_impressions_unique")
    .sort((a, b) => new Date(a.end_time) - new Date(b.end_time));

  const totalImpressions = impressionsData.reduce((sum, item) => {
    return sum + Number(item.value || 0);
  }, 0);

  const maxGauge = totalImpressions < 100 ? 100 : totalImpressions * 1.5;

  const gaugeChartData = {
    datasets: [
      {
        data: [totalImpressions, maxGauge - totalImpressions],
        backgroundColor: ["#1877F2", "#e0e0e0"],
        cutout: "80%",
        borderWidth: 0,
      },
    ],
  };

  const gaugeOptions = {
    rotation: -90,
    circumference: 180,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
  };

  const lineChartData = {
    labels: reachData.map((item) => item.end_time.slice(0, 10)),
    datasets: [
      {
        label: "Reach",
        data: reachData.map((item) => item.value),
        fill: false,
        borderColor: "#00c49f",
        backgroundColor: "#00c49f",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "circle", 
          boxWidth: 10,
          color: "#4b4f56", 
          font: {
            size: 12,
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "grey", // axis tick color
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "grey",
          font: {
            size: 12,
          },
        },
      },
    },
  };
  
  

  return (
    <div className="container mt-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="" style={{color:"grey"}} >Brand Awareness</h5>
      </div>

      <div className="d-flex flex-wrap gap-4">
        <div
          style={{ flex: "1", minWidth: "280px",display: "flex",
                flexDirection: "column",
                alignItems: "center" ,border:"1px solid grey",boxShadow:"0 0px 10px #001027"}}
          className="p-3 rounded  text-center"
        >
          <div className="d-flex align-items-center justify-content-center mb-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Facebook_icon.svg"
              alt="Facebook"
              style={{ width: "24px", height: "24px", marginRight: "8px" }}
            />
            <h6 className=" m-0" style={{color:"gray"}}> Page Impressions</h6>
          </div>
          <div style={{ position: "relative", height: "180px" }}>
            <Doughnut
              data={gaugeChartData}
              options={gaugeOptions}
              plugins={[gaugeLabelPlugin]}
            />
          </div>
        </div>

        <div
          style={{ flex: "2", minWidth: "400px" ,border:"1px solid grey",boxShadow:"0 0px 10px #001027",background:"transparent"}}
          className="p-3 rounded"
        >
          <h6 className="mb-3" style={{color:"gray"}}>📘 Page Reach</h6>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default BrandAwareness;
