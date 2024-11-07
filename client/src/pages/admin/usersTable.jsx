import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../components/admin/adminbar/sidebar';
import Topbar from '../../components/admin/adminbar/topbar';
import "./css/usersTable.css";
import { jwtDecode } from 'jwt-decode';

const UsersTable = ({ users, onDelete, onUpdate }) => (
  <div className="table-container">
    <div className="table-responsive">
      <table className="custom-table">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Position</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <UserRow
              key={user._id || index}
              user={user}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const UserRow = ({ user, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      position: user.position,
      department: user.department,
      status: user.status,
    });
  }, [user]);

  const handleSave = () => {
    if (window.confirm("Are you sure you want to save these changes?")) {
      onUpdate(user._id, formData);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      onDelete(user._id);
    }
  };

  return (
    <tr>
      <td>{user._id}</td>
      {isEditing ? (
        <>

          <td><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></td>
          <td><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></td>

          <td>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="faculty_staff">Faculty Staff</option>
              <option value="departmental_admin">Departmental Admin</option>
              <option value="general_admin">General Admin</option>
            </select>
          </td>
          <td><input type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} /></td>
          <td>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="none">None</option>
              <option value="College of Arts and Sciences">College of Arts and Sciences</option>
              <option value="College of Business">College of Business</option>
              <option value="College of Education">College of Education</option>
              <option value="College of Law">College of Law</option>
              <option value="College of Nursing">College of Nursing</option>
              <option value="College of Technologies">College of Technologies</option>
            </select>
          </td>
          <td>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="inactive">inactive</option>
              <option value="active">active</option>
            </select>
          </td>
        </>
      ) : (
        <>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.role}</td>
          <td>{user.position}</td>
          <td>{user.department}</td>
          <td>{user.status}</td>
        </>
      )}
      <td>
        {isEditing ? (
          <>
            <button className="table_save" onClick={handleSave}>Save</button>
            <button className="table_cancel" onClick={() => setIsEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="table_edit" onClick={() => setIsEditing(true)}>Edit</button>
            <button className="table_delete" onClick={handleDelete}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
};


const Table = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({ users: [] });
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Step 1: Define state for current user

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/a/dashboard');
        setStats(response.data);
        setFilteredUsers(response.data.users);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const filtered = stats.users.filter(user => {
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesDepartment && matchesRole;
    });
    setFilteredUsers(filtered);
  }, [departmentFilter, roleFilter, stats.users]);

  //Retrieve the name of the in session user
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded.name);
    }
  }, []);

  //Upddate Data
  const handleUpdate = async (userId, formData) => {
    try {
      await axios.put(`http://localhost:3000/a/users/${userId}`, formData);
      setFilteredUsers(filteredUsers.map(user => (user._id === userId ? { ...user, ...formData } : user)));
    } catch (err) {
      console.log(err);
    }
  };

  //Delete Data
  const handleDelete = async (userId) => {
    try {
      const deletedBy = currentUser; // Use the current user's name
      await axios.delete(`http://localhost:3000/a/users/${userId}`, { data: { deletedBy } });
      setFilteredUsers(filteredUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.log(err);
    }
  };


  return (
    <div className="dashboard-container">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} activePage="users" />
      <div className="content">
        <Topbar />
        <div className="header-container">
          <h2>Users Table</h2>
          <div className="filter-header">
            <div className="filter">
              <label htmlFor="departmentFilter">Department:</label>
              <select
                id="departmentFilter"
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setRoleFilter('all');
                }}
              >
                <option value="all">All</option>
                <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                <option value="College of Business">College of Business</option>
                <option value="College of Education">College of Education</option>
                <option value="College of Law">College of Law</option>
                <option value="College of Nursing">College of Nursing</option>
                <option value="College of Technologies">College of Technologies</option>
              </select>
            </div>
            <div className="filter">
              <label htmlFor="roleFilter">Role:</label>
              <select
                id="roleFilter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="departmental_admin">Departmental Admin</option>
                <option value="faculty_staff">Faculty Staff</option>
                <option value="general_admin">General Admin</option>
              </select>
            </div>
          </div>
        </div>

        <UsersTable
          users={filteredUsers}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};

export default Table;