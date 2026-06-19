import { useState, useEffect, useCallback } from 'react'
import API_BASE_URL from '../../config'
import DashboardLayout from './DashboardLayout'
import '../../styles/dashboard.css'

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

/* ═══════════════════════════════
   STYLES
═══════════════════════════════ */
const S = {
  card:      { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' },
  row:       { padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap', transition:'background .12s' },
  lbl:       { fontSize:11, color:'var(--text-muted)', fontWeight:600, display:'block', marginBottom:5 },
  inp:       { width:'100%', boxSizing:'border-box', height:38, background:'var(--bg-base)', border:'1px solid var(--border-md)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'0 11px', fontFamily:"'Cairo',sans-serif", outline:'none' },
  textarea:  { width:'100%', boxSizing:'border-box', minHeight:80, background:'var(--bg-base)', border:'1px solid var(--border-md)', borderRadius:8, color:'var(--text)', fontSize:13, padding:'9px 11px', fontFamily:"'Cairo',sans-serif", outline:'none', resize:'vertical' },
  btnGold:   { height:36, padding:'0 16px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#d4a855,var(--gold))', color:'#080d16', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:6 },
  btnGhost:  { height:32, padding:'0 12px', borderRadius:7, border:'1px solid var(--border-md)', background:'transparent', color:'var(--text-muted)', fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:6 },
  btnDanger: { height:32, padding:'0 12px', borderRadius:7, border:'1px solid rgba(248,113,113,.3)', background:'rgba(248,113,113,.08)', color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:6 },
  btnSmGold: { height:30, padding:'0 12px', borderRadius:7, border:'none', background:'linear-gradient(135deg,#d4a855,var(--gold))', color:'#080d16', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'Cairo',sans-serif", whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:5 },
  tag:       (c='var(--gold)') => ({ display:'inline-block', padding:'2px 8px', borderRadius:12, fontSize:10, fontWeight:700, background:`${c}22`, color:c, whiteSpace:'nowrap' }),
  err:       { color:'var(--red)', fontSize:12, padding:'7px 10px', background:'var(--red-bg)', borderRadius:7 },
  sec:       { marginBottom:28 },
  secTitle:  { fontSize:13, fontWeight:800, color:'var(--gold)', marginBottom:12, display:'flex', alignItems:'center', gap:8 },
  grid2:     { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  grid3:     { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 },
}

/* ═══════════════════════════════
   TOAST
═══════════════════════════════ */
function Toast({ toast }) {
  if (!toast) return null
  return (
    <div style={{
      position:'fixed', top:20, left:'50%', transform:'translateX(-50%)', zIndex:2000,
      background: toast.ok ? 'rgba(52,211,153,.15)' : 'rgba(248,113,113,.15)',
      border:`1px solid ${toast.ok ? '#34d399' : '#f87171'}`,
      color: toast.ok ? '#34d399' : '#f87171',
      borderRadius:10, padding:'10px 24px', fontSize:14, fontWeight:600,
      boxShadow:'0 8px 24px rgba(0,0,0,.4)', pointerEvents:'none', whiteSpace:'nowrap',
    }}>{toast.msg}</div>
  )
}

/* ═══════════════════════════════
   MODAL
═══════════════════════════════ */
function Modal({ title, onClose, children, maxWidth=520 }) {
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
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, width:'100%', maxWidth, padding:24, direction:'rtl', boxShadow:'0 25px 60px rgba(0,0,0,.6)', margin:'auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <span style={{ fontSize:15, fontWeight:800, color:'var(--gold)' }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:22, cursor:'pointer', lineHeight:1, padding:4 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════
   FIELD HELPERS
═══════════════════════════════ */
function Field({ label, children }) {
  return (
    <div>
      <label style={S.lbl}>{label}</label>
      {children}
    </div>
  )
}

function Inp({ label, value, onChange, placeholder, type='text' }) {
  return (
    <Field label={label}>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} style={S.inp} />
    </Field>
  )
}

function Textarea({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || ''} style={S.textarea} />
    </Field>
  )
}

/* ═══════════════════════════════
   SETTINGS TAB
═══════════════════════════════ */
function SettingsTab({ showToast }) {
  const [form, setForm]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch(`${API_BASE_URL}/api/v1/admin/website/settings`, { headers: authHeaders() })
        if (r.ok) {
          const d = await r.json()
          setForm(d?.data || d)
        } else {
          setForm({})
        }
      } catch { setForm({}) }
      setLoading(false)
    })()
  }, [])

  const save = async () => {
    setSaving(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/website/settings`, {
        method:'PUT', headers:authHeaders(), body:JSON.stringify(form),
      })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      showToast('تم حفظ الإعدادات')
    } catch(e) { setError(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>جاري التحميل...</div>

  return (
    <div style={{ direction:'rtl' }}>

      {/* الهوية */}
      <div style={S.sec}>
        <div style={S.secTitle}>🏷️ هوية الموقع</div>
        <div style={{ ...S.card, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={S.grid2}>
            <Inp label="اسم الموقع" value={form?.siteName} onChange={v => set('siteName', v)} placeholder="N3AMCO" />
            <Inp label="الشعار الفرعي" value={form?.siteTagline} onChange={v => set('siteTagline', v)} placeholder="أفضل لحوم النعام" />
          </div>
          <div style={S.grid2}>
            <Inp label="رابط اللوجو" value={form?.logoUrl} onChange={v => set('logoUrl', v)} placeholder="https://..." />
            <Inp label="رابط الـ Favicon" value={form?.faviconUrl} onChange={v => set('faviconUrl', v)} placeholder="https://..." />
          </div>
          <div style={S.grid2}>
            <div>
              <label style={S.lbl}>اللون الأساسي</label>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="color" value={form?.primaryColor || '#C9A96E'} onChange={e => set('primaryColor', e.target.value)}
                  style={{ width:38, height:38, borderRadius:8, border:'1px solid var(--border-md)', cursor:'pointer', padding:2, background:'var(--bg-base)' }} />
                <input value={form?.primaryColor || ''} onChange={e => set('primaryColor', e.target.value)} style={{ ...S.inp, flex:1 }} placeholder="#C9A96E" />
              </div>
            </div>
            <div>
              <label style={S.lbl}>اللون الثانوي</label>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <input type="color" value={form?.secondaryColor || '#080d16'} onChange={e => set('secondaryColor', e.target.value)}
                  style={{ width:38, height:38, borderRadius:8, border:'1px solid var(--border-md)', cursor:'pointer', padding:2, background:'var(--bg-base)' }} />
                <input value={form?.secondaryColor || ''} onChange={e => set('secondaryColor', e.target.value)} style={{ ...S.inp, flex:1 }} placeholder="#080d16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* الهيرو */}
      <div style={S.sec}>
        <div style={S.secTitle}>🦸 قسم الهيرو</div>
        <div style={{ ...S.card, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={S.grid2}>
            <Inp label="العنوان الرئيسي" value={form?.heroTitle} onChange={v => set('heroTitle', v)} placeholder="أفضل لحوم النعام..." />
            <Inp label="الكلمة المميزة (Highlight)" value={form?.heroTitleHighlight} onChange={v => set('heroTitleHighlight', v)} placeholder="N3AMCO" />
          </div>
          <Inp label="النص الفرعي" value={form?.heroSubtitle} onChange={v => set('heroSubtitle', v)} placeholder="وصف قصير..." />
          <div style={S.grid2}>
            <Inp label="نص الزر الأساسي" value={form?.heroPrimaryBtnText} onChange={v => set('heroPrimaryBtnText', v)} placeholder="احجز الآن" />
            <Inp label="نص الزر الثانوي" value={form?.heroSecondaryBtnText} onChange={v => set('heroSecondaryBtnText', v)} placeholder="تعرف أكثر" />
          </div>
        </div>
      </div>

      {/* التواصل */}
      <div style={S.sec}>
        <div style={S.secTitle}>📞 بيانات التواصل</div>
        <div style={{ ...S.card, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={S.grid2}>
            <Inp label="رقم الدعم" value={form?.supportPhone} onChange={v => set('supportPhone', v)} placeholder="+20..." />
            <Inp label="إيميل الدعم" value={form?.supportEmail} onChange={v => set('supportEmail', v)} placeholder="info@n3amco.com" />
          </div>
          <Inp label="العنوان" value={form?.address} onChange={v => set('address', v)} placeholder="المدينة، المحافظة، مصر" />
        </div>
      </div>

      {/* سوشيال ميديا */}
      <div style={S.sec}>
        <div style={S.secTitle}>📱 السوشيال ميديا</div>
        <div style={{ ...S.card, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <div style={S.grid2}>
            <Inp label="فيسبوك" value={form?.facebookUrl} onChange={v => set('facebookUrl', v)} placeholder="https://facebook.com/..." />
            <Inp label="انستجرام" value={form?.instagramUrl} onChange={v => set('instagramUrl', v)} placeholder="https://instagram.com/..." />
          </div>
          <div style={S.grid2}>
            <Inp label="واتساب" value={form?.whatsAppNumber} onChange={v => set('whatsAppNumber', v)} placeholder="+20..." />
            <Inp label="تيك توك" value={form?.tiktokUrl} onChange={v => set('tiktokUrl', v)} placeholder="https://tiktok.com/..." />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div style={S.sec}>
        <div style={S.secTitle}>🔍 إعدادات SEO</div>
        <div style={{ ...S.card, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <Inp label="عنوان الصفحة (SEO Title)" value={form?.seoTitle} onChange={v => set('seoTitle', v)} placeholder="N3AMCO - أفضل لحوم النعام في مصر" />
          <Textarea label="وصف الصفحة (Meta Description)" value={form?.seoDescription} onChange={v => set('seoDescription', v)} placeholder="وصف قصير للموقع يظهر في نتائج البحث..." />
        </div>
      </div>

      {/* الفوتر */}
      <div style={S.sec}>
        <div style={S.secTitle}>📄 الفوتر</div>
        <div style={{ ...S.card, padding:20, display:'flex', flexDirection:'column', gap:14 }}>
          <Inp label="نص حقوق النشر" value={form?.footerText} onChange={v => set('footerText', v)} placeholder="© 2025 N3AMCO. جميع الحقوق محفوظة." />
          <Textarea label="نص عن الشركة في الفوتر" value={form?.footerAboutText} onChange={v => set('footerAboutText', v)} placeholder="نبذة قصيرة عن الشركة تظهر في الفوتر..." />
        </div>
      </div>

      {error && <div style={{ ...S.err, marginBottom:16 }}>{error}</div>}

      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button onClick={save} disabled={saving} style={S.btnGold}>
          {saving ? '...' : '💾 حفظ الإعدادات'}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════
   SECTION MODAL
═══════════════════════════════ */
function SectionModal({ section, onClose, onSuccess }) {
  const isEdit = !!section?.id
  const [form, setForm] = useState({
    key:          section?.key          || '',
    title:        section?.title        || '',
    subtitle:     section?.subtitle     || '',
    content:      section?.content      || '',
    imageUrl:     section?.imageUrl     || '',
    displayOrder: section?.displayOrder ?? 0,
    isActive:     section?.isActive     ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.key.trim())   { setError('الـ Key مطلوب'); return }
    if (!form.title.trim()) { setError('العنوان مطلوب'); return }
    setLoading(true); setError('')
    try {
      const url    = isEdit
        ? `${API_BASE_URL}/api/v1/admin/website/sections/${section.id}`
        : `${API_BASE_URL}/api/v1/admin/website/sections`
      const method = isEdit ? 'PUT' : 'POST'
      const res    = await fetch(url, { method, headers:authHeaders(), body:JSON.stringify({ ...form, displayOrder: parseInt(form.displayOrder) }) })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={isEdit ? `تعديل: ${section.key}` : 'إضافة سيكشن جديد'} onClose={onClose}>
      <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
        <div style={S.grid2}>
          <Inp label="Key *" value={form.key} onChange={v => set('key', v)} placeholder="hero / about / features" />
          <div>
            <label style={S.lbl}>الترتيب</label>
            <input type="number" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)} style={S.inp} />
          </div>
        </div>
        <Inp label="العنوان *" value={form.title} onChange={v => set('title', v)} placeholder="عنوان السيكشن" />
        <Inp label="العنوان الفرعي" value={form.subtitle} onChange={v => set('subtitle', v)} placeholder="نص فرعي..." />
        <Textarea label="المحتوى" value={form.content} onChange={v => set('content', v)} placeholder="محتوى السيكشن..." />
        <Inp label="رابط الصورة" value={form.imageUrl} onChange={v => set('imageUrl', v)} placeholder="https://..." />
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <input
            type="checkbox" id="secActive"
            checked={form.isActive}
            onChange={e => set('isActive', e.target.checked)}
            style={{ accentColor:'var(--gold)', width:16, height:16, cursor:'pointer' }}
          />
          <label htmlFor="secActive" style={{ fontSize:13, color:'var(--text-muted)', cursor:'pointer' }}>السيكشن مفعّل</label>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button onClick={submit} disabled={loading} style={S.btnGold}>{loading ? '...' : isEdit ? 'حفظ' : 'إضافة'}</button>
        </div>
      </div>
    </Modal>
  )
}

/* ── Delete Confirm ──────────────────────────────────────── */
function DeleteModal({ section, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/website/sections/${section.id}`, {
        method:'DELETE', headers:authHeaders(),
      })
      if (!res.ok) { const j = await res.json().catch(() => {}); throw new Error(j?.message || `خطأ ${res.status}`) }
      onSuccess()
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="حذف السيكشن" onClose={onClose} maxWidth={380}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7 }}>
          هل أنت متأكد من حذف سيكشن <strong style={{ color:'var(--text)' }}>{section?.key}</strong>؟ لا يمكن التراجع.
        </p>
        {error && <div style={S.err}>{error}</div>}
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={S.btnGhost}>إلغاء</button>
          <button onClick={submit} disabled={loading} style={{ ...S.btnGold, background:'#f87171', color:'#fff' }}>
            {loading ? '...' : 'حذف'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ═══════════════════════════════
   SECTIONS TAB
═══════════════════════════════ */
function SectionsTab({ showToast }) {
  const [sections, setSections] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)   // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API_BASE_URL}/api/v1/admin/website/sections`, { headers:authHeaders() })
      if (r.ok) { const d = await r.json(); setSections(Array.isArray(d) ? d : d?.data || []) }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const open  = (type, sec=null) => { setSelected(sec); setModal(type) }
  const close = () => { setModal(null); setSelected(null) }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:14 }}>
        <button style={S.btnGold} onClick={() => open('create')}>+ سيكشن جديد</button>
      </div>

      <div style={S.card}>
        {loading
          ? <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>جاري التحميل...</div>
          : sections.length === 0
            ? <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>لا توجد سيكشنات</div>
            : sections.map(sec => (
              <div key={sec.id}
                style={{ ...S.row }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,110,.04)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                {/* Info */}
                <div style={{ display:'flex', alignItems:'center', gap:12, minWidth:0, flex:1 }}>
                  <div style={{
                    width:34, height:34, borderRadius:8, flexShrink:0,
                    background:'rgba(201,169,110,.1)', display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:800, color:'var(--gold)',
                  }}>
                    {sec.displayOrder}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{sec.title}</span>
                      <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:'monospace', background:'var(--bg-base)', padding:'1px 6px', borderRadius:4, border:'1px solid var(--border)' }}>{sec.key}</span>
                      <span style={S.tag(sec.isActive ? '#34d399' : '#f87171')}>{sec.isActive ? 'مفعّل' : 'معطّل'}</span>
                    </div>
                    {sec.subtitle && (
                      <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:320 }}>
                        {sec.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button style={S.btnGhost} onClick={() => open('edit', sec)}>تعديل</button>
                  <button style={S.btnDanger} onClick={() => open('delete', sec)}>حذف</button>
                </div>
              </div>
            ))
        }
      </div>

      {modal === 'create' && <SectionModal section={null}     onClose={close} onSuccess={() => { close(); showToast('تم إضافة السيكشن'); load() }} />}
      {modal === 'edit'   && <SectionModal section={selected} onClose={close} onSuccess={() => { close(); showToast('تم حفظ التعديلات'); load() }} />}
      {modal === 'delete' && <DeleteModal  section={selected} onClose={close} onSuccess={() => { close(); showToast('تم الحذف');         load() }} />}
    </div>
  )
}

