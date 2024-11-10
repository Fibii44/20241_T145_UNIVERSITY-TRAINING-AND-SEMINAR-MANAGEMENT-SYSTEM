import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate, faHistory, faCalendar, faCog, faSignOutAlt, faBars, faHome, faCalendarCheck, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import LogoutModal from '../logoutModal/logoutModal.jsx';


const Sidebar = ({ activePage }) => {
  // Retrieve the initial state from localStorage or set default to true (collapsed)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('isSidebarCollapsed') === 'true';
  });

  const toggleSidebar = () => {
    // Toggle the state and store the updated state in localStorage
    setIsCollapsed((prevState) => {
      const newState = !prevState;
      localStorage.setItem('isSidebarCollapsed', newState);
      return newState;
    });
  };

  useEffect(() => {
    // Update the collapsed state when the component mounts
    const savedState = localStorage.getItem('isSidebarCollapsed') === 'true';
    setIsCollapsed(savedState);
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} d-none d-md-flex`}>
            <div className="sidebar-header">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={faBars} />
                </button>

                <div className="sidebar-title">
                    <h2 className="buksu">{!isCollapsed && 'BukSU'}</h2>
                    <h2 className="engage">{!isCollapsed && 'Engage'}</h2>
                </div>
            </div>
            
            <ul className="menu-items">
                <li className={activePage === 'home' ? 'active' : ''}>
                    <Link to="/u/home">
                        <span className="icon"><FontAwesomeIcon icon={faHome} size="lg" /></span>
                        {!isCollapsed && <span>Home</span>}
                    </Link>
                </li>
                <li className={activePage === 'events' ? 'active' : ''}>
                    <Link to="/u/events">
                        <span className="icon"><FontAwesomeIcon icon={faCalendarCheck} size="lg" /></span>
                        {!isCollapsed && <span>Events</span>}
                    </Link>
                </li>
                <li className={activePage === 'calendar' ? 'active' : ''}>
                    <Link to="/u/calendar">
                        <span className="icon"><FontAwesomeIcon icon={faCalendar} size="lg" /></span>
                        {!isCollapsed && <span>Calendar</span>}
                    </Link>
                </li>
                <li className={activePage === 'certificates' ? 'active' : ''}>
                    <Link to="/u/certificates">
                        <span className="icon"><FontAwesomeIcon icon={faCertificate} size="lg" /></span>
                        {!isCollapsed && <span>Certificates</span>}
                    </Link>
                </li>
                <li className={activePage === 'history' ? 'active' : ''}>
                    <Link to="/u/history">
                        <span className="icon"><FontAwesomeIcon icon={faHistory} size="lg" /></span>
                        {!isCollapsed && <span>History</span>}
                    </Link>
                </li>
                
            </ul>

            <ul className="sidebar-footer">
            <li className={`sidebar-footer-item ${activePage === 'profile' ? 'active' : ''}`}>
                    <Link to="/u/profile">
                        <span className="icon"><FontAwesomeIcon icon={faUser} size="lg" /></span>
                        {!isCollapsed && <span>Profile</span>}
                    </Link>
                </li>
                <li className={`sidebar-footer-item ${activePage === 'settings' ? 'active' : ''}`}>
                    <Link to="/settings">
                        <span className="icon"><FontAwesomeIcon icon={faCog} size="lg" /></span>
                        {!isCollapsed && <span>Settings</span>}
                    </Link>
                </li>
                <li className="sidebar-footer-item">
                    <a href="#" onClick={openLogoutModal} className="logout-link">
                        <span className="icon"><FontAwesomeIcon icon={faSignOutAlt} size="lg" /></span>
                        {/* Assuming isCollapsed is defined in your component */}
                        {!isCollapsed && <span>Logout</span>}
                    </a>
                </li>
            </ul>

            {showLogoutModal && (
                <LogoutModal show={showLogoutModal} onClose={closeLogoutModal} onLogout={() => {
                console.log("User logged out");
                closeLogoutModal();
                }} />
            )}
        </div>
    );
};

export default Sidebar;
