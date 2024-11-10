// DeleteModal.js
import React from 'react';
import './deleteModal.css'; // Optional: style your modal

const DeleteModal = ({ isOpen, onClose, onConfirmDelete }) => {
  if (!isOpen) return null; // Don't render if modal is closed

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Delete Event?</h3>
        <p>This can't be undone</p>
        <div className="modal-actions">
          <button onClick={onConfirmDelete} className="confirm-button">Yes, Delete</button>
          <button onClick={onClose} className="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;