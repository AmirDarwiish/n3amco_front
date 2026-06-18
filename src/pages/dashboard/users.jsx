import { useState, useEffect, useCallback } from "react"
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'
import DashboardLayout from './DashboardLayout'
import '../../styles/dashboard.css'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

/* ═══════════════════════════════
   PERMISSION TRANSLATIONS
═══════════════════════════════ */
const PERM_NAMES = {
  ACCOUNTS_VIEW:               'عرض الحسابات',
  ACCOUNTS_CREATE:             'إضافة حسابات',
  ACCOUNTS_UPDATE:             'تعديل حسابات',
  ACCOUNTS_DELETE:             'حذف حسابات',
  CUSTOMERS_CREATE:            'إضافة عميل',
  CUSTOMERS_VIEW:              'عرض العملاء',
  CUSTOMERS_UPDATE:            'تعديل عميل',
  CUSTOMERS_DELETE:            'حذف عميل',
  CUSTOMER_PAYMENT_CREATE:     'إضافة دفعة عميل',
  DASHBOARD_VIEW:              'عرض لوحة التحكم',
  JOURNAL_VIEW:                'عرض القيود',
  JOURNAL_POST:                'ترحيل القيود',
  JOURNAL_CREATE:              'إضافة قيد',
  SALES_READ:                  'عرض المبيعات',
  SALES_CREATE:                'إضافة مبيعات',
  SUPPLIER_PAYMENT_CREATE:     'إضافة دفعة مورد',
  SUPPLIER_PAYMENT_VIEW:       'عرض مدفوعات الموردين',
  SUPPLIERS_CREATE:            'إضافة مورد',
  SUPPLIERS_VIEW:              'عرض الموردين',
  SUPPLIERS_UPDATE:            'تعديل مورد',
  SUPPLIERS_DELETE:            'حذف مورد',
  RESERVATION_READ:            'عرض الحجوزات',
  RESERVATION_CREATE:          'إضافة حجز',
  RESERVATION_UPDATE:          'تعديل حجز',
  BATCH_READ:                  'عرض الدفعات',
  BATCH_CREATE:                'إضافة دفعة',
  BATCH_UPDATE:                'تعديل دفعة',
  BATCH_DELETE:                'حذف دفعة',
  WAITLIST_READ:               'عرض قائمة الانتظار',
  WAITLIST_DELETE:             'حذف من قائمة الانتظار',
  WEBSITE_VIEW:                'عرض الموقع',
  WEBSITE_UPDATE:              'تعديل الموقع',
  PRODUCTS_CREATE:             'إضافة منتج',
  PRODUCTS_VIEW:               'عرض المنتجات',
  PRODUCTS_UPDATE:             'تعديل منتج',
  PRODUCTS_DELETE:             'حذف منتج',
  PRODUCTS_ADD_BATCH:          'إضافة دفعة منتجات',
  PERMISSIONS_VIEW:            'عرض الصلاحيات',
  ROLES_EDIT:                  'تعديل الأدوار',
  ROLES_VIEW:                  'عرض الأدوار',
  ROLES_PERMISSIONS_VIEW:      'عرض صلاحيات الدور',
  ROLES_PERMISSIONS_ASSIGN:    'إسناد صلاحيات للدور',
  ROLES_PERMISSIONS_REMOVE:    'إزالة صلاحيات من الدور',
  ROLES_CREATE:                'إضافة دور',
  USERS_VIEW:                  'عرض المستخدمين',
  USERS_CREATE:                'إضافة مستخدم',
  USERS_CHANGE_ROLE:           'تغيير دور المستخدم',
  USERS_EDIT:                  'تعديل مستخدم',
  USERS_CHANGE_STATUS:         'تغيير حالة المستخدم',
  USERS_RESET_PASSWORD:        'إعادة تعيين كلمة المرور',
  UNITS_CREATE:                'إضافة وحدة',
  UNITS_VIEW:                  'عرض الوحدات',
  UNITS_UPDATE:                'تعديل وحدة',
  UNITS_DELETE:                'حذف وحدة',
}

const MODULE_NAMES = {
  ACCOUNTS:    'الحسابات',
  CUSTOMERS:   'العملاء',
  DASHBOARD:   'لوحة التحكم',
  JOURNAL:     'القيود المحاسبية',
  SALES:       'المبيعات',
  SUPPLIERS:   'الموردون',
  SUPPLIER:    'مدفوعات الموردين',
  CUSTOMER:    'مدفوعات العملاء',
  RESERVATION: 'الحجوزات',
  BATCH:       'الدفعات',
  WAITLIST:    'قائمة الانتظار',
  WEBSITE:     'الموقع الإلكتروني',
  PRODUCTS:    'المنتجات',
  PERMISSIONS: 'الصلاحيات',
  ROLES:       'الأدوار',
  USERS:       'المستخدمون',
  UNITS:       'الوحدات',
}

