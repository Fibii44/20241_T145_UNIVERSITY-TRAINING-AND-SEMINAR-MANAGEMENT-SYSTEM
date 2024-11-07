import React, { useState, useEffect } from 'react';
import { Button, Form, Image, Container, Row, Col } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const Profile = ({ token }) => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    // Decode JWT token to extract user details
    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            const storedUser = JSON.parse(sessionStorage.getItem('userData'));  // Get the updated user data
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
                    department: decoded.department || '',  
                    position: decoded.position || '',  
                });
            }
        }
    }, []);

    // Toggle edit mode
    const handleEditToggle = () => setIsEditing(!isEditing);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value,
        }));
    };

    // Confirm and save updates with PATCH request
    const handleSave = async () => {
        const confirmSave = window.confirm("Are you sure you want to save changes?");
        if (!confirmSave) return;
    
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            // Optionally handle the case where the token is not found
            return;
        }
    
        try {
            // Avoid logging the Authorization header
            const response = await axios.patch(
                'http://localhost:3000/u/profile',
                {
                    phoneNumber: user.phoneNumber,
                    department: user.department,
                    position: user.position,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,  // This sends the token without logging it
                    },
                }
            );
    
            if (response.status === 200) {
                const updatedUser = {
                    ...user,
                    phoneNumber: response.data.phoneNumber,
                    department: response.data.department,
                    position: response.data.position,
                };
    
                // Save the updated data to sessionStorage
                sessionStorage.setItem('authToken', token);  
                sessionStorage.setItem('userData', JSON.stringify(updatedUser));  
    
                setUser(updatedUser);
                setIsEditing(false);
            }
        } catch (error) {
            // Handle error silently without logging sensitive information
            console.error("Error while saving profile:", error);
        }
    };
    return (
        <Container>
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
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={user.email}
                                disabled
                            />
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

                        <Form.Group controlId="formDepartment">
                            <Form.Label>Department</Form.Label>
                            <Form.Select
                                name="department"
                                value={user.department}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            >
                                <option value="College of Arts and Sciences">College of Arts and Sciences</option>
                                <option value="College of Technologies">College of Technologies</option>
                                <option value="College of Nursing">College of Nursing</option>
                                <option value="College of Business">College of Business</option>
                                <option value="College of Education">College of Education</option>
                            </Form.Select>
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
                            <Button variant="outline-primary" onClick={handleEditToggle} className="mt-3">
                                Edit Profile
                            </Button>
                        ) : (
                            <div>
                                <Button variant="primary" onClick={handleSave} className="mt-3">
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
        </Container>
    );
};

export default Profile;
