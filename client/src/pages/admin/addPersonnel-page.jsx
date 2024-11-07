import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Sidebar from '../../components/admin/adminbar/sidebar';
import Topbar from '../../components/admin/adminbar/topbar';
import '../../components/admin/adminbar/css/topbar.css';

import AddUserForm from '../../components/admin/admin_add-personnel/add-personnel';

const AddUser = () => {

    const [isCollapsed, setIsCollapsed] = useState(false);

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
