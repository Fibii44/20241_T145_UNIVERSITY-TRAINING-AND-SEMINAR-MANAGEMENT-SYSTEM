import React, { useState, useEffect } from 'react';
import { Button, Form, Image, Container, Row, Col } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Confirm from '../../modals/saveProfile/saveProfile';
import './profile.css';

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


const Profile = ({ token }) => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Manage modal visibility

    // Decode JWT token to extract user details
    useEffect(() => {
        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        if (token) {
            const storedUser = JSON.parse(sessionStorage.getItem('userData'));
            if (storedUser) {
                setUser(storedUser);
            } else {
                const decoded = jwtDecode(token);
                setUser({
                    id: decoded.id,
                    name: decoded.name || 'Anonymous User',
                    email: decoded.email,
                    profileImage: decoded.profilePicture,
                    role: decoded.role,
                    phoneNumber: decoded.phoneNumber || '',
                    college: decoded.college || '',
                    department: decoded.department || '',
                    position: decoded.position || '',
                });
                
            }
        }
    }, []);

    const handleEditToggle = () => setIsEditing(!isEditing);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        setShowConfirmModal(false); // Close modal after confirming

        const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
        const stayLoggedIn = localStorage.getItem('stayLoggedIn') === 'true';
        if (!token) return;

        try {
            const response = await axios.patch(
                'http://localhost:3000/u/profile',
                {
                    phoneNumber: user.phoneNumber,
                    college: user.college,
                    department: user.department,
                    position: user.position,
                    stayLoggedIn: stayLoggedIn,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                const updatedUser = {
                    ...response.data.user,
                    profileImage: user.profileImage || response.data.user.profileImage, // Preserve profileImage
                };
                const newToken = response.data.token;
                if (stayLoggedIn) {
                    localStorage.setItem('authToken', newToken);
                    localStorage.setItem('userData', JSON.stringify(updatedUser));
                } else {
                    sessionStorage.setItem('authToken', newToken);
                    sessionStorage.setItem('userData', JSON.stringify(updatedUser));
                }

                setUser(updatedUser);
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Error while saving profile:", error);
        }
    };

    return (
        <div>

            <Container>
                {/* Confirmation Modal */}

                <Row className="justify-content-center">

                    <Col md={6}>
                        <div className="text-center">

                            <Image
                                src={user.profileImage}
                                roundedCircle
                                width="150"
                                height="150"
                                alt="Profile"
                            />
                        </div>
                        <h2 className="text-center mt-3">{user.name}</h2>
                        <p className="text-center text-muted">{user.email}</p>

                        <Form>
                            <Form.Group controlId="formCollege">
                                <Form.Label>College</Form.Label>
                                <Form.Select
                                    name="college"
                                    value={user.college}
                                    onChange={(e) => {
                                        handleInputChange(e); // Update the selected college
                                        setUser((prevUser) => ({
                                            ...prevUser,
                                            department: "", // Reset department when college changes
                                        }));
                                    }}
                                    disabled={!isEditing}
                                >
                                    <option value="">Select a College</option>
                                    {colleges.map((college) => (
                                        <option key={college} value={college}>
                                            {college}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="formDepartment">
                                <Form.Label>Department</Form.Label>
                                <Form.Select
                                    name="department"
                                    value={user.department}
                                    onChange={handleInputChange}
                                    disabled={!isEditing || !user.college}
                                >
                                    <option value="">Select a Department</option>
                                    {(departments[user.college] || []).map((department) => (
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
                                    value={user.phoneNumber}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                />
                            </Form.Group>



                            <Form.Group controlId="formPosition">
                                <Form.Label>Position</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="position"
                                    value={user.position}
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
                                        onClick={() => setShowConfirmModal(true)} // Show modal on save
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