// استخراج اسم الـ module من كود الصلاحية
const getModule = code => {
  if (code.startsWith('SUPPLIER_PAYMENT')) return 'SUPPLIER'
  if (code.startsWith('CUSTOMER_PAYMENT')) return 'CUSTOMER'
  return code.split('_')[0]
}

const permName   = code => PERM_NAMES[code]   || code
const moduleName = mod  => MODULE_NAMES[mod]   || mod

/* ═══════════════════════════════
   STYLES
═══════════════════════════════ */
const S = {
  wrap:     { background:'var(--bg-base)', minHeight:'100vh', padding:'20px 16px', direction:'rtl', color:'var(--text)', fontFamily:"'Cairo',sans-serif", boxSizing:'border-box' },
  card:     { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' },
  row:      { padding:'11px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap', transition:'background .12s' },
  lbl:      { fontSize:11, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:5 },
  inp:      { width:'100%', boxSizing:'border-box', height:38, background:'var(--bg-base)', border:'1px solid var(--border-md)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'0 11px', fontFamily:"'Cairo',sans-serif", outline:'none' },
  sel:      { width:'100%', boxSizing:'border-box', height:38, background:'var(--bg-base)', border:'1px solid var(--border-md)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'0 11px', fontFamily:"'Cairo',sans-serif", outline:'none', cursor:'pointer' },
  btnGold:  { height:36, padding:'0 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#d4a855,var(--gold))', color:'#080d16', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:6 },
  btnGhost: { height:32, padding:'0 12px', borderRadius:7, border:'1px solid var(--border-md)', background:'transparent', color:'var(--text-muted)', fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:6 },
  btnDanger:{ height:32, padding:'0 12px', borderRadius:7, border:'1px solid rgba(248,113,113,.3)', background:'rgba(248,113,113,.08)', color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:6 },
  tag:      (color='var(--gold)') => ({ display:'inline-block', padding:'2px 8px', borderRadius:12, fontSize:10, fontWeight:700, background:`${color}22`, color, whiteSpace:'nowrap' }),
  err:      { color:'var(--red)', fontSize:12, padding:'7px 10px', background:'var(--red-bg)', borderRadius:7 },
}

/* ═══════════════════════════════
   MODAL
═══════════════════════════════ */
function Modal({ title, onClose, children, maxWidth=480 }) {
  useEffect(() => {
    const fn = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, overflowY:'auto' }}
    >
      <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:16, width:'100%', maxWidth, padding:24, direction:'rtl', boxShadow:'0 25px 60px rgba(0,0,0,.6)', margin:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontSize:15, fontWeight:800, color:'#C9A96E' }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#64748b', fontSize:22, cursor:'pointer', lineHeight:1, padding:4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════
   TOAST
═══════════════════════════════ */
function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{ position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', zIndex:2000,
      background: toast.ok ? 'rgba(52,211,153,.15)' : 'rgba(248,113,113,.15)',
      border:`1px solid ${toast.ok ? '#34d399' : '#f87171'}`,
      color: toast.ok ? '#34d399' : '#f87171',
      borderRadius:10, padding:'10px 24px', fontSize:14, fontWeight:600,
      boxShadow:'0 8px 24px rgba(0,0,0,.4)', pointerEvents:'none', whiteSpace:'nowrap',
    }}>{toast.msg}</div>
  )
}

