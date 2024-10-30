import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Footer from '../../components/footer/footer.jsx';
import NavbarWithSidebar from '../../components/sidebar/sidebar.jsx';
import Home from '../../components/homecontent/home-content.jsx'

import Events from '../../components/events-grid/events-grid.jsx';

import '@fortawesome/fontawesome-free/css/all.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="NavbarWithSidebar-container">
        <NavbarWithSidebar />
        <div className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <Home />
                  <Events />
                </>
              } 
            />
            <Route path="/events" element={<Events />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  </StrictMode>
);
