import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate, faRectangleList, faClock, faCog, faSignOutAlt, faBars, faUsers, faCalendar, faHistory  } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom'; // Import Link
import './sidebar.css';


const Sidebar = ({ isCollapsed, toggleSidebar, activePage }) => (
  <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
    <div className="sidebar-header">
      <div className="sidebar-title">
        <h2 className="buksu">{!isCollapsed && 'BukSU'}</h2>
        <h2 className="engage">{!isCollapsed && 'Engage'}</h2>
      </div>
      
      <button className="menu-toggle" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faBars} />
      </button>
    </div>
    
    <ul className="menu-items">
      <li className={activePage === 'dashboard' ? 'active' : ''}>
        <Link to="/certificates"> {/* Add link to Dashboard */}
          <span className="icon"><FontAwesomeIcon icon={faCertificate} size="lg" /></span>
          {!isCollapsed && <span>Certificates</span>}
        </Link>
      </li>
      <li className={activePage === 'history' ? 'active' : ''}>
        <Link to="/history"> {/* Add link to Users Table */}
          <span className="icon"><FontAwesomeIcon icon={faHistory} size="lg" /></span>
          {!isCollapsed && <span>History</span>}
        </Link>
      </li>
      <li className={activePage === 'events' ? 'active' : ''}>
        <Link to="/events"> {/* Add link to Events */}
          <span className="icon"><FontAwesomeIcon icon={faCalendar} size="lg" /></span>
          {!isCollapsed && <span>Events</span>}
        </Link>
      </li>
    </ul>

    <ul className="sidebar-footer"> 
      <li className={`sidebar-footer-item ${activePage === 'settings' ? 'active' : ''}`}>
        <Link to="/settings"> {/* Add link to Settings */}
          <span className="icon"><FontAwesomeIcon icon={faCog} size="lg" /></span>
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </li>
      <li className={`sidebar-footer-item ${activePage === 'logout' ? 'active' : ''}`}>
        <Link to="/logout"> {/* Add link to Logout */}
          <span className="icon"><FontAwesomeIcon icon={faSignOutAlt} size="lg" /></span>
          {!isCollapsed && <span>Logout</span>}
        </Link>
      </li>
    </ul>
  </div>
);

export default Sidebar;