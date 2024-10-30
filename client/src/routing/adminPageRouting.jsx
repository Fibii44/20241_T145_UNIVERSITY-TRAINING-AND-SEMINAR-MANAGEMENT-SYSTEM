
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from '../pages/admin/dashboard';
import EventM from '../pages/adminp/eventM';
import HistoryM from '../pages/admin/history';
import EventDetails from '../pages/admin/eventDetails'; 
import AddUser from '../pages/admin/add-personnel-page'; 

// import CalendarA from '../../pages/adminpages/calendarA'; 

function Admin() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/events" element={<EventM />} />
          <Route path="/history" element={<HistoryM />} />
          <Route path="/history/:id" element={<EventDetails />} /> 
          <Route path="/personnel" element={<AddUser />} /> 
          {/* <Route path="/calendar" element={<CalendarA />} />  */}
        </Routes>
      </div>
    </Router>
  );
}

export default Admin;