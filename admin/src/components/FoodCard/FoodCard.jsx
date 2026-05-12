import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { imageUrl, removeFood } from '../../api/client.js'
import ConfirmDialog from '../Modal/ConfirmDialog.jsx'
import UpdateFoodModal from '../UpdateFoodModal/UpdateFoodModal.jsx'

export default function FoodCard({ food, onChanged }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const priceText = useMemo(() => {
    const n = Number(food?.price ?? 0)
    if (!Number.isFinite(n)) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  }, [food?.price])

  async function doDelete() {
    if (!food?._id) return
    setBusy(true)
    try {
      const res = await removeFood(food._id)
      if (!res?.success) throw new Error(res?.message || 'Delete failed')
      toast.success('Food removed')
      await onChanged?.()
    } catch (e) {
      toast.error(e?.message || 'Delete failed')
    } finally {
      setBusy(false)
      setConfirmOpen(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card__media">
          {food?.image ? (
            <img src={imageUrl(food.image)} alt={food?.name || 'Food'} loading="lazy" />
          ) : (
            <div className="imgFallback" aria-hidden="true">
              No image
            </div>
          )}
          <div className="badge">{food?.category || 'Uncategorized'}</div>
        </div>

        <div className="card__body">
          <div className="card__titleRow">
            <div className="card__title" title={food?.name || ''}>
              {food?.name || '—'}
            </div>
            <div className="card__price">{priceText}</div>
          </div>
          <div className="card__desc">{food?.description || '—'}</div>

          <div className="card__actions">
            <button className="btn btnGhost" onClick={() => setUpdateOpen(true)} disabled={busy}>
              Update
            </button>
            <button className="btn btnDanger" onClick={() => setConfirmOpen(true)} disabled={busy}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove this food?"
        description="This action will delete the item and its image from the server."
        confirmText={busy ? 'Removing…' : 'Remove'}
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={doDelete}
        onClose={() => (busy ? null : setConfirmOpen(false))}
      />

      <UpdateFoodModal
        open={updateOpen}
        food={food}
        onClose={() => setUpdateOpen(false)}
        onSaved={async () => {
          setUpdateOpen(false)
          await onChanged?.()
        }}
      />
    </>
  )
}

