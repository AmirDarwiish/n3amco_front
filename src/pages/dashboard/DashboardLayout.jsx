import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import API_BASE_URL from '../../config'
import { useTheme } from '../../context/ThemeContext'
import NotificationBell from './NotificationBell'
import '../../styles/dashboard.css'

/* ── Auth helper ─────────────────────────────────────────── */
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

/* ── Permissions helper ──────────────────────────────────── */
function usePermissions() {
  const raw   = localStorage.getItem('permissions')
  const roles = JSON.parse(localStorage.getItem('roles') || '[]')
  const permissions = raw ? JSON.parse(raw) : []
  const isSuperAdmin = roles.includes('SuperAdmin')

  const can = (permission) => {
    if (!permission)    return true   // بدون قيد → يظهر للكل
    if (isSuperAdmin)   return true   // SuperAdmin يشوف كل حاجة
    return permissions.includes(permission)
  }

  return { can, isSuperAdmin, permissions }
}

/* ── SVG Icons ───────────────────────────────────────────── */
const Ico = ({ children, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

const IcoDashboard  = () => <Ico><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></Ico>
const IcoSuppliers  = () => <Ico><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Ico>
const IcoPayments   = () => <Ico><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></Ico>
const IcoUsers      = () => <Ico><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ico>
const IcoReport     = () => <Ico><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Ico>
const IcoLogout     = () => <Ico><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ico>
const IcoMenu       = () => <Ico><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></Ico>
const IcoSun        = () => <Ico><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></Ico>
const IcoMoon       = () => <Ico><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Ico>
const IcoCollapse   = () => <Ico size={16}><polyline points="15 18 9 12 15 6"/></Ico>
const IcoExpand     = () => <Ico size={16}><polyline points="9 18 15 12 9 6"/></Ico>
const IcoInventory  = () => <Ico><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></Ico>
const IcoSaleList   = () => <Ico><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Ico>
const IcoNewSale    = () => <Ico><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></Ico>
const IcoMilk       = () => <Ico><path d="M7 2h10l1 10H6L7 2z"/><path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5"/></Ico>
const IcoAccounting = () => <Ico><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></Ico>

/* ── Nav Structure ───────────────────────────────────────── */
const NAV = [
  {
    section: 'الرئيسية',
    items: [
      { path: '/dashboard', label: 'لوحة التحكم', Icon: IcoDashboard, permission: 'DASHBOARD_VIEW' },
    ],
  },
  {
    section: 'الموردون والخامات',
    items: [
      { path: '/dashboard/milk-collections', label: 'سجل التوريدات',    Icon: IcoMilk,      permission: 'SUPPLIERS_VIEW'        },
      { path: '/dashboard/suppliers',         label: 'الموردون',          Icon: IcoSuppliers, permission: 'SUPPLIERS_VIEW'        },
      { path: '/dashboard/supplier-payments', label: 'مدفوعات الموردين', Icon: IcoPayments,  permission: 'SUPPLIER_PAYMENT_VIEW' },
    ],
  },
  {
    section: 'المبيعات',
    items: [
      { path: '/dashboard/sales/new', label: 'فاتورة جديدة',   Icon: IcoNewSale,  permission: 'SALES_CREATE' },
      { path: '/dashboard/sales',     label: 'قائمة المبيعات', Icon: IcoSaleList, permission: 'SALES_READ'   },
      { path: '/dashboard/customers', label: 'العملاء',         Icon: IcoUsers,    permission: 'CUSTOMERS_VIEW' },
      { path: '/dashboard/Waitlistpage', label: 'قائمة الانتظار',         Icon: IcoUsers,    permission: 'WAITLIST_READ' },
    ],
  },
  {
    section: 'المخزن والمستودع',
    items: [
      { path: '/dashboard/products', label: 'المنتجات والمخزون', Icon: IcoInventory, permission: 'PRODUCTS_VIEW' },
      { path: '/dashboard/Units',    label: 'الوحدات',            Icon: IcoInventory, permission: 'UNITS_VIEW'    },
    ],
  },
  {
    section: 'المالية والحسابات',
    items: [
      { path: '/dashboard/accounting', label: 'النظام المالي', Icon: IcoAccounting, permission: 'ACCOUNTS_VIEW' },
    ],
  },
  {
    section: 'الإدارة',
    items: [
      { path: '/dashboard/users',            label: 'المستخدمون',    Icon: IcoUsers,  permission: 'USERS_VIEW' },
      { path: '/dashboard/websitemanager', label: 'محتوي الموقع', Icon: IcoMoon, permission: null     ,  permission: 'WEBSITE_VIEW'    },
      { path: '/dashboard/reports/activity', label: 'تقارير النشاط', Icon: IcoReport, permission: null         },

    ],
  },
]

/* ── User Profile Dropdown ───────────────────────────────── */
function ProfileDropdown({ onClose }) {
  const navigate = useNavigate()
  const ref = useRef()

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [onClose])

  const name  = localStorage.getItem('user-name')  || 'المستخدم'
  const email = localStorage.getItem('user-email') || ''

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST', headers: authHeaders(), credentials: 'include',
      })
    } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user-name')
    localStorage.removeItem('user-email')
    localStorage.removeItem('permissions')
    localStorage.removeItem('roles')
    navigate('/dashboard/login')
  }

  return (
    <div ref={ref} style={{
      position: 'absolute',
      top: 'calc(100% + 8px)',
      left: 0,
      minWidth: 220,
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-md)',
      borderRadius: 12,
      boxShadow: 'var(--shadow-modal)',
      overflow: 'hidden',
      zIndex: 300,
      direction: 'rtl',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>{name}</div>
        {email && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{email}</div>}
      </div>
      <button
        onClick={handleLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '12px 16px', border: 'none',
          background: 'transparent', cursor: 'pointer',
          color: 'var(--red)', fontSize: 13, fontWeight: 700,
          fontFamily: "'Cairo', sans-serif", textAlign: 'right',
          transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--red-bg)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <IcoLogout /> تسجيل الخروج
      </button>
    </div>
  )
}

