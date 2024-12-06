import React, { useState } from 'react';
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
} from 'mdb-react-ui-kit';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css'; 
import Logo from '../../assets/buksu-logo.png';

function Login() {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState(''); // State for error message

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleManualLogin();
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleManualLogin = async () => {
    setErrorMessage(''); // Clear error message before attempting login
    try {
      const recaptchaToken = await executeRecaptcha('login');
      console.log("reCAPTCHA Token:", recaptchaToken);

      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password, 
          recaptchaToken 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        setErrorMessage('Invalid username or password'); // Show error message
        return;
      }

      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem('authToken', data.token);
        console.log("Token:", data.token);
        navigate(`/login/success?token=${data.token}`); // Redirect to success 
      } else {
        setErrorMessage(data.message); // Show error message from response
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage('An error occurred during login. Please try again.'); // Show generic error message
    }
  };

  return (
    <MDBContainer fluid className="login-container p-5">
      <MDBRow>
        <MDBCol md="7" className="text-center text-md-start d-flex flex-column justify-content-center">
          <h1 className="not-clickable my-5 display-1 fw-bold ls-tight px-100">
            BukSU <span style={{ color: '#FFB800' }}>Engage</span>
          </h1>
        </MDBCol>

        <MDBCol md="4">
          <MDBCard className="bg-white my-5 mx-auto" style={{ borderRadius: '1rem', maxWidth: '500px' }}>
            <MDBCardBody className="p-4 w-100 d-flex flex-column align-items-center">
              <div className="image-container mb-4">
                <img src={Logo} alt="BukSU Logo" />
              </div>

              <MDBInput 
                wrapperClass="mb-4 w-100" 
                placeholder="Email address" 
                id="email" 
                type="email" 
                size="lg" 
                floating="true" 
                value={formData.email}
                onChange={handleInputChange} 
                onKeyDown={handleKeyDown}
              />
              <MDBInput 
                wrapperClass="mb-4 w-100" 
                placeholder="Password" 
                id="password" 
                type="password" 
                size="lg" 
                floating="true" 
                value={formData.password}
                onChange={handleInputChange} 
                onKeyDown={handleKeyDown}
              />

              <div  style={{ magin: '0'}} className="login-form-check">
                <input className="form-check-input" type="checkbox" id="flexCheckDefault"/>
                <label className="form-check-label" htmlFor="flexCheckDefault">
                  Stay logged in
                </label>
              </div>

              {errorMessage && ( // Conditionally render error message
                  <p style={{ fontSize: '16px', margin: '0' }} className="text-danger mt-3">{errorMessage}</p>
                )}

              <div className="d-grid gap-2 col-6 mx-auto mt-3">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleManualLogin}
                  style={{ backgroundColor: '#FFB800', border: 'none', color: '#000' }}
                >
                  Login
                </button>
              </div>

              <hr className="my-4 w-100" />

              <div onClick={handleGoogleLogin} style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', cursor: 'pointer' }}>
                <FcGoogle style={{ fontSize: 40 }} />
                <h5 className="mt-3">Continue with Google</h5>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;
