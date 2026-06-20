import { useState, useEffect, useCallback } from 'react'
import {
  Clock, Search, Trash2, AlertTriangle, CheckCircle,
  X, Loader2, Phone, Package, ChevronRight, ChevronLeft,
  Users, RefreshCw, Download
} from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import API_BASE_URL from '../../config'

/* ── Auth ── */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

/* ── Helpers ── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) : '—'

const fmt = (n) => Number(n ?? 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function Toast({ msg, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className={`db-toast db-toast--${type === 'ok' ? 'ok' : 'err'}`}
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {type === 'ok' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
      {msg}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   CONFIRM DELETE MODAL
══════════════════════════════════════════════════════════ */
function ConfirmModal({ entry, onConfirm, onClose, loading }) {
  return (
    <div className="db-overlay" onClick={onClose}>
      <div className="db-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="db-modal__accent" style={{ background: 'var(--red)' }} />
        <div className="db-modal__header">
          <span className="db-modal__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Trash2 size={18} color="var(--red)" /> تأكيد الحذف
          </span>
          <button className="db-modal__close" onClick={onClose}>×</button>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-sec)', marginBottom: 20, lineHeight: 1.7 }}>
          هل أنت متأكد من حذف{' '}
          <strong style={{ color: 'var(--text)' }}>{entry.name}</strong>{' '}
          من قائمة الانتظار؟
          <br />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            هذا الإجراء لا يمكن التراجع عنه.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="db-btn db-btn--ghost" onClick={onClose} disabled={loading}>إلغاء</button>
          <button className="db-btn db-btn--danger" onClick={onConfirm} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {loading ? <Loader2 size={14} className="db-spinner" /> : <Trash2 size={14} />}
            {loading ? 'جاري الحذف…' : 'تأكيد الحذف'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════════════════ */
function WaitlistTable({ entries, onDelete }) {
  if (entries.length === 0)
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Clock size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
        <div style={{ fontSize: 14, fontWeight: 700 }}>قائمة الانتظار فارغة</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>لا يوجد عملاء مسجلين حالياً</div>
      </div>
    )

  return (
    <div className="db-table-wrap">
      <table className="db-table">
        <thead>
          <tr>
            <th>#</th>
            <th>الاسم</th>
            <th>الموبايل</th>
            <th>الكمية المطلوبة</th>
            <th>الملاحظات</th>
            <th>تاريخ التسجيل</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr key={e.id}>
              <td>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
                  background: 'var(--bg-base)', padding: '2px 8px', borderRadius: 6,
                }}>#{e.id}</span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: 'var(--gold-08)', color: 'var(--gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontWeight: 900, fontSize: 13,
                  }}>{(e.name || '؟')[0]}</div>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{e.name}</span>
                </div>
              </td>
              <td>
                <span style={{ fontSize: 12, color: 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Phone size={12} color="var(--text-muted)" />
                  <span dir="ltr">{e.phone || '—'}</span>
                </span>
              </td>
              <td>
                {e.requestedKg > 0 ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    fontWeight: 800, fontSize: 14, color: 'var(--teal)',
                  }}>
                    <Package size={13} />
                    {fmt(e.requestedKg)}
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>كجم</span>
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>غير محدد</span>
                )}
              </td>
              <td>
                <span style={{ fontSize: 12, color: 'var(--text-sec)', maxWidth: 180, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.notes || '—'}
                </span>
              </td>
              <td>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {fmtDate(e.createdAt)}
                </span>
              </td>
              <td>
                <button
                  className="db-btn db-btn--danger db-btn--sm"
                  onClick={() => onDelete(e)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  title="حذف">
                  <Trash2 size={13} /> حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN CONTENT
══════════════════════════════════════════════════════════ */
function WaitlistContent() {
  const [entries, setEntries] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const [searchInput, setSearchInput] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [page, setPage] = useState(1)
  const pageSize = 15

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE_URL}/api/waitlist`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const data = json?.data?.data ?? json?.data ?? json
      const list = Array.isArray(data) ? data : (data.data ?? [])
      setEntries(list)
      setFiltered(list)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* ── Search (client-side) ── */
  useEffect(() => {
    const q = searchInput.trim().toLowerCase()
    if (!q) { setFiltered(entries); setPage(1); return }
    setFiltered(entries.filter(e =>
      (e.name || '').toLowerCase().includes(q) ||
      (e.phone || '').includes(q) ||
      (e.notes || '').toLowerCase().includes(q)
    ))
    setPage(1)
  }, [searchInput, entries])

  /* ── Delete ── */
  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/waitlist/${deleteTarget.id}`, {
        method: 'DELETE', headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setToast({ msg: 'تم حذف العنصر بنجاح', type: 'ok' })
      setDeleteTarget(null)
      load()
    } catch (e) {
      setToast({ msg: `فشل الحذف: ${e.message}`, type: 'err' })
    } finally {
      setDeleteLoading(false)
    }
  }

  /* ── Export CSV ── */
  const exportCsv = () => {
    const rows = [
      ['#', 'الاسم', 'الموبايل', 'الكمية (كجم)', 'الملاحظات', 'تاريخ التسجيل'],
      ...entries.map(e => [e.id, e.name, e.phone, e.requestedKg, e.notes || '', fmtDate(e.createdAt)]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `waitlist_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  /* ── Stats ── */
  const totalKg = entries.reduce((s, e) => s + (e.requestedKg || 0), 0)
  const withKg = entries.filter(e => e.requestedKg > 0).length

  return (
    <div className="db-page db-animate-in">

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {deleteTarget && (
        <ConfirmModal
          entry={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 22,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>إدارة الطلبات</div>
          <h1 style={{
            fontSize: 22, fontWeight: 900, color: 'var(--text)',
            lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Clock size={22} color="var(--gold)" /> قائمة الانتظار
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="db-btn db-btn--ghost" onClick={load}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> تحديث
          </button>
          <button className="db-btn db-btn--gold" onClick={exportCsv}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            disabled={entries.length === 0}>
            <Download size={14} /> تصدير CSV
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="db-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 20 }}>
        {[
          { label: 'إجمالي المسجلين', value: entries.length.toLocaleString('ar-EG'), unit: 'شخص', color: 'var(--gold)', icon: <Users size={18} /> },
          { label: 'حددوا الكمية', value: withKg.toLocaleString('ar-EG'), unit: 'شخص', color: 'var(--teal)', icon: <Package size={18} /> },
          { label: 'إجمالي الكميات المطلوبة', value: fmt(totalKg), unit: 'كجم', color: 'var(--green)', icon: <Package size={18} /> },
        ].map(({ label, value, unit, color, icon }) => (
          <div key={label} className="db-stat">
            <div className="db-stat__accent" style={{ background: color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div className="db-stat__value" style={{ color, fontSize: 22 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{unit}</div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
              </div>
            </div>
            <div className="db-stat__label">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Card ── */}
      <div className="db-card">

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={14} style={{
              position: 'absolute', right: 12, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              className="db-input"
              placeholder="بحث بالاسم أو الموبايل…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ paddingRight: 36 }}
            />
          </div>
          {searchInput && (
            <button className="db-btn db-btn--ghost db-btn--sm" onClick={() => setSearchInput('')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <X size={13} /> مسح
            </button>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', marginRight: 'auto' }}>
            {filtered.length} نتيجة
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="db-error-box" style={{ margin: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> {error}
            <button className="db-btn db-btn--ghost db-btn--sm" onClick={load} style={{ marginRight: 'auto' }}>
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="db-loading">
            <Loader2 size={32} className="db-spinner" color="var(--gold)" />
            جاري تحميل القائمة…
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <WaitlistTable entries={paginated} onDelete={setDeleteTarget} />
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="db-pagination">
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
              صفحة {page} من {totalPages} — {filtered.length} نتيجة
            </span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button className="db-page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronRight size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pg
                if (totalPages <= 5) pg = i + 1
                else if (page <= 3) pg = i + 1
                else if (page >= totalPages - 2) pg = totalPages - 4 + i
                else pg = page - 2 + i
                return (
                  <button key={pg}
                    className={`db-page-btn${page === pg ? ' db-page-btn--active' : ''}`}
                    onClick={() => setPage(pg)}>
                    {pg.toLocaleString('ar-EG')}
                  </button>
                )
              })}
              <button className="db-page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronLeft size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   EXPORT
══════════════════════════════════════════════════════════ */
export default function WaitlistPage() {
  return (
    <DashboardLayout title="قائمة الانتظار" breadcrumb="إدارة قائمة الانتظار">
      <WaitlistContent />
    </DashboardLayout>
  )
}