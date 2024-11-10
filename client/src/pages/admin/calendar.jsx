import React, { useState } from 'react';
import Sidebar from '../../components/admin/navbars/sidebar/sidebar';
import Topbar from '../../components/admin/navbars/topbar/topbar';
import Calendar from '../../components/admin/calendar/calendar'


const CalendarAdmin = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="dashboard-container">
            <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="calendar" />
            <div className="content">
                <Topbar />
                <div className="calendar-section">
                    <Calendar /> {/* Calendar component integration */}
                </div>
            </div>
        </div>
    );
};

export default CalendarAdmin;

