import { useState } from 'react';
import './add-personnel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    profilePicture: null,
    name: '',
    phoneNumber: '',
    department: '',
    gender: '',
    position: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [error, setError] = useState('');

  const departments = [
    'None',
    'College of Arts and Sciences',
    'College of Business',
    'College of Education',
    'College of Nursing',
    'College of Technologies',
  ];

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
      phoneNumber: '',
      department: '',
      gender: '',
      position: '',
      password: '',
      confirmPassword: '',
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');
    console.log('Form Data:', formData);
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
      <div className='buttons'>
        <button type="submit">Add User</button>
        <button type="button" onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddUserForm;