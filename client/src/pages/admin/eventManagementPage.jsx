import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Sidebar from '../../components/admin/navbars/sidebar/sidebar';
import Topbar from '../../components/admin/navbars/topbar/topbar';
import Events from '../../components/admin/eventManagement/eventManagement';

const events = () => {

    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="dashboard-container">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="events" />
            <div className="content">
                <Topbar />
                <div className="context-card">
                  <Events />
                </div>
            </div>
        </div>
    );
};

export default events;
