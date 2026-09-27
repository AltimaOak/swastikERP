// src/components/Modal.jsx

import { X } from "lucide-react";

export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <h3>{title}</h3>

          <button className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-content">
          {children}
        </div>

      </div>
    </div>
  );
}