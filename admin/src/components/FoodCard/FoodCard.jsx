import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { imageUrl, removeFood } from '../../api/client.js'
import ConfirmDialog from '../Modal/ConfirmDialog.jsx'
import UpdateFoodModal from '../UpdateFoodModal/UpdateFoodModal.jsx'

export default function FoodCard({ food, onChanged }) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const priceText = useMemo(() => {
    const n = Number(food?.price ?? 0)
    if (!Number.isFinite(n)) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  }, [food?.price])

  const images = food?.images || []
  const currentImage = images[currentImageIndex] || null

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

  function nextImage() {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  function prevImage() {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card__media">
          {currentImage ? (
            <>
              <img src={imageUrl(currentImage)} alt={food?.name || 'Food'} loading="lazy" />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                  >
                    ›
                  </button>
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '6px'
                  }}>
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          width: idx === currentImageIndex ? '8px' : '6px',
                          height: idx === currentImageIndex ? '8px' : '6px',
                          borderRadius: '50%',
                          background: idx === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="imgFallback" aria-hidden="true">
              No images
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
        description="This action will delete the item and its images from the server."
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

