import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendarCheck, faBan, faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import "./dashboard.css";
import Profile from "../../../assets/default-profile.png"
const StatCard = ({ title, count, icon, color, Route }) => (

  <Link to={Route} className="dashboard__card"> {/* Updated class name for specificity */}
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
  </Link>

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



const UsersTable = ({ users }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculate the current page's users
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Function to get the profile picture URL
  const getProfilePictureUrl = (profilePicture) => {
    if (!profilePicture) return Profile;
    return `http://localhost:3000/profilePictures/${profilePicture}`;
  };

  // Handle "Next" and "Prev" button clicks
  const handleNext = () => {
    if (currentPage * rowsPerPage < users.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="table-container">
      {/* Users Table Label and Pagination */}
      <div className="table-header">
        <h2 className="users-heading">Users Table</h2>

        {/* Pagination Controls - Aligning with Label */}
        <div className="dashboard-pagination">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage * rowsPerPage >= users.length}
            className="pagination-button"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead className="thead-dark">
            <tr>
              <th></th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user._id || index}>
                <td className="profile-cell">
                  <img
                    src={getProfilePictureUrl(user.profilePicture)}
                    alt={`${user.name}'s profile`}
                    className="dashboard-profile-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = Profile;
                    }}
                  />
                </td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: user.status.toLowerCase() === "active" ? "green" : "red",
                      marginRight: "8px",
                    }}
                  ></span>
                  {user.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    successfulEvents: 0,
    canceledEvents: 0,
    users: [],
    dailyUserData: [] // Update to daily data
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
  // Format the date for daily data (e.g., "MM/DD" or "MM/DD/YYYY")
  const formatDate = (date) => {
    const options = { month: 'short', day: 'numeric' }; // e.g., "Dec 13"
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboards-container">
      <div className="content">
        <h2 className="dashboard-heading">Dashboard</h2>
        <div className="dashboard">
          <StatCard Route="/a/users" title="Total User" count={stats.totalUsers} icon={<FontAwesomeIcon icon={faUser} size="2x" />} color="#4a90e2"/>
          <StatCard Route="/a/events" title="Total Events" count={stats.totalEvents} icon={<FontAwesomeIcon icon={faCalendarCheck} size="2x" />} color="#ffe600"/>
          <StatCard Route="/a/events" title="Upcoming Events" count={stats.upcomingEvents} icon={<FontAwesomeIcon icon={faCalendarCheck} size="2x" />} color="#9b51e0" />
          <StatCard Route="/a/events" title="Successful Events" count={stats.successfulEvents || 0} icon={<FontAwesomeIcon icon={faCalendarCheck} size="2x" />} color="#34c759" />
          <StatCard Route="/a/events" title="Canceled Events" count={stats.canceledEvents} icon={<FontAwesomeIcon icon={faBan} size="2x" />} color="#ff3b30" />
        </div>

        {/* Pass daily data to the Chart */}
        <Chart 
          data={stats.dailyUserData.map(({ date, totalUsers, activeUsers }) => ({
            name: formatDate(date), // Format date to short format
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