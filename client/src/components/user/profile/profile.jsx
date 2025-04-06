import React, { useState, useEffect } from 'react';
import { Button, Form, Image, Container, Row, Col } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Confirm from '../../modals/saveProfile/saveProfile';
import './profile.css';
import ProfilePic from "../../../assets/default-profile.png";
// College and Department Data
const colleges = [
    "College of Arts and Sciences",
    "College of Business",
    "College of Education",
    "College of Law",
    "College of Public Administration & Governance",
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


const Profile = ({ token }) => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (token) {
            const storedUser = JSON.parse(sessionStorage.getItem('userData'));
            if (storedUser) {
                setUser(storedUser);
                setFormData(storedUser);
            } else {
                const decoded = jwtDecode(token);
                const userData = {
                    id: decoded.id,
                    name: decoded.name || 'Anonymous User',
                    email: decoded.email,
                    profileImage: decoded.profilePicture,
                    role: decoded.role,
                    phoneNumber: decoded.phoneNumber || '',
                    college: decoded.college || '',
                    department: decoded.department || '',
                    position: decoded.position || '',
                };
                setUser(userData);
                setFormData(userData);
            }
        }
    }, []);

    const handleEditToggle = () => {
        if (isEditing) {
            setFormData(user);
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setShowConfirmModal(false);

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const stayLoggedIn = localStorage.getItem('stayLoggedIn') === 'true';
        
        if (!token) {
            console.error("No authentication token found");
            return;
        }

        try {
            console.log("Attempting to save profile with data:", {
                phoneNumber: formData.phoneNumber,
                college: formData.college,
                department: formData.department,
                position: formData.position,
                stayLoggedIn: stayLoggedIn,
            });

            const response = await axios.patch(
                'http://localhost:3000/u/profile',
                {
                    phoneNumber: formData.phoneNumber,
                    college: formData.college,
                    department: formData.department,
                    position: formData.position,
                    stayLoggedIn: stayLoggedIn,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log("Server response:", response);

            if (response.status === 200) {
                const updatedUser = {
                    ...response.data.user,
                    profileImage: formData.profileImage || response.data.user.profileImage,
                };
                const newToken = response.data.token;
                
                console.log("Updating local storage with new data");
                if (stayLoggedIn) {
                    localStorage.setItem('authToken', newToken);
                    localStorage.setItem('userData', JSON.stringify(updatedUser));
                } else {
                    sessionStorage.setItem('authToken', newToken);
                    sessionStorage.setItem('userData', JSON.stringify(updatedUser));
                }

                setUser(updatedUser);
                setFormData(updatedUser);
                setIsEditing(false);
                
                console.log("Profile update successful");
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Error while saving profile:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                console.error("Error response headers:", error.response.headers);
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <Image
                    src={user.profileImage || ProfilePic}
                    roundedCircle
                    className="profile-image"
                    alt="Profile"
                />
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-email">{user.email}</p>
            </div>

            <Form className="profile-form">
                {/* First Row - College and Department */}
                <div className="form-row">
                    <Form.Group controlId="formCollege" className="profile-form-group">
                        <Form.Label>College</Form.Label>
                        <Form.Select
                            name="college"
                            value={formData.college || ''}
                            onChange={(e) => {
                                handleInputChange(e);
                                setFormData(prev => ({
                                    ...prev,
                                    department: "",
                                }));
                            }}
                            disabled={!isEditing}
                            className="form-select"
                        >
                            <option value="">Select a College</option>
                            {colleges.map((college) => (
                                <option key={college} value={college}>
                                    {college}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="formDepartment" className="profile-form-group">
                        <Form.Label>Department</Form.Label>
                        <Form.Select
                            name="department"
                            value={formData.department || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing || !formData.college}
                            className="form-select"
                        >
                            <option value="">Select a Department</option>
                            {(departments[formData.college] || []).map((department) => (
                                <option key={department} value={department}>
                                    {department}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>

                {/* Second Row - Phone Number and Position */}
                <div className="form-row">
                    <Form.Group controlId="formPhoneNumber" className="profile-form-group">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="form-control"
                            placeholder="Enter phone number"
                        />
                    </Form.Group>

                    <Form.Group controlId="formPosition" className="profile-form-group">
                        <Form.Label>Position</Form.Label>
                        <Form.Control
                            type="text"
                            name="position"
                            value={formData.position || ''}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="form-control"
                            placeholder="Enter position"
                        />
                    </Form.Group>
                </div>

                <div className="save-btns">
                    {isEditing ? (
                        <>
                            <Button className="save" onClick={() => setShowConfirmModal(true)}>
                                Save Changes
                            </Button>
                            <Button className="cancel-btn" onClick={handleEditToggle}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button className="edit" onClick={handleEditToggle}>
                            Edit Profile
                        </Button>
                    )}
                </div>
            </Form>

            <Confirm
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                onConfirm={handleSave}
            />
        </div>
    );
};

export default Profile;
