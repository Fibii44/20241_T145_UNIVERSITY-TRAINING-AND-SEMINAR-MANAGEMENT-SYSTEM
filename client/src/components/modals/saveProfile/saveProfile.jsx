import React from 'react';
import './saveProfile.css';

const SaveConfirmModal = ({ show, onHide, onConfirm, message }) => {
    if (!show) return null; // Don't render if modal is not visible

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2 className="modal-title">Confirm Save</h2>
                    <button className="modal-close-btn" onClick={onHide}>&times;</button>
                </div>
                <div className="modal-body">
                    <p>{message || "Are you sure you want to save changes?"}</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onHide}>
                        Cancel
                    </button>
                    <button className="modal-btn modal-btn-primary" onClick={onConfirm}>
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveConfirmModal;
