
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from  '../pages/user/home';
import Login from '../pages/login/Login'
import LoginSuccess from '../pages/login/LoginSuccess';

function User() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default User;