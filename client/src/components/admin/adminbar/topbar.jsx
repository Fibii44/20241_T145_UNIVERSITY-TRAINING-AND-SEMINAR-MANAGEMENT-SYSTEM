import React, { useState } from 'react';


const Topbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <div className="topbar">
            <div className="search">
                <input type="text" placeholder="Search..." />
            </div>

            <div className="user-info">
                <div className="profile">
                    <img src="path/to/your/image.png" />
                </div>
                <div className="user-details">
                    {/* Move the onClick to the name span */}
                    <span className="name" onClick={toggleDropdown} style={{ cursor: 'pointer' }}>
                        Si Feby
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
