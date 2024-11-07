// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from '../pages/adminpages/eventM'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import Login from './login.jsx';
import LoginSuccess from './loginSuccess.jsx';
import Footer from '../components/footer/footer.jsx';
import NavbarWithSidebar from '../components/sidebar/sidebar.jsx';
import HomeContent from '../components/homecontent/homeContent.jsx';
import Events from '../components/eventsGrid/eventsGrid.jsx';
import Calendar from '../components/calendar/calendar.jsx';

import '@fortawesome/fontawesome-free/css/all.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
        <div className="NavbarWithSidebar-container">
          <NavbarWithSidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login/success" element={<LoginSuccess />} />
              <Route path="/home" element={<HomeContent />} />
              <Route path="/events" element={<Events />} />
              <Route path="/calendar" element={<Calendar />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </GoogleReCaptchaProvider>
    </BrowserRouter>
  </StrictMode>
);
