import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Admin from '../../routing/adminPageRouting.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Admin />
    </StrictMode>
  );