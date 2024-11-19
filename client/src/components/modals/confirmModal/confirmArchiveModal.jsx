import React from 'react';
import './confirmArchiveModal.css'; // Add CSS for styling the modal

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="confirm-modal-buttons">
          <button className="confirm-button" onClick={onConfirm}>Archive</button>
          <button className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;