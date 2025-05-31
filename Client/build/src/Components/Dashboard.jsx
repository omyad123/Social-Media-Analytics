
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import DateFilter from './DateFilter';
import KPIBox from './KPIBox';
import ContentPerformance from './ContentPerformance';
import DownloadReport from './DownloadReport';
import Navbar from './Navbar';
import CustomTooltip from './CustomTooltip'; 
import FansBar from '../Facebook/FansBar';
import Demographics from '../Facebook/Demographics';
import EngagementOverview from '../Facebook/EngagementOverview';
import BrandAwareness from '../Facebook/BrandAwareness';
import api from '../api';
import FbProfile from '../Facebook/FbProfile';
import AdsData from '../Facebook/AdsData';


const Dashboard = () => {
 const [pageId, setPageId] = useState(null);
  const [insights, setInsights] = useState([]);
  const [actualInsights, setActualInsights] = useState([]);
  const [visibleMetrics, setVisibleMetrics] = useState([]);
  const [ContentData, setContentData] = useState([]);
  const [adData, setAdData] = useState([]);

    const handlePageSelect = (pageId) => {
    setPageId(pageId);
    console.log("selected Page Id --",pageId);
  };


  const DemographicsSample = [
    {
      metric: "page_fans_gender_age",
      value: {
        "M.18-24": 150,
        "M.25-34": 300,
        "M.35-44": 200,
        "F.18-24": 120,
        "F.25-34": 220,
        "F.35-44": 180,
      }
    },
    {
      metric: "page_fans_city",
      value: {
        "New York": 500,
        "Los Angeles": 350,
        "Chicago": 250,
        "Houston": 200,
        "Phoenix": 150,
         "Chicago": 250,
        "Houston": 200,
        "Uttar Pradesh": 950,
      }
    }
  ];
  

  const adsSample = [
  {
    "_id": "60d74f017e2f8d3f1c92f4c8",
    "userId": "60d74f017e2f8d3f1c92f4c7",
    "ad_account_id": "act_123456789",
    "ad_id": "12345",
    "adset_id": "67890",
    "adset_name": "Ad Set 1",
    "campaign_id": "112233",
    "campaign_name": "Campaign A",
    "metrics": {
      "impressions": 1000,
      "reach": 800,
      "clicks": 50,
      "spend": 150,
      "ctr": 0.05,
      "cpc": 3,
      "cpm": 15
    },
    "date_start": "2025-05-06",
    "date_stop": "2025-05-12",
    "createdAt": "2025-05-13T10:00:00.000Z",
    "updatedAt": "2025-05-13T10:00:00.000Z"
  },
  {
    "_id": "60d74f017e2f8d3f1c92f4c9",
    "userId": "60d74f017e2f8d3f1c92f4c7",
    "ad_account_id": "act_123456789",
    "ad_id": "12346",
    "adset_id": "67891",
    "adset_name": "Ad Set 2",
    "campaign_id": "112234",
    "campaign_name": "Campaign B",
    "metrics": {
      "impressions": 2000,
      "reach": 1500,
      "clicks": 120,
      "spend": 250,
      "ctr": 0.06,
      "cpc": 2.08,
      "cpm": 12.5
    },
    "date_start": "2025-05-06",
    "date_stop": "2025-05-12",
    "createdAt": "2025-05-13T10:10:00.000Z",
    "updatedAt": "2025-05-13T10:10:00.000Z"
  },
  {
    "_id": "60d74f017e2f8d3f1c92f4ca",
    "userId": "60d74f017e2f8d3f1c92f4c7",
    "ad_account_id": "act_123456789",
    "ad_id": "12347",
    "adset_id": "67892",
    "adset_name": "Ad Set 3",
    "campaign_id": "112235",
    "campaign_name": "Campaign C",
    "metrics": {
      "impressions": 1500,
      "reach": 1300,
      "clicks": 80,
      "spend": 180,
      "ctr": 0.053,
      "cpc": 2.25,
      "cpm": 13.2
    },
    "date_start": "2025-05-06",
    "date_stop": "2025-05-12",
    "createdAt": "2025-05-13T10:20:00.000Z",
    "updatedAt": "2025-05-13T10:20:00.000Z"
  }
]

  const selectedMetrics = [
    "page_fans",  // total page likes                                                       
    "page_impressions_unique",  //reach          
    "page_impressions",
    "page_views_total",//total views
    "page_daily_follows",
  ];

  const metricColors = {
    page_fan_adds: "pink",
    page_fan_removes: "#ff0000",
    page_daily_follows: "#82ca9d",
    page_impressions: "#ffc658",
    page_post_engagements: "#32a852",
    page_impressions_unique: "#8a2be2",
    page_video_views: "#00bcd4",
    page_views_total: "#ff9800",
    page_actions_post_reactions_total: "#607d8b",
  };

  const token = localStorage.getItem("token");

  const buildParamsWithPageId = (params) => {
  return {
    ...params,
    pageId, 
  };
};

   const fetchInsights = async (params = { type: 'last7days' }) => {
   const fullParams = buildParamsWithPageId(params);
   const query = new URLSearchParams(fullParams).toString();
    try {
      const res = await api.get(`/api/insight/filter?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setActualInsights(res.data);
      const transformed = {};
      (res.data).forEach(({ end_time, metric, value }) => {
        if (!selectedMetrics.includes(metric)) return;
        if (!transformed[end_time]) transformed[end_time] = {end_time};
        let finalValue = 0;
        if (typeof value === "number"){
          finalValue = value;
        } else if (typeof value === "object" && value !== null) {
          finalValue = Object.values(value).reduce((sum, v) => sum + (typeof v === "number" ? v : 0), 0);
        }
        transformed[end_time][metric] = finalValue;
      });

      const finalData = Object.values(transformed);
      setInsights(finalData);
      setVisibleMetrics(selectedMetrics);
    } catch (err) {
      console.error("Error fetching insights:", err);
    }

     try{
       await api.get(`/api/insight/content`, { // just fetch initial post data
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }catch (err) {
      console.error("Error fetching post insights:", err);
    }

    try{
      const response = await api.get(`/api/insight/filter/topPost?${query}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setContentData(response.data);
    }catch (err) {
      console.error("Error fetching Post insights:", err);
    }
    
     try{
       await api.get(`/api/insight/ads`, { // just fetch initial ad data
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }catch (err) {
      console.error("Error fetching ads insights:", err);
    }
     try{
      const response = await api.get(`/api/insight/ads/filter?${query}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdData(response.data);
    }catch (err) {
      console.error("Error retrive ads insights:", err);
    }
  };

useEffect(() => {
  if (pageId) {
    fetchInsights(); 
    }
}, [pageId]);

  const toggleMetric = (metric) => {
    setVisibleMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const getTotalForMetric = (metric) =>
    insights.reduce((sum, item) => sum + (item[metric] ?? 0), 0);

  return (
    <div className="main-content">
      <Navbar />
      <div className="date_filter sticky-top d-flex justify-content-between px-4 align-items-center" style={{ background: "rgb(3 38 77)", boxShadow: "0 0 10px #001027", width: "100%", padding: "0.5rem", maxHeight: "60px" }}>
        <DateFilter onFilter={fetchInsights}/>
        <div className="search-bar-container d-flex align-items-center rounded px-3 py-1" style={{ background: "#112a4b", width: "300px" }}>
          <i className="bi bi-search text-white me-2"></i>
          <input type="text" className="form-control border-0 bg-transparent text-white" placeholder="Search..." style={{ boxShadow: "none" }} />
        </div>
      </div>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <h5 className='mx-4 mt-4 my-2' style={{color:"grey"}}>Page Overview</h5>
      <FbProfile  onPageSelect={handlePageSelect}/>
  </div>

      <div style={{ padding: '1rem' }}>
        {/* KPI Toggle Boxes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
          {selectedMetrics.map(metric => (
            <div
              key={metric}
              onClick={() => toggleMetric(metric)}
              style={{ cursor: "pointer", opacity: visibleMetrics.includes(metric) ? 1 : 0.3 }}
            >
              <KPIBox
                label={metric.replace(/_/g, ' ')}
                value={getTotalForMetric(metric)}
                color={metricColors[metric] || '#999'}
              />
            </div>
          ))}
        </div>

        {/* Line Chart */}
        <div style={{
  backgroundColor: "transparent",
  padding: "1.5rem",
  borderRadius: "8px",
  border:"1px solid grey",boxShadow:"0 0px 10px #001027",
  marginBottom: "2rem",
  margin:"5px"
}}>
        <ResponsiveContainer width="100%" height={400}>
  <LineChart
    data={insights}
    margin={{ top: 30, right: 30, left: 30, bottom: 30 }}
  >
    {/* <CartesianGrid stroke="#ccc" /> */} {/* Remove background lines */}
    <XAxis
      dataKey="end_time"
      tickFormatter={(v) => dayjs(v).format("DD-MM-YYYY")}
      label={{  position: 'insideBottomRight', offset: -5 }}
    />
    <YAxis
      label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
      domain={[0, 'auto']}
    />
    <Tooltip content={<CustomTooltip />} />
    <Legend />
    {visibleMetrics.map(metric => (
      <Line
        key={metric}
        type="monotone"
        dataKey={metric}
        stroke={metricColors[metric] || 'teal'}
        strokeWidth={2}
        dot={{ r: 4 }}
        activeDot={{ r: 5 }}
        name={metric.replace(/_/g, ' ')}
      />
    ))}
  </LineChart>
</ResponsiveContainer>
</div>

<BrandAwareness insights={actualInsights} />

 <div className='mt-4' style={{display:"flex",gap:"20px",justifyContent:"center",alignItems:"center"}}> 
 <FansBar data = {actualInsights}/>
 <EngagementOverview data={actualInsights}/>
 </div>
 <Demographics insights={DemographicsSample}/>

 {/*  Content Performance  */}
 <ContentPerformance posts={ContentData.posts}></ContentPerformance>
 <AdsData data ={adsSample}/>

 <div className='mt-4' style={{marginLeft:"30px",marginBottom:"10px",marginRight:"30px",display:"flex",justifyContent:"space-around"}}>
        <DownloadReport data={insights} contentData={ContentData} type="csv" />
        <DownloadReport data={insights} contentData={ContentData} type="pdf" />
        <DownloadReport data={insights} contentData={ContentData} type="excel"/>
    </div>
      </div>
    </div>
  );
};

export default Dashboard;

