import React from 'react';
import '../archiveConfirmModal/confirmArchiveModal.css'; // Add CSS for styling the modal

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
<div className="modal-overlay" onClick={onCancel}>
        <div
          className="confirm-modal shadow-md"
        >
        
          <div className="flex flex-col items-center mb-4 mt-3 text-center">
            <h2 className="confirm-modal">{title}</h2>
          </div>

          <p className="confirm-modal mb-1">
          {message}
          </p>
          <div className="buttons mb-2"> 
            <button className="confirmButton" onClick={onConfirm}>
                Save
            </button>
            <button
                className="cancelButton" onClick={onCancel}
            >
                Cancel
            </button>
          </div>
        </div>
      </div>


  );
};

export default ConfirmationModal;