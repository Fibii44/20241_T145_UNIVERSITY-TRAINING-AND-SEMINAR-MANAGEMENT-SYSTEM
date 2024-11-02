import { useState } from 'react'; // Import useState if not already imported
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt, faCalendarCheck, faClock, faCog, faSignOutAlt, faBars, faUsers, faCalendar, faHistory } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom'; // Import Link and useLocation
import './css/admin.css';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const location = useLocation(); // Get the current location
    const activePage = location.pathname.split('/').pop(); // Determine active page from path

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                
                
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
            </div>
            
            <ul className="menu-items">
                <li className={activePage === 'dashboard' ? 'active' : ''}>
                    <Link to="/a/dashboard">
                        <span className="icon"><FontAwesomeIcon icon={faTachometerAlt} size="lg" /></span>
                        {!isCollapsed && <span>Dashboard</span>}
                    </Link>
                </li>
                <li className={activePage === 'calendar' ? 'active' : ''}>
                    <Link to="/a/calendar">
                        <span className="icon"><FontAwesomeIcon icon={faCalendarCheck} size="lg" /></span>
                        {!isCollapsed && <span>Calendar</span>}
                    </Link>
                </li>
                <li className={activePage === 'personnel' ? 'active' : ''}>
                    <Link to="/a/personnel">
                        <span className="icon"><FontAwesomeIcon icon={faClock} size="lg" /></span>
                        {!isCollapsed && <span>Personnel</span>}
                    </Link>
                </li>
                <li className={activePage === 'users' ? 'active' : ''}>
                    <Link to="/a/users">
                        <span className="icon"><FontAwesomeIcon icon={faUsers} size="lg" /></span>
                        {!isCollapsed && <span>Users</span>}
                    </Link>
                </li>
                <li className={activePage === 'history' ? 'active' : ''}>
                    <Link to="/a/history">
                        <span className="icon"><FontAwesomeIcon icon={faHistory} size="lg" /></span>
                        {!isCollapsed && <span>History</span>}
                    </Link>
                </li>
                <li className={activePage === 'events' ? 'active' : ''}>
                    <Link to="/a/events">
                        <span className="icon"><FontAwesomeIcon icon={faCalendar} size="lg" /></span>
                        {!isCollapsed && <span>Events</span>}
                    </Link>
                </li>
            </ul>

            <ul className="sidebar-footer"> 
                <li className={`sidebar-footer-item ${activePage === 'settings' ? 'active' : ''}`}>
                    <Link to="/settings">
                        <span className="icon"><FontAwesomeIcon icon={faCog} size="lg" /></span>
                        {!isCollapsed && <span>Settings</span>}
                    </Link>
                </li>
                <li className={`sidebar-footer-item ${activePage === 'logout' ? 'active' : ''}`}>
                    <Link to="/logout">
                        <span className="icon"><FontAwesomeIcon icon={faSignOutAlt} size="lg" /></span>
                        {!isCollapsed && <span>Logout</span>}
                    </Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;