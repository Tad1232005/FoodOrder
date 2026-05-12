import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { listFoods } from '../../api/client.js'
import FoodCard from '../../components/FoodCard/FoodCard.jsx'
import { Link } from 'react-router-dom'

export default function FoodList() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  async function load() {
    setLoading(true)
    try {
      const data = await listFoods()
      if (!data?.success) throw new Error(data?.message || 'Failed to load foods')
      setFoods(Array.isArray(data.data) ? data.data : [])
    } catch (e) {
      toast.error(e?.message || 'Failed to load foods')
      setFoods([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return foods
    return foods.filter((f) => {
      const name = String(f?.name || '').toLowerCase()
      const category = String(f?.category || '').toLowerCase()
      const desc = String(f?.description || '').toLowerCase()
      return name.includes(q) || category.includes(q) || desc.includes(q)
    })
  }, [foods, query])

  return (
    <div className="fadeIn">
      <div className="pageHeader">
        <div className="pageHeader__left">
          <div className="pageTitle">Food list</div>
          <div className="pageSub">Manage your menu items</div>
        </div>

        <div className="pageHeader__right">
          <div className="searchField">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category, description…"
              aria-label="Search foods"
            />
          </div>
          <Link className="btn btnPrimary" to="/foods/new">
            Add new food
          </Link>
          <button className="btn btnGhost" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeletonCard" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="emptyState">
          <div className="emptyState__title">No foods found</div>
          <div className="emptyState__text">Try clearing search or add items from your backend.</div>
          <button className="btn btnPrimary" onClick={load}>
            Reload
          </button>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((food) => (
            <FoodCard key={food?._id} food={food} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  )
}

