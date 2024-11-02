import { useState, useEffect } from 'react';
import './add-personnel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from 'react-router-dom';
import { faCamera, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    profilePicture: null,
    name: '',
    email: '',
    phoneNumber: '',
    department: '',
    gender: '',
    position: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    // Check if user has access to this page
    const checkAccess = async () => {
      try {
        const response = await fetch('http://localhost:3000/a/personnel', {
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

    checkAccess();
  }, [navigate]);

  const departments = [
    'None',
    'College of Arts and Sciences',
    'College of Business',
    'College of Education',
    'College of Nursing',
    'College of Technologies',
    'College of Public Administration and Governance',
  ];

  const roles = ['departmental_admin', 'faculty_staff'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profilePicture: e.target.files[0],
    });
  };

  const handleTogglePassword = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleCancel = () => {
    setFormData({
      profilePicture: null,
      name: '',
      email: '',
      phoneNumber: '',
      department: '',
      gender: '',
      position: '',
      password: '',
      confirmPassword: '',
      role: '',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Retrieve token from localStorage just before the request
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }

    const data = new FormData();
    data.append("profilePicture", formData.profilePicture);
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phoneNumber", formData.phoneNumber);
    data.append("department", formData.department);
    data.append("gender", formData.gender);
    data.append("position", formData.position);
    data.append("password", formData.password);
    data.append("role", formData.role);

    try {
      const response = await fetch('http://localhost:3000/a/personnel', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Set token if available
        },
        body: data,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        setError(errorResponse.message);
      } else {
        console.log("User added successfully");
        handleCancel();
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add User Account</h3>

      <label className="profile-picture-label">
        <div className="profile-picture">
          <FontAwesomeIcon icon={faCamera} className="camera-icon" />
          <input
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </label>

      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Phone Number:
        <input
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        College Department:
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </label>

      <label>
        Position:
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Role:
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>

      <label>
        Password:
        <div className="password-container">
          <input
            type={showPassword.password ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <FontAwesomeIcon
            icon={showPassword.password ? faEyeSlash : faEye}
            onClick={() => handleTogglePassword("password")}
            className="eye-icon"
          />
        </div>
      </label>

      <label>
        Re-enter Password:
        <div className="password-container">
          <input
            type={showPassword.confirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <FontAwesomeIcon
            icon={showPassword.confirmPassword ? faEyeSlash : faEye}
            onClick={() => handleTogglePassword("confirmPassword")}
            className="eye-icon"
          />
        </div>
      </label>

      {error && <p className="error-message">{error}</p>}
      <div className="buttons">
        <button type="submit">Add User</button>
        <button type="button" onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddUserForm;
