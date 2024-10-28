import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarCheck, faClock } from '@fortawesome/free-solid-svg-icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../../component/adminbar/sidebar';
import Topbar from '../../component/adminbar/topbar';
import '../../component/adminbar/css/admin.css';



//Temporary Data, I connect ra ang data sa database kung naa na
const data = [
  { name: 'Jan', TotalUsers: 4000, ActiveUsers: 2400 },
  { name: 'Feb', TotalUsers: 3000, ActiveUsers: 1398 },
  { name: 'Mar', TotalUsers: 2000, ActiveUsers: 9800 },
  { name: 'Apr', TotalUsers: 2780, ActiveUsers: 3908 },
  { name: 'May', TotalUsers: 1890, ActiveUsers: 4800 },
  { name: 'Jun', TotalUsers: 2390, ActiveUsers: 3800 },
  { name: 'Jul', TotalUsers: 3490, ActiveUsers: 4300 },
];
const users = [
  { id: '00001', name: 'Christine Brooks', email: 'christine@domain.com', phone: '0946-245-6797', position: 'Finance Cashier', gender: 'Female' },
  { id: '00002', name: 'John Doe', email: 'john@domain.com', phone: '0912-345-6789', position: 'IT Specialist', gender: 'Male' },
  { id: '00003', name: 'Jane Smith', email: 'jane@domain.com', phone: '0923-456-7890', position: 'Manager', gender: 'Female' }
 
];

const StatCard = ({ title, count, icon, color }) => (
  <div className="card">
    <div className="card-content">
      <h3>{title}</h3>
      <p>{count}</p>
    </div>
    <div className="icon" style={{ color }}>{icon}</div>
  </div>
);

const Chart = () => (
  <div className="chart">
    <h2 className="userstat-heading">User Statistics</h2>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF4B4B" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#FF4B4B" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9b51e0" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#9b51e0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        
        <Area type="monotone" dataKey="TotalUsers" stroke="#FF4B4B" fillOpacity={1} fill="url(#colorTotal)" />
        <Area type="monotone" dataKey="ActiveUsers" stroke="#9b51e0" fillOpacity={1} fill="url(#colorActive)" />
      </AreaChart>
    </ResponsiveContainer>
    <div className="chart-header">
      <div className="header-item">
        <span className="color-box" style={{ backgroundColor: "#FF4B4B" }}></span>
        <span>Total Users</span>
      </div>
      <div className="header-item">
        <span className="color-box" style={{ backgroundColor: "#9b51e0" }}></span>
        <span>Active Users</span>
      </div>
    </div>
  </div>
);



const UsersTable = () => (
  <div className="table-container">
    <h2 className="users-heading">Users</h2>
    <div className="table-responsive"> {/* Add this div for responsiveness */}
      <table className="table table-striped">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Position</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.position}</td>
              <td>{user.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="dashboard" />
      <div className="content">
        <Topbar />
        <h2 className="dashboard-heading">Dashboard</h2>

        <div className="dashboard">
          <StatCard title="Total User" count="5,609" icon={<FontAwesomeIcon icon={faUser} size="2x" />} color="#4a90e2" />
          <StatCard title="Upcoming Events" count="20" icon={<FontAwesomeIcon icon={faCalendarCheck} size="2x" />} color="#9b51e0" />
          <StatCard title="Successful Events" count="20" icon={<FontAwesomeIcon icon={faCalendarCheck} size="2x" />} color="#34c759" />
          <StatCard title="Canceled Events" count="20" icon={<FontAwesomeIcon icon={faClock} size="2x" />} color="#ff3b30" />
        </div>
        <Chart />
        <UsersTable />
      </div>
    </div>
  );
};


export default Dashboard;
