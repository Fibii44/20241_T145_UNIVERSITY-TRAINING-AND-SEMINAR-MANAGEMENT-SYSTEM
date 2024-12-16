import React from 'react';
import './formModal.css';

const Modal = ({ show, onClose, formLink }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <span className="modal-title">Survey Form</span>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>
                <iframe
                    src={formLink}
                    title="Google Form"
                    className="embedded-form"
                    frameBorder="0"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default Modal;
