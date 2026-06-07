export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="modal-panel">
        <button type="button" onClick={onClose} className="modal-close" aria-label="Close">
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
