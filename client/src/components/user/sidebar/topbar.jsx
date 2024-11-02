import React, { useState } from 'react';
import './sidebar.css';
import Profile from "../../../assets/userProfile.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faHome, faCalendar, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleSearch = () => {
        console.log(searchTerm); // Handle the search logic here
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
            <div className="topnavbar">
                <ul>
                    {/* <li>
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
                        <Link to="/u/calendar">   
                            <div className="nav-icons">
                                <FontAwesomeIcon icon={faCalendar} size="lg" />
                            </div>
                        </Link>
                    </li> */}
                    
                    <div className="search-container">
                    <input 
                        type="text" 
                        className="search-bar" 
                        placeholder="Search..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                    <button className="search-button" onClick={handleSearch}>
                        Search
                    </button>
                </div>
                </ul>
                
            </div>
            <div className="user-info">
                        <div className="nav-icons">
                            <FontAwesomeIcon icon={faBell} size="lg" />
                        </div>

                <div className="profile">
                    <img src={user.profilePicture} alt="User Profile" />
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