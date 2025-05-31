import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InstaKpi from './InstaKpi';
import Navbar from '../Components/Navbar';
import DateFilter from '../Components/DateFilter';
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import ReplyIcon from "@mui/icons-material/Reply";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import GroupIcon from '@mui/icons-material/Group';
import CircularProgressRing from './CircularProgressRing';
import ReachVsViews from './ReachVsViews';
import PostList from './PostList';
import MeadiaDistribution from './MeadiaDistribution';
import api from '../api';
import InstaProfile from './InstaProfile';
import InstaDemographics from './InstaDemographics';
import IgAdsData from './IgAdsData';
import IgReports from './IgReports';


const metricInfo = {
  accounts_engaged: {
    title: "Accounts Engaged",
    icon: <PersonIcon color="primary" />
  },
  profile_views: {
    title: "Profile Views",
    icon: <VisibilityIcon color="primary" />
  },
  reach: {
    title: "Reach",
    icon: <TrendingUpIcon color="primary" />
  },
  views: {
    title: "Views",
    icon: <PlayCircleOutlineIcon color="primary" />
  },
  likes: {
    title: "Likes",
    icon: <ThumbUpAltIcon color="primary" />
  },
  comments: {
    title: "Comments",
    icon: <CommentIcon color="primary" />
  },
  shares: {
    title: "Shares",
    icon: <ShareIcon color="primary" />
  },
  replies: {
    title: "Replies",
    icon: <ReplyIcon color="primary" />
  },
  saves: {
    title: "Saves",
    icon: <BookmarkIcon color="primary" />
  },
  follower_count: {
    title: "Followers",
    icon: <GroupIcon color="primary" />
  },
};


