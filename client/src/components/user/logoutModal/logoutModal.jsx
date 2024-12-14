  import React from "react";
  import "./logoutmodal.css";
  import { useNavigate } from 'react-router-dom'; // Import useNavigate

  const LogoutModal = ({ show, onClose, onLogout }) => {
    const navigate = useNavigate(); // Initialize useNavigate

    if (!show) return null;

    const handleLogout = async () => {
       // Call your existing onLogout function (if needed)

      try{
        const response = await fetch('http://localhost:3000/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('authToken') || localStorage.getItem('authToken')}`
          }
        });
        if (response.ok) {
          console.log('Logout successful');
        } else {
          console.error('Logout failed:', response.statusText);
        }
      } catch (error) {
        console.error('Logout failed:', error);
      }
      
      function deleteGoogleCookies() {
        const cookies = document.cookie.split(";");
      
        // Loop through all cookies
        cookies.forEach(cookie => {
          const cookieName = cookie.split("=")[0];
          if (cookieName.includes("google")) {  // You can refine this based on the cookie names
            document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
          }
        });
      }
      
      // Call this function when logging out
      deleteGoogleCookies();

      sessionStorage.clear();	
      localStorage.clear();
      
      if (window.gapi && window.gapi.auth2) {
        const auth2 = window.gapi.auth2.getAuthInstance();
        if (auth2.isSignedIn.get()) {
          await auth2.signOut(); // Force logout from Google session
          console.log('User signed out from Google');
        }
      }

      onLogout();
      navigate('/'); // Navigate to the login page
    };

    

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="logout-modal shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
        
          <div className="flex flex-col items-center mb-4 mt-3 text-center">
            <h2 className="logout-modal">Confirm log out</h2>
          </div>

          <p className="logout-modal mb-1">
            You are about to log out from this device
          </p>
          <div className="buttons mb-2"> 
            <button
                className="cancelButton" onClick={onClose}
            >
                Cancel
            </button>
            <button className="logoutButton" onClick={handleLogout}>
                Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default LogoutModal;