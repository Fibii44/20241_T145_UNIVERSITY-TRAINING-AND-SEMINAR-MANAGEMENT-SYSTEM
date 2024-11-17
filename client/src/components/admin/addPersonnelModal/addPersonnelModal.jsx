import React, { useState, useEffect } from "react";
import "./addPersonnelModal.css"; // Create this CSS file for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

const AddPersonnelModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    profilePicture: null,
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    position: "",
    role: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    // Check if user has access to this page
    const checkAccess = async () => {
      try {
        const response = await fetch("http://localhost:3000/a/personnel", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          // Redirect to a different page if access is denied
          navigate("/a/dashboard"); // Change this to your desired redirect path
        }
      } catch (error) {
        console.error("Access check failed:", error);
      }
    };

    checkAccess();
  }, [navigate]);

  const departments = [
    "None",
    "College of Arts and Sciences",
    "College of Business",
    "College of Education",
    "College of Nursing",
    "College of Technologies",
    "College of Public Administration and Governance",
  ];

  const roles = ["departmental_admin", "faculty_staff"];

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

  const handleCancel = () => {
    setFormData({
      profilePicture: null,
      name: "",
      email: "",
      phoneNumber: "",
      department: "",
      gender: "",
      position: "",
      role: "",
    });
    setError("");
    onClose(); // Close the modal
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    data.append("role", formData.role);

    try {
      const response = await fetch("http://localhost:3000/a/personnel", {
        method: "POST",
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
        handleCancel(); // Close modal after successful submission
      }
    } catch (err) {
      setError("Failed to create account. Please try again.");
    }
  };

  if (!show) return null;

  return (
    <div className="addPersonnel modal-overlay" onClick={onClose}> 
      <div
        className="add-personnel-modal shadow-md"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="personnel-modal-content">
        <form className="add-personnel-form" onSubmit={handleSubmit}>
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

            {error && <p className="error-message">{error}</p>}
            <div className="personnel-modal-buttons"  style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
              <button type="submit">Add User</button>
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPersonnelModal;