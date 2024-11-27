import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./usersTable.css";
import { jwtDecode } from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddPersonnelModal from "../addPersonnelModal/addPersonnelModal";
import { faEdit, faSave, faTimes, faArchive, faUserPlus, faRedo } from '@fortawesome/free-solid-svg-icons';
import ConfirmArchiveModal from "../../modals/archiveConfirmModal/confirmArchiveModal"
import SaveModal from "../../modals/saveConfirmModal/confirmSaveModal"
import RestoreModal from "../../modals/restoreModal/restoreModal"
import defaultEventPicture from '../../../assets/default-profile.png'


const UsersTable = ({ 
  users, 
  onDelete, 
  onUpdate, 
  selectAllChecked, 
  onSelectAllChange, 
  onRoleFilterChange, 
  onDepartmentFilterChange, 
  onStatusFilterChange, 
  statusFilter 
}) => (

  <div className="user-table-container"> 
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
            showInactive={statusFilter === 'inactive'}  // Pass this prop to UserRow
          />
        ))}
      </tbody>
    </table>
  </div>
  </div>
);


const UserRow = ({ user, onUpdate, selectAllChecked, showInactive }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [isChecked, setIsChecked] = useState(selectAllChecked);

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const [modalAction, setModalAction] = useState(null);
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
    setModalAction(() => () => {
      onUpdate(user._id, formData);
      setIsEditing(false);
    });
    setIsSaveModalOpen(true);
  };

  const handleArchive = () => {
    setModalAction(() => () => {
      const updatedUser = { ...user, status: "inactive" };
      onUpdate(user._id, updatedUser);
    });
    setIsArchiveModalOpen(true);
  };
  const handleRestore = () => {
    setModalAction(() => () => {
      const updatedUser = { ...user, status: "active" };
      onUpdate(user._id, updatedUser);
    });
    setIsRestoreModalOpen(true);
  };

  return (
    <>
      <ConfirmArchiveModal
        isOpen={isArchiveModalOpen}
        title="Archive User?"
        message="This user will be inactive"
        onConfirm={() => {
          modalAction();
          setIsArchiveModalOpen(false);
        }}
        onCancel={() => setIsArchiveModalOpen(false)}
      />
      <SaveModal
        isOpen={isSaveModalOpen}
        title="Save Changes"
        message="Changes will be permanently saved."
        onConfirm={() => {
          modalAction();
          setIsSaveModalOpen(false);
        }}
        onCancel={() => setIsSaveModalOpen(false)}
      />
      <RestoreModal
        isOpen={isRestoreModalOpen}
        title="Restore User"
        message="This user will be active and can be used."
        onConfirm={() => {
          modalAction();
          setIsRestoreModalOpen(false);
        }}
        onCancel={() => setIsRestoreModalOpen(false)}
      />
    <tr className={isChecked ? "row-selected" : ""}>
      <td width="1%">
        <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
      </td>

      {isEditing ? (
        <>
          <td><input className="form-control" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></td>
          <td><input className="form-control" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></td>
          <td>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="faculty_staff">Faculty Staff</option>
              <option value="departmental_admin">Departmental Admin</option>
              <option value="general_admin">General Admin</option>
            </select>
          </td>
          <td><input className="form-control" type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} /></td>
          <td>
            <select
              className="form-select"
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
            <span>{formData.status}</span>
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
       <td className="button-actions">
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
            {user.status === 'inactive' ? (
              <button className="table_restore" onClick={handleRestore}>
                <FontAwesomeIcon icon={faRedo} />
              </button>
            ) : (
              <button className="table_archive" onClick={handleArchive}>
                <FontAwesomeIcon icon={faArchive} />
              </button> 
            )}
          </>
        )}
      </td>
    </tr>
    </>
  );
};

const Table = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [stats, setStats] = useState({ users: [] });
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null); // Step 1: Define state for current user
  const [selectAllChecked, setSelectAllChecked] = useState(false);

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
      const matchesStatus = user.status === statusFilter;
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


  useEffect(() => {
    const filtered = stats.users.filter(user => {
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = user.status === statusFilter;
      return matchesDepartment && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
  }, [departmentFilter, roleFilter, statusFilter, stats.users]);

  // Update Data
  const handleUpdate = async (userId, formData) => {
    try {
      await axios.put(`http://localhost:3000/a/users/${userId}`, formData);
      setFilteredUsers(filteredUsers.map(user => (user._id === userId ? { ...user, ...formData } : user)));
   
      setStats(prevStats => ({ 
        ...prevStats, 
        users: prevStats.users.map(user => 
          user._id === userId ? { ...user, ...formData } : user
        )
      }));
    } catch (err) {
      console.log(err);
    }
  };

  

  // Pagination Logic
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;

  // Paginate filtered users (those that are filtered by status)
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const onSelectAllChange = () => setSelectAllChecked(!selectAllChecked);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

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


        <UsersTable users={getCurrentPageData()} onUpdate={handleUpdate} selectAllChecked={selectAllChecked}
          onSelectAllChange={onSelectAllChange} onRoleFilterChange={setRoleFilter}
          onDepartmentFilterChange={setDepartmentFilter}
          onStatusFilterChange={setStatusFilter} />
          
          <div className="pagination">
        <button onClick={handlePrev} disabled={currentPage === 1}>
          Prev
        </button>
        
        {/* Render page numbers */}
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        
        <button onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
    </div>
  );
};

export default Table;
