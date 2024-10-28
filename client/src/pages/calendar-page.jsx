import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Calendar from './calendar.jsx';
import Footer from './footer.jsx';
import NavbarWithSidebar from './sidebar.jsx';
import Home from './home-content.jsx'

import Events from './events';

import '@fortawesome/fontawesome-free/css/all.min.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="NavbarWithSidebar-container">
        <Calendar />
        

      </div>
    </BrowserRouter>
  </StrictMode>
);
