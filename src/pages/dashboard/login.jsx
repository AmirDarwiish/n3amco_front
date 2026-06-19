import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../../config'

export default function DashboardLogin() {
const [email, setEmail]       = useState('admin@n3amco.com')
const [password, setPassword] = useState('123123123')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted]   = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  const handleLogin = async () => {
    if (!email || !password) { setError('من فضلك أدخل الإيميل والباسورد'); return }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      const json = await res.json()
      if (!res.ok) { setError('إيميل أو باسورد غلط'); setLoading(false); return }

      const data  = json?.data ?? json
      const token = data?.token

      localStorage.setItem('token',       token)
      localStorage.setItem('user-name',   data?.fullName ?? '')
      localStorage.setItem('user-email',  data?.email    ?? '')
      localStorage.setItem('permissions', JSON.stringify(data?.permissions ?? []))
      localStorage.setItem('roles',       JSON.stringify(data?.roles       ?? []))

      navigate('/dashboard')
    } catch {
      setError('فشل الاتصال بالسيرفر')
      setLoading(false)
    }
  }

  const handleKey = e => e.key === 'Enter' && handleLogin()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-page {
          min-height: 100vh;
          background: #080e1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          position: relative;
          overflow: hidden;
        }

        /* ── animated mesh background ── */
        .login-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(201,169,110,.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 90%, rgba(56,189,248,.05) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(15,23,42,.8) 0%, transparent 100%);
          pointer-events: none;
        }

        /* ── grid lines ── */
        .login-page::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(201,169,110,.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201,169,110,.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }

        /* ── floating orbs ── */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          animation: drift 12s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 400px; height: 400px;
          background: rgba(201,169,110,.06);
          top: -100px; right: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 300px; height: 300px;
          background: rgba(56,189,248,.04);
          bottom: -80px; left: -80px;
          animation-delay: -6s;
        }
        @keyframes drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.05); }
        }

        /* ── card ── */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          margin: 24px;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .6s ease, transform .6s ease;
        }
        .login-card.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        /* card glow border */
        .card-inner {
          background: rgba(15,23,42,.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(201,169,110,.18);
          border-radius: 20px;
          padding: 44px 40px 40px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,.03),
            0 32px 80px rgba(0,0,0,.6),
            0 0 60px rgba(201,169,110,.04);
        }

        /* ── logo area ── */
        .logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 36px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity .5s ease .15s, transform .5s ease .15s;
        }
        .login-card.mounted .logo-wrap {
          opacity: 1;
          transform: translateY(0);
        }
        .logo-img {
          height: 64px;
          width: auto;
          object-fit: contain;
          margin-bottom: 16px;
          filter: drop-shadow(0 4px 20px rgba(201,169,110,.25));
        }
        .logo-divider {
          width: 48px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #C9A96E, transparent);
          margin: 0 auto 14px;
        }
        .logo-subtitle {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #C9A96E;
          text-transform: uppercase;
        }

        /* ── title ── */
        .login-title {
          font-size: 22px;
          font-weight: 800;
          color: #f1f5f9;
          text-align: center;
          margin-bottom: 6px;
          opacity: 0;
          transform: translateY(10px);
          transition: opacity .5s ease .25s, transform .5s ease .25s;
        }
        .login-card.mounted .login-title { opacity: 1; transform: translateY(0); }

        .login-desc {
          font-size: 13px;
          color: #64748b;
          text-align: center;
          margin-bottom: 32px;
          opacity: 0;
          transition: opacity .5s ease .3s;
        }
        .login-card.mounted .login-desc { opacity: 1; }

        /* ── fields ── */
        .field-wrap {
          margin-bottom: 16px;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity .45s ease, transform .45s ease;
        }
        .field-wrap.f1 { transition-delay: .32s; }
        .field-wrap.f2 { transition-delay: .40s; }
        .login-card.mounted .field-wrap { opacity: 1; transform: translateY(0); }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 7px;
          letter-spacing: .4px;
        }

        .field-input-wrap {
          position: relative;
        }

        .field-input {
          width: 100%;
          height: 46px;
          background: rgba(255,255,255,.04);
          border: 1px solid #1e3a5f;
          border-radius: 10px;
          color: #f1f5f9;
          font-size: 14px;
          font-family: 'Cairo', sans-serif;
          padding: 0 14px;
          outline: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
          direction: ltr;
          text-align: right;
        }
        .field-input::placeholder { color: #334155; direction: rtl; }
        .field-input:focus {
          border-color: #C9A96E;
          background: rgba(201,169,110,.04);
          box-shadow: 0 0 0 3px rgba(201,169,110,.08);
        }

        .pass-toggle {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #475569;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color .15s;
        }
        .pass-toggle:hover { color: #94a3b8; }

        /* ── error ── */
        .login-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(248,113,113,.08);
          border: 1px solid rgba(248,113,113,.25);
          border-radius: 9px;
          padding: 10px 14px;
          font-size: 13px;
          color: #f87171;
          margin-bottom: 16px;
          animation: shake .35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }

        /* ── submit button ── */
        .login-btn {
          width: 100%;
          height: 48px;
          background: linear-gradient(135deg, #C9A96E 0%, #b8924f 100%);
          border: none;
          border-radius: 10px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 800;
          font-family: 'Cairo', sans-serif;
          cursor: pointer;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
          transition: transform .15s, box-shadow .2s;
          opacity: 0;
          transition: opacity .45s ease .48s, transform .15s, box-shadow .2s;
          letter-spacing: .5px;
        }
        .login-card.mounted .login-btn { opacity: 1; }

        .login-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(201,169,110,.35);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled {
          opacity: .7;
          cursor: not-allowed;
        }

        /* ── spinner ── */
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(15,23,42,.3);
          border-top-color: #0f172a;
          border-radius: 50%;
          animation: spin .7s linear infinite;
          display: inline-block;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── footer line ── */
        .login-footer {
          margin-top: 28px;
          text-align: center;
          font-size: 11px;
          color: #1e3a5f;
          letter-spacing: .5px;
          opacity: 0;
          transition: opacity .5s ease .55s;
        }
        .login-card.mounted .login-footer { opacity: 1; }
      `}</style>

      <div className="login-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className={`login-card ${mounted ? 'mounted' : ''}`}>
          <div className="card-inner">

            {/* Logo */}
            <div className="logo-wrap">
              <img
                src="/logo.webp"
                alt="Logo"
                className="logo-img"
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
              <div className="logo-divider" />
              <div className="logo-subtitle">ERP System</div>
            </div>

            {/* Title */}
            <div className="login-title">تسجيل الدخول</div>
            <div className="login-desc">أدخل بياناتك للوصول إلى لوحة التحكم</div>

            {/* Email */}
            <div className="field-wrap f1">
              <label className="field-label">البريد الإلكتروني</label>
              <div className="field-input-wrap">
                <input
                  className="field-input"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-wrap f2">
              <label className="field-label">كلمة المرور</label>
              <div className="field-input-wrap">
                <input
                  className="field-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  autoComplete="current-password"
                  style={{ paddingLeft: 40 }}
                />
                <button
                  className="pass-toggle"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error" key={error}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading
                ? <span className="spinner" />
                : 'دخول'
              }
            </button>

            {/* Footer */}
            <div className="login-footer">ZEIIA ERP · نظام إدارة الموارد</div>
          </div>
        </div>
      </div>
    </>
  )
}