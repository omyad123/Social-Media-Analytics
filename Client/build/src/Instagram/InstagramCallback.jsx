import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../Analytics/Loader';
import api from '../api';


const InstagramCallback = () => {
  const navigate = useNavigate();
   const [loading, setLoading] = useState(true);
 
   

  const fetchInsights = async(token) => {
    if(!token)
      return console.log("user Token not found");
   try {
    console.log("API Base URL in callback file before fething api:", import.meta.env.VITE_API_BASE_URL);
    const response = await api.get("/api/insight/Ig/fetch", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Fetched Insights Response for insta", response.data);
    console.log("API Base URL in callback file after fething api:", import.meta.env.VITE_API_BASE_URL);
    setLoading(false); 
    navigate("/LayoutPage/Instagram_Dashboard");
  } catch (error) {
    console.error("Error fetching insights:", error);
    setLoading(false); 
  }
  };

  const getInstagramToken = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const token = localStorage.getItem("token");
    console.log("Code from URL:", code);
    console.log("Token from localStorage:", token);

    if (code && token) {
      try {
        console.log("API Base URL in callback file before exchange code:", import.meta.env.VITE_API_BASE_URL);
        console.log("user jwt token",token)
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
        console.error("Failed to exchange code for Instagram token:", error);
        setLoading(false); 
      }
    } else {
      console.error("Missing code or token");
      setLoading(false); 
    }
  };

  useEffect(() => {
    getInstagramToken();
  }, [navigate]);

   if (loading) {
      return <Loader/>;
    }

  return null; 
};

export default InstagramCallback;
