import { useState, useEffect, useRef } from 'react'

/* ── Icons ── */
const Icons = {
  menu: () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  x: () => (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  whatsapp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
}

/* ── Active Banner ── */
function ActiveBanner({ banners }) {
  const [dismissed, setDismissed] = useState([])
  const visible = (banners || []).filter(b => !dismissed.includes(b.id))
  if (!visible.length) return null
  const b = visible[0]
  return (
    <div style={{
      background: b.backgroundColor || 'var(--gold)',
      color: b.textColor || '#fff',
      padding: '10px 20px',
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      position: 'relative',
      zIndex: 1100,
    }}>
      <span>{b.content || b.title}</span>
      {b.linkUrl && b.linkText && (
        <a href={b.linkUrl} style={{ color: 'inherit', fontWeight: 900, textDecoration: 'underline' }}>
          {b.linkText}
        </a>
      )}
      <button
        onClick={() => setDismissed(d => [...d, b.id])}
        style={{
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', color: 'inherit', cursor: 'pointer',
          fontSize: 16, opacity: 0.7, padding: 4,
        }}
      >✕</button>
    </div>
  )
}

/* ── NavSpacer ── */
export function NavSpacer({ navRef }) {
  const [h, setH] = useState(64)
  useEffect(() => {
    const measure = () => {
      if (navRef.current) setH(navRef.current.getBoundingClientRect().height)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (navRef.current) ro.observe(navRef.current)
    return () => ro.disconnect()
  }, [navRef])
  return <div style={{ height: h, flexShrink: 0 }} />
}

/* ════════════════════════════════════════════════════════
   NAVBAR COMPONENT
════════════════════════════════════════════════════════ */
export default function Navbar({ settings = {}, banners = [], navRef, onTrackClick, scrollTo }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const siteName    = settings?.siteName    || 'نعامكو'
  const siteTagline = settings?.siteTagline || 'PREMIUM OSTRICH'
  const waNumber    = settings?.whatsAppNumber?.replace(/\D/g, '')
  const waLink      = waNumber ? `https://wa.me/${waNumber}` : null

  const NAV_LINKS = [
    ['الرئيسية',       'hero'],
    ['الدفعة الحالية', 'batch'],
    ['المنتجات',       'products'],
    ['إزاي بيشتغل',   'how'],
    ['آراء العملاء',   'reviews'],
  ]

  const handleScroll = (id) => {
    setMenuOpen(false)
    scrollTo(id)
  }

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(250,250,247,0.97)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(28,25,23,0.08)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <ActiveBanner banners={banners} />

      {/* ── Main Bar ── */}
      <div
        style={{ height: 64, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        className="nav-inner-pad"
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {settings?.logoUrl ? (
            <>
              <img
                src={settings.logoUrl}
                alt={siteName}
                style={{
                  height: 42,
                  maxHeight: 42,
                  width: 'auto',
                  maxWidth: 110,
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 900,
                    color: '#1c1917',
                    letterSpacing: 0.5,
                    fontFamily: "'Cairo', sans-serif",
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                  }}
                >{siteName}</div>
                <div
                  className="hide-mob"
                  style={{ fontSize: 8, color: '#a8a29e', fontWeight: 700, letterSpacing: 2.5, marginTop: 1, whiteSpace: 'nowrap' }}
                >{siteTagline}</div>
              </div>
            </>
          ) : (
            <>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'linear-gradient(135deg, #c8913f, #B8843A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 15, color: '#fff', flexShrink: 0,
              }}>ن</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#1c1917', letterSpacing: 1.5, fontFamily: "'Cairo', sans-serif" }}>{siteName}</div>
                <div style={{ fontSize: 8, color: '#a8a29e', fontWeight: 700, letterSpacing: 2.5, marginTop: -1 }}>{siteTagline}</div>
              </div>
            </>
          )}
        </div>

        {/* Desktop Links */}
        <div className="hide-mob" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {NAV_LINKS.map(([label, id]) => (
            <button key={id} className="nav-link" onClick={() => handleScroll(id)}>{label}</button>
          ))}
        </div>

        {/* Desktop Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {waLink && (
            <a
              href={waLink} target="_blank" rel="noopener noreferrer"
              className="btn-ghost hide-mob"
              style={{ height: 38, padding: '0 14px', fontSize: 13, color: '#25d366', borderColor: 'rgba(37,211,102,0.3)' }}
            >
              <Icons.whatsapp /> واتساب
            </a>
          )}
          <button
            className="btn-ghost hide-mob"
            style={{ height: 38, padding: '0 16px', fontSize: 13 }}
            onClick={onTrackClick}
          >تتبع حجزك</button>
          <button
            className="btn-gold hide-mob"
            style={{ height: 38, padding: '0 20px', fontSize: 13 }}
            onClick={() => handleScroll('batch')}
          >احجز دلوقتي</button>

          {/* Hamburger */}
          <button
            className="show-mob"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: 'none', width: 38, height: 38,
              border: '1.5px solid rgba(28,25,23,0.12)', borderRadius: 10,
              background: '#fff', color: '#1c1917', cursor: 'pointer',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            {menuOpen ? <Icons.x /> : <Icons.menu />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div style={{
          background: '#fafaf7', borderTop: '1px solid rgba(28,25,23,0.06)',
          padding: '14px 20px 22px', display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          {NAV_LINKS.map(([label, id]) => (
            <button
              key={id}
              onClick={() => handleScroll(id)}
              style={{
                padding: '13px 0', background: 'none', border: 'none',
                borderBottom: '1px solid rgba(28,25,23,0.06)',
                color: '#1c1917', fontSize: 15, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Cairo',sans-serif", textAlign: 'right',
              }}
            >{label}</button>
          ))}
          {waLink && (
            <a
              href={waLink} target="_blank" rel="noopener noreferrer"
              className="btn-ghost"
              style={{ marginTop: 10, height: 44, fontSize: 14, color: '#25d366' }}
            ><Icons.whatsapp /> واتساب</a>
          )}
          <button
            className="btn-ghost"
            style={{ marginTop: 10, height: 44, fontSize: 14 }}
            onClick={() => { setMenuOpen(false); onTrackClick() }}
          >تتبع حجزك</button>
          <button
            className="btn-gold"
            style={{ marginTop: 8, height: 48, fontSize: 15 }}
            onClick={() => handleScroll('batch')}
          >احجز دلوقتي</button>
        </div>
      )}
    </nav>
  )
}