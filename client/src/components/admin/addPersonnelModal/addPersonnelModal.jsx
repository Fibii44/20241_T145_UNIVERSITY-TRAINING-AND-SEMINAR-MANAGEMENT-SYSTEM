import React, { useState, useEffect } from "react";
import "./addPersonnelModal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

const AddPersonnelModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    profilePicture: null,
    name: "",
    email: "",
    phoneNumber: "",
    college: "",
    department: "",
    gender: "",
    position: "",
    role: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");

    const checkAccess = async () => {
      try {
        const response = await fetch("http://localhost:3000/a/personnel", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 403) {
          navigate("/a/dashboard");
        }
      } catch (error) {
        console.error("Access check failed:", error);
      }
    };

    checkAccess();
  }, [navigate]);

  const colleges = [
    "College of Arts and Sciences",
    "College of Business",
    "College of Education",
    "College of Law",
    "College of Public Administration and Governance",
    "College of Nursing",
    "College of Technologies",
    "Others"
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
    "Others": [],
  };

  const roles = ["departmental_admin", "faculty_staff"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear the department field when the college changes
    if (name === "college") {
      setFormData({
        ...formData,
        college: value,
        department: "", // Reset department
      });
    }
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
      college: "",
      department: "",
      gender: "",
      position: "",
      role: "",
    });
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }

    // Log all form data for debugging
    console.log("Form data being submitted:", {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      phoneNumber: formData.phoneNumber,
      college: formData.college,
      department: formData.department,
      position: formData.position,
      profilePicture: formData.profilePicture ? `[File: ${formData.profilePicture.name}]` : null
    });

    const data = new FormData();
    
    // Handle each form field individually to ensure proper formatting
    if (formData.profilePicture) {
      console.log("Adding profile picture to form data:", formData.profilePicture.name);
      data.append("profilePicture", formData.profilePicture);
    }
    
    data.append("name", formData.name || "");
    data.append("email", formData.email || "");
    data.append("phoneNumber", formData.phoneNumber || "");
    data.append("college", formData.college || "");
    data.append("department", formData.department || "");
    data.append("position", formData.position || "");
    data.append("role", formData.role || "");

    try {
      console.log("Sending user data to server at http://localhost:3000/a/personnel");
      console.log("Auth token present:", !!token);
      
      const response = await fetch("http://localhost:3000/a/personnel", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't include Content-Type for FormData with files
        },
        body: data,
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Server error response:", errorResponse);
        setError(errorResponse.message || "Failed to create user account");
      } else {
        console.log("User added successfully");
        handleCancel();
        // Optional: refresh the user list
        window.location.reload();
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Check if server is running
      try {
        console.log("Checking if server is reachable...");
        const pingResponse = await fetch("http://localhost:3000/", { 
          method: "HEAD",
          mode: "no-cors" 
        });
        console.log("Server ping response:", pingResponse);
      } catch (pingErr) {
        console.error("Server ping failed:", pingErr);
      }
      
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
              College:
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                required
              >
                <option value="">Select College</option>
                {colleges.map((college) => (
                  <option key={college} value={college}>
                    {college}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Department:
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                disabled={!formData.college}
              >
                <option value="">Select Department</option>
                {formData.college &&
                  departments[formData.college].map((dept) => (
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
            <div
              className="personnel-modal-buttons"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
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
