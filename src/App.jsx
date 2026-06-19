import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LangProvider } from './context/LangContext'
import { ThemeProvider } from './context/ThemeContext'
import ScrollToTop from './components/ScrollToTop'
import N3amcoHomePage from './pages/N3amcohomepage'


// ── Dashboard Pages — lazy
const DashboardLogin      = lazy(() => import('./pages/dashboard/login'))
const Dashboard           = lazy(() => import('./pages/dashboard/index'))
const UsersPage           = lazy(() => import('./pages/dashboard/users'))
const UserActivityReport  = lazy(() => import('./pages/dashboard/Useractivityreport'))
const SupplierPaymentsPage = lazy(() => import('./pages/dashboard/Supplierpaymentspage'))
const SuppliersPage       = lazy(() => import('./pages/dashboard/Supplierspage'))
const SalesList           = lazy(() => import('./pages/dashboard/SalesList'))
const CreateSale          = lazy(() => import('./pages/dashboard/CreateSale'))
const ProductsList        = lazy(() => import('./pages/dashboard/ProductsList'))
const MilkCollectionsPage = lazy(() => import('./pages/dashboard/MilkCollectionsPage'))
const CustomersPage       = lazy(() => import('./pages/dashboard/Customerspage'))
const UnitsPage       = lazy(() => import('./pages/dashboard/Unitspage'))
const WebsiteManager       = lazy(() => import('./pages/dashboard/Websitemanager'))

// إضافة صفحة النظام المالي
const AccountingModule    = lazy(() => import('./pages/dashboard/AccountingModule'))


/* ── isLoggedIn ────────────────────────────────────────────── */
const isLoggedIn = () => !!localStorage.getItem('token')

/* ── PrivateRoute ──────────────────────────────────────────── */
function PrivateRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/dashboard/login" replace />
  return children
}

/* ── Dashboard Loader ──────────────────────────────────────── */
const DashboardLoader = () => (
  <div style={{ 
    minHeight: '100vh', background: '#080d16',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      border: '3px solid rgba(201,169,110,0.2)',
      borderTopColor: '#C9A96E',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
)

/* ── 404 ───────────────────────────────────────────────────── */
function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'#080d16', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cairo',sans-serif", direction:'rtl', padding:20 }}>
      <div style={{ background:'#0d1420', border:'1px solid rgba(255,255,255,.06)', borderRadius:20, padding:'48px 40px', maxWidth:420, width:'100%', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, left:0, height:3, background:'linear-gradient(90deg,#C9A96E,#d4a855,transparent)', borderRadius:'20px 20px 0 0' }} />
        <div style={{ fontSize:72, fontWeight:900, lineHeight:1, background:'linear-gradient(135deg,#C9A96E,#d4a855)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:12 }}>404</div>
        <div style={{ fontSize:20, fontWeight:800, color:'#e8edf5', marginBottom:10 }}>الصفحة غير موجودة</div>
        <div style={{ fontSize:13, color:'#6b7891', lineHeight:1.8, marginBottom:28 }}>الصفحة دي مش موجودة. تأكد من الرابط وحاول مجدداً.</div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={() => navigate(-1)} style={{ height:38, padding:'0 16px', borderRadius:9, border:'1px solid rgba(255,255,255,.1)', background:'transparent', color:'#94a3b8', fontSize:13, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>← رجوع</button>
          <button onClick={() => navigate('/dashboard')} style={{ height:38, padding:'0 16px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#d4a855,#C9A96E)', color:'#080d16', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>الداشبورد</button>
        </div>
      </div>
    </div>
  )
}

/* ── Session Expired ───────────────────────────────────────── */
function SessionExpired() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'#080d16', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cairo',sans-serif", direction:'rtl', padding:20 }}>
      <div style={{ background:'#0d1420', border:'1px solid rgba(255,255,255,.06)', borderRadius:20, padding:'48px 40px', maxWidth:420, width:'100%', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, left:0, height:3, background:'linear-gradient(90deg,#fbbf24,transparent)', borderRadius:'20px 20px 0 0' }} />
        <div style={{ fontSize:72, fontWeight:900, lineHeight:1, background:'linear-gradient(135deg,#fbbf24,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:12 }}>401</div>
        <div style={{ fontSize:20, fontWeight:800, color:'#e8edf5', marginBottom:10 }}>انتهت الجلسة</div>
        <div style={{ fontSize:13, color:'#6b7891', lineHeight:1.8, marginBottom:28 }}>انتهت مدة جلستك. سجّل الدخول مجدداً للمتابعة.</div>
        <button onClick={() => { localStorage.removeItem('token'); navigate('/dashboard/login') }}
          style={{ height:38, padding:'0 20px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#d4a855,#C9A96E)', color:'#080d16', fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:"'Cairo',sans-serif" }}>
          تسجيل الدخول
        </button>
      </div>
    </div>
  )
}

/* ── Root ──────────────────────────────────────────────────── */
const App = () => (
  <ThemeProvider>
    <LangProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Redirect root to dashboard */}
<Route path="/" element={<N3amcoHomePage />} />

          {/* Login & session */}
          <Route path="/dashboard/login"
            element={<Suspense fallback={<DashboardLoader />}><DashboardLogin /></Suspense>}
          />
          <Route path="/dashboard/session-expired"
            element={<Suspense fallback={<DashboardLoader />}><SessionExpired /></Suspense>}
          />

          {/* Protected dashboard routes */}
          <Route path="/dashboard"
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><Dashboard /></Suspense></PrivateRoute>}
          />
          <Route path="/dashboard/users"
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><UsersPage /></Suspense></PrivateRoute>}
          />
          <Route path="/dashboard/reports/activity"
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><UserActivityReport /></Suspense></PrivateRoute>}
          />
          <Route path="/dashboard/supplier-payments" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><SupplierPaymentsPage /></Suspense></PrivateRoute>} 
          />
          <Route path="/dashboard/suppliers" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><SuppliersPage /></Suspense></PrivateRoute>} 
          />
          <Route path="/dashboard/milk-collections" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><MilkCollectionsPage /></Suspense></PrivateRoute>} 
          />
          <Route path="/dashboard/sales/new" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><CreateSale /></Suspense></PrivateRoute>} 
          />
          <Route path="/dashboard/sales" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><SalesList /></Suspense></PrivateRoute>} 
          />
          <Route path="/dashboard/products" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><ProductsList /></Suspense></PrivateRoute>} 
          />
          
          {/* راوت النظام المالي الجديد */}
          <Route path="/dashboard/accounting" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><AccountingModule /></Suspense></PrivateRoute>} 
          />

          {/* تعديل مسار العملاء لإضافة الحماية (إذا كان مطلوباً) */}
          <Route path="/dashboard/customers" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><CustomersPage /></Suspense></PrivateRoute>} 
          />
 <Route path="/dashboard/units" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><UnitsPage /></Suspense></PrivateRoute>} 
          />
           <Route path="/dashboard/websitemanager" 
            element={<PrivateRoute><Suspense fallback={<DashboardLoader />}><WebsiteManager /></Suspense></PrivateRoute>} 
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </LangProvider>
  </ThemeProvider>
)

export default App