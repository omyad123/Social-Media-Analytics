import React from 'react'
import Omnitrix from './HomePage/Omnitrix'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './HomePage/Login';
import Register from './HomePage/Register';

import FacebookDashboard from './Facebook/FacebookDashboard';
import InstaDashboard from './Instagram/InstaDashboard';
import FacebookCallbackHandler from './Facebook/FacebookCallbackHandler';
import FacebookIntegr from './Analytics/FacebookIntegr';
import InstagramIntegr from './Analytics/InstagramIntegr';
import InstagramCallback from './Instagram/InstagramCallback';
import LayoutPage from './Analytics/LayoutPage';


const App = () => {
  return (
    <>
      <div className="app-container">
        <Router>
          <Routes>
            <Route path="/" element={<Omnitrix />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Register" element={<Register />} />

            <Route path="/LayoutPage" element={<LayoutPage />}>
              <Route index element={<FacebookIntegr />} />
              <Route path="Instagram_Ingegration_Dashboard" element={<InstagramIntegr />} />
              <Route path="facebook_Dashboard" element={<FacebookDashboard />} />
              <Route path="Instagram_Dashboard" element={<InstaDashboard />} />
            </Route>

            <Route path="/auth/facebook/callback" element={<FacebookCallbackHandler />} />
            <Route path="/auth/instagram/callback" element={<InstagramCallback />} />
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App

