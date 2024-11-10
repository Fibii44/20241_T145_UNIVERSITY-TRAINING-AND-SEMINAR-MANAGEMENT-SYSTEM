import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Sidebar from '../../components/admin/navbars/sidebar/sidebar';
import Topbar from '../../components/admin/navbars/topbar/topbar';

import AddUserForm from '../../components/admin/addPersonnel/addPersonnel';

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
