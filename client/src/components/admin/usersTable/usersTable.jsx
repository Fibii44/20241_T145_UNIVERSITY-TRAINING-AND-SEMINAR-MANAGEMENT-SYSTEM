import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./usersTable.css";
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddPersonnelModal from "../addPersonnelModal/addPersonnelModal";
import { faEdit,  faSave, faTimes, faArchive, faUserPlus } from '@fortawesome/free-solid-svg-icons';


import defaultEventPicture from '../../../assets/default-profile.png'

const UsersTable = ({ users, onDelete, onUpdate, selectAllChecked, onSelectAllChange, onRoleFilterChange, onDepartmentFilterChange, onStatusFilterChange }) => (

  <div className="personnel-table-responsive">
    <table className="personnel-table">
      <thead className="thead-dark">
        <tr>
          <th>
            <input
              type="checkbox"
              checked={selectAllChecked}
              onChange={onSelectAllChange}
            /> {/* Select All Checkbox */}
          </th>
          <th>NAME</th>
          <th>EMAIL</th>
          <th>
            <div className="filter-container">
              <span>ROLE</span>
              <select className="filter-role" onChange={e => onRoleFilterChange(e.target.value)}>
                <option value="all">All</option>
                <option value="faculty_staff">Faculty Staff</option>
                <option value="departmental_admin">Departmental Admin</option>
                <option value="general_admin">General Admin</option>
              </select>
            </div>
          </th>
          <th>POSITION</th>
          <th>
            <div className="filter-container">
              <span>DEPARTMENT</span>
              <select className="filter-department" onChange={e => onDepartmentFilterChange(e.target.value)}>
                <option value="all">All</option>
                <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                <option value="College of Business">College of Business</option>
                <option value="College of Education">College of Education</option>
                <option value="College of Law">College of Law</option>
                <option value="College of Nursing">College of Nursing</option>
                <option value="College of Technologies">College of Technologies</option>
              </select>
            </div>
          </th>
          <th>
            <div className="filter-container">
              <span>STATUS</span>
              <select className="filter-status" onChange={e => onStatusFilterChange(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </th>
          <th>ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <UserRow
            key={user._id || index}
            user={user}
            onDelete={onDelete}
            onUpdate={onUpdate}
            selectAllChecked={selectAllChecked}
          />
        ))}
      </tbody>
    </table>
  </div>

);

const UserRow = ({ user, onDelete, onUpdate, selectAllChecked }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isChecked, setIsChecked] = useState(selectAllChecked);


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

  useEffect(() => {
    setIsChecked(selectAllChecked); // Update checkbox state when Select All changes
  }, [selectAllChecked]);

  const handleCheckboxChange = () => setIsChecked(!isChecked);

  const handleSave = () => {
    if (window.confirm("Are you sure you want to save these changes?")) {
      onUpdate(user._id, formData);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to archive this user?")) {
      onDelete(user._id);
    }
  };

  return (
    <tr className={isChecked ? "row-selected" : ""}>
      <td width="1%"> 
        <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
      </td>

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
          <td className="profile-container">
            <img
              src={user.profilePicture || defaultEventPicture}
              alt="Profile"
              className="profile-image"
            />
            {user.name}
          </td>
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
            <button className="table_save" onClick={handleSave}>
              <FontAwesomeIcon icon={faSave} />
            </button>
            <button className="table_cancel" onClick={() => setIsEditing(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </>
        ) : (
          <>
            <button className="table_edit" onClick={() => setIsEditing(true)}>
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button className="table_delete" onClick={handleDelete}>
              <FontAwesomeIcon icon={faArchive} />
            </button>
          </>
        )}
      </td>
    </tr>
  );
};
const Table = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({ users: [] });
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null); // Step 1: Define state for current user
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {

    const token = sessionStorage.getItem("authToken");
    const checkAccess = async () => {
      try {
        const response = await fetch('http://localhost:3000/a/users', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          // Redirect to a different page if access is denied
          navigate('/a/dashboard'); // Change this to your desired redirect path
        }
      } catch (error) {
        console.error("Access check failed:", error);
      }
    }

    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/a/dashboard');
        setStats(response.data);
        setFilteredUsers(response.data.users);
      } catch (err) {
        console.log(err);
      }
    };
    checkAccess();
    fetchStats();
  }, []);

  useEffect(() => {
    const filtered = stats.users.filter(user => {
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesDepartment && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  }, [departmentFilter, roleFilter, statusFilter, stats.users]);

  // Retrieve the name of the in session user
  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded.name);
    }
  }, []);

  // Update Data
  const handleUpdate = async (userId, formData) => {
    try {
      await axios.put(`http://localhost:3000/a/users/${userId}`, formData);
      setFilteredUsers(filteredUsers.map(user => (user._id === userId ? { ...user, ...formData } : user)));
    } catch (err) {
      console.log(err);
    }
  };

  // Delete Data
  const handleDelete = async (userId) => {
    try {
      const archivedBy = currentUser; // Use the current user's name
      await axios.delete(`http://localhost:3000/a/users/${userId}`, { data: { archivedBy } });
      setFilteredUsers(filteredUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.log(err);
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Next Page Handler
  const nextPage = () => {
    if (currentPage < Math.ceil(filteredUsers.length / rowsPerPage)) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Prev Page Handler
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const onSelectAllChange = () => setSelectAllChecked(!selectAllChecked);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };


  return (
    <div className="usertable-container">
      <div className="content">
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
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setDepartmentFilter('all');
                }}
              >
                <option value="all">All</option>
                <option value="faculty_staff">Faculty Staff</option>
                <option value="departmental_admin">Departmental Admin</option>
                <option value="general_admin">General Admin</option>
              </select>
            </div>
            <div className="add-personnel-button">
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  handleOpenModal(); 
                }}> 
                  <FontAwesomeIcon icon={faUserPlus} /> 
                </a>
                <AddPersonnelModal show={isModalOpen} onClose={handleCloseModal} />
              </div>
          </div>
        </div>


        <UsersTable users={currentUsers} onDelete={handleDelete} onUpdate={handleUpdate} selectAllChecked={selectAllChecked}
          onSelectAllChange={onSelectAllChange} onRoleFilterChange={setRoleFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          onStatusFilterChange={setStatusFilter} />
        <div className="pagination">
          <button onClick={prevPage} disabled={currentPage === 1}>Prev</button>
          <span>Page {currentPage} of {Math.ceil(filteredUsers.length / rowsPerPage)}</span>
          <button onClick={nextPage} disabled={currentPage === Math.ceil(filteredUsers.length / rowsPerPage)}>Next</button>
        </div>
      </div>
    </div>
  );
};

export default Table;
