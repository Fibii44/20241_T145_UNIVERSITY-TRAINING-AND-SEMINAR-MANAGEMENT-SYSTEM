import React, { useEffect } from 'react';

const Toast = ({ message, onClose, type = 'success', duration = 3000 }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
  
      return () => clearTimeout(timer);
    }, [onClose, duration]);
  
    return (
      <div style={{ ...toastStyle, ...getTypeStyle(type) }}>
        {message}
      </div>
    );
  };
  
  const toastStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 1000,
  };
  
  const getTypeStyle = (type) => {
    switch (type) {
      case 'error':
        return { background: '#dc3545' }; // Red for errors
      case 'success':
        return { background: '#28a745' }; // Green for success
      default:
        return { background: '#6c757d' }; // Default (gray)
    }
  };
  
  export default Toast;
