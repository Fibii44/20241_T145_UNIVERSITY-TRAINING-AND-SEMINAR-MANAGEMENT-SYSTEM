// PrivateRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children, allowedRoles }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (token) {
      try {
        const decoded = jwtDecode(token); // Decode the JWT token
        const userRole = decoded.role;   // Extract the user's role
        console.log(`User Role: ${userRole}`);

        // Check if the user's role is allowed
        if (allowedRoles.includes(userRole)) {
          setIsAuthenticated(true);
          setHasAccess(true);
        } else {
          setIsAuthenticated(true);
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsChecking(false);  // Indicate that the check is complete
  }, [allowedRoles]);

  if (isChecking) {
    return <div>Loading...</div>;  // Show a loading state while checking
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (!hasAccess) {
    return <Navigate to="/" />;  // Redirect to home if user doesn't have access
  }

  return children;  // Render the child component if authenticated and has access
};

export default PrivateRoute;
