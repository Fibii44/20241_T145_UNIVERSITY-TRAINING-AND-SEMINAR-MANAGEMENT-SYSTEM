import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function NavbarWithSidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            {/* Topbar */}
            <div className="announcement">
                <p>Announcement: Lorem ipsum odor amet, consectetuer adipiscing elit. Consequat vestibulum nec bibendum hendrerit himenaeos sociosqu vitae cursus. Purus imperdiet faucibus orci fusce, pellentesque auctor. </p>
            </div>
            <div className="topbar">
                <button className="breadcrumb-button" onClick={toggleSidebar}>
                    ☰
                </button>
                <div className="nav-buttons">
                    <button className="home"> <Link to="/" className="home">HOME</Link></button>
                    <button><Link to="/events">EVENTS</Link></button>
                    <button><Link to="./calendar.jsx">CALENDAR</Link></button>
                </div>
                <div className="topbar-icons">
                    <button className="notification-button">
                        <i className="fas fa-bell"></i>
                    </button>
                    <div className="profile-icon">
                        <i className="fas fa-user-circle"></i>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-btn" onClick={toggleSidebar}>✖</button>
                <h3>
                    <span>BukSU</span> <span className="highlight">Engage</span>
                </h3>
                <ul>
                    <li><i className="fas fa-user"></i> User Profile</li>
                    <li><i class="fa-solid fa-border-all"></i> Certificates</li>
                    <li><i className="fas fa-history"></i> History</li>
                </ul>
                <div className="sidebar-bottom">
                    <button className="sidebar-button"><i className="fas fa-cog"></i> Settings</button>
                    <button className="sidebar-button"><i className="fas fa-sign-out-alt"></i> Logout</button>
                </div>
            </div>
        </>
    );
}

export default NavbarWithSidebar;