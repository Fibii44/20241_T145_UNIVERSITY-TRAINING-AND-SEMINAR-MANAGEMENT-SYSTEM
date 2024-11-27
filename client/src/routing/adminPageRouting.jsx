
import { Route, Routes, Navigate} from 'react-router-dom';
import Dashboard from '../pages/admin/dashboardPage';
import Events from '../pages/admin/eventManagementPage';
import History from '../pages/admin/history';
import EventDetails from '../pages/admin/eventHistoryDetails'; 
import AddUser from '../pages/admin/addPersonnelPage'; 
import Calendar from '../pages/admin/calendar'
import Table from '../pages/admin/usersTable';
import Logs from '../pages/admin/activityLogPage'
// import Login from '../pages/login/Login'
// import LoginSuccess from '../pages/login/LoginSuccess';
// import CalendarA from '../../pages/adminpages/calendarA'; 

function Admin() {
  return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/a/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="users" element={<Table />} />
          <Route path="history" element={<History />} />
          <Route path="events/:id" element={<EventDetails />} /> 
          <Route path="personnel" element={<AddUser />} /> 
          <Route path="events" element={<Events />} />
          <Route path='activity-logs' element={<Logs />} />
          {/* <Route path="/calendar" element={<CalendarA />} />  */}
        </Routes>
      </div>
  );
}

export default Admin;