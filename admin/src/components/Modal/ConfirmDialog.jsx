import { useEffect } from 'react'

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Confirm'}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <div className="modal__title">{title || 'Confirm action'}</div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        {description ? <div className="modal__desc">{description}</div> : null}

        <div className="modal__actions">
          <button className="btn btnGhost" type="button" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`btn ${confirmVariant === 'danger' ? 'btnDanger' : 'btnPrimary'}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

