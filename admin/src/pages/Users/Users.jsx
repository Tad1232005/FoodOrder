import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { createUser, deleteUser, listUsers, setUserBlocked, updateUserRole } from '../../api/client.js'

// Các quyền truy cập cho user
const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
  { value: 'customer', label: 'Customer' },
]

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('staff')
  const [createBusy, setCreateBusy] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await listUsers()
      if (!res?.success) throw new Error(res?.message || 'Failed to load users')
      setUsers(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      toast.error(e?.message || 'Failed to load users')
      setUsers([])
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
    if (!q) return users
    return users.filter((u) => {
      const name = String(u?.name || '').toLowerCase()
      const email = String(u?.email || '').toLowerCase()
      const role = String(u?.role || '').toLowerCase()
      return name.includes(q) || email.includes(q) || role.includes(q)
    })
  }, [users, query])

  async function changeRole(userId, role) {
    if (!userId) return
    setBusyId(userId)
    const toastId = toast.loading('Updating role…')
    try {
      const res = await updateUserRole({ id: userId, role })
      if (!res?.success) throw new Error(res?.message || 'Update failed')
      toast.update(toastId, { render: 'Role updated', type: 'success', isLoading: false, autoClose: 1600 })
      setUsers((prev) => prev.map((u) => (u?._id === userId ? res.data : u)))
    } catch (e) {
      toast.update(toastId, { render: e?.message || 'Update failed', type: 'error', isLoading: false, autoClose: 2400 })
    } finally {
      setBusyId('')
    }
  }

  async function toggleBlocked(userId, nextBlocked) {
    if (!userId) return
    setBusyId(userId)
    const toastId = toast.loading(nextBlocked ? 'Blocking…' : 'Unblocking…')
    try {
      const res = await setUserBlocked({ id: userId, blocked: nextBlocked })
      if (!res?.success) throw new Error(res?.message || 'Update failed')
      toast.update(toastId, { render: nextBlocked ? 'Blocked' : 'Unblocked', type: 'success', isLoading: false, autoClose: 1600 })
      setUsers((prev) => prev.map((u) => (u?._id === userId ? res.data : u)))
    } catch (e) {
      toast.update(toastId, { render: e?.message || 'Update failed', type: 'error', isLoading: false, autoClose: 2400 })
    } finally {
      setBusyId('')
    }
  }

  async function removeUser(userId) {
    if (!userId) return
    const ok = window.confirm('Delete this user? This cannot be undone.')
    if (!ok) return
    setBusyId(userId)
    const toastId = toast.loading('Deleting…')
    try {
      const res = await deleteUser({ id: userId })
      if (!res?.success) throw new Error(res?.message || 'Delete failed')
      toast.update(toastId, { render: 'Deleted', type: 'success', isLoading: false, autoClose: 1600 })
      setUsers((prev) => prev.filter((u) => u?._id !== userId))
    } catch (e) {
      toast.update(toastId, { render: e?.message || 'Delete failed', type: 'error', isLoading: false, autoClose: 2400 })
    } finally {
      setBusyId('')
    }
  }

  async function submitCreate(e) {
    e?.preventDefault?.()
    if (createBusy) return
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Please fill name and email.')
      return
    }
    setCreateBusy(true)
    const toastId = toast.loading('Creating user…')
    try {
      const res = await createUser({
        name: newName.trim(),
        email: newEmail.trim(),
        role: newRole,
      })
      if (!res?.success) throw new Error(res?.message || 'Create failed')
      toast.update(toastId, { render: 'User created', type: 'success', isLoading: false, autoClose: 1600 })
      setCreateOpen(false)
      setNewName('')
      setNewEmail('')
      setNewPassword('')
      setNewRole('staff')
      await load()
    } catch (e2) {
      toast.update(toastId, { render: e2?.message || 'Create failed', type: 'error', isLoading: false, autoClose: 2400 })
    } finally {
      setCreateBusy(false)
    }
  }

  return (
    <div className="fadeIn">
      <div className="pageHeader">
        <div className="pageHeader__left">
          <div className="pageTitle">Users</div>
          <div className="pageSub">Manage accounts & roles</div>
        </div>

        <div className="pageHeader__right">
          <div className="searchField">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name/email/role…" />
          </div>
          <button className="btn btnPrimary" type="button" onClick={() => setCreateOpen(true)}>
            New user
          </button>
          <button className="btn btnGhost" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeletonCard" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="emptyState">
          <div className="emptyState__title">No users</div>
          <div className="emptyState__text">
            If you see “Forbidden”, your current token is not an admin token.
          </div>
          <button className="btn btnPrimary" onClick={load}>
            Reload
          </button>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((u) => (
            <div key={u?._id} className="card">
              <div className="card__body">
                <div className="card__titleRow">
                  <div className="card__title" title={u?.name || ''}>
                    {u?.name || '—'}
                  </div>
                  <div className={`pill pillRole pillRole--${u?.role || 'customer'}`}>
                    {u?.role || 'customer'}
                  </div>
                </div>
                <div className="card__desc" style={{ minHeight: 0 }}>
                  {u?.email || '—'}
                </div>

                <div className="card__actions" style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    className="select"
                    value={u?.role || 'customer'}
                    onChange={(e) => changeRole(u?._id, e.target.value)}
                    disabled={busyId === u?._id}
                    aria-label="User role"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btnGhost"
                    type="button"
                    onClick={() => toggleBlocked(u?._id, !(u?.isBlocked === true))}
                    disabled={busyId === u?._id}
                  >
                    {u?.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button className="btn btnDanger" type="button" onClick={() => removeUser(u?._id)} disabled={busyId === u?._id}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen ? (
        <div className="modalOverlay" role="presentation" onMouseDown={() => (createBusy ? null : setCreateOpen(false))}>
          <div
            className="modal modalWide"
            role="dialog"
            aria-modal="true"
            aria-label="Create user"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal__head">
              <div className="modal__title">Create new user</div>
              <button className="iconBtn" type="button" onClick={() => setCreateOpen(false)} aria-label="Close dialog" disabled={createBusy}>
                ×
              </button>
            </div>

            <form className="formGrid" onSubmit={submitCreate}>
              <label className="field">
                <div className="field__label">Name</div>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name" autoFocus />
              </label>

              <label className="field">
                <div className="field__label">Role</div>
                <select className="select" value={newRole} onChange={(e) => setNewRole(e.target.value)} aria-label="New user role">
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field fieldFull">
                <div className="field__label">Email</div>
                <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@example.com" />
              </label>

              <div className="modal__actions modal__actions--sticky fieldFull">
                <button className="btn btnGhost" type="button" onClick={() => setCreateOpen(false)} disabled={createBusy}>
                  Cancel
                </button>
                <button className="btn btnPrimary" type="submit" disabled={createBusy}>
                  {createBusy ? 'Creating…' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}

