import { useState, useEffect, useRef } from 'react'
import Navbar, { NavSpacer } from './Navbar'
import Footer from './Footer'
import './styles.css'

const API_BASE_URL = 'https://n3amco.runasp.net'

/* ── API Helpers ── */
async function fetchHomeData() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/public/website/home`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? json ?? null
  } catch { return null }
}

async function fetchOpenBatch() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/public/batches/open`)
    if (!res.ok) return null
    const json = await res.json()
    const data = json?.data ?? json ?? null
    return Array.isArray(data) ? data : (data ? [data] : [])
  } catch { return [] }
}
async function submitReservation(data) {
  const res = await fetch(`${API_BASE_URL}/api/v1/public/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || 'فشل الحجز، حاول تاني')
  }
  const json = await res.json()
  return json?.data ?? json
}

async function trackReservation(code) {
  const res = await fetch(`${API_BASE_URL}/api/v1/public/reservations/track/${code}`)
  if (!res.ok) throw new Error('الكود مش موجود')
  const json = await res.json()
  return json?.data ?? json
}

async function submitWaitlist(data) {
  const res = await fetch(`${API_BASE_URL}/api/v1/public/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('فشل التسجيل')
  const json = await res.json()
  return json?.data ?? json
}

/* ── Fallback Mock Data ── */
const MOCK_SETTINGS = {
  siteName: 'نعامكو',
  siteTagline: 'PREMIUM OSTRICH',
  heroTitle: 'احجز لحم النعام',
  heroTitleHighlight: 'قبل موعد الذبح',
  heroSubtitle: 'مش بيعات عادية — بتحجز كيلوجراماتك قبل ما نذبح، وتستلم اللحم طازج على طول من غير أي تخزين أو وسطاء.',
  heroPrimaryBtnText: 'احجز دلوقتي',
  heroSecondaryBtnText: 'شوف المنتجات',
  supportPhone: null,
  supportEmail: null,
  whatsAppNumber: null,
  facebookUrl: null,
  instagramUrl: null,
}

const MOCK_BATCH = {
  id: 1,
  title: 'دفعة يوليو 2025',
  slaughterDate: '2025-07-20',
  totalKg: 500,
  reservedKg: 347,
  status: 'open',
  closingDate: '2025-07-15',
}

const MOCK_PRODUCTS = [
  { id: 1, name: 'فيليه النعام',  nameEn: 'Ostrich Fillet',   defaultSellingPrice: 320, minStock: 1, isActive: true,  tag: 'الأكثر طلباً' },
  { id: 2, name: 'ستيك النعام',  nameEn: 'Ostrich Steak',    defaultSellingPrice: 280, minStock: 1, isActive: true,  tag: null },
  { id: 3, name: 'لحم مفروم',    nameEn: 'Minced Ostrich',   defaultSellingPrice: 220, minStock: 2, isActive: true,  tag: null },
  { id: 4, name: 'برغر النعام',  nameEn: 'Ostrich Burger',   defaultSellingPrice: 260, minStock: 1, isActive: false, tag: 'نفد' },
  { id: 5, name: 'قطع مشكلة',   nameEn: 'Premium Cuts Mix', defaultSellingPrice: 300, minStock: 2, isActive: true,  tag: 'محدود' },
  { id: 6, name: 'كباب النعام',  nameEn: 'Ostrich Kofta',    defaultSellingPrice: 240, minStock: 1, isActive: true,  tag: null },
]

const MOCK_TESTIMONIALS = [
  { id: 1, name: 'محمد السيد',    city: 'القاهرة',    text: 'والله جربت كتير بس مفيش زيهم. الفيليه وصل طازج زي ما قالوا، والتعامل محترم من أول ما حجزت لحد ما استلمت.', stars: 5 },
  { id: 2, name: 'نورهان أحمد',  city: 'الإسكندرية', text: 'الفكرة دي ذكية جداً — بتحجز الكيلو بتاعك قبل الذبح وتستلمه طازج على طول. مش هقدر أشتري لحم نعام من أي حتة تانية بعد كده.', stars: 5 },
  { id: 3, name: 'كريم عبد الله', city: 'الجيزة',     text: 'السعر مناسب جداً مقارنةً بالجودة. اللحم طري وطعمه مختلف خالص. الأسرة كلها عجبتهم وهنحجز تاني في الدفعة الجاية.', stars: 5 },
]

const HOW_STEPS = [
  { num: '01', title: 'بنعلن عن الدفعة',    desc: 'بنبعتلك إشعار بموعد الدفعة الجديدة وعدد الكيلوجرامات المتاحة قبل أي حد.', icon: 'bell' },
  { num: '02', title: 'احجز كيلوجراماتك',   desc: 'اختار المنتج اللي عايزه وحدد الكمية وادفع أون لاين — كل ده في دقيقتين.',   icon: 'lock' },
  { num: '03', title: 'بيتأكد الحجز فوراً', desc: 'هتستلم رسالة تأكيد على طول فيها كل تفاصيل الطلب وموعد التوصيل.',          icon: 'check-circle' },
  { num: '04', title: 'اللحم يوصلك طازج',   desc: 'بعد الذبح مباشرة، اللحم بيتوصل على بابك في نفس اليوم من غير أي تخزين.',   icon: 'truck' },
]

/* ── Countdown Hook ── */
function useCountdown(targetDate) {
  const calc = () => {
    if (!targetDate) return { d: 0, h: 0, m: 0, s: 0 }
    const diff = new Date(targetDate) - new Date()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    }
  }
  const [t, setT] = useState(calc)
  useEffect(() => {
    const i = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(i)
  }, [targetDate])
  return t
}

