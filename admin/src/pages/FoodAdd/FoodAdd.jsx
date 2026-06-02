import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { addFood } from '../../api/client.js'
import { Link, useNavigate } from 'react-router-dom'

export default function FoodAdd() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [images, setImages] = useState([])
  const [busy, setBusy] = useState(false)

  const canSubmit = useMemo(() => {
    if (busy) return false
    if (!name.trim()) return false
    const p = Number(price)
    if (!Number.isFinite(p) || p < 0) return false
    if (!category.trim()) return false
    if (!description.trim()) return false
    if (images.length === 0) return false
    return true
  }, [busy, name, price, category, description, images])

  async function submit(e) {
    e?.preventDefault?.()
    if (!canSubmit) return

    const fd = new FormData()
    fd.append('name', name.trim())
    fd.append('description', description.trim())
    fd.append('price', String(Number(price)))
    fd.append('category', category.trim())
    images.forEach(img => fd.append('images', img))

    setBusy(true)
    const toastId = toast.loading('Adding…')
    try {
      const res = await addFood(fd)
      if (!res?.success) throw new Error(res?.message || 'Add failed')
      toast.update(toastId, { render: 'Food added', type: 'success', isLoading: false, autoClose: 1600 })
      navigate('/foods')
    } catch (err) {
      toast.update(toastId, { render: err?.message || 'Add failed', type: 'error', isLoading: false, autoClose: 2400 })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fadeIn">
      <div className="pageHeader">
        <div className="pageHeader__left">
          <div className="pageTitle">Add new food</div>
          <div className="pageSub">Create a menu item (name, description, price, category, image)</div>
        </div>
        <div className="pageHeader__right">
          <Link className="btn btnGhost" to="/foods">
            Back to list
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card__body">
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
              <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </label>

            <label className="field fieldFull">
              <div className="field__label">Images (up to 10)</div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
              />
              {images.length > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  {images.length} image(s) selected
                </div>
              )}
            </label>

            <div className="modal__actions modal__actions--sticky fieldFull">
              <button className="btn btnGhost" type="button" onClick={() => navigate('/foods')} disabled={busy}>
                Cancel
              </button>
              <button className="btn btnPrimary" type="submit" disabled={!canSubmit}>
                {busy ? 'Adding…' : 'Add food'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

