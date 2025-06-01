import React from 'react';
import { FaRss } from 'react-icons/fa6';
const InstagramIntegr = () => {

  const FACEBOOK_APP_ID = '1188008382709475';
  const INSTAGRAM_REDIRECT_URI = 'https://omnidash.live/auth/instagram/callback'; 

  // Function to login with Instagram (OAuth)
  const loginWithInstagram = () => {
    const instagramLoginUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=public_profile,instagram_basic,pages_show_list,ads_read,pages_read_engagement,instagram_manage_insights&response_type=code&state=instagram`;

    window.location.href = instagramLoginUrl;
  };

  return (
    <div className="flex min-h-screen" style={{display:"flex",width:"100%",background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",height:"100vh" }}>
      {/* Main Dashboard */}
      <div className="ml-64 flex-1 p-10 p-4" style={{width:"70%",marginLeft:"100px",marginTop:"100px"}}>
        <div className="max-w-5xl mx-auto rounded-xl shadow-md p-10" style={{boxShadow:"0 0 10px black",borderRadius:"10px",padding:"50px"}} >
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Connect your Instagram and extract all the analytics
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Extract the analytics related to your Page and improve your strategy based on the data.
          </p>

        <button onClick={loginWithInstagram}  className="p-4 mb-4 text-white font-medium px-6 py-3 rounded-md flex items-center gap-2 transition duration-200" style={{background:"transparent",border:"none", paddingLeft:"3px"}}>
            <FaRss className="text-lg" />
         <span style={{padding:"10px",boxShadow:"0 0 10px black",borderRadius:"10px",background:"blue",marginLeft:"3px"}}>Connect Your Instagram Page</span>
          </button>

          <div className="mt-10" style={{boxShadow:"0 0 10px white",borderRadius:"8px",width:"300px"}}>
            <img
              src="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Google-Analytics-4-Blog-Post-Header-2096x1182.width-1300_O3uqryV.jpg" style={{width:"300px"}}
              alt="Analytics"
              className="w-full max-w-3xl rounded-lg shadow-lg border"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramIntegr;
