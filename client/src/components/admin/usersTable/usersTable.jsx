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

// College and Department Data
const colleges = [
  "College of Arts and Sciences",
  "College of Business",
  "College of Education",
  "College of Law",
  "College of Public Administration and Governance",
  "College of Nursing",
  "College of Technologies",
];

const departments = {
  "College of Arts and Sciences": [
    "Social Sciences",
    "Sociology",
    "Philosophy",
    "Biology",
    "Environmental Science",
    "Mathematics",
    "English",
    "Economics",
    "Communication",
    "Social Work",
  ],
  "College of Business": [
    "Accountancy",
    "Business Administration",
    "Hospitality Management",
    "Management",
  ],
  "College of Education": [
    "Secondary Education",
    "Early Childhood Education",
    "Elementary Education",
    "Physical Education",
    "English Language and Literature",
  ],
  "College of Law": ["Juris Doctor"],
  "College of Public Administration and Governance": [],
  "College of Nursing": [],
  "College of Technologies": [
    "Information Technology",
    "Electronics Technology",
    "Automotive Technology",
    "Food Science and Technology",
    "Electronics and Communications Engineering",
  ],
};

const UsersTable = ({
  users,
  onUpdate,
  onRoleFilterChange,
  onCollegeFilterChange,
  onDepartmentFilterChange,
  onStatusFilterChange,
  selectAllChecked,
  onSelectAllChange,
  statusFilter,
  selectedCollege,
  selectedDepartment,
}) => {
  const [searchTerm, setSearchTerm] = useState(""); // State for the search bar

  // Filter department options based on the selected college
  const departmentOptions = selectedCollege ? departments[selectedCollege] || [] : [];

  // Filtered Users based on Search Term
  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-table-container">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="personnel-table-responsive">
        <table className="personnel-table">
          <thead className="thead-dark">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAllChecked}
                  onChange={onSelectAllChange}
                />
              </th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>
                <div className="filter-container">
                  <span>ROLE</span>
                  <select
                    className="filter-role"
                    onChange={(e) => onRoleFilterChange(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="faculty_staff">Faculty Staff</option>
                    <option value="departmental_admin">Departmental Admin</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </th>
              <th>POSITION</th>
              <th>
                <div className="filter-container">
                  <span>COLLEGE</span>
                  <select
                    className="filter-college"
                    value={selectedCollege || "all"}
                    onChange={(e) => {
                      const selectedCollege = e.target.value;
                      onCollegeFilterChange(selectedCollege);
                      onDepartmentFilterChange("all"); // Reset department filter when college changes
                    }}
                  >
                    <option value="all">All</option>
                    {colleges.map((college) => (
                      <option key={college} value={college}>
                        {college}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th>
                <div className="filter-container">
                  <span>DEPARTMENT</span>
                  <select
                    className="filter-department"
                    value={selectedDepartment || "all"}
                    onChange={(e) => onDepartmentFilterChange(e.target.value)}
                  >
                    <option value="all">All</option>
                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th>
                <div className="filter-container">
                  <span>STATUS</span>
                  <select
                    className="filter-status"
                    onChange={(e) => onStatusFilterChange(e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <UserRow
                key={user._id}
                user={user}
                onUpdate={onUpdate}
                selectAllChecked={selectAllChecked}
                showInactive={statusFilter === "inactive"}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


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
      college: user.college,
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
    console.log("Archiving user with ID:", user._id);
    console.log("Updated user data:", { ...user, status: "inactive" });
  
    setModalAction(() => () => {
      const updatedUser = { ...user, status: "inactive" };
      onUpdate(user._id, updatedUser);
  
      // Update filteredUsers immediately after the archive action
      setFilteredUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: 'inactive' } : u));
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

 // Handle college change and update department options
 const handleCollegeChange = (e) => {
  const selectedCollege = e.target.value;
  setFormData({ ...formData, college: selectedCollege, department: '' });
};

// Handle department change
const handleDepartmentChange = (e) => {
  setFormData({ ...formData, department: e.target.value });
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
            <select className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="faculty_staff">Faculty Staff</option>
              <option value="departmental_admin">Departmental Admin</option>
              <option value="admin">Admin</option>
            </select>
          </td>
          <td><input className="form-control" type="text" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} /></td>
          <td>
            <select className="form-select" value={formData.college} onChange={handleCollegeChange}>
              <option value="none">None</option>
              <option value="College of Arts and Sciences">College of Arts and Sciences</option>
              <option value="College of Business">College of Business</option>
              <option value="College of Education">College of Education</option>
              <option value="College of Law">College of Law</option>
              <option value="College of Nursing">College of Nursing</option>
              <option value="College of Public Administration and Governance">College of Public Administration and Governance</option>
              <option value="College of Technologies">College of Technologies</option>
            </select>
          </td>
          <td>
            <select className="form-select" value={formData.department} onChange={handleDepartmentChange}>
              <option value="">Select Department</option>
              {departments[formData.college]?.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
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
          <td>{user.college}</td>
          <td>{user.department}</td>
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
  const [collegeFilter, setCollegeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [filteredUsers, setFilteredUsers] = useState([]); // Default to an empty array
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {

    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");

    const checkAccess = async () => {
      try {
        const response = await fetch('http://localhost:3000/a/users', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          navigate('/a/dashboard');
        }
      } catch (error) {
        console.error("Access check failed:", error);
      }
    };
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/a/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;

        // Ensure stats.users is always an array
        setStats({ users: data.users || [] });
        setFilteredUsers(data.users || []); // Default to an empty array if undefined
      } catch (err) {
        console.log(err);
      }
    };
    checkAccess();
    fetchStats();
  }, [navigate]);

  useEffect(() => {
    const filtered = stats.users.filter(user => {
      const matchesCollege = collegeFilter === 'all' || user.college === collegeFilter;
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesCollege && matchesDepartment && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);  // Reset to page 1 whenever filters change
  }, [collegeFilter, departmentFilter, roleFilter, statusFilter, stats.users]);

  const handleUpdate = async (userId, formData) => {
    try {
      const response = await axios.put(`http://localhost:3000/a/users/${userId}`, formData);
      console.log("Update successful:", response.data);
      setFilteredUsers(filteredUsers.map(user => (user._id === userId ? { ...user, ...formData } : user)));
      setStats(prevStats => ({ 
        ...prevStats, 
        users: prevStats.users.map(user => 
          user._id === userId ? { ...user, ...formData } : user
        )
      }));
      
    } catch (err) {
      console.log("Error updating user:", err);
      if (err.response) {
        console.log("Error response:", err.response);
      }
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = (filteredUsers || []).slice(indexOfFirstUser, indexOfLastUser);

  const onSelectAllChange = () => setSelectAllChecked(!selectAllChecked);
  const totalPages = Math.ceil((filteredUsers?.length || 0) / rowsPerPage);

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
              <label htmlFor="collegeFilter">Colleges:</label>
              <select
                id="collegeFilter"
                value={collegeFilter}
                onChange={(e) => {
                  setCollegeFilter(e.target.value);
                  setDepartmentFilter('all'); // Reset department filter when college changes
                }}
              >
                <option value="all">All</option>
                {colleges.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label htmlFor="departmentFilter">Departments:</label>
              <select
                id="departmentFilter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                disabled={collegeFilter === 'all'}
              >
                <option value="all">All</option>
                {collegeFilter !== 'all' &&
                  departments[collegeFilter]?.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
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
                <option value="faculty_staff">Faculty Staff</option>
                <option value="departmental_admin">Departmental Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="filter">
              <label htmlFor="statusFilter">Status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
          onDepartmentFilterChange={setDepartmentFilter} onCollegeFilterChange={setCollegeFilter}
          onStatusFilterChange={setStatusFilter} statusFilter={statusFilter} selectedCollege={collegeFilter}
          selectedDepartment={departmentFilter}/>
        
        <div className="pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>
            Prev
          </button>

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
