import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn,
  FaPinterestP, FaTiktok, FaYoutube, FaRss
} from 'react-icons/fa6';
import { BsThreads, BsGoogle } from 'react-icons/bs';
import { PiButterflyBold } from 'react-icons/pi';
import { border, borderRadius, padding } from '@mui/system';


const platforms = [
  { name: 'Web', icon: <FaRss />, route: '/LayoutPage/dashboard/web' },
  { name: 'Facebook', icon: <FaFacebookF />, route: '/LayoutPage' },
  { name: 'Instagram', icon: <FaInstagram />, route: '/LayoutPage/Instagram_Ingegration_Dashboard' }, 
  { name: 'Threads', icon: <BsThreads />, route: '/LayoutPage/dashboard/threads' },
  { name: 'Twitter', icon: <FaXTwitter />, route: '/LayoutPage/dashboard/twitter' },
  { name: 'Bluesky', icon: <PiButterflyBold />, route: '/LayoutPage/dashboard/bluesky' },
  { name: 'LinkedIn', icon: <FaLinkedinIn />, route: '/LayoutPage/dashboard/linkedin' },
  { name: 'Pinterest', icon: <FaPinterestP />, route: '/LayoutPage/dashboard/pinterest' },
  { name: 'TikTok', icon: <FaTiktok />, route: '/LayoutPage/dashboard/tiktok' },
  { name: 'Google Business', icon: <BsGoogle />, route: '/LayoutPage/dashboard/google' },
  { name: 'YouTube', icon: <FaYoutube />, route: '/LayoutPage/dashboard/youtube' },
];

const sidebarStyle = {
  background: 'linear-gradient(to bottom, #ffffff, #f5f7fa)',
  height: '100vh',
  width: '260px',
  padding: '24px',
  boxShadow: '2px 0 6px rgba(0,0,0,0.08)',
  borderRight: '1px solid #e2e8f0',
  overflowY: 'auto',
};

const headerStyle = {
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign:"center",
  borderRadius:"8px",
  boxShadow:"0 0 8px red",
  padding:"5px",
  backgroundColor:"blue",
  marginBottom: '24px',
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 14px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  color: '#4b5563',
  transition: 'all 0.2s ease-in-out',
};

const activeLinkStyle = {
  backgroundColor: '#e0f2fe',
  color: '#2563eb',
  fontWeight: '600',
  boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)',
};

const AnalyticsSidebar = () => {
  const location = useLocation();

  return (
    <aside style={sidebarStyle}>
      <h2 style={headerStyle} className='text-center'>Platform Summary</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {platforms.map((platform) => {
          const isActive = location.pathname === platform.route;
          const combinedStyle = {
            ...linkStyle,
            ...(isActive ? activeLinkStyle : {}),
          };

          return (
            <li key={platform.name} style={{ marginBottom: '10px' }}>
              <Link to={platform.route} style={combinedStyle}>
                <span style={{ fontSize: '18px' }}>{platform.icon}</span>
                <span>{platform.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default AnalyticsSidebar;
