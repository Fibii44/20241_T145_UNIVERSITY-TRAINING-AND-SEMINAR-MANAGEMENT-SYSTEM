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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css'; 
import Logo from '../../assets/buksu-logo.png'

function Login() {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const handleManualLogin = async () => {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        sessionStorage.setItem('authToken', data.token);
        console.log("Token:", data.token);
        navigate(`/login/success?token=${data.token}`); // Redirect to success 
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert('An error occurred during login. Please try again.');
    }
  };

  return (
    <MDBContainer fluid className="p-5">
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
              />

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
                <FontAwesomeIcon icon={faGoogle} style={{ fontSize: 40, color: '#000353' }} />
                <p>Sign in with Google</p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default Login;