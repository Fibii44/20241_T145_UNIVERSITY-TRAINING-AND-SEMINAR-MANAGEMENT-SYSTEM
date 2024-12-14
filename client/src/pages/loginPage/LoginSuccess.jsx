import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function LoginSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const stayLoggedIn = searchParams.get("stayLoggedIn") === "true";
    
    const decoded = jwtDecode(token);
    const userRole = decoded.role;
    const mustChangePassword = decoded.mustChangePassword;
    
    if (token) {
      if (stayLoggedIn) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("stayLoggedIn", stayLoggedIn);
      } else {
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("userRole", userRole);
      }


      console.log(decoded);

      if (mustChangePassword) {
        navigate("/set-password");
        return;
      }

      if (userRole === "faculty_staff" && decoded.status === "active") {
        navigate("/u"); 
      } else if (
        userRole === "admin" ||
        userRole === "departmental_admin" && decoded.status === "active"
      ) {
        navigate("/a"); 
      } else {
        console.error("Unknown user role:", userRole);
        navigate("/"); // Redirect to login for unknown roles
      }
    } else {
      console.error("Token not found in query parameters");
      navigate("/login"); // Redirect to login if no token
    }
  }, [navigate, searchParams]);

  return <div>Redirecting...</div>;
}

export default LoginSuccess;