
import { Route, Routes, Navigate } from 'react-router-dom';
import Home from  '../pages/user/home';
import Events  from  '../pages/user/events-page';

function User() {
  return (
      <div className="App">
        <Routes> 
          <Route path="/" element={<Navigate to="/u/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="events" element={<Events />} />
        </Routes>
      </div>
  );
}

export default User;