
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from  '../pages/user/home';
import Events  from  '../pages/user/eventsPage';
import Calendar from '../pages/user/calendarPage'
import Certificates from '../pages/user/certificates'
import History from '../pages/user/historyList'
import Profile from '../pages/user/profile'
import EventDetails from '../pages/user/eventDetails';
import NotFound from '../pages/user/notFound';


function User() {
  return (
      <div className="App">
        <Routes> 
          <Route path="/" element={<Navigate to="/u/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="history" element={<History />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
  );
}

export default User;