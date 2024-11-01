import React, { useState } from 'react';
import './sidebar.css';
import Profile from "../../../assets/userProfile.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHome, faCalendar, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="topbar">
            <div className="topnavbar">
                <ul>
                    <li>
                    <Link to="/u/home">
                        <div className="nav-icons">
                            <FontAwesomeIcon icon={faHome} size="lg" />
                        </div>
                    </Link>
                    </li>
                    <li>
                    <Link to="/u/events">   
                        <div className="nav-icons">
                            <FontAwesomeIcon icon={faCalendarCheck} size="lg" />
                        </div>
                    </Link>
                    </li>
                    <li>
                        <div className="nav-icons">
                            <FontAwesomeIcon icon={faCalendar} size="lg" />
                        </div>
                    </li>
                    <li>
                        <div className="nav-icons">
                            <FontAwesomeIcon icon={faBell} size="lg" />
                        </div>
                    </li>
                </ul>
            </div>
            <div className="user-info">
                <div className="profile">
                    <img src={Profile} alt="Admin Profile" />
                </div>
                <div className="user-details">
                    <span className="name" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                        Ay Ay Ron
                    </span>
                    <span className="role">Faculty</span>
                </div>
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <ul>
                            <li>Profile</li>
                            <li>Settings</li>
                            <li>Logout</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Topbar;