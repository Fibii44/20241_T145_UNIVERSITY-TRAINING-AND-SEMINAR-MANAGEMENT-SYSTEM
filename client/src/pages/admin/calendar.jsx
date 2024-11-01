// import React, { useState } from 'react';
// import '@fortawesome/fontawesome-free/css/all.min.css';

// import Calendar  from '../../components/admin/calendar/calendar';
// import Sidebar from '../../components/admin/adminbar/sidebar';
// import Topbar from '../../components/admin/adminbar/topbar';

// const adminCalendar =  () => {
//     const [isCollapsed, setIsCollapsed] = useState(false);
//     const toggleSidebar = () => {
//         setIsCollapsed(!isCollapsed);
//     }
//     return(
//         <div className="dashboard-container">
//             <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="calendar" />
//             <div className="content">
//                 <Topbar />
//                 <div className="context-card">
//                     <Calendar />
//                 </div>
//             </div>
//         </div>
//     )
// };
// export default adminCalendar;

import React, { useState } from 'react';
import Sidebar from '../../components/admin/adminbar/sidebar';
import Topbar from '../../components/admin/adminbar/topbar';
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

