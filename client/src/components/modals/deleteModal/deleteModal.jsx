import React from 'react';
import './deleteModal.css'; // Optional: style your modal

const DeleteModal = ({ isOpen, onClose, onConfirmDelete }) => {
  if (!isOpen) return null; // Don't render if modal is closed

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
      <h3 className="delete-modal-heading">Delete Event?</h3>
        <p>This can't be undone</p>
        <div className="delete-modal-actions">
          <button onClick={onConfirmDelete} className="delete-confirm-button">Yes, Delete</button>
          <button onClick={onClose} className="delete-cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;