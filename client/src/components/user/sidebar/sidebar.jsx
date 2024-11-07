import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCertificate, faHistory, faCalendar, faCog, faSignOutAlt, faBars, faBell, faHome, faCalendarCheck} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import '../../../components/admin/adminbar/css/admin.css';

const Sidebar = ({ isCollapsed, toggleSidebar, activePage }) => (
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

{/* ============================================================================================ */}
      <li className={activePage === 'home' ? 'active' : ''}>
        <Link to="/u/home">
          <span className="icon"><FontAwesomeIcon icon={faHome} size="lg" /></span>
          {!isCollapsed && <span>Home</span>}
        </Link>
      </li>

{/* ============================================================================================ */}
      <li className={activePage === 'events' ? 'active' : ''}>
        <Link to="/u/events">
          <span className="icon"><FontAwesomeIcon icon={faCalendarCheck} size="lg" /></span>
          {!isCollapsed && <span>Events</span>}
        </Link>
      </li>
{/* ============================================================================================ */}
      <li className={activePage === 'calendar' ? 'active' : ''}>
        <Link to="/u/calendar">
          <span className="icon"><FontAwesomeIcon icon={faCalendar} size="lg" /></span>
          {!isCollapsed && <span>Calendar</span>}
        </Link>
      </li>
{/* ============================================================================================ */}
      <li className={activePage === 'certificates' ? 'active' : ''}>
        <Link to="/u/certificates">
          <span className="icon"><FontAwesomeIcon icon={faCertificate} size="lg" /></span>
          {!isCollapsed && <span>Certificates</span>}
        </Link>
      </li>
{/* ============================================================================================ */}
      <li className={activePage === 'history' ? 'active' : ''}>
        <Link to="/u/history">
          <span className="icon"><FontAwesomeIcon icon={faHistory} size="lg" /></span>
          {!isCollapsed && <span>History</span>}
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

export default Sidebar;