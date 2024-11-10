import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Sidebar from '../../components/admin/navbars/sidebar/sidebar';
import Topbar from '../../components/admin/navbars/topbar/topbar';
import Dashboard from '../../components/admin/dashboard/dashboard';

const dashboard = () => {

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="dashboard-container">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="dashboard" />
            <div className="content">
                <Topbar />
                <div className="context-card">
                  <Dashboard />
                </div>
            </div>
        </div>
    );
};

export default dashboard;
