import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function LoginSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      sessionStorage.setItem("authToken", token);

      const decoded = jwtDecode(token);
      const userRole = decoded.role;
      const mustChangePassword = decoded.mustChangePassword;

      sessionStorage.setItem("userRole", userRole);

      console.log(decoded);

      if (mustChangePassword) {
        navigate("/set-password");
        return;
      }

      if (userRole === "faculty_staff") {
        navigate("/u"); 
      } else if (
        userRole === "general_admin" ||
        userRole === "departmental_admin"
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