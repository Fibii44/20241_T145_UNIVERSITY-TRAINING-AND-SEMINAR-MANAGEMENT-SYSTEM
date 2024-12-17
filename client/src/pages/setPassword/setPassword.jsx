import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './setPassword.css';
import Toast from "../../components/modals/successToast/toast"

const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  
const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    hasCapital: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false
  });
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    return {
      hasCapital: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*]/.test(password),
      hasMinLength: password.length >= 8
    };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check all password requirements
    if (!passwordStrength.hasCapital || 
      !passwordStrength.hasNumber || 
      !passwordStrength.hasSpecial || 
      !passwordStrength.hasMinLength) {
      showToast('Password does not meet all requirements', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3000/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPassword: password
        })
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      const data = await response.json();
      navigate('/login');
      showToast('Password updated successfully!');
    } catch (error) {
      showToast('Failed to update password', 'error');
    }
  };

  return (
    <div className="change-password-form-container">
        <form onSubmit={handleSubmit} className="change-password-form">
            <h3>Change Password</h3>
            <div className="password-requirements">
            <h5>Password Requirements:</h5>
            <ul>
              <li className={passwordStrength.hasMinLength ? 'met' : 'unmet'}>
                ✓ At least 8 characters long
              </li>
              <li className={passwordStrength.hasCapital ? 'met' : 'unmet'}>
                ✓ At least one capital letter
              </li>
              <li className={passwordStrength.hasNumber ? 'met' : 'unmet'}>
                ✓ At least one number
              </li>
              <li className={passwordStrength.hasSpecial ? 'met' : 'unmet'}>
                ✓ At least one special character (!@#$%^&*(),.?&quot;:{}|&lt;&gt;)
              </li>
            </ul>
          </div>

            <label>
            New Password:
            <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
            />
            </label>

            <label>
            Confirm Password:
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            </label>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" disabled={!passwordStrength.hasCapital || 
                       !passwordStrength.hasNumber || 
                       !passwordStrength.hasSpecial || 
                       !passwordStrength.hasMinLength ||
                       !confirmPassword}>Change Password</button>
        </form>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ChangePassword;
