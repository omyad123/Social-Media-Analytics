import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Loader from '../Analytics/Loader';
import api from '../api';

const FacebookCallbackHandler = () =>{
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchInsights = async (token) => {
    try {
      const response = await api.get("/api/insight/fetch", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Fetched Insights Response for facebookkkk:", response.data);
      setLoading(false); 
      navigate("/LayoutPage/facebook_Dashboard");
    } catch (error) {
      console.error("Error fetching insights:", error);
      setLoading(false); 
    }
  };

  const getToken = async () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const token = localStorage.getItem("token");

    console.log("Code from URL:", code);
    console.log("Token from localStorage:", token);

    if (code && token) {
      console.log("yes sab ok hai------")
      try {
        const response = await api.post(
          "/api/facebook/exchange-code",
          { code, platform: state },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Exchange Response:", response);

        fetchInsights(token);
      } catch (error) {
        console.error("Error occurred during exchange:", error);
        setLoading(false); 
      }
    } else {
      console.error("No code or token available!");
      setLoading(false); 
    }
  };

  useEffect(() => {
    getToken();
  }, [navigate]);

  if (loading) {
    return <Loader/>;
  }

  return null;
};

export default FacebookCallbackHandler;