/* ── Hero Slider ── */
function HeroSlider({ sliders }) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!sliders?.length) return
    const t = setInterval(() => setCurrent(c => (c + 1) % sliders.length), 5000)
    return () => clearInterval(t)
  }, [sliders])
  if (!sliders?.length) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {sliders.map((s, i) => (
        <div key={s.id} style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${
  window.innerWidth <= 768
    ? (s.mobileImageUrl || s.imageUrl)
    : s.imageUrl
})`,
          backgroundSize: 'cover',
backgroundPosition: 'center center',
backgroundRepeat: 'no-repeat',
          opacity: i === current ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }} />
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(28,25,23,0.55)' }} />
      {sliders.length > 1 && (
        <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2 }}>
          {sliders.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} style={{
              width: i === current ? 24 : 8, height: 8, borderRadius: 99,
              background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Icons ── */
const Icons = {
  star: ({ filled }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill={filled ? '#B8843A' : 'none'} stroke="#B8843A" strokeWidth="1.5">
      <polygon points="7,1 8.8,5.6 13.7,6 10,9.3 11.1,14 7,11.5 2.9,14 4,9.3 0.3,6 5.2,5.6"/>
    </svg>
  ),
  arrowLeft: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  chevronDown: () => (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  check: () => (
    <svg width="13" height="13" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 6 5 10 12 2"/>
    </svg>
  ),
  pin: () => (
    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
  quote: () => (
    <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
    </svg>
  ),
  meat: () => (
    <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.18">
      <path d="M18 10c-7 0-12 5.5-12 12 0 3.5 1.8 6.5 4.5 8.5L18 38l10-8c2.5-2 4.5-5 4.5-8.5C32.5 15.5 25 10 18 10z"/>
      <path d="M18 38l7 7M25 45l5-5M30 40l5-5"/>
      <circle cx="18" cy="22" r="3.5" opacity="0.5"/>
    </svg>
  ),
  bell: () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  lock: () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  checkCircle: () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  truck: () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  search: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  x: () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  loading: () => (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  ),
  location: () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  ),
}

const StepIcon = ({ type }) => {
  const map = { bell: Icons.bell, lock: Icons.lock, 'check-circle': Icons.checkCircle, truck: Icons.truck }
  const C = map[type] || Icons.bell
  return <C />
}

/* ════════════════════════════════════════════════════════
   RESERVATION MODAL — with address field
════════════════════════════════════════════════════════ */
function ReservationModal({ product, batch, onClose }) {
  const [kg,      setKg]      = useState(product?.minStock || 1)
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [address, setAddress] = useState('')
  const [deposit, setDeposit] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error,   setError]   = useState('')

  const price = product?.defaultSellingPrice || 0
  const total = (kg * price).toFixed(0)

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim())   { setError('الاسم والموبايل مطلوبين'); return }
    if (!address.trim())                  { setError('العنوان مطلوب للتوصيل'); return }
    if (kg < (product?.minStock || 1))   { setError(`الحد الأدنى ${product?.minStock} كجم`); return }
    setLoading(true); setError('')
    try {
      const result = await submitReservation({
        batchId:       batch?.id || 1,
        customerName:  name,
        phone,
        address,
        reservedKg:    Number(kg),
        pricePerKg:    price,
        depositAmount: Number(deposit) || 0,
      })
      setSuccess(result)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(28,25,23,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 24, padding: '36px 32px',
        maxWidth: 480, width: '100%', boxShadow: '0 32px 80px rgba(28,25,23,0.22)',
        animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(22,163,74,0.1)', border: '2px solid rgba(22,163,74,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: 28,
            }}>✓</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#1c1917', marginBottom: 8 }}>تم الحجز بنجاح!</div>
            <div style={{ fontSize: 13, color: '#78716c', marginBottom: 20, lineHeight: 1.8 }}>كود متابعة حجزك:</div>
            <div style={{
              background: 'rgba(184,132,58,0.08)', border: '1.5px solid rgba(184,132,58,0.3)',
              borderRadius: 12, padding: '12px 20px', fontSize: 22, fontWeight: 900,
              color: 'var(--gold)', letterSpacing: 3, marginBottom: 24,
            }}>
              {success.trackingCode || success.code || '—'}
            </div>
            <button className="btn-gold" style={{ width: '100%', height: 46, fontSize: 14 }} onClick={onClose}>
              تمام، شكراً
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1c1917' }}>احجز {product?.name}</div>
                <div style={{ fontSize: 12, color: '#a8a29e', marginTop: 3 }}>{price} ج.م / كجم</div>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e', padding: 4 }}>
                <Icons.x />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#78716c', display: 'block', marginBottom: 6 }}>الاسم الكامل *</label>
                <input className="n3-input" value={name} onChange={e => setName(e.target.value)} placeholder="اسمك هنا" style={{ width: '100%', height: 44 }} />
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#78716c', display: 'block', marginBottom: 6 }}>رقم الموبايل *</label>
                <input className="n3-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="01xxxxxxxxx" style={{ width: '100%', height: 44 }} dir="ltr" />
              </div>

              {/* Address */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#78716c', display: 'block', marginBottom: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    <Icons.location /> العنوان بالتفصيل *
                  </span>
                </label>
                <textarea
                  className="n3-input"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="المحافظة — المنطقة — الشارع — رقم المبنى والشقة"
                  rows={3}
                  style={{ width: '100%', padding: '12px 16px', resize: 'none', lineHeight: 1.7 }}
                />
              </div>

              {/* KG */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#78716c', display: 'block', marginBottom: 6 }}>الكمية (كجم) — أدنى {product?.minStock || 1} كجم</label>
                <input className="n3-input" type="number" value={kg} onChange={e => setKg(Math.max(product?.minStock || 1, Number(e.target.value)))} min={product?.minStock || 1} style={{ width: '100%', height: 44 }} />
              </div>

              {/* Deposit */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#78716c', display: 'block', marginBottom: 6 }}>مبلغ العربون (اختياري)</label>
                <input className="n3-input" type="number" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="0" style={{ width: '100%', height: 44 }} />
              </div>
            </div>

            {/* Total */}
            <div style={{
              background: 'rgba(184,132,58,0.06)', border: '1.5px solid rgba(184,132,58,0.2)',
              borderRadius: 12, padding: '12px 16px', margin: '16px 0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: '#78716c', fontWeight: 700 }}>إجمالي الطلب</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--gold)' }}>{total} ج.م</span>
            </div>

            {error && (
              <div style={{ background: 'rgba(220,38,38,0.07)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#dc2626', fontWeight: 700, marginBottom: 12 }}>{error}</div>
            )}

            <button className="btn-gold" style={{ width: '100%', height: 48, fontSize: 14, gap: 8 }} onClick={handleSubmit} disabled={loading}>
              {loading ? <><Icons.loading /> جاري الحجز...</> : <>تأكيد الحجز <Icons.arrowLeft /></>}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Track Modal ── */
function TrackModal({ onClose }) {
  const [code,    setCode]    = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const handleTrack = async () => {
    if (!code.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await trackReservation(code.trim())
      setResult(data)
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const statusMap = {
    pending:   { label: 'قيد الانتظار', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
    confirmed: { label: 'مؤكد',         color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
    cancelled: { label: 'ملغي',         color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
    delivered: { label: 'تم التوصيل',   color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(28,25,23,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 24, padding: '36px 32px',
        maxWidth: 420, width: '100%', boxShadow: '0 32px 80px rgba(28,25,23,0.22)',
        animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#1c1917' }}>تتبع حجزك</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a8a29e' }}><Icons.x /></button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input
            className="n3-input" value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTrack()}
            placeholder="كود التتبع" style={{ flex: 1, height: 44 }} dir="ltr"
          />
          <button className="btn-gold" style={{ height: 44, padding: '0 18px', fontSize: 13 }} onClick={handleTrack} disabled={loading}>
            {loading ? <Icons.loading /> : <Icons.search />}
          </button>
        </div>
        {error && (
          <div style={{ background: 'rgba(220,38,38,0.07)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#dc2626', fontWeight: 700 }}>{error}</div>
        )}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {[
              ['الاسم',    result.customerName],
              ['الموبايل', result.phone],
              ['العنوان',  result.address],
              ['الكمية',   result.reservedKg ? `${result.reservedKg} كجم` : null],
              ['السعر',    result.pricePerKg  ? `${result.pricePerKg} ج.م / كجم` : null],
              ['الإجمالي', (result.reservedKg && result.pricePerKg) ? `${(result.reservedKg * result.pricePerKg).toFixed(0)} ج.م` : null],
            ].filter(([, v]) => v).map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(28,25,23,0.06)' }}>
                <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 700 }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#1c1917', textAlign: 'left', maxWidth: '65%' }}>{v}</span>
              </div>
            ))}
            {result.status && (() => {
              const s = statusMap[result.status] || { label: result.status, color: '#78716c', bg: '#f5f4f0' }
              return (
                <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: s.bg, color: s.color, fontSize: 12, fontWeight: 800, marginTop: 4 }}>
                  {s.label}
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
function ProductsCarousel({ products, normalizeProduct, batches, onSelect }) {
  const trackRef = useRef(null)
  const autoTimerRef = useRef(null)
  const isPausedRef = useRef(false)
  const resumeTimeoutRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    autoTimerRef.current = setInterval(() => {
      if (isPausedRef.current) return
      track.scrollLeft -= 1
      if (Math.abs(track.scrollLeft) >= (track.scrollWidth - track.clientWidth)) {
        track.scrollLeft = 0
      }
    }, 30)

    return () => {
      clearInterval(autoTimerRef.current)
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    }
  }, [products])

  const pauseAuto = () => {
    isPausedRef.current = true
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
  }

  const scheduleResume = (delay = 2500) => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedRef.current = false
    }, delay)
  }


  return (
    <div
      style={{ position: 'relative', maxWidth: 1180, margin: '0 auto' }}
      onMouseEnter={pauseAuto}
      onMouseLeave={() => scheduleResume(300)}
    >
      <div
        ref={trackRef}
        className="products-scroll"
        style={{ display: 'flex', gap: 18, overflowX: 'auto', overflowY: 'visible', scrollBehavior: 'smooth', paddingTop: 16, paddingBottom: 24, paddingInline: 24, touchAction: 'pan-x' }}
        onTouchStart={pauseAuto}
        onTouchEnd={() => scheduleResume()}
        onTouchCancel={() => scheduleResume()}
        onPointerDown={pauseAuto}
        onPointerUp={() => scheduleResume()}
      >
        {products.map(raw => {
          const p = normalizeProduct(raw)
          const imageUrl = p.imageUrl || raw.imageUrl
          return (
            <div key={p.id} className="product-card" style={{ flex: '0 0 calc((100% - 36px) / 3)', minWidth: 220, scrollSnapAlign: 'start' }}>
              <div style={{
                height: 160, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
background: imageUrl
  ? `url(${imageUrl}) center/cover`
  : 'linear-gradient(135deg, #f5f4f0, #eeecea)',              }}>
{!imageUrl && <Icons.meat />}
                {p.tag && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    padding: '3px 11px', borderRadius: 99, fontSize: 11, fontWeight: 800,
                    background: p.tag === 'نفد' ? 'rgba(220,38,38,0.08)' : p.tag === 'محدود' ? 'rgba(217,119,6,0.1)' : 'rgba(184,132,58,0.1)',
                    color:      p.tag === 'نفد' ? '#dc2626'              : p.tag === 'محدود' ? '#d97706'             : 'var(--gold)',
                    border:     `1.5px solid ${p.tag === 'نفد' ? 'rgba(220,38,38,0.2)' : p.tag === 'محدود' ? 'rgba(217,119,6,0.2)' : 'rgba(184,132,58,0.25)'}`,
                  }}>{p.tag}</div>
                )}
                {!p.available && !p.tag && (
                  <div style={{ position: 'absolute', top: 12, right: 12, padding: '3px 11px', borderRadius: 99, fontSize: 11, fontWeight: 800, background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1.5px solid rgba(220,38,38,0.2)' }}>نفد</div>
                )}
              </div>
              <div style={{ padding: '18px 20px' }}>
                {p.nameEn && <div style={{ fontSize: 10, color: '#c8c0ba', fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>{p.nameEn.toUpperCase()}</div>}
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1c1917', marginBottom: 6 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 12, color: '#78716c', lineHeight: 1.7, marginBottom: 10 }}>{p.description}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--gold)' }}>{p.pricePerKg}</span>
                    <span style={{ fontSize: 11, color: '#a8a29e', marginRight: 3 }}> ج.م / كجم</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#a8a29e' }}>أقل {p.minKg} كجم</span>
                </div>
                <button
                  className={p.available ? 'btn-gold' : 'btn-ghost'}
                  style={{ width: '100%', height: 42, fontSize: 13, opacity: p.available ? 1 : 0.5, cursor: p.available ? 'pointer' : 'not-allowed' }}
                  disabled={!p.available || !batches?.length}
                  onClick={() => {
                    if (!p.available || !batches?.length) return
                    const openBatch = batches.find(b => (b.status||'').toLowerCase() === 'open' && (b.totalKg - b.reservedKg) > 0) || batches[0]
                    onSelect({ product: raw, batch: openBatch })
                  }}
                >
                  {p.available ? 'احجز دلوقتي' : 'الكمية نفدت'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      
    </div>
  )
}
function BatchCard({ batch, onReserve, onWaitlist }) {
  const countdown   = useCountdown(batch.closingDate)
  const reservedKg  = batch.reservedKg  || 0
  const totalKg     = batch.totalKg     || 1
  const reservedPct = Math.min(100, Math.round((reservedKg / totalKg) * 100))
  const remainingKg = Math.max(0, totalKg - reservedKg)
  const isFull      = reservedPct >= 100

  return (
    <div className="card batch-card" style={{ padding: '32px 36px', borderColor: isFull ? 'rgba(220,38,38,0.2)' : 'rgba(184,132,58,0.25)', boxShadow: '0 4px 24px rgba(28,25,23,0.06)' }}>
      {/* Header */}
      <div className="batch-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 10, color: '#a8a29e', fontWeight: 800, letterSpacing: 2.5, marginBottom: 4 }}>BATCH ID · {batch.id}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#1c1917' }}>{batch.title || batch.label}</div>
          <div style={{ fontSize: 13, color: '#78716c', marginTop: 4 }}>
            موعد الذبح: {new Date(batch.slaughterDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          {batch.description && <div style={{ fontSize: 13, color: '#78716c', marginTop: 6, lineHeight: 1.7 }}>{batch.description}</div>}
        </div>
        {isFull ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 99, background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.2)', color: '#dc2626', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
            الكمية امتلت
          </div>
        ) : (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', borderRadius: 99, background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.2)', color: '#16a34a', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
            <span className="pulse-anim" style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
            الحجز مفتوح
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#78716c', fontWeight: 700 }}>الكمية المحجوزة</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: isFull ? '#dc2626' : 'var(--gold)' }}>{reservedPct}% امتلت</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${reservedPct}%`, background: isFull ? '#dc2626' : undefined, transition: 'width 0.8s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: 11, color: '#a8a29e' }}>محجوز: {reservedKg} كجم</span>
          <span style={{ fontSize: 11, color: isFull ? '#dc2626' : '#a8a29e', fontWeight: isFull ? 700 : 400 }}>
            {isFull ? 'لا يوجد كمية متاحة' : `فاضل: ${remainingKg} كجم بس`}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="batch-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { l: 'الكمية الكلية', v: `${totalKg} كجم`,    a: false },
          { l: 'فاضل للحجز',   v: isFull ? 'نفدت' : `${remainingKg} كجم`, a: !isFull },
          { l: 'نسبة الامتلاء', v: `${reservedPct}%`,   a: false },
        ].map(({ l, v, a }) => (
          <div key={l} style={{ background: a ? 'rgba(184,132,58,0.06)' : '#f5f4f0', borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${a ? 'rgba(184,132,58,0.25)' : 'rgba(28,25,23,0.08)'}` }}>
            <div style={{ fontSize: 10, color: '#a8a29e', fontWeight: 700, marginBottom: 5 }}>{l}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: a ? 'var(--gold)' : '#1c1917' }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Countdown — فقط لو مش ممتلئ */}
      {!isFull && batch.closingDate && (
        <div style={{ textAlign: 'center', marginBottom: 26, padding: '20px', borderRadius: 16, background: 'rgba(184,132,58,0.04)', border: '1.5px dashed rgba(184,132,58,0.2)' }}>
          <div style={{ fontSize: 11, color: '#a8a29e', fontWeight: 700, letterSpacing: 2, marginBottom: 14 }}>⏳ الحجز بيقفل بعد</div>
          <div className="countdown-row" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[['يوم', countdown.d], ['ساعة', countdown.h], ['دقيقة', countdown.m], ['ثانية', countdown.s]].map(([label, val]) => (
              <div key={label} className="countdown-box" style={{ position: 'relative' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(val).padStart(2, '0')}</div>
                <div style={{ fontSize: 10, color: '#a8a29e', marginTop: 5, fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        {isFull ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <p style={{ fontSize: 13, color: '#78716c', margin: 0 }}>الدفعة دي امتلت — سجّل في قائمة الانتظار وهنعلمك بالدفعة الجاية</p>
            <button className="btn-gold" style={{ height: 52, padding: '0 44px', fontSize: 15 }} onClick={onWaitlist}>
              انضم لقائمة الانتظار <Icons.arrowLeft />
            </button>
          </div>
        ) : (
          <button className="btn-gold" style={{ height: 52, padding: '0 44px', fontSize: 15 }} onClick={onReserve}>
            اختار منتجك وابدأ الحجز <Icons.arrowLeft />
          </button>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════
   HOME PAGE
════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navRef = useRef(null)

  const [loadingData, setLoadingData] = useState(true)
  const [settings,  setSettings]  = useState(MOCK_SETTINGS)
  const [sliders,   setSliders]   = useState([])
  const [sections,  setSections]  = useState([])
  const [banners,   setBanners]   = useState([])
const [batches, setBatches] = useState([MOCK_BATCH])
  const [products,  setProducts]  = useState(MOCK_PRODUCTS)

  const [selectedProduct, setSelectedProduct] = useState(null) // { product, batch }
  const [showTrack,       setShowTrack]       = useState(false)

  // Waitlist state
  const [wlName,    setWlName]    = useState('')
  const [wlPhone,   setWlPhone]   = useState('')
  const [wlKg,      setWlKg]      = useState('')
  const [wlJoined,  setWlJoined]  = useState(false)
  const [wlLoading, setWlLoading] = useState(false)
  const [wlError,   setWlError]   = useState('')
  const [wlNotes, setWlNotes] = useState('')

  // batch state replaced by batches array — per-batch calcs happen inline

  /* ── Load Data ── */
  useEffect(() => {
    async function loadData() {
      setLoadingData(true)
      const [homeData, batchData] = await Promise.all([fetchHomeData(), fetchOpenBatch()])
      if (homeData) {
        if (homeData.settings) setSettings(s => ({ ...s, ...homeData.settings }))
        if (Array.isArray(homeData.sliders)         && homeData.sliders.length)          setSliders(homeData.sliders)
        if (Array.isArray(homeData.sections))                                             setSections(homeData.sections)
        if (Array.isArray(homeData.banners)          && homeData.banners.length)          setBanners(homeData.banners)
        if (Array.isArray(homeData.featuredProducts) && homeData.featuredProducts.length) setProducts(homeData.featuredProducts)
        if ((!batchData || batchData.length === 0) && Array.isArray(homeData.activeBatches) && homeData.activeBatches.length) {
          setBatches(homeData.activeBatches.filter(b => ['open','upcoming'].includes((b.status||'').toLowerCase())))
        }
      }
      if (batchData && batchData.length > 0) setBatches(batchData)
      setLoadingData(false)
    }
    loadData()
  }, [])

  /* ── Scroll Helper ── */
const scrollTo = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  const navH = navRef.current ? navRef.current.getBoundingClientRect().height : 64
  const top = el.getBoundingClientRect().top + window.scrollY - navH - 8
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
  /* ── Waitlist Submit ── */
  const handleWaitlist = async () => {
    if (!wlName.trim() || !wlPhone.trim()) { setWlError('الاسم والموبايل مطلوبين'); return }
if (!wlKg || Number(wlKg) <= 0) { setWlError('الكمية مطلوبة'); return }
    setWlLoading(true); setWlError('')
    try {
await submitWaitlist({ name: wlName, phone: wlPhone, requestedKg: Number(wlKg), notes: wlNotes })
      setWlJoined(true)
    } catch (e) { setWlError(e.message) }
    setWlLoading(false)
  }

  /* ── Normalize Product ── */
const normalizeProduct = (p) => ({
  id: p.id,
  name: p.name,
  nameEn: p.nameEn || '',
  pricePerKg: p.defaultSellingPrice || p.pricePerKg || 0,
  minKg: p.minStock || p.minKg || 1,
  available: p.available !== undefined ? p.available : (p.isActive !== undefined ? p.isActive : true),

  tag: p.tag || null,
  description: p.description || null,
  imageUrl: p.imageUrl || null
})
  const getSection   = (key) => sections.find(s => (s.sectionKey || s.key || s.type || '').toLowerCase() === key.toLowerCase())
  const hasSliders   = sliders.length > 0
  const heroHasImage = hasSliders
  const whySection   = getSection('why')

  const heroTitle          = settings?.heroTitle          || 'احجز لحم النعام'
  const heroTitleHighlight = settings?.heroTitleHighlight || 'قبل موعد الذبح'
  const heroSubtitle       = settings?.heroSubtitle       || 'مش بيعات عادية — بتحجز كيلوجراماتك قبل ما نذبح، وتستلم اللحم طازج على طول من غير أي تخزين أو وسطاء.'
  const heroPrimaryBtn     = settings?.heroPrimaryBtnText  || 'احجز دلوقتي'
  const heroSecondaryBtn   = settings?.heroSecondaryBtnText || 'شوف المنتجات'
const siteName = settings?.siteName || 'نعامكو'

const waNumber = settings?.whatsAppNumber?.replace(/\D/g, '')
const waLink = waNumber ? `https://wa.me/${waNumber}` : null  

  return (
    <div style={{ fontFamily: "'Cairo', sans-serif", direction: 'rtl', background: '#fafaf7', color: '#1c1917' }}>

      {/* Modals */}
      {selectedProduct && <ReservationModal product={selectedProduct.product} batch={selectedProduct.batch} onClose={() => setSelectedProduct(null)} />}
      {showTrack        && <TrackModal onClose={() => setShowTrack(false)} />}

      {/* Navbar */}
      <Navbar
        settings={settings}
        banners={banners}
        navRef={navRef}
        onTrackClick={() => setShowTrack(true)}
        scrollTo={scrollTo}
      />
      <NavSpacer navRef={navRef} />

      {/* ════ HERO ════ */}
      <section id="hero" style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 20px', overflow: 'hidden',
        background: heroHasImage ? '#1c1917' : 'linear-gradient(170deg, #fefcf8 0%, #f9f5ee 50%, #f4ede0 100%)',
      }}>
        {hasSliders ? (
          <HeroSlider sliders={sliders} />
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
              {/* Warm gradient blobs */}
              <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,132,58,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,132,58,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
            </div>
            <div className="hero-glow" />
            <div className="dot-bg" />
            {/* Ostrich silhouette right */}
            <div style={{ position: 'absolute', left: '2%', bottom: '5%', zIndex: 0, opacity: 0.06, transform: 'scaleX(-1)' }}>
              <svg width="380" height="380" viewBox="0 0 420 420" fill="none"><ellipse cx="210" cy="300" rx="80" ry="110" stroke="#B8843A" strokeWidth="3" fill="none"/><circle cx="240" cy="110" r="55" stroke="#B8843A" strokeWidth="3" fill="none"/><path d="M240 165 Q230 200 210 230" stroke="#B8843A" strokeWidth="3" strokeLinecap="round"/><path d="M190 300 Q170 350 160 390" stroke="#B8843A" strokeWidth="3" strokeLinecap="round"/><path d="M230 300 Q230 360 225 400" stroke="#B8843A" strokeWidth="3" strokeLinecap="round"/><path d="M240 85 Q260 60 280 50 Q270 75 275 90" stroke="#B8843A" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
          </>
        )}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, width: '100%' }}>
          {/* Live chip */}
          <div className="fu chip" style={{
            marginBottom: 28,
            ...(heroHasImage ? { background: 'rgba(184,132,58,0.15)', borderColor: 'rgba(184,132,58,0.5)', color: '#f0c97a' } : {}),
          }}>
            <span className="chip-dot pulse-anim" />
            الحجز مفتوح  {batches[0]?.title || ''}
          </div>

          <h1 className="hero-h1 fu d1" style={{ fontSize: 54, fontWeight: 900, lineHeight: 1.2, marginBottom: 20, color: heroHasImage ? '#fff' : '#1c1917' }}>
            {heroTitle}<br />
            <span style={{ color: 'var(--gold)' }}>{heroTitleHighlight}</span>
          </h1>

          <p className="hero-p fu d2" style={{ fontSize: 17, color: heroHasImage ? 'rgba(255,255,255,0.8)' : '#78716c', lineHeight: 1.9, maxWidth: 520, margin: '0 auto 36px' }}>
            {heroSubtitle}
          </p>

          <div className="fu d3 hero-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-gold" style={{ height: 54, padding: '0 36px', fontSize: 15 }} onClick={() => scrollTo('batch')}>
              {heroPrimaryBtn} <Icons.arrowLeft />
            </button>
            {heroHasImage
              ? <button className="btn-ghost-inv" style={{ height: 54, padding: '0 28px', fontSize: 15 }} onClick={() => scrollTo('products')}>{heroSecondaryBtn}</button>
              : <button className="btn-ghost"     style={{ height: 54, padding: '0 28px', fontSize: 15 }} onClick={() => scrollTo('products')}>{heroSecondaryBtn}</button>
            }
          </div>

          <div className="fu d4 stats-row" style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
            {[['500+','عميل راضي'],['100%','مضمون طازج'],['0','تخزين أو تجميد']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)' }}>{n}</div>
                <div style={{ fontSize: 11, color: heroHasImage ? 'rgba(255,255,255,0.5)' : '#a8a29e', fontWeight: 700, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 28, left: '50%', animation: 'bounce 2.2s ease-in-out infinite', color: heroHasImage ? 'rgba(255,255,255,0.4)' : '#c8c0ba' }}>
          <Icons.chevronDown />
        </div>
      </section>

{/* ════ CURRENT BATCHES ════ */}
      <section id="batch" style={{ padding: '88px 24px', background: '#f5f4f0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="chip" style={{ marginBottom: 14 }}><span className="chip-dot" /> الدفعات الحالية</div>
            <h2 className="sec-h2" style={{ fontSize: 34, fontWeight: 900, color: '#1c1917' }}>
              {loadingData ? 'جاري التحميل...' : 'الدفعات المفتوحة دلوقتي'}
            </h2>
          </div>

          {loadingData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[80, 120, 60, 100].map((h, i) => <div key={i} className="skeleton" style={{ height: h, borderRadius: 16 }} />)}
            </div>
          ) : batches.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {batches.map(batch => <BatchCard key={batch.id} batch={batch} onReserve={() => scrollTo('products')} onWaitlist={() => scrollTo('waitlist')} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🦤</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1c1917', marginBottom: 8 }}>مفيش دفعة مفتوحة دلوقتي</div>
              <p style={{ fontSize: 14, color: '#78716c', marginBottom: 24 }}>سجّل في قائمة الانتظار وهنعلمك أول ما تفتح الدفعة الجديدة</p>
              <button className="btn-gold" style={{ height: 48, padding: '0 32px', fontSize: 14 }} onClick={() => scrollTo('waitlist')}>انضم لقائمة الانتظار</button>
            </div>
          )}
        </div>
      </section>

   {/* ════ PRODUCTS ════ */}
<section id="products" style={{ padding: '88px 0', background: '#fafaf7', overflowX: 'clip', overflowY: 'visible' }}>
  <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      <div className="chip" style={{ marginBottom: 14 }}><span className="chip-dot" /> تشكيلتنا</div>
      <h2 className="sec-h2" style={{ fontSize: 34, fontWeight: 900, color: '#1c1917', marginBottom: 10 }}>منتجات النعام الفاخرة</h2>
      <p style={{ fontSize: 14, color: '#78716c', maxWidth: 380, margin: '0 auto' }}>قطعات متاختارة بعناية من أجود أنواع لحم النعام</p>
    </div>
  </div>

  {loadingData ? (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
      <div className="products-scroll" style={{ display: 'flex', gap: 18, overflowX: 'auto' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ flex: '0 0 calc((100% - 36px) / 3)', minWidth: 220, borderRadius: 20, overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: 160 }} />
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skeleton" style={{ height: 14, width: '60%' }} />
              <div className="skeleton" style={{ height: 18, width: '80%' }} />
              <div className="skeleton" style={{ height: 42, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <ProductsCarousel
      products={products}
      normalizeProduct={normalizeProduct}
      batches={batches}
      onSelect={setSelectedProduct}
    />
  )}
</section>

      {/* ════ HOW IT WORKS ════ */}
      <section id="how" style={{ padding: '88px 24px', background: '#f5f4f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="chip" style={{ marginBottom: 14 }}><span className="chip-dot" /> العملية</div>
            <h2 className="sec-h2" style={{ fontSize: 34, fontWeight: 900, color: '#1c1917', marginBottom: 10 }}>إزاي بيشتغل {siteName}؟</h2>
            <p style={{ fontSize: 14, color: '#78716c', maxWidth: 400, margin: '0 auto' }}>أربع خطوات بسيطة وتاخد أجود لحم نعام في البلد</p>
          </div>
          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {HOW_STEPS.map(step => (
              <div key={step.num} className="card card-hover" style={{ padding: '26px 20px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -8, left: -2, fontSize: 68, fontWeight: 900, color: 'rgba(184,132,58,0.05)', lineHeight: 1, userSelect: 'none' }}>{step.num}</div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(184,132,58,0.08)', border: '1.5px solid rgba(184,132,58,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--gold)' }}>
                  <StepIcon type={step.icon} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>{step.num}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#1c1917', marginBottom: 8, lineHeight: 1.4 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: '#78716c', lineHeight: 1.75 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ WHY نعامكو ════ */}
      <section style={{ padding: '88px 24px', background: '#fafaf7' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="split-two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div className="chip" style={{ marginBottom: 18 }}><span className="chip-dot" /> ليه {siteName}</div>
              <h2 className="sec-h2" style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.22, marginBottom: 16, color: '#1c1917' }}>
                {whySection?.title || <><span>تجربة لحوم</span><br /><span style={{ color: 'var(--gold)' }}>مختلفة خالص</span></>}
              </h2>
              <p style={{ fontSize: 14, color: '#78716c', lineHeight: 1.9, marginBottom: 24 }}>
                {whySection?.subtitle || 'إحنا مش متجر لحوم عادي — بنذبح بس لما تحجز. ده معناه إن اللحم اللي هيوصلك مش اتخزنش يوم واحد.'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {(whySection?.bulletPoints || [
                  'بدون تخزين أو تجميد خالص',
                  'من المزرعة لبابك مباشرة',
                  'معايير جودة على أعلى مستوى',
                  'كميات محدودة بتضمن الطزاجة',
                ]).map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.check /></div>
                    <span style={{ fontSize: 13, color: '#44403c', fontWeight: 600 }}>{item}</span>
                  </div>
                ))}
              </div>
              <button className="btn-gold" style={{ height: 50, padding: '0 30px', fontSize: 14 }} onClick={() => scrollTo('batch')}>
                احجز من الدفعة الحالية
              </button>
            </div>
            <div className="why-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { title: 'دفعات محدودة بس',     desc: 'مش بنذبح أكتر من اللي اتحجز — ده معناه إن لحمك هيبقى طازج دايماً.', icon: '⭐' },
                { title: 'من المزرعة لباب بيتك', desc: 'مفيش وسطاء ومفيش تخزين — من المزرعة للطبخ في بيتك مباشرة.',      icon: '🏠' },
                { title: 'جودة مضمونة 100%',    desc: 'النعام بتاعنا مرباة على أعلى المعايير — اللحم صحي وطعمه خالص.',   icon: '🛡️' },
                { title: 'حجزت؟ ضمنت طزاجتك',  desc: 'لو حجزت كيلوك مش هتقلق — اللحم بتاعك محجوز قبل الذبح بالاسم.',  icon: '✅' },
              ].map(({ title, desc, icon }) => (
                <div key={title} className="card card-hover" style={{ padding: '20px 16px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(184,132,58,0.08)', border: '1.5px solid rgba(184,132,58,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 18 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1c1917', marginBottom: 6, lineHeight: 1.4 }}>{title}</div>
                  <div style={{ fontSize: 12, color: '#78716c', lineHeight: 1.72 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ TESTIMONIALS ════ */}
      <section id="reviews" style={{ padding: '88px 24px', background: '#f5f4f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="chip" style={{ marginBottom: 14 }}><span className="chip-dot" /> بيقولوا إيه</div>
            <h2 className="sec-h2" style={{ fontSize: 34, fontWeight: 900, color: '#1c1917' }}>كلام عملاءنا</h2>
          </div>
          <div className="testi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {MOCK_TESTIMONIALS.map(t => (
              <div key={t.id} className="card card-hover" style={{ padding: '26px 22px' }}>
                <div style={{ color: 'var(--gold)', marginBottom: 12 }}><Icons.quote /></div>
                <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
                  {Array.from({ length: 5 }).map((_, i) => <Icons.star key={i} filled={i < t.stars} />)}
                </div>
                <p style={{ fontSize: 13, color: '#57534e', lineHeight: 1.85, marginBottom: 18 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(184,132,58,0.1)', border: '1.5px solid rgba(184,132,58,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--gold)', flexShrink: 0 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#1c1917' }}>{t.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#a8a29e', marginTop: 2 }}><Icons.pin />{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

{/* ════ WAITLIST ════ */}
      <section id="waitlist" style={{ padding: '100px 24px', background: '#fafaf7' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div className="card waitlist-card" style={{ padding: '56px 48px', borderColor: 'rgba(184,132,58,0.25)', background: 'linear-gradient(160deg, #fff 60%, #fdf8f0)', boxShadow: '0 8px 40px rgba(28,25,23,0.07)' }}>
            <div className="chip" style={{ marginBottom: 18 }}><span className="chip-dot" /> قائمة الانتظار</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1c1917', marginBottom: 12 }}>متفوتكش الدفعة الجاية</h2>
            <p style={{ fontSize: 14, color: '#78716c', marginBottom: 34, lineHeight: 1.9, maxWidth: 460, margin: '0 auto 34px' }}>
              سجّل بياناتك وهنبعتلك إشعار فور ما نعلن الدفعة الجديدة — قبل ما نفتحها للعموم.
            </p>
            {wlJoined ? (
              <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(22,163,74,0.07)', border: '1.5px solid rgba(22,163,74,0.2)', color: '#16a34a', fontSize: 15, fontWeight: 700 }}>
                تم تسجيلك! هنبعتلك إشعار قبل أي حد تاني ✓
              </div>
            ) : (
              <div className="waitlist-form" style={{ display: 'flex', flexDirection: 'column', gap: 18, textAlign: 'right' }}>
                <div className="waitlist-row" style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: '#57534e' }}>الاسم</label>
                    <input className="n3-input" placeholder="اسمك بالكامل" value={wlName} onChange={e => setWlName(e.target.value)} style={{ width: '100%', height: 56, fontSize: 15 }} />
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: '#57534e' }}>رقم الموبايل</label>
                    <input className="n3-input" placeholder="01xxxxxxxxx" value={wlPhone} onChange={e => setWlPhone(e.target.value)} style={{ width: '100%', height: 56, fontSize: 15 }} dir="ltr" />
                  </div>
                </div>

<div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: '#57534e' }}>الكمية التقريبية (كجم) *</label>
                  <input className="n3-input" type="number" placeholder="مثلاً 3" value={wlKg} onChange={e => setWlKg(e.target.value)} style={{ width: '100%', height: 56, fontSize: 15 }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <label style={{ fontSize: 12, fontWeight: 800, color: '#57534e' }}>ملاحظات — اختياري</label>
                  <input className="n3-input" placeholder="أي تفاصيل إضافية..." value={wlNotes} onChange={e => setWlNotes(e.target.value)} style={{ width: '100%', height: 56, fontSize: 15 }} />
                </div>

                {wlError && (
                  <div style={{ background: 'rgba(220,38,38,0.07)', border: '1.5px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#dc2626', fontWeight: 700 }}>
                    {wlError}
                  </div>
                )}

                <button className="btn-gold" onClick={handleWaitlist} disabled={wlLoading} style={{ width: '100%', height: 58, fontSize: 16, marginTop: 6 }}>
                  {wlLoading ? <Icons.loading /> : 'انضم للقائمة'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
            <a
  href={waLink}
  target="_blank"
  rel="noopener noreferrer"
  style={{
    position: 'fixed',
    bottom: '25px',
    left: '25px',
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    background: '#25D366',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(37,211,102,.4)',
    zIndex: 9999,
    transition: 'all .25s ease',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.08)'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1)'
  }}
>
  <svg
    width="34"
    height="34"
    viewBox="0 0 24 24"
    fill="white"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884z"/>
  </svg>
</a>

      {/* Footer */}
      <Footer settings={settings} scrollTo={scrollTo} />
    </div>
  )
}