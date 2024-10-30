import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//import { BrowserRouter, Routes, Route } from 'react-router-dom';

import User from '../../routing/userPageRoutes.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <User />
    </StrictMode>
  );