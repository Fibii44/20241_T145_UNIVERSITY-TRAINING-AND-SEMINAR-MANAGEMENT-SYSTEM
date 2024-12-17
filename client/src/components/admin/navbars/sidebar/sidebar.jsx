import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faCalendarCheck, faClock, faCog, faSignOutAlt, faBars, faUsers, faCalendar, faHistory, faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'; 
import './sidebar.css';
import LogoutModal from '../../../user/logoutModal/logoutModal';

const Sidebar = ({ activePage }) => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return sessionStorage.getItem('isSidebarCollapsed') === 'true';
  });
  const [role, setRole] = useState(sessionStorage.getItem('userRole') || localStorage.getItem('userRole') || ''); // Retrieve role 
  
  const toggleSidebar = () => {
    setIsCollapsed((prevState) => {
      const newState = !prevState;
      sessionStorage.setItem('isSidebarCollapsed', newState);
      return newState;
    });
  };

  useEffect(() => {
    const savedState = sessionStorage.getItem('isSidebarCollapsed') === 'true';
    setIsCollapsed(savedState);
  }, []);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
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
        <li className={activePage === 'dashboard' ? 'active' : ''}>
          <Link to="/a/dashboard">
            <span className="icon"><FontAwesomeIcon icon={faTachometerAlt} size="lg" /></span>
            {!isCollapsed && <span className='list-name'>Dashboard</span>}
          </Link>
        </li>
        <li className={activePage === 'calendar' ? 'active' : ''}>
          <Link to="/a/calendar">
            <span className="icon"><FontAwesomeIcon icon={faCalendarCheck} size="lg" /></span>
            {!isCollapsed && <span className='list-name'>Calendar</span>}
          </Link>
        </li>
        
        {/* Conditionally render Personnel and Users menu items for general_admin */}
        {role === 'admin' && (
          <>
            <li className={activePage === 'users' ? 'active' : ''}>
              <Link to="/a/users">
                <span className="icon"><FontAwesomeIcon icon={faUsers} size="lg" /></span>
                {!isCollapsed && <span className='list-name'>Users</span>}
              </Link>
            </li>
          </>
        )}
        
        <li className={activePage === 'history' ? 'active' : ''}>
          <Link to="/a/history">
            <span className="icon"><FontAwesomeIcon icon={faHistory} size="lg" /></span>
            {!isCollapsed && <span className='list-name'>History</span>}
          </Link>
        </li>
        <li className={activePage === 'events' ? 'active' : ''}>
          <Link to="/a/events">
            <span className="icon"><FontAwesomeIcon icon={faCalendar} size="lg" /></span>
            {!isCollapsed && <span className='list-name'>Events</span>}
          </Link>
        </li>
        {role === 'admin' && (
          <>
            <li className={activePage === 'activity-logs' ? 'active' : ''}>
              <Link to="/a/activity-logs">
              <span className="icon"><FontAwesomeIcon icon={faClipboardCheck} size="lg" /></span>
              {!isCollapsed && <span className='list-name'>Activity Logs</span>}
              </Link>
            </li>
          </>
        )}
      </ul>

      <ul className="sidebar-footer"> 
        <li className={`sidebar-footer-item ${activePage === 'settings' ? 'active' : ''}`}>
          <Link to="/a/oqwidjoiqwj">
            <span className="icon"><FontAwesomeIcon icon={faCog} size="lg" /></span>
            {!isCollapsed && <span className='list-name'>Settings</span>}
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