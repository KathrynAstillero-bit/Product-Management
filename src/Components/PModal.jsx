import { AlertTriangle, X } from "lucide-react";
import "./PModal.css";

export default function PModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <button
          type="button"
          className="icon-button confirm-close"
          aria-label="Close dialog"
          onClick={onCancel}
        >
          <X size={18} />
        </button>
        <span className="confirm-icon">
          <AlertTriangle size={20} />
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="editor-actions">
          <button className="secondary-button" onClick={onCancel}>
            Keep dish
          </button>
          <button className="danger-button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
