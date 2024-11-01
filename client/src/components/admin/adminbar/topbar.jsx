import React, { useState, useEffect } from 'react';
import './css/admin.css';
import Profile from "../../../assets/adminProfile.png"; // Imported Profile image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { jwtDecode } from 'jwt-decode';

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState({ name: '', profilePicture: '', role: '' });

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if(token){
            const decoded = jwtDecode(token);
            console.log('Decoded Profile Picture:', decoded.profilePicture);
            setUser({
                name: decoded.name,
                email: decoded.email,
                profilePicture: decoded.profilePicture,
                role: decoded.role
            })
        }
    }, []);

    return (
        <div className="topbar">
            <div className="search-admin">
                <i className="fa fa-search search-icon"></i>
                <input type="text" placeholder="Search..." />
            </div>
            <div className="user-info">
                <div className="notification">
                    <FontAwesomeIcon icon={faBell} size="lg" />
                </div>
                <div className="profile">
                    <img src={user.profilePicture} alt="Admin Profile" />
                </div>
                <div className="user-details">
                    <span className="name" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                       {user.name}
                    </span>
                    <span className="role">Admin</span>
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