/* ═══════════════════════════════
   MAIN PAGE
═══════════════════════════════ */
export default function WebsiteManager() {
  const [tab, setTab]     = useState('settings')
  const [toast, setToast] = useState(null)

  const showToast = (msg, ok=true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const tabs = [
    { id:'settings', label:'⚙️ إعدادات الموقع' },
    { id:'sections', label:'📐 السيكشنات' },
  ]

  return (
    <DashboardLayout title="إدارة الموقع الإلكتروني" breadcrumb="الموقع">
      <div style={{ background:'var(--bg-base)', minHeight:'100vh', padding:0, direction:'rtl', color:'var(--text)', fontFamily:"'Cairo',sans-serif" }}>
        <Toast toast={toast} />

        <div style={{ padding:'0 24px 32px' }}>
          {/* Tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid var(--border)', paddingBottom:1, overflowX:'auto' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                height:38, padding:'0 20px', border:'none', cursor:'pointer', whiteSpace:'nowrap',
                background:'transparent', fontFamily:"'Cairo',sans-serif", fontSize:14,
                color:        tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
                fontWeight:   tab === t.id ? 800 : 400,
                borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom:-1, transition:'all .15s',
              }}>{t.label}</button>
            ))}
          </div>

          {tab === 'settings' && <SettingsTab showToast={showToast} />}
          {tab === 'sections' && <SectionsTab showToast={showToast} />}
        </div>
      </div>
    </DashboardLayout>
  )
}