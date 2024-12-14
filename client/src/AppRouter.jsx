import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/loginPage/Login';
import LoginSuccess from './pages/loginPage/LoginSuccess';
import Admin from './routing/adminPageRouting.jsx'; 
import User from './routing/userPageRoutes.jsx';
import PrivateRoute from './PrivateRoute';
import ChangePassword from './pages/setPassword/setPassword';

const RootRedirector = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          if (decoded.role === 'admin' || decoded.role === 'departmental_admin') {
            navigate('/a');
          } else if (decoded.role === 'faculty_staff') {
            navigate('/u');
          } else {
            console.error('Unknown user role:', decoded.role);
            navigate('/login');
          }
        } else {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    } catch (e) {
      console.warn('Storage error or invalid token:', e);
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      navigate('/login');
    }
  }, [navigate]);

  return null;
};

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter> 
          <Routes>
            <Route path="/" element={<RootRedirector />} />
            <Route path="/login" element={<GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}> <Login /></GoogleReCaptchaProvider>}> </Route>
            <Route path="/login/success" element={<LoginSuccess />}> </Route>
            <Route
              path="/a/*"
              element={
                <PrivateRoute allowedRoles={['admin', 'departmental_admin']}>
                  <Admin /> 
                </PrivateRoute>
              }
            />
            <Route
              path="/u/*"
              element={
                <PrivateRoute allowedRoles={['faculty_staff']}>
                  <User /> 
                </PrivateRoute>
              }
            />
            <Route path="/set-password" element={<ChangePassword />} />
          </Routes>
        </BrowserRouter>
    </StrictMode>
);
