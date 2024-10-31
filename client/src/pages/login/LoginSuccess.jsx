import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get('token');

    if (token) {
      // Save token to localStorage
      localStorage.setItem('authToken', token);

      // Decode token to get user role
      const decoded = jwtDecode(token);
      const userRole = decoded.role;

      // Redirect based on role
      if (userRole === 'faculty_staff') {
        navigate('/home');
      } else if (userRole === 'general_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  return <div>Redirecting...</div>;
}

export default LoginSuccess;
