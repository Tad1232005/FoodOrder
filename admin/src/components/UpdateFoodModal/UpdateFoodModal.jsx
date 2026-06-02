import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { updateFood, imageUrl } from '../../api/client.js'

export default function UpdateFoodModal({ open, food, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [newImages, setNewImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setName(String(food?.name || ''))
    setDescription(String(food?.description || ''))
    setPrice(food?.price == null ? '' : String(food.price))
    setCategory(String(food?.category || ''))
    setNewImages([])
    setImagesToDelete([])
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

  function toggleImageDelete(img) {
    setImagesToDelete(prev => 
      prev.includes(img) ? prev.filter(x => x !== img) : [...prev, img]
    )
  }

  async function submit(e) {
    e?.preventDefault?.()
    if (!canSubmit) return

    setBusy(true)
    const toastId = toast.loading('Saving…')
    try {
      const hasChanges = newImages.length > 0 || imagesToDelete.length > 0
      
      if (hasChanges) {
        const fd = new FormData()
        fd.append('id', food._id)
        fd.append('name', name.trim())
        fd.append('description', description.trim())
        fd.append('price', String(Number(price)))
        fd.append('category', category.trim())
        if (imagesToDelete.length > 0) {
          imagesToDelete.forEach(img => fd.append('imagesToDelete', img))
        }
        newImages.forEach(img => fd.append('images', img))
        const res = await updateFood(fd)
        if (!res?.success) throw new Error(res?.message || 'Update failed')
        toast.update(toastId, { render: 'Saved', type: 'success', isLoading: false, autoClose: 1600 })
        await onSaved?.(res?.data)
      } else {
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
      }
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

          <label className="field fieldFull">
            <div className="field__label">Current Images</div>
            {food?.images && food.images.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {food.images.map((img, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img 
                      src={imageUrl(img)} 
                      alt={`Image ${idx + 1}`} 
                      style={{ 
                        width: '80px', 
                        height: '80px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        opacity: imagesToDelete.includes(img) ? 0.4 : 1,
                        border: imagesToDelete.includes(img) ? '2px solid #ff6347' : 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleImageDelete(img)}
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        background: imagesToDelete.includes(img) ? '#ff6347' : '#fff',
                        color: imagesToDelete.includes(img) ? '#fff' : '#ff6347',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      {imagesToDelete.includes(img) ? '↺' : '×'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>No images</div>
            )}
          </label>

          <label className="field fieldFull">
            <div className="field__label">Add New Images (up to 10)</div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewImages(Array.from(e.target.files || []))}
            />
            {newImages.length > 0 && (
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                {newImages.length} new image(s) selected
              </div>
            )}
          </label>

          <div className="modal__actions modal__actions--sticky">
            <button 
              className="btn btnGhost" 
              type="button" 
              onClick={onClose} 
              disabled={busy}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button 
              className="btn btnPrimary" 
              type="submit" 
              disabled={!canSubmit}
              style={{
                padding: '10px 24px',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 4px 12px rgba(255, 99, 71, 0.3)'
              }}
            >
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

