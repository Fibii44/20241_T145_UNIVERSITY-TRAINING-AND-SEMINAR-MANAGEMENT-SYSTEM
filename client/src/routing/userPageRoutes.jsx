
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from  '../pages/user/home';
import Events  from  '../pages/user/events-page';

function User() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/events" element={<Events />} />
        </Routes>
      </div>
    </Router>
  );
}

export default User;