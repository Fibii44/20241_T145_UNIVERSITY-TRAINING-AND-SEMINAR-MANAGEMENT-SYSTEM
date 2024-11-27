import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Sidebar from '../../components/admin/navbars/sidebar/sidebar';
import Topbar from '../../components/admin/navbars/topbar/topbar';
import History from '../../components/admin/eventHistoryDetails/eventHistoryDetails'
import './page.css'
const dashboard = () => {

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="dashboard-container">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="history" />
            <div className="content">
                <Topbar />
                <div className="context-cards">
                <History />
                </div>
            </div>
        </div>
    );
};

export default dashboard;
