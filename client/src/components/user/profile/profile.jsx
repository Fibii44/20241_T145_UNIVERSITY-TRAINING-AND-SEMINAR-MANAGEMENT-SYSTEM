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
        <div>
            <Container>
                <Row className="justify-content-center">
                    <Col md={6}>
                        <div className="text-center">
                            <Image
                                src={user.profileImage || ProfilePic}
                                roundedCircle
                                width="150"
                                height="150"
                                alt="Profile"
                            />
                        </div>
                        <h2 className="text-center mt-3">{user.name}</h2>
                        <p className="text-center text-muted">{user.email}</p>

                        <Form>
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
                                    className="profile-college-select"
                                >
                                    <option value="">Select a College</option>
                                    {colleges.map((college) => (
                                        <option 
                                            key={college} 
                                            value={college}
                                            style={college === "College of Public Administration & Governance" ? {
                                                whiteSpace: 'pre-wrap',
                                                height: 'auto'
                                            } : {}}
                                        >
                                            {college === "College of Public Administration & Governance" 
                                                ? "College of Public Administration &\nGovernance"
                                                : college}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="formDepartment">
                                <Form.Label>Department</Form.Label>
                                <Form.Select
                                    name="department"
                                    value={formData.department || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing || !formData.college}
                                >
                                    <option value="">Select a Department</option>
                                    {(departments[formData.college] || []).map((department) => (
                                        <option key={department} value={department}>
                                            {department}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="formPhoneNumber">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Form.Group>

                            <Form.Group controlId="formPosition">
                                <Form.Label>Position</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="position"
                                    value={formData.position || ''}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Form.Group>

                            {!isEditing ? (
                                <Button variant="outline-primary" onClick={handleEditToggle} className="edit mt-3">
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className='save-btns'>
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowConfirmModal(true)}
                                        className="save mt-3"
                                    >
                                        Save Changes
                                    </Button>
                                    <Button variant="secondary" onClick={handleEditToggle} className="mt-3">
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </Form>
                    </Col>
                </Row>

                <Confirm
                    show={showConfirmModal}
                    onHide={() => setShowConfirmModal(false)}
                    onConfirm={handleSave}
                    message="Are you sure you want to save changes?"
                />
            </Container>
        </div>
    );
};

export default Profile;