/* ── NavItem ─────────────────────────────────────────────── */
function NavItem({ item, collapsed, badge }) {
  const location = useLocation()
  const navigate = useNavigate()
  const isActive = location.pathname === item.path

  return (
    <button
      onClick={() => navigate(item.path)}
      className={`db-nav-item${isActive ? ' db-nav-item--active' : ''}`}
      title={collapsed ? item.label : ''}
    >
      <span className="db-nav-item__icon"><item.Icon /></span>
      <span className="db-nav-item__label">{item.label}</span>
      {badge > 0 && (
        <span className="db-nav-item__badge">{badge > 9 ? '9+' : badge}</span>
      )}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD LAYOUT — Main Export
═══════════════════════════════════════════════════════════ */
export default function DashboardLayout({ children, title, breadcrumb, headerActions }) {
  const { toggleTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { can } = usePermissions()

  const [collapsed,   setCollapsed]   = useState(() => window.innerWidth < 1200)
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [todayBadge,  setTodayBadge]  = useState(0)
  const [isMobile,    setIsMobile]    = useState(() => window.innerWidth <= 768)

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    const fn = () => {
      if (window.innerWidth < 1200) setCollapsed(true)
      setIsMobile(window.innerWidth <= 768)
    }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <div className="db-shell" style={{ direction: 'rtl' }}>

      {/* ── Sidebar Overlay (mobile) ────────────────────── */}
      <div
        className={`db-sidebar-overlay${mobileOpen ? ' db-sidebar-overlay--visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* ══════════════════════════════════════════════════
         SIDEBAR
      ══════════════════════════════════════════════════ */}
      <aside className={[
        'db-sidebar',
        collapsed && !isMobile ? 'db-sidebar--collapsed' : '',
        mobileOpen ? 'db-sidebar--open' : '',
      ].filter(Boolean).join(' ')}>

        {/* ── Logo ────────────────────────────────────── */}
        <div className="db-sidebar__logo">
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--gold-light), var(--gold))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: '#080d16',
          }}>Z</div>

          <div className="db-sidebar__logo-text" style={{ lineHeight: 1 }}>
            <span style={{
              display: 'block', fontSize: 15, fontWeight: 900,
              color: 'var(--gold)', letterSpacing: 1, whiteSpace: 'nowrap',
            }}>
              ZEIIA ERP
            </span>
            <span style={{
              display: 'block', fontSize: 9, fontWeight: 600,
              color: 'var(--sidebar-text-muted, rgba(255,255,255,.4))',
              letterSpacing: 1.5, whiteSpace: 'nowrap', marginTop: 1,
            }}>
              نظام إدارة المصنع
            </span>
          </div>
        </div>

        {/* ── Nav ─────────────────────────────────────── */}
        <nav className="db-nav">
          {NAV.map(section => {
            // فلتر الـ items بناءً على permissions اليوزر
            const visibleItems = section.items.filter(item => can(item.permission))

            // لو مفيش items → متظهرش الـ section خالص
            if (visibleItems.length === 0) return null

            return (
              <div key={section.section} className="db-nav-section">
                <div className="db-nav-label">{section.section}</div>
                {visibleItems.map(item => (
                  <NavItem
                    key={item.path}
                    item={item}
                    collapsed={collapsed && !mobileOpen}
                    badge={item.path === '/dashboard' ? todayBadge : 0}
                  />
                ))}
              </div>
            )
          })}
        </nav>

        {/* ── Collapse Toggle ─────────────────────────── */}
        <div className="db-sidebar__footer">
          <button
            onClick={() => setCollapsed(c => !c)}
            className="db-nav-item"
            style={{ width: '100%' }}
            title={collapsed ? 'توسيع' : 'تصغير'}
          >
            <span className="db-nav-item__icon">
              {collapsed ? <IcoExpand /> : <IcoCollapse />}
            </span>
            <span className="db-nav-item__label">
              {collapsed ? 'توسيع' : 'تصغير'}
            </span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
         MAIN WRAPPER
      ══════════════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* ── Header ──────────────────────────────────── */}
        <header className={`db-header${collapsed && !isMobile ? ' db-header--collapsed' : ''}`}>

          {/* Right: hamburger + breadcrumb */}
          <div className="db-header__right" style={{ gap: 12 }}>
            <button
              className="db-btn--icon"
              onClick={() => setMobileOpen(o => !o)}
              style={{ display: isMobile ? 'flex' : 'none' }}
            >
              <IcoMenu />
            </button>
            <div style={{ minWidth: 0 }}>
              {breadcrumb && (
                <div className="db-header__breadcrumb" style={{ fontSize: 11, marginBottom: 1 }}>
                  {breadcrumb}
                </div>
              )}
              {title && <div className="db-header__title">{title}</div>}
            </div>
          </div>

          {/* Left: actions */}
          <div className="db-header__actions">
            {headerActions}
            <button className="db-btn--icon" title="الإشعارات" style={{ position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--red)', color: '#fff',
                fontSize: 9, fontWeight: 800,
                width: 14, height: 14, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                0
              </span>
            </button>

            <button
              className="db-btn--icon"
              onClick={toggleTheme}
              title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
              {isDark ? <IcoSun /> : <IcoMoon />}
            </button>

            <div style={{ position: 'relative' }}>
              <div
                className="db-avatar"
                onClick={() => setProfileOpen(o => !o)}
                title="الملف الشخصي"
              >
                {(localStorage.getItem('user-name') || 'M')[0].toUpperCase()}
              </div>
              {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
            </div>
          </div>
        </header>

        {/* ── Page Content ────────────────────────────── */}
        <main
          className={[
            'db-main',
            'db-animate-in',
            collapsed && !isMobile ? 'db-main--collapsed' : '',
          ].filter(Boolean).join(' ')}
          style={{ overflowY: 'auto', height: `calc(100vh - var(--header-h))` }}
        >
          {children}
        </main>
      </div>

      <style>{`
        [data-theme="light"] .db-sidebar {
          background: #ffffff !important;
          border-left-color: #e5e7eb !important;
        }
        [data-theme="light"] .db-nav-label {
          color: #9ca3af !important;
        }
        [data-theme="light"] .db-nav-item {
          color: #4b5563 !important;
        }
        [data-theme="light"] .db-nav-item:hover {
          background: #f3f4f6 !important;
          color: #111827 !important;
        }
        [data-theme="light"] .db-nav-item--active {
          background: rgba(201,169,110,.15) !important;
          color: #b08d4b !important;
        }
        [data-theme="light"] .db-nav-item--active::before {
          background: #C9A96E !important;
        }
        [data-theme="light"] .db-sidebar__footer {
          border-top-color: #e5e7eb !important;
        }
        [data-theme="light"] .db-sidebar__logo {
          border-bottom-color: #e5e7eb !important;
        }
        [data-theme="light"] .db-sidebar__logo-text span:last-child {
          color: #6b7280 !important;
        }
      `}</style>
    </div>
  )
}