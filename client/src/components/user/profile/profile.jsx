import React, { useState, useEffect } from 'react';
import { Button, Form, Image, Container, Row, Col } from 'react-bootstrap';
import {jwtDecode} from 'jwt-decode'; // Note: No braces needed for jwtDecode
import axios from 'axios';

const Profile = ({ token }) => {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    // Decode JWT token to extract user details
    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            const decoded = jwtDecode(token);
            setUser({
                id: decoded.id,
                name: decoded.name || 'Anonymous User',
                email: decoded.email,
                profileImage: decoded.profilePicture, // Consistent naming
                role: decoded.role,
                phoneNumber: decoded.phoneNumber || '',
                department: decoded.department || '',
                position: decoded.position || '',
            });
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

    // Save updates with PATCH request
    const handleSave = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
    
            // Log the token to ensure it’s correct
            console.log('Auth Token:', token);
    
            const response = await axios.patch(
                'http://localhost:5000/u/profile',  // Remove `${user.id}`
                {
                    phoneNumber: user.phoneNumber,
                    department: user.department,
                    position: user.position,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,  // Ensure this header is being sent correctly
                    },
                }
            );
    
            console.log('Response data from server:', response.data);
    
            // Update the user state with the new data from the server
            setUser((prevUser) => ({
                ...prevUser,
                ...response.data.user,  // Update user with updated profile data
            }));
    
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            // Detailed error logging
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
    
                // Use a fallback message in case `error.response.data.message` is undefined
                const message = error.response.data.message || 'An unknown error occurred on the server';
                alert(`Failed to update profile. Server responded with: ${message}`);
            } else if (error.request) {
                console.error('Error request data:', error.request);
                alert('Failed to update profile. No response received from server.');
            } else {
                console.error('Error message:', error.message);
                alert(`Failed to update profile. Error: ${error.message}`);
            }
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

                    {isEditing ? (
                        <Form>
                            <Form.Group controlId="formEmail">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    disabled // Keep disabled if you don't want it editable
                                />
                            </Form.Group>

                            <Form.Group controlId="formPhoneNumber">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phoneNumber" // Match the state key
                                    value={user.phoneNumber}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Form.Group controlId="formDepartment">
                                <Form.Label>Department</Form.Label>
                                <Form.Select
                                    name="department"
                                    value={user.department}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Department</option>
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
                                />
                            </Form.Group>

                            <Button variant="primary" onClick={handleSave} className="mt-3">
                                Save Changes
                            </Button>
                            <Button variant="secondary" onClick={handleEditToggle}>
                                Cancel
                            </Button>
                        </Form>
                    ) : (
                        <Button variant="outline-primary" onClick={handleEditToggle}>
                            Edit Profile
                        </Button>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Profile;