const InstaAnalytics = () => {
  const [pageId, setPageId] = useState(null);
  const [insights, setInsights] = useState([]);
  const [filterInsights, setfilterInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topPost, setTopPost] = useState([])
  const [MediaDis, setMediaDis] = useState([])
  const [Demographics, setDemographics] = useState([])
  const [adData, setAdData] = useState([])

  const handlePageSelect = (pageId) => {
    setPageId(pageId);
    console.log("selected Page Id --", pageId);
  };


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
      const res = await api.get(`/api/insight/Ig/filter/Acc/growth?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInsights(res.data.data);
    } catch (err) {
      console.error("Error fetching growth insights", err);
    } finally {
      setLoading(false);
    }
    try {
      const res1 = await api.get(`/api/insight/Ig/filter/Acc/?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setfilterInsights(res1.data);
    } catch (err) {
      console.error("Error fetching Ig insights", err);
    } finally {
      setLoading(false);
    }
      try {
      await api.get(`/api/insight/ig/demographics`, { // only fetch demogrphics  and save to db
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error fetching demographics insights", err);
    } finally {
      setLoading(false);
    }
    try {
      const { pageId } = fullParams; 
      const demoQuery = new URLSearchParams({ pageId }).toString();
      const demoRes = await api.get(`/api/insight/ig/demographics/data/?${demoQuery}`, { // extract from demographics db
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDemographics(demoRes.data.data)
    } catch (err) {
      console.error("Error fetching demographics from db", err);
      setDemographics(null);
    } finally {
      setLoading(false);
    }
    try {
      await api.get(`/api/insight/ig/post`, { // only  fetch post and save to db
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error fetching post insights", err);
    } finally {
      setLoading(false);
    }
    try {
      const postRes = await api.get(`/api/insight/Ig/filter/post?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTopPost(postRes.data.posts);
    } catch (err) {
      console.error("Error fetching post insights from db", err);
    } finally {
      setLoading(false);
    }

    try {
      const mediaDis = await api.get(`/api/insight/Ig/filter/post/reach?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMediaDis(mediaDis.data);
    } catch (err) {
      console.error("Error fetching reach insights", err);
    } finally {
      setLoading(false);
    }
    try {
      await api.get(`/api/insight/ig/ads`, { // just fetch initial ad data
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Error fetching ads insights:", err);
    } finally {
      setLoading(false);
    }
    try {
      const response = await api.get(`/api/insight/ig/filter/ads?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdData(response.data);
    } catch (err) {
      console.error("Error retrive ads insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) {
      fetchInsights();
    }
  }, [pageId]);



  const colorMap = {
    likes: '#8884d8',
    comments: '#0088FE',
    shares: '#FFBB28',
    saves: '#00C49F',
  };


  // For circluar Progress bar

  const engagementMetrics = ['likes', 'comments', 'shares', "saves",];

  const engagementRingData = insights
    .filter(item => engagementMetrics.includes(item.metric))
    .map(item => ({
      label: metricInfo[item.metric]?.title || item.metric,
      value: item.current,
      color: colorMap[item.metric] || '#AAAAAA',
    }));

  const engagementRingSample = [
    {
      label: 'Likes',
      value: 556,
      color: '#8884d8',
    },
    {
      label: 'Comments',
      value: 500,
      color: '#0088FE',
    },
    {
      label: 'Shares',
      value: 600,
      color: '#FFBB28',
    },
    {
      label: 'Saves',
      value: 400,
      color: 'red',
    },
  ];

  const igDemographicsSample = [
    {
      "_id": "681de760f14688d459adc780",
      "createdAt": "2025-05-09T11:30:42.353Z",
      "updatedAt": "2025-05-09T12:56:03.330Z",
      "demographic_type": "age_gender",
      "ig_user_id": "17841441180855122",
      "metric": "follower_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "18-24_F": 10,
        "25-34_F": 25,
        "35-44_F": 4,
        "13-17_M": 4,
        "18-24_M": 125
      },
      "__v": 0
    },
    {
      "_id": "681de761f14688d459adc782",
      "createdAt": "2025-05-09T11:30:43.403Z",
      "updatedAt": "2025-05-09T12:56:04.451Z",
      "demographic_type": "city",
      "ig_user_id": "17841441180855122",
      "metric": "follower_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "Bansdih, Uttar Pradesh": 4,
        "Thane, Maharashtra": 7,
        "Chandigarh, Chandigarh": 4,
        "Faizabad, Uttar Pradesh": 4,
        "Varanasi, Uttar Pradesh": 6
      },
      "__v": 0
    },
    {
      "_id": "681de761f14688d459adc781",
      "createdAt": "2025-05-09T11:30:42.844Z",
      "updatedAt": "2025-05-09T12:56:03.896Z",
      "demographic_type": "country",
      "ig_user_id": "17841441180855122",
      "metric": "follower_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "NP": 1,
        "BD": 4,
        "FI": 1,
        "RU": 5,
        "TZ": 1
      },
      "__v": 0
    },
    {
      "_id": "681de762f14688d459adc783",
      "createdAt": "2025-05-09T11:30:44.353Z",
      "updatedAt": "2025-05-09T12:56:04.553Z",
      "demographic_type": "age_gender",
      "ig_user_id": "17841441180855122",
      "metric": "reach_audience_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "18-24_F": 20,
        "25-34_F": 35,
        "35-44_F": 15,
        "13-17_M": 10,
        "18-24_M": 150
      },
      "__v": 0
    },
    {
      "_id": "681de763f14688d459adc784",
      "createdAt": "2025-05-09T11:30:45.403Z",
      "updatedAt": "2025-05-09T12:56:05.451Z",
      "demographic_type": "city",
      "ig_user_id": "17841441180855122",
      "metric": "reach_audience_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "Bansdih, Uttar Pradesh": 6,
        "Thane, Maharashtra": 8,
        "Chandigarh, Chandigarh": 5,
        "Faizabad, Uttar Pradesh": 3,
        "Varanasi, Uttar Pradesh": 7
      },
      "__v": 0
    },
    {
      "_id": "681de764f14688d459adc785",
      "createdAt": "2025-05-09T11:30:46.844Z",
      "updatedAt": "2025-05-09T12:56:06.896Z",
      "demographic_type": "country",
      "ig_user_id": "17841441180855122",
      "metric": "reach_audience_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "NP": 2,
        "BD": 6,
        "FI": 2,
        "RU": 6,
        "TZ": 2
      },
      "__v": 0
    },
    {
      "_id": "681de765f14688d459adc786",
      "createdAt": "2025-05-09T11:30:47.353Z",
      "updatedAt": "2025-05-09T12:56:07.330Z",
      "demographic_type": "age_gender",
      "ig_user_id": "17841441180855122",
      "metric": "engaged_audience_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "18-24_F": 18,
        "25-34_F": 30,
        "35-44_F": 8,
        "13-17_M": 6,
        "18-24_M": 140
      },
      "__v": 0
    },
    {
      "_id": "681de766f14688d459adc787",
      "createdAt": "2025-05-09T11:30:48.403Z",
      "updatedAt": "2025-05-09T12:56:08.451Z",
      "demographic_type": "city",
      "ig_user_id": "17841441180855122",
      "metric": "engaged_audience_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "Bansdih, Uttar Pradesh": 8,
        "Thane, Maharashtra": 9,
        "Chandigarh, Chandigarh": 6,
        "Faizabad, Uttar Pradesh": 5,
        "Varanasi, Uttar Pradesh": 8
      },
      "__v": 0
    },
    {
      "_id": "681de767f14688d459adc788",
      "createdAt": "2025-05-09T11:30:49.844Z",
      "updatedAt": "2025-05-09T12:56:09.896Z",
      "demographic_type": "country",
      "ig_user_id": "17841441180855122",
      "metric": "engaged_audience_demographics",
      "period": "lifetime",
      "userId": "68107f478983ea4d9ad4fedb",
      "value": {
        "NP": 3,
        "BD": 8,
        "FI": 3,
        "RU": 7,
        "TZ": 3
      },
      "__v": 0
    }
  ]


  return (
    <div className="main-content ">
      <Navbar />
      <div className="date_filter sticky-top d-flex justify-content-between px-4 align-items-center" style={{ background: "rgb(3 38 77)", boxShadow: "0 0 10px #001027", width: "100%", padding: "0.5rem", maxHeight: "60px" }}>
        <DateFilter onFilter={fetchInsights} />
        <div className="search-bar-container d-flex align-items-center rounded px-3 py-1" style={{ background: "#112a4b", width: "300px" }}>
          <i className="bi bi-search text-white me-2"></i>
          <input type="text" className="form-control border-0 bg-transparent text-white" placeholder="Search..." style={{ boxShadow: "none" }} />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h5 className='mx-4 mt-4 my-2' style={{ color: "grey" }}>Page Overview</h5>
        <InstaProfile onPageSelect={handlePageSelect} />
      </div>
      <Box  >
        <div style={{ width: "100%", display: "flex", justifyContent: "space-around", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: "51%" }}>
            {loading ? (
              <CircularProgress />
            ) : (
              <Grid container spacing={3} >
                {insights.filter(item => !engagementMetrics.includes(item.metric)).map((item, idx) => {
                  const info = metricInfo[item.metric] || {
                    title: item.metric,
                    icon: <TrendingUpIcon />
                  };

                  return (
                    <Grid item xs={12} sm={6} md={4} key={idx} >
                      <InstaKpi
                        title={info.title}
                        value={item.current}
                        percent={item.growth}
                        icon={info.icon}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </div>
          {/* Circular Progress */}
          <div className='mt-4 text-center mb-4' style={{ border: "1px solid grey", boxShadow: "0 0px 10px #001027", height: "400px", borderRadius: "8px" }}>
            <h5 className='mt-4 mb-4' style={{ color: "gray" }}>Engagement Ratio</h5>
            <CircularProgressRing data={engagementRingData}></CircularProgressRing>
          </div>
        </div>
      </Box>
      <div style={{ display: "flex", gap: "30px", justifyContent: "center" }}>
        <MeadiaDistribution data={MediaDis} />
        <ReachVsViews compareData={filterInsights} />
      </div>
      <InstaDemographics InstaDemographics={Demographics} />
      <PostList posts={topPost} />
      <IgAdsData data={adsSample} />
      <div className='mt-4' style={{ marginLeft: "30px", marginBottom: "10px", marginRight: "30px", display: "flex", justifyContent: "space-around" }}>
        <IgReports data={insights} contentData={topPost} adsData={adsSample} type="csv" />
        <IgReports data={insights} contentData={topPost} adsData={adsSample} type="pdf" />
        <IgReports data={insights} contentData={topPost} adsData={adsSample} type="excel" />
      </div>
    </div>

  );
}
export default InstaAnalytics
