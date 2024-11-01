import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Login from './pages/login/Login';
import LoginSuccess from './pages/login/LoginSuccess';
import Admin from './routing/adminPageRouting.jsx'; 
import User from './routing/userPageRoutes.jsx';
import PrivateRoute from './PrivateRoute';

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter> 
          <Routes>
            <Route path="/" element={<GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}> <Login /></GoogleReCaptchaProvider>}> </Route>
            <Route path="/login/success" element={<LoginSuccess />}> </Route>
            <Route
              path="/a/*"
              element={
                <PrivateRoute>
                  <Admin /> 
                </PrivateRoute>
              }
            />
            <Route
              path="/u/*"
              element={
                <PrivateRoute>
                  <User /> 
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
    </StrictMode>
);
