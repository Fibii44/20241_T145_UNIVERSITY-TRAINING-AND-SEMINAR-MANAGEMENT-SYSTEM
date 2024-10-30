import React from 'react';
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
import 'bootstrap/dist/css/bootstrap.min.css';
import './login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  // Function to handle Google Login
  const handleGoogleLogin = () => {
    // Directly redirect the user to the Google OAuth login page
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return (
    <MDBContainer fluid className='p-5'>
      <MDBRow>
        <MDBCol md='7' className='text-center text-md-start d-flex flex-column justify-content-center'>
          <h1 className="not-clickable my-5 display-1 fw-bold ls-tight px-100">
            BukSU <span style={{ color: '#FFB800' }}>Engage</span>
          </h1>
        </MDBCol>

        <MDBCol md='4'>
          <MDBCard className='bg-white my-5 mx-auto' style={{ borderRadius: '1rem', maxWidth: '500px' }}>
            <MDBCardBody className='p-4 w-100 d-flex flex-column align-items-center'>
              <div className="image-container mb-4">
                <img src="../Images/Logo.png" className="card-img-top small-image" alt="Buksu Logo" />
              </div>

              <p className="text-white-50 mb-4 text-center">Please enter your login and password!</p>

              <MDBInput wrapperClass='mb-4 w-100' placeholder='Email address' id='formControlLg' type='email' size="lg" floating />
              <MDBInput wrapperClass='mb-4 w-100' placeholder='Password' id='formControlLg' type='password' size="lg" floating />

              <div className="d-grid gap-2 col-6 mx-auto">
                <button className="btn btn-primary" type="button" style={{ backgroundColor: '#FFB800', border: 'none', color: '#000' }}>Login</button>
              </div>

              <hr className="my-4 w-100" />

              <div 
                onClick={handleGoogleLogin} // Add onClick event to trigger Google login
                style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', cursor: 'pointer' }}>
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
