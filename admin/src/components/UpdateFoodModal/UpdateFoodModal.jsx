import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { updateFood } from '../../api/client.js'

export default function UpdateFoodModal({ open, food, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(String(food?.name || ''))
    setDescription(String(food?.description || ''))
    setPrice(food?.price == null ? '' : String(food.price))
    setCategory(String(food?.category || ''))
    setBusy(false)
  }, [open, food?._id])

  const canSubmit = useMemo(() => {
    if (busy) return false
    if (!food?._id) return false
    if (!name.trim()) return false
    const p = Number(price)
    if (!Number.isFinite(p) || p < 0) return false
    return true
  }, [busy, food?._id, name, price])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  async function submit(e) {
    e?.preventDefault?.()
    if (!canSubmit) return

    setBusy(true)
    const toastId = toast.loading('Saving…')
    try {
      const payload = {
        id: food._id,
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),
      }
      const res = await updateFood(payload)
      if (!res?.success) throw new Error(res?.message || 'Update failed')
      toast.update(toastId, { render: 'Saved', type: 'success', isLoading: false, autoClose: 1600 })
      await onSaved?.(res?.data)
    } catch (err) {
      toast.update(toastId, { render: err?.message || 'Update failed', type: 'error', isLoading: false, autoClose: 2400 })
    } finally {
      setBusy(false)
    }
  }

  if (!open) return null

  return (
    <div className="modalOverlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal modalWide"
        role="dialog"
        aria-modal="true"
        aria-label="Update food"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <div className="modal__title">Update food</div>
          <button className="iconBtn" type="button" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        <form className="formGrid" onSubmit={submit}>
          <label className="field">
            <div className="field__label">Name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Food name" autoFocus />
          </label>

          <label className="field">
            <div className="field__label">Category</div>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Salad" />
          </label>

          <label className="field fieldFull">
            <div className="field__label">Description</div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description…"
            />
          </label>

          <label className="field">
            <div className="field__label">Price</div>
            <input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
            />
          </label>

          <div className="modal__actions modal__actions--sticky">
            <button className="btn btnGhost" type="button" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button className="btn btnPrimary" type="submit" disabled={!canSubmit}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

