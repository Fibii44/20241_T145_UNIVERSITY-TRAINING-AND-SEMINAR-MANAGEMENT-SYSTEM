import React, { useState } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput,
} from "mdb-react-ui-kit";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Eye icons
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./login.css";
import Logo from "../../assets/buksu-logo.png";

function Login() {
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const MAX_ATTEMPTS = 3; // Max failed login attempts
  const LOCKOUT_TIME = 5 * 60 * 1000; // Lockout duration in milliseconds (5 minutes)

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleManualLogin();
    }
  };

  const handleStayLoggedIn = (event) => {
    setStayLoggedIn(event.target.checked);
  };

  const handleManualLogin = async () => {
    const failedAttempts = JSON.parse(sessionStorage.getItem("failedAttempts")) || {
      count: 0,
      lockoutUntil: null,
    };

    const currentTime = new Date().getTime();

    // Check if the user is locked out
    if (failedAttempts.lockoutUntil && currentTime < failedAttempts.lockoutUntil) {
      setErrorMessage(
        `Too many failed attempts. Try again at ${new Date(
          failedAttempts.lockoutUntil
        ).toLocaleTimeString()}`
      );
      return;
    }

    try {
      setErrorMessage(""); // Clear previous errors
      const recaptchaToken = await executeRecaptcha("login");
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          recaptchaToken,
          stayLoggedIn,
        }),
      });

      if (!response.ok) {
        // Increment failed login attempts
        failedAttempts.count += 1;

        if (failedAttempts.count >= MAX_ATTEMPTS) {
          failedAttempts.lockoutUntil = currentTime + LOCKOUT_TIME; // Set lockout time
          setErrorMessage("Too many failed attempts. Locked out for 5 minutes.");
        } else {
          setErrorMessage("Invalid email or password.");
        }

        sessionStorage.setItem("failedAttempts", JSON.stringify(failedAttempts));
        return;
      }

      // Reset failed attempts on success
      localStorage.removeItem("failedAttempts");
      const data = await response.json();

      console.log("token", data.token);
      navigate(`/login/success?token=${data.token}&stayLoggedIn=${stayLoggedIn}`);
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `http://localhost:3000/auth/google?stayLoggedIn=${stayLoggedIn}`;
  };

  return (
    <MDBContainer fluid className="login-container p-5">
      <MDBRow>
        <MDBCol
          md="7"
          className="text-center text-md-start d-flex flex-column justify-content-center"
        >
          <h1 className="not-clickable my-5 display-1 fw-bold ls-tight px-100">
            BukSU <span style={{ color: "#FFB800" }}>Engage</span>
          </h1>
        </MDBCol>

        <MDBCol md="4">
          <MDBCard
            className="bg-white my-5 mx-auto"
            style={{ borderRadius: "1rem", maxWidth: "500px" }}
          >
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

              <div className="password-field mb-4 w-100 position-relative">
                <MDBInput
                  wrapperClass="w-100"
                  placeholder="Password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  size="lg"
                  floating="true"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  style={{ paddingRight: "40px" }}
                />
                <span
                  className="eye-icon position-absolute"
                  style={{
                    cursor: "pointer",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: "10",
                  }}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="login-form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="flexCheckDefault"
                  checked={stayLoggedIn}
                  onChange={handleStayLoggedIn}
                />
                <label className="form-check-label" htmlFor="flexCheckDefault">
                  Stay logged in
                </label>
              </div>

              {errorMessage && (
                <p className="text-danger mt-3" style={{ fontSize: "16px", margin: "0" }}>
                  {errorMessage}
                </p>
              )}

              <div className="d-grid gap-2 col-6 mx-auto mt-3">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleManualLogin}
                  style={{ backgroundColor: "#FFB800", border: "none", color: "#000" }}
                >
                  Login
                </button>
              </div>

              <hr className="my-4 w-100" />

              <div
                onClick={handleGoogleLogin}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  cursor: "pointer",
                }}
              >
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
