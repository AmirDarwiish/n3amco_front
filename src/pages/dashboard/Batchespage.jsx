import { useState, useEffect, useCallback } from 'react'
import {
  Package, Plus, Search, Pencil, Trash2,
  AlertTriangle, CheckCircle, X, Loader2,
  ChevronRight, ChevronLeft, RefreshCw,
  Calendar, Scale, FileText, TrendingUp
} from 'lucide-react'
import DashboardLayout from './DashboardLayout'
import API_BASE_URL from '../../config'

/* ── Auth ── */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

/* ── Helpers ── */
const fmt = (n) => Number(n ?? 0).toLocaleString('ar-EG', { maximumFractionDigits: 2 })

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : '—'

const toInputDate = (d) =>
  d ? new Date(d).toISOString().slice(0, 10) : ''

const STATUS_MAP = {
  Open:     { label: 'مفتوح',   color: 'var(--green)', bg: 'var(--green-bg)' },
  Upcoming: { label: 'قادم',    color: 'var(--gold)',  bg: 'var(--gold-08)'  },
  Full:     { label: 'ممتلئ',   color: 'var(--teal)',  bg: 'var(--teal-bg)'  },
  Closed:   { label: 'مغلق',    color: 'var(--red)',   bg: 'var(--red-bg)'   },
}

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
function ConfirmModal({ batch, onConfirm, onClose, loading }) {
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
          هل أنت متأكد من حذف الدفعة{' '}
          <strong style={{ color: 'var(--text)' }}>{batch.title}</strong>؟
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
   FORM MODAL — CREATE / EDIT
══════════════════════════════════════════════════════════ */
function FormModal({ editData, products, onClose, onSuccess }) {
  const isEdit = !!editData
  const [form, setForm] = useState({
    productId:    editData?.productId    || '',
    title:        editData?.title        || '',
    slaughterDate: editData?.slaughterDate ? toInputDate(editData.slaughterDate) : '',
    totalKg:      editData?.totalKg      || '',
    notes:        editData?.notes        || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.productId)    return setError('المنتج مطلوب')
    if (!form.title.trim()) return setError('العنوان مطلوب')
    if (!form.slaughterDate) return setError('تاريخ الذبح مطلوب')
    if (!form.totalKg || Number(form.totalKg) <= 0) return setError('الكمية الكلية مطلوبة')
    setError(null)
    setLoading(true)
    try {
      const url    = isEdit ? `${API_BASE_URL}/api/SlaughterBatches/${editData.id}` : `${API_BASE_URL}/api/SlaughterBatches`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify({
          productId:    Number(form.productId),
          title:        form.title,
          slaughterDate: new Date(form.slaughterDate).toISOString(),
          totalKg:      Number(form.totalKg),
          notes:        form.notes || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`)
      onSuccess(isEdit ? 'تم تحديث الدفعة بنجاح ✓' : 'تم إنشاء الدفعة بنجاح ✓')
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="db-overlay" onClick={onClose}>
      <div className="db-modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="db-modal__accent" />
        <div className="db-modal__header">
          <span className="db-modal__title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isEdit ? <Pencil size={18} color="var(--gold)" /> : <Plus size={18} color="var(--gold)" />}
            {isEdit ? 'تعديل الدفعة' : 'إنشاء دفعة جديدة'}
          </span>
          <button className="db-modal__close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="db-error-box" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={15} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Product */}
          <div>
            <label className="db-label">المنتج *</label>
            <select className="db-input" value={form.productId} onChange={set('productId')}
              style={{ cursor: 'pointer' }}>
              <option value="">اختر المنتج…</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="db-label">عنوان الدفعة *</label>
            <input className="db-input" placeholder="مثال: دفعة يوليو 2025"
              value={form.title} onChange={set('title')} />
          </div>

          {/* Date + KG */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="db-label">تاريخ الذبح *</label>
              <input className="db-input" type="date"
                value={form.slaughterDate} onChange={set('slaughterDate')} />
            </div>
            <div>
              <label className="db-label">الكمية الكلية (كجم) *</label>
              <input className="db-input" type="number" placeholder="500"
                min="1" step="0.01"
                value={form.totalKg} onChange={set('totalKg')} />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="db-label">ملاحظات</label>
            <textarea className="db-textarea" placeholder="أي تفاصيل إضافية…"
              value={form.notes} onChange={set('notes')} style={{ minHeight: 72 }} />
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="db-btn db-btn--ghost" onClick={onClose} disabled={loading}>إلغاء</button>
            <button className="db-btn db-btn--gold" onClick={submit} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {loading
                ? <><Loader2 size={14} className="db-spinner" /> جاري الحفظ…</>
                : <>{isEdit ? <Pencil size={14} /> : <Plus size={15} />} {isEdit ? 'حفظ التعديلات' : 'إنشاء الدفعة'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: 'var(--text-muted)', bg: 'var(--bg-base)' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800,
      color: s.color, background: s.bg,
      border: `1px solid ${s.color}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {s.label}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════
   PROGRESS BAR
══════════════════════════════════════════════════════════ */
function ProgressBar({ reserved, total }) {
  const pct = total > 0 ? Math.min(100, Math.round((reserved / total) * 100)) : 0
  return (
    <div style={{ minWidth: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(reserved)} / {fmt(total)} كجم</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)' }}>{pct}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct}%`,
          background: pct >= 100 ? 'var(--green)' : pct >= 70 ? 'var(--gold)' : 'var(--teal)',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   TABLE
══════════════════════════════════════════════════════════ */
function BatchesTable({ batches, onEdit, onDelete }) {
  if (batches.length === 0)
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <Package size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
        <div style={{ fontSize: 14, fontWeight: 700 }}>لا توجد دفعات</div>
        <div style={{ fontSize: 12, marginTop: 4 }}>ابدأ بإنشاء أول دفعة ذبح</div>
      </div>
    )

  return (
    <div className="db-table-wrap">
      <table className="db-table">
        <thead>
          <tr>
            <th>#</th>
            <th>الدفعة</th>
            <th>تاريخ الذبح</th>
            <th>التقدم</th>
            <th>الحالة</th>
            <th>ملاحظات</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {batches.map(b => (
            <tr key={b.id}>
              <td>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: 'var(--text-muted)',
                  background: 'var(--bg-base)', padding: '2px 8px', borderRadius: 6,
                }}>#{b.id}</span>
              </td>
              <td>
                <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{b.title}</div>
                {b.productId && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Product #{b.productId}
                  </div>
                )}
              </td>
              <td>
                <span style={{ fontSize: 12, color: 'var(--text-sec)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={12} color="var(--text-muted)" />
                  {fmtDate(b.slaughterDate)}
                </span>
              </td>
              <td style={{ minWidth: 160 }}>
                <ProgressBar reserved={b.reservedKg} total={b.totalKg} />
              </td>
              <td><StatusBadge status={b.status} /></td>
              <td>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 160, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.notes || '—'}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 5 }}>
                  <button className="db-btn db-btn--ghost db-btn--sm"
                    onClick={() => onEdit(b)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--gold)', borderColor: 'var(--gold-20)' }}>
                    <Pencil size={13} /> تعديل
                  </button>
                  <button className="db-btn db-btn--danger db-btn--sm"
                    onClick={() => onDelete(b)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
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
function BatchesContent() {
  const [batches,  setBatches]  = useState([])
  const [products, setProducts] = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const pageSize = 10

  const [search,      setSearch]      = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [toast,   setToast]   = useState(null)

  const [showCreate,    setShowCreate]    = useState(false)
  const [editData,      setEditData]      = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  /* ── Load Products (for dropdown) ── */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/Products?pageSize=200&isActive=true`, { headers: authHeaders() })
        if (!res.ok) return
        const json = await res.json()
        const d = json?.data?.data ?? json?.data ?? json
        setProducts(Array.isArray(d) ? d : (d.data ?? []))
      } catch {}
    }
    loadProducts()
  }, [])

  /* ── Load Batches ── */
  const load = useCallback(async (pg, s) => {
    setLoading(true)
    setError(null)
    try {
      let url = `${API_BASE_URL}/api/SlaughterBatches?page=${pg}&pageSize=${pageSize}`
      const res = await fetch(url, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const d = json?.data?.data ?? json?.data ?? json
      const list = Array.isArray(d) ? d : (d.items ?? d.data ?? [])
      setTotal(d.total ?? d.Total ?? list.length)
      setBatches(list)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(page, search) }, [page, search, load])

  /* ── Delete ── */
  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/SlaughterBatches/${deleteTarget.id}`, {
        method: 'DELETE', headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setToast({ msg: 'تم حذف الدفعة بنجاح', type: 'ok' })
      setDeleteTarget(null)
      load(page, search)
    } catch (e) {
      setToast({ msg: `فشل الحذف: ${e.message}`, type: 'err' })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSuccess = (msg) => {
    setToast({ msg, type: 'ok' })
    load(1, search)
    setPage(1)
  }

  /* ── Filter client-side by status ── */
  const filtered = statusFilter
    ? batches.filter(b => b.status === statusFilter)
    : batches

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  /* ── Stats ── */
  const openBatches     = batches.filter(b => b.status === 'Open').length
  const totalReservedKg = batches.reduce((s, b) => s + (b.reservedKg || 0), 0)
  const totalKg         = batches.reduce((s, b) => s + (b.totalKg || 0), 0)

  return (
    <div className="db-page db-animate-in">

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      {(showCreate || editData) && (
        <FormModal
          editData={editData}
          products={products}
          onClose={() => { setShowCreate(false); setEditData(null) }}
          onSuccess={handleSuccess}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          batch={deleteTarget}
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
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>إدارة الدفعات</div>
          <h1 style={{
            fontSize: 22, fontWeight: 900, color: 'var(--text)',
            lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Package size={22} color="var(--gold)" /> دفعات الذبح
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="db-btn db-btn--ghost" onClick={() => load(page, search)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> تحديث
          </button>
          <button className="db-btn db-btn--gold" onClick={() => setShowCreate(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Plus size={16} /> دفعة جديدة
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="db-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
        {[
          { label: 'إجمالي الدفعات',    value: total.toLocaleString('ar-EG'),       unit: 'دفعة',  color: 'var(--gold)',  icon: <Package size={18} /> },
          { label: 'دفعات مفتوحة',      value: openBatches.toLocaleString('ar-EG'), unit: 'مفتوح', color: 'var(--green)', icon: <CheckCircle size={18} /> },
          { label: 'إجمالي الكميات',    value: fmt(totalKg),                        unit: 'كجم',   color: 'var(--teal)',  icon: <Scale size={18} /> },
          { label: 'إجمالي المحجوز',    value: fmt(totalReservedKg),               unit: 'كجم',   color: 'var(--gold)',  icon: <TrendingUp size={18} /> },
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
            <input type="text" className="db-input"
              placeholder="بحث بعنوان الدفعة…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
              style={{ paddingRight: 36 }}
            />
          </div>
          {searchInput && (
            <button className="db-btn db-btn--ghost db-btn--sm"
              onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <X size={13} /> مسح
            </button>
          )}

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { val: '',         label: 'الكل'   },
              { val: 'Open',     label: 'مفتوح'  },
              { val: 'Upcoming', label: 'قادم'   },
              { val: 'Full',     label: 'ممتلئ'  },
              { val: 'Closed',   label: 'مغلق'   },
            ].map(({ val, label }) => (
              <button key={val}
                className={`db-tab${statusFilter === val ? ' db-tab--active' : ''}`}
                style={{ height: 30, padding: '0 10px', fontSize: 12 }}
                onClick={() => setStatusFilter(val)}>
                {label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, whiteSpace: 'nowrap', marginRight: 'auto' }}>
            {filtered.length} دفعة
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="db-error-box" style={{ margin: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> {error}
            <button className="db-btn db-btn--ghost db-btn--sm"
              onClick={() => load(page, search)} style={{ marginRight: 'auto' }}>
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && !error && (
          <div className="db-loading">
            <Loader2 size={32} className="db-spinner" color="var(--gold)" />
            جاري تحميل الدفعات…
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <BatchesTable
            batches={filtered}
            onEdit={setEditData}
            onDelete={setDeleteTarget}
          />
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="db-pagination">
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700 }}>
              صفحة {page} من {totalPages} — {total} دفعة
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
export default function BatchesPage() {
  return (
    <DashboardLayout title="دفعات الذبح" breadcrumb="إدارة دفعات الذبح">
      <BatchesContent />
    </DashboardLayout>
  )
}