/* ═══════════════════════════════
   PERMISSION CHECKBOXES
═══════════════════════════════ */
function PermissionCheckboxes({ all, selected, onChange }) {
  const grouped = all.reduce((acc, p) => {
    const m = getModule(p.code || p)
    if (!acc[m]) acc[m] = []
    acc[m].push(p)
    return acc
  }, {})

  const toggle = code => {
    if (selected.includes(code)) onChange(selected.filter(c => c !== code))
    else onChange([...selected, code])
  }

  const toggleModule = perms => {
    const codes = perms.map(p => p.code || p)
    const allOn = codes.every(c => selected.includes(c))
    if (allOn) onChange(selected.filter(c => !codes.includes(c)))
    else onChange([...new Set([...selected, ...codes])])
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {Object.entries(grouped).map(([module, perms]) => {
        const codes = perms.map(p => p.code || p)
        const allOn  = codes.every(c => selected.includes(c))
        const someOn = codes.some(c => selected.includes(c))
        return (
          <div key={module} style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:10, overflow:'hidden' }}>
            <div
              onClick={() => toggleModule(perms)}
              style={{ padding:'9px 14px', borderBottom:'1px solid #334155', display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}
            >
              <input
                type="checkbox"
                checked={allOn}
                ref={el => { if (el) el.indeterminate = someOn && !allOn }}
                onChange={() => toggleModule(perms)}
                onClick={e => e.stopPropagation()}
                style={{ accentColor:'#C9A96E', width:15, height:15, flexShrink:0 }}
              />
              <span style={{ fontSize:12, fontWeight:800, color:'#C9A96E' }}>{moduleName(module)}</span>
              <span style={{ fontSize:11, color:'#475569', marginRight:'auto' }}>
                {codes.filter(c => selected.includes(c)).length}/{codes.length}
              </span>
            </div>
            <div style={{ padding:'10px 14px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'8px 12px' }}>
              {perms.map(p => {
                const code = p.code || p
                const isOn = selected.includes(code)
                return (
                  <label
                    key={code}
                    style={{ display:'flex', alignItems:'center', gap:7, cursor:'pointer', padding:'5px 8px', borderRadius:6, background: isOn ? 'rgba(201,169,110,.07)' : 'transparent', transition:'background .1s' }}
                  >
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggle(code)}
                      style={{ accentColor:'#C9A96E', width:13, height:13, flexShrink:0 }}
                    />
                    <span style={{ fontSize:12, color: isOn ? '#f1f5f9' : '#64748b', lineHeight:1.3 }}>
                      {permName(code)}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ═══════════════════════════════
   USERS TAB
═══════════════════════════════ */
function UsersTab({ showToast }) {
  const [users, setUsers]       = useState([])
  const [roles, setRoles]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)  // 'create' | 'edit' | 'resetpw' | 'changerole' | 'status'
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ur, rr] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users`,  { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/roles`,  { headers: authHeaders() }),
      ])
      if (ur.ok) { const d = await ur.json(); setUsers(Array.isArray(d) ? d : d?.data || []) }
      if (rr.ok) { const d = await rr.json(); setRoles(Array.isArray(d) ? d : d?.data || []) }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = users.filter(u =>
    !search ||
    u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const openModal = (type, user = null) => { setSelected(user); setModal(type) }
  const closeModal = () => { setModal(null); setSelected(null) }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <input
          style={{ ...S.inp, flex:1, minWidth:180, maxWidth:300 }}
          placeholder="بحث بالاسم أو الإيميل..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <button style={S.btnGhost} onClick={() => navigate('/dashboard/reports/activity')}>
          تقارير النشاط
        </button>
        <button style={S.btnGold} onClick={() => openModal('create')}>+ مستخدم جديد</button>
      </div>

      {/* Table */}
      <div style={S.card}>
        {loading
          ? <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>جاري التحميل...</div>
          : filtered.length === 0
            ? <div style={{ padding:40, textAlign:'center', color:'#475569' }}>لا توجد نتائج</div>
            : filtered.map(u => (
              <div key={u.id}
                style={{ ...S.row }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,.04)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                {/* Avatar + Info */}
                <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0, flex:1 }}>
                  <div style={{
                    width:38, height:38, borderRadius:'50%', flexShrink:0,
                    background: u.isActive ? 'rgba(201,169,110,.15)' : 'rgba(100,116,139,.15)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color: u.isActive ? '#C9A96E' : '#64748b', fontWeight:800, fontSize:14,
                  }}>
                    {(u.fullName || '?')[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {u.fullName}
                    </div>
                    <div style={{ fontSize:11, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {u.email}
                    </div>
                  </div>
                </div>

                {/* Badges + Actions */}
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', flexShrink:0 }}>
                  {u.roles?.map(r => <span key={r} style={S.tag('#a78bfa')}>{r}</span>)}
                  <span style={S.tag(u.isActive ? '#34d399' : '#f87171')}>
                    {u.isActive ? 'نشط' : 'غير نشط'}
                  </span>

                  {/* Actions */}
                  <button style={S.btnGhost} onClick={() => openModal('edit', u)}>تعديل</button>
                  <button style={S.btnGhost} onClick={() => openModal('changerole', u)}>تغيير الدور</button>
                  <button style={S.btnGhost} onClick={() => openModal('resetpw', u)}>كلمة المرور</button>
                  <button
                    style={u.isActive ? S.btnDanger : S.btnGhost}
                    onClick={() => openModal('status', u)}
                  >
                    {u.isActive ? 'تعطيل' : 'تفعيل'}
                  </button>
                </div>
              </div>
            ))
        }
      </div>

      {/* Modals */}
      {modal === 'create'     && <CreateUserModal   roles={roles}  onClose={closeModal} onSuccess={() => { closeModal(); showToast('تم إضافة المستخدم'); load() }} />}
      {modal === 'edit'       && <EditUserModal     user={selected} onClose={closeModal} onSuccess={() => { closeModal(); showToast('تم حفظ التعديلات'); load() }} />}
      {modal === 'changerole' && <ChangeRoleModal   user={selected} roles={roles} onClose={closeModal} onSuccess={() => { closeModal(); showToast('تم تغيير الدور'); load() }} />}
      {modal === 'resetpw'    && <ResetPwModal      user={selected} onClose={closeModal} onSuccess={() => { closeModal(); showToast('تم تغيير كلمة المرور') }} />}
      {modal === 'status'     && <ChangeStatusModal user={selected} onClose={closeModal} onSuccess={() => { closeModal(); showToast(selected?.isActive ? 'تم تعطيل الحساب' : 'تم تفعيل الحساب'); load() }} />}
    </div>
  )
}

/* ── Create User ─────────────────────────────────────────── */
function CreateUserModal({ roles, onClose, onSuccess }) {
  const [form, setForm]       = useState({ fullName:'', email:'', password:'', roleId:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.fullName.trim()) { setError('الاسم مطلوب'); return }
    if (!form.email.trim())    { setError('الإيميل مطلوب'); return }
    if (!form.password.trim()) { setError('كلمة المرور مطلوبة'); return }
    if (!form.roleId)          { setError('يجب اختيار دور'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...form, roleId: parseInt(form.roleId) }),
      })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="إضافة مستخدم جديد" onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
        {[
          { k:'fullName', label:'الاسم الكامل *', ph:'الاسم...', type:'text' },
          { k:'email',    label:'الإيميل *',       ph:'user@mail.com', type:'email' },
          { k:'password', label:'كلمة المرور *',   ph:'••••••••', type:'password' },
        ].map(f => (
          <div key={f.k}>
            <label style={S.lbl}>{f.label}</label>
            <input type={f.type} value={form[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph} style={S.inp} />
          </div>
        ))}
        <div>
          <label style={S.lbl}>الدور *</label>
          <select value={form.roleId} onChange={e => set('roleId', e.target.value)} style={S.sel}>
            <option value="">-- اختر دور --</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button onClick={submit} disabled={loading} style={S.btnGold}>{loading ? '...' : 'إضافة'}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Edit User ───────────────────────────────────────────── */
function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm]       = useState({ fullName: user?.fullName || '', email: user?.email || '', isActive: user?.isActive ?? true })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.fullName.trim()) { setError('الاسم مطلوب'); return }
    if (!form.email.trim())    { setError('الإيميل مطلوب'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ fullName: form.fullName.trim(), email: form.email.trim(), isActive: form.isActive }),
      })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`تعديل: ${user?.fullName}`} onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
        <div>
          <label style={S.lbl}>الاسم الكامل</label>
          <input value={form.fullName} onChange={e => set('fullName', e.target.value)} style={S.inp} />
        </div>
        <div>
          <label style={S.lbl}>الإيميل</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={S.inp} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ accentColor:'#C9A96E', width:16, height:16, cursor:'pointer' }} />
          <label htmlFor="isActive" style={{ fontSize:13, color:'#94a3b8', cursor:'pointer' }}>الحساب نشط</label>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button onClick={submit} disabled={loading} style={S.btnGold}>{loading ? '...' : 'حفظ'}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Change Role ─────────────────────────────────────────── */
function ChangeRoleModal({ user, roles, onClose, onSuccess }) {
  const currentRole = roles.find(r => user?.roles?.includes(r.name))
  const [roleId, setRoleId]   = useState(currentRole?.id?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = async () => {
    if (!roleId) { setError('يجب اختيار دور'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/change-role`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ userId: user.id, roleId: parseInt(roleId) }),
      })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`تغيير دور: ${user?.fullName}`} onClose={onClose} maxWidth={400}>
      <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
        {/* Current role info */}
        <div style={{ background:'rgba(201,169,110,.06)', border:'1px solid rgba(201,169,110,.2)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#94a3b8' }}>
          الدور الحالي:&nbsp;
          <span style={{ color:'#a78bfa', fontWeight:700 }}>
            {user?.roles?.join(', ') || 'بدون دور'}
          </span>
        </div>
        <div>
          <label style={S.lbl}>الدور الجديد *</label>
          <select value={roleId} onChange={e => setRoleId(e.target.value)} style={S.sel}>
            <option value="">-- اختر دور --</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button onClick={submit} disabled={loading} style={S.btnGold}>{loading ? '...' : 'تغيير الدور'}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Change Status ───────────────────────────────────────── */
function ChangeStatusModal({ user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/status`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify(!user.isActive),
      })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={user?.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'} onClose={onClose} maxWidth={380}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <p style={{ fontSize:13, color:'#94a3b8', lineHeight:1.7 }}>
          هل أنت متأكد من {user?.isActive ? 'تعطيل' : 'تفعيل'} حساب
          <strong style={{ color:'#f1f5f9' }}> {user?.fullName}</strong>؟
        </p>
        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button
            onClick={submit}
            disabled={loading}
            style={user?.isActive ? { ...S.btnGold, background:'#f87171', color:'#fff' } : S.btnGold}
          >
            {loading ? '...' : user?.isActive ? 'تعطيل' : 'تفعيل'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Reset Password ──────────────────────────────────────── */
function ResetPwModal({ user, onClose, onSuccess }) {
  const [pw, setPw]           = useState('')
  const [show, setShow]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = async () => {
    if (!pw.trim())      { setError('ادخل كلمة المرور'); return }
    if (pw.length < 6)   { setError('كلمة المرور 6 أحرف على الأقل'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${user.id}/reset-password`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ newPassword: pw }),
      })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`تغيير كلمة المرور: ${user?.fullName}`} onClose={onClose} maxWidth={380}>
      <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
        <div style={{ position:'relative' }}>
          <label style={S.lbl}>كلمة المرور الجديدة</label>
          <input
            type={show ? 'text' : 'password'}
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="••••••••"
            style={{ ...S.inp, paddingLeft:36 }}
          />
          <button
            onClick={() => setShow(s => !s)}
            style={{ position:'absolute', left:10, bottom:9, background:'none', border:'none', color:'#64748b', cursor:'pointer', padding:0, fontSize:13 }}
          >
            {show ? '🙈' : '👁️'}
          </button>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button onClick={submit} disabled={loading} style={S.btnGold}>{loading ? '...' : 'تغيير'}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ═══════════════════════════════
   ROLES TAB
═══════════════════════════════ */
function RolesTab({ showToast }) {
  const [roles, setRoles]       = useState([])
  const [allPerms, setAllPerms] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [rr, pr] = await Promise.all([
        fetch(`${API_BASE_URL}/api/roles`,       { headers: authHeaders() }),
        fetch(`${API_BASE_URL}/api/permissions`, { headers: authHeaders() }),
      ])
      if (rr.ok) { const d = await rr.json(); setRoles(Array.isArray(d) ? d : d?.data || []) }
      if (pr.ok) { const d = await pr.json(); setAllPerms(Array.isArray(d) ? d : d?.data || []) }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <button style={S.btnGold} onClick={() => { setSelected(null); setModal('create') }}>+ دور جديد</button>
      </div>
      <div style={S.card}>
        {loading
          ? <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>جاري التحميل...</div>
          : roles.length === 0
            ? <div style={{ padding:40, textAlign:'center', color:'#475569' }}>لا توجد أدوار</div>
            : roles.map(r => (
              <div key={r.id}
                style={{ ...S.row }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,.04)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#C9A96E', flexShrink:0 }} />
                  <span style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{r.name}</span>
                  {r.usersCount !== undefined && (
                    <span style={S.tag('#64748b')}>{r.usersCount} مستخدم</span>
                  )}
                </div>
                <button style={S.btnGhost} onClick={() => { setSelected(r); setModal('edit') }}>
                  تعديل الصلاحيات
                </button>
              </div>
            ))
        }
      </div>

      {modal === 'create' && <CreateRoleModal allPerms={allPerms} onClose={() => setModal(null)} onSuccess={() => { setModal(null); showToast('تم إنشاء الدور'); load() }} />}
      {modal === 'edit'   && <EditRoleModal   role={selected} allPerms={allPerms} onClose={() => setModal(null)} onSuccess={() => { setModal(null); showToast('تم حفظ التعديلات'); load() }} />}
    </div>
  )
}

/* ── Create Role ─────────────────────────────────────────── */
function CreateRoleModal({ allPerms, onClose, onSuccess }) {
  const [name, setName]         = useState('')
  const [selected, setSelected] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const submit = async () => {
    if (!name.trim()) { setError('اسم الدور مطلوب'); return }
    setLoading(true); setError('')
    try {
      const r1 = await fetch(`${API_BASE_URL}/api/roles`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ name: name.trim() }),
      })
      if (!r1.ok) { const j = await r1.json().catch(() => {}); throw new Error(j?.message || `خطأ ${r1.status}`) }
      const created = await r1.json()
      const newId = created?.roleId || created?.id || created?.data?.id
      if (selected.length > 0 && newId) {
        await fetch(`${API_BASE_URL}/api/roles/${newId}`, {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ roleName: name.trim(), permissionCodes: selected }),
        })
      }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="إنشاء دور جديد" onClose={onClose} maxWidth={620}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={S.lbl}>اسم الدور *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="مثال: مدير المبيعات" style={S.inp} />
        </div>
        <div>
          <label style={{ ...S.lbl, marginBottom:10 }}>الصلاحيات ({selected.length} محددة)</label>
          <div style={{ maxHeight:380, overflowY:'auto' }}>
            <PermissionCheckboxes all={allPerms} selected={selected} onChange={setSelected} />
          </div>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button onClick={submit} disabled={loading} style={S.btnGold}>{loading ? '...' : 'إنشاء'}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Edit Role ───────────────────────────────────────────── */
function EditRoleModal({ role, allPerms, onClose, onSuccess }) {
  const [name, setName]         = useState(role?.name || '')
  const [selected, setSelected] = useState([])
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/roles/${role.id}/permissions`, { headers: authHeaders() })
        if (r.ok) {
          const d = await r.json()
          const perms = d?.permissions || d?.data?.permissions || d || []
          setSelected(perms.map(p => p.code || p))
        }
      } catch {}
      setFetching(false)
    })()
  }, [role.id])

  const submit = async () => {
    if (!name.trim()) { setError('الاسم مطلوب'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/roles/${role.id}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ roleName: name.trim(), permissionCodes: selected }),
      })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`تعديل الدور: ${role?.name}`} onClose={onClose} maxWidth={640}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <label style={S.lbl}>اسم الدور *</label>
          <input value={name} onChange={e => setName(e.target.value)} style={S.inp} />
        </div>

        {/* Summary */}
        <div style={{ background:'rgba(201,169,110,.06)', border:'1px solid rgba(201,169,110,.2)', borderRadius:8, padding:'8px 14px', fontSize:12, color:'#C9A96E', display:'flex', justifyContent:'space-between' }}>
          <span>الصلاحيات المحددة</span>
          <span style={{ fontWeight:800 }}>{selected.length} من {allPerms.length}</span>
        </div>

        <div style={{ maxHeight:420, overflowY:'auto' }}>
          {fetching
            ? <div style={{ color:'#94a3b8', padding:24, textAlign:'center' }}>جاري التحميل...</div>
            : <PermissionCheckboxes all={allPerms} selected={selected} onChange={setSelected} />
          }
        </div>

        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button onClick={submit} disabled={loading || fetching} style={S.btnGold}>
            {loading ? '...' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function UsersRolesPage() {
  const [tab, setTab]     = useState('users')
  const [toast, setToast] = useState(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const tabs = [
    { id:'users', label:'المستخدمون' },
    { id:'roles', label:'الأدوار والصلاحيات' },
  ]

  return (
    <DashboardLayout title="إدارة المستخدمين والأدوار" breadcrumb="الإدارة">
      <div style={{ ...S.wrap, padding:0 }}>
        <Toast toast={toast} />

        <div style={{ padding:'0 24px 24px', direction:'rtl' }}>
          {/* Tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:20, borderBottom:'1px solid var(--border)', paddingBottom:1, overflowX:'auto' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                height:38, padding:'0 20px', border:'none', cursor:'pointer', whiteSpace:'nowrap',
                background:'transparent', fontFamily:"'Cairo',sans-serif", fontSize:14,
                color:        tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
                fontWeight:   tab === t.id ? 800 : 400,
                borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: -1, transition:'all .15s',
              }}>{t.label}</button>
            ))}
          </div>

          {tab === 'users' && <UsersTab showToast={showToast} />}
          {tab === 'roles' && <RolesTab showToast={showToast} />}
        </div>
      </div>
    </DashboardLayout>
  )
}