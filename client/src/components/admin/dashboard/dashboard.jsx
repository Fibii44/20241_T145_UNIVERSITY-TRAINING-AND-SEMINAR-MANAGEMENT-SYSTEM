import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarCheck, faBan} from '@fortawesome/free-solid-svg-icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import "./dashboard.css";

const StatCard = ({ title, count, icon, color }) => (
  <div className="dashboard__card"> {/* Updated class name for specificity */}
    <div className="card-content">
      <div className="stat-content">
        <div className="text-content">
          <h3>{title}</h3>
          <p>{count}</p>
        </div>
        <div className="stat-icon" style={{ color }}>
          {icon}
        </div>
      </div>  
    </div>
  </div>
);


const Chart = ({ data }) => (
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



const UsersTable = ({ users }) => (
  <div className="table-container">
    <h2 className="users-heading">Users</h2>
    <div className="table-responsive">
      <table className="table table-striped">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id || index}>
              <td>{user._id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);



const Dashboard = () => {
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    successfulEvents: 0,
    canceledEvents: 0,
    users: [],
    monthlyUserData: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/a/dashboard');
        setStats(response.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, []);
  
  const formatMonthYearShort = (monthYear) => {
    const [month, year] = monthYear.split("-");
    const monthNamesShort = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthIndex = parseInt(month) - 1; // Convert string month to zero-based index
    return `${monthNamesShort[monthIndex]} ${year}`; // Format as "Month Year"
  };

  return (
    <div className="dashboard-container">
      <div className="content">
        <h2 className="dashboard-heading">Dashboard</h2>
        <div className="dashboard">
          <StatCard title="Total User" count={stats.totalUsers} icon={<FontAwesomeIcon icon={faUser} size="2x" />} color="#4a90e2"/>
          <StatCard title="Total Events" count={stats.totalEvents} icon={<FontAwesomeIcon icon={faCalendarCheck} size="2x" />} color="#ffe600"/>
          <StatCard title="Upcoming Events" count={stats.upcomingEvents} icon={<FontAwesomeIcon icon={faCalendarCheck} size="2x" />} color="#9b51e0" />
          <StatCard title="Successful Events" count={stats.successfulEvents || 0} icon={<FontAwesomeIcon icon={faCalendarCheck} size="2x" />} color="#34c759" />
          <StatCard title="Canceled Events" count={stats.canceledEvents} icon={<FontAwesomeIcon icon={faBan} size="2x" />} color="#ff3b30" />
        </div>
        
        <Chart 
          data={stats.monthlyUserData.map(({ month, totalUsers, activeUsers }) => ({
              name: formatMonthYearShort(month), // Short format
              TotalUsers: totalUsers,
              ActiveUsers: activeUsers
          }))} 
        />
        <UsersTable users={stats.users} />
      </div>
    </div>
  );
};


export default Dashboard;