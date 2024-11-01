
import { Route, Routes, Navigate} from 'react-router-dom';
import Dashboard from '../pages/admin/dashboard';
import EventM from '../pages/admin/eventM';
import HistoryM from '../pages/admin/history';
import EventDetails from '../pages/admin/eventDetails'; 
import AddUser from '../pages/admin/add-personnel-page'; 
import Calendar from '../pages/admin/calendar'
import Table from '../pages/admin/usersTable';
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
          <Route path="history" element={<HistoryM />} />
          <Route path="history/:id" element={<EventDetails />} /> 
          <Route path="personnel" element={<AddUser />} /> 
          <Route path="events" element={<EventM />} />
          {/* <Route path="/calendar" element={<CalendarA />} />  */}
        </Routes>
      </div>
  );
}

export default Admin;