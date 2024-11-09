  import React from "react";
  import "./logoutmodal.css";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";   
  import { useNavigate } from 'react-router-dom'; // Import useNavigate

  const LogoutModal = ({ show, onClose, onLogout }) => {
    const navigate = useNavigate(); // Initialize useNavigate

    if (!show) return null;

    const handleLogout = () => {
      onLogout(); // Call your existing onLogout function (if needed)
      sessionStorage.clear();	
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