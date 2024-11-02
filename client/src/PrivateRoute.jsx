// PrivateRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    console.log(token);
    setIsAuthenticated(!!token);
    setIsChecking(false);  // Indicate that the check is complete
  }, []);  // Empty dependency array ensures this runs only on initial mount

  if (isChecking) {
    return <div>Loading...</div>;  // Show a loading state while checking
  }

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
