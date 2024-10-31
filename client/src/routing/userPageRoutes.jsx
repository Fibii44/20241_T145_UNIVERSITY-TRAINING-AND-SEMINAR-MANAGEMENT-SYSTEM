
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from  '../pages/user/home';


function User() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default User;