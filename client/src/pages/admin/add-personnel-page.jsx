import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Sidebar from '../../components/adminbar/sidebar';
import Topbar from '../../components/adminbar/topbar';
import '../../components/adminbar/css/admin.css';

import AddUserForm from '../../components/admin_add-personnel/add-personnel';

const AddUser = () => {
    // Declare state for sidebar collapse
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Function to toggle sidebar collapse state
    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="dashboard-container">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="personnel" />
            <div className="content">
                <Topbar />
                <div className="context-card">
                    <AddUserForm />
                </div>
            </div>
        </div>
    );
};

export default AddUser;