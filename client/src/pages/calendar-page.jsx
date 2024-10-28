import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Calendar from '/src/components/calendar/calendar.jsx';


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
