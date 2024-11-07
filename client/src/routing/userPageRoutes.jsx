
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from  '../pages/user/home';
import Events  from  '../pages/user/eventsPage';
import Calendar from '../pages/user/calendarPage'
import Certificates from '../pages/user/certificates'
import History from '../pages/user/history'
import Profile from '../pages/user/profile'
import EventPage from '../pages/user/eventOpened';


function User() {
  return (
      <div className="App">
        <Routes> 
          <Route path="/" element={<Navigate to="/u/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventPage />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </div>
  );
}

export default User;