import React from 'react';
import { Link } from 'react-router-dom';
import './notFound.css'; // Import the CSS file

const NotFound = () => {
    return (
        <div className="not-found-container">
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you're looking for doesn't exist.</p>
            <Link to="/a/dashboard">Go back to Home</Link>
        </div>
    );
};

export default NotFound;
