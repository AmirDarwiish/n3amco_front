/* ── Icons ── */
const Icons = {
  whatsapp: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
}

/* ════════════════════════════════════════════════════════
   FOOTER COMPONENT
════════════════════════════════════════════════════════ */
export default function Footer({ settings = {}, scrollTo }) {
  const siteName    = settings?.siteName       || 'N3AMCO'
  const siteTagline = settings?.siteTagline    || 'PREMIUM OSTRICH'
  const footerAbout = settings?.footerAboutText || 'منصة حجز لحم النعام الفاخر. كميات محدودة وطزاجة مضمونة.'
  const waNumber    = settings?.whatsAppNumber?.replace(/\D/g, '')
  const waLink      = waNumber ? `https://wa.me/${waNumber}` : null
  const fbUrl       = settings?.facebookUrl
  const igUrl       = settings?.instagramUrl

  const platformLinks = [
    ['الدفعة الحالية', 'batch'],
    ['المنتجات',       'products'],
    ['إزاي بيشتغل',   'how'],
    ['قائمة الانتظار', 'waitlist'],
  ]

  const companyLinks = [
    ['مين إحنا',      null],
    ['مزارعنا',       null],
    ['معايير الجودة', null],
    ['أسئلة شائعة',   null],
  ]

  const contactLinks = [
    ...(settings?.supportPhone ? [[`📞 ${settings.supportPhone}`, null]] : []),
    ...(settings?.supportEmail ? [[`✉️ ${settings.supportEmail}`, null]] : []),
    ...(waLink ? [['واتساب',   null]] : []),
    ...(fbUrl  ? [['فيسبوك',   null]] : []),
    ...(igUrl  ? [['انستجرام', null]] : []),
  ]

  const columns = [
    { title: 'المنصة',      links: platformLinks },
    { title: 'الشركة',      links: companyLinks  },
    { title: 'تواصل معانا', links: contactLinks  },
  ]

  return (
    <footer style={{
      background: '#1c1917', color: '#a8a29e',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '52px 24px 28px',
    }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>

        {/* ── Grid ── */}
        <div
          className="footer-grid"
          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 36 }}
        >
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={siteName} style={{ height: 34, filter: 'brightness(0.8)' }} />
              ) : (
                <>
                  <div style={{
                    width: 34, height: 34, borderRadius: 9,
                    background: 'linear-gradient(135deg, #c8913f, #B8843A)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 14, color: '#fff',
                  }}>N</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#fafaf7', letterSpacing: 1.5 }}>{siteName}</div>
                    <div style={{ fontSize: 8, color: '#57534e', fontWeight: 700, letterSpacing: 2.5 }}>{siteTagline}</div>
                  </div>
                </>
              )}
            </div>

            <p style={{ fontSize: 12, color: '#57534e', lineHeight: 1.85, maxWidth: 210 }}>{footerAbout}</p>

            {/* Social Icons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {fbUrl && (
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a8a29e', textDecoration: 'none', fontSize: 14,
                }}>f</a>
              )}
              {igUrl && (
                <a href={igUrl} target="_blank" rel="noopener noreferrer" style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a8a29e', textDecoration: 'none', fontSize: 14,
                }}>ig</a>
              )}
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#25d366', textDecoration: 'none',
                }}><Icons.whatsapp /></a>
              )}
            </div>
          </div>

          {/* Link Columns */}
          {columns.map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#d6d3d1', marginBottom: 14 }}>{title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {links.map(([label, id]) => (
                  <button
                    key={label}
                    onClick={() => id && scrollTo(id)}
                    style={{
                      fontSize: 12, color: '#57534e', background: 'none', border: 'none',
                      cursor: id ? 'pointer' : 'default',
                      textAlign: 'right', fontFamily: "'Cairo',sans-serif",
                      padding: 0, transition: 'color 0.18s',
                    }}
                    onMouseEnter={e => { if (id) e.target.style.color = '#B8843A' }}
                    onMouseLeave={e => { e.target.style.color = '#57534e' }}
                  >{label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ fontSize: 11, color: '#3c3836' }}>© 2025 {siteName} — جميع الحقوق محفوظة</div>
          <div style={{ display: 'flex', gap: 18 }}>
            {['سياسة الخصوصية', 'الشروط والأحكام'].map(l => (
              <a key={l} href="#" style={{ fontSize: 11, color: '#3c3836', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </div>
      <div
  style={{
    textAlign: 'center',
    marginTop: 18,
    paddingTop: 18,
  }}
>
  <span
    style={{
      fontSize: 13,
      color: '#78716c',
      fontWeight: 500
    }}
  >
    Made with ❤️ by{' '}
  </span>

  <a
    href="https://zeiia.com"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: '#B8843A',
      textDecoration: 'none',
      fontSize: 15,
      fontWeight: 800,
      letterSpacing: '1px'
    }}
  >
    Z E I I A
  </a>
</div>
    </footer>
  )
}