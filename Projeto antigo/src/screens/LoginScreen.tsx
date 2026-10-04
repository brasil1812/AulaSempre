import { useState, useId } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../store/AppContext";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white" />
          <path d="M6 9L8.5 11.5L12.5 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="font-bold text-xl tracking-tight text-white">
        Aula<span className="text-blue-300">Sempre</span>
      </span>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
      <circle cx="10" cy="10" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l14 14M10 4c5.5 0 9 6 9 6s-.9 1.65-2.42 3.13M6.62 6.6C4.48 7.98 3 10 3 10s3.5 6 9 6a9.2 9.2 0 0 0 3.38-.63" />
      <circle cx="10" cy="10" r="3" clipPath="inset(0 0 3px 0)" />
    </svg>
  );
}

type View = "login" | "register";

export default function LoginScreen() {
  const navigate = useNavigate();
  const { setRole } = useApp();

  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  // — Validation helpers —
  function validateEmail(v: string) {
    if (!v) return "Informe seu e-mail";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Confira o formato do e-mail";
    return "";
  }
  function validatePassword(v: string) {
    if (!v) return "Informe sua senha";
    if (v.length < 6) return "A senha precisa ter pelo menos 6 caracteres";
    return "";
  }

  function handleBlurEmail() {
    setTouched((t) => ({ ...t, email: true }));
    const err = validateEmail(email);
    setErrors((e) => ({ ...e, email: err || undefined }));
  }
  function handleBlurPassword() {
    setTouched((t) => ({ ...t, password: true }));
    const err = validatePassword(password);
    setErrors((e) => ({ ...e, password: err || undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) {
      setErrors({ email: emailErr || undefined, password: passErr || undefined });
      return;
    }
    setErrors({});
    setLoading(true);
    // Demo: simulate a brief delay then go to profile selection
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    // In a real app, the back-end would identify the account type.
    // In this prototype we send to profile selection.
    navigate("/demo");
  }

  function handleRegister(role: "professor" | "instituicao") {
    setRole(role);
    navigate(role === "professor" ? "/professor" : "/instituicao");
  }

  // ─── Input class helper ───────────────────────────────────────────
  function inputCls(hasError?: boolean) {
    return [
      "w-full px-4 py-3 rounded-xl border text-slate-800 placeholder-slate-400",
      "text-sm transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      hasError
        ? "border-red-400 bg-red-50 focus:ring-red-400 focus:border-red-400"
        : "border-slate-200 bg-white hover:border-slate-300",
    ].join(" ");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">

      {/* ── Left panel: presentation ────────────────────────────── */}
      <div className="hidden md:flex md:w-[44%] lg:w-[42%] relative flex-col justify-between p-10 lg:p-14 overflow-hidden bg-slate-800 flex-shrink-0">
        {/* Photo */}
        <img
          src="https://images.unsplash.com/photo-1761532276195-5d975abae829?w=900&h=1200&fit=crop&auto=format&q=80"
          alt="Sala de aula com luz natural entrando pelas janelas"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        {/* Subtle gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/30 to-slate-900/70" />

        {/* Top: logo */}
        <div className="relative z-10">
          <Logo />
        </div>

        {/* Bottom: copy */}
        <div className="relative z-10">
          <p className="text-white text-2xl lg:text-3xl font-semibold leading-snug mb-3">
            Bom ter você<br />por aqui.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed max-w-xs">
            Entre para acompanhar suas oportunidades ou organizar as substituições da sua escola.
          </p>
        </div>
      </div>

      {/* ── Right panel: form ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0">

        {/* Mobile logo */}
        <div className="md:hidden px-6 pt-8 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L15.5 5.25V12.75L9 16.5L2.5 12.75V5.25L9 1.5Z" fill="white" />
                <path d="M6 9L8.5 11.5L12.5 7" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">
              Aula<span className="text-blue-600">Sempre</span>
            </span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10 md:py-0">
          <div className="w-full max-w-sm">

            {view === "login" ? (
              <>
                <h1 className="text-2xl font-bold text-slate-800 mb-1">Entre na sua conta</h1>
                <p className="text-sm text-slate-500 mb-8">
                  Escola ou professor — use o mesmo formulário.
                </p>

                {errors.form && (
                  <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <svg className="text-red-500 mt-0.5 flex-shrink-0" width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-700">{errors.form}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor={emailId} className="block text-sm font-medium text-slate-700 mb-1.5">
                      E-mail
                    </label>
                    <input
                      id={emailId}
                      type="email"
                      autoComplete="email"
                      placeholder="voce@exemplo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (touched.email) setErrors((err) => ({ ...err, email: validateEmail(e.target.value) || undefined }));
                      }}
                      onBlur={handleBlurEmail}
                      aria-describedby={errors.email ? `${emailId}-err` : undefined}
                      aria-invalid={!!errors.email}
                      className={inputCls(!!errors.email)}
                    />
                    {errors.email && (
                      <p id={`${emailId}-err`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor={passwordId} className="block text-sm font-medium text-slate-700">
                        Senha
                      </label>
                      <button
                        type="button"
                        onClick={() => navigate("/recuperar-senha")}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:underline transition-colors"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id={passwordId}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (touched.password) setErrors((err) => ({ ...err, password: validatePassword(e.target.value) || undefined }));
                        }}
                        onBlur={handleBlurPassword}
                        aria-describedby={errors.password ? `${passwordId}-err` : undefined}
                        aria-invalid={!!errors.password}
                        className={inputCls(!!errors.password) + " pr-11"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    {errors.password && (
                      <p id={`${passwordId}-err`} role="alert" className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember me */}
                  <label htmlFor={rememberId} className="flex items-center gap-3 cursor-pointer select-none group">
                    <div className="relative">
                      <input
                        id={rememberId}
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white peer-checked:border-blue-600 peer-checked:bg-blue-600 transition-colors flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-1">
                        {remember && (
                          <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                            <path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Manter conectado</span>
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                        </svg>
                        Entrando…
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </button>
                </form>

                {/* Demo notice */}
                <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Protótipo:</strong> qualquer e-mail e senha entram na demonstração. Nenhum dado é salvo ou enviado.
                  </p>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Ainda não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => { setView("register"); setErrors({}); }}
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline focus:outline-none focus:underline transition-colors"
                  >
                    Cadastre-se
                  </button>
                </p>
              </>
            ) : (
              /* ── Register: choose profile ──────────────────────── */
              <>
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6 focus:outline-none focus:underline"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 4.293a1 1 0 010 1.414L7.414 8l2.293 2.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Voltar ao login
                </button>

                <h1 className="text-2xl font-bold text-slate-800 mb-1">Crie sua conta</h1>
                <p className="text-sm text-slate-500 mb-8">Como você vai usar o AulaSempre?</p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handleRegister("professor")}
                    className="w-full text-left bg-white border-2 border-slate-100 hover:border-blue-400 focus:border-blue-500 focus:outline-none rounded-2xl p-5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center text-2xl transition-colors flex-shrink-0">
                        👩‍🏫
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors text-sm">Sou professor</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Recebo convites, aceito ou recuso, e acompanho minhas substituições.</p>
                      </div>
                      <svg className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRegister("instituicao")}
                    className="w-full text-left bg-white border-2 border-slate-100 hover:border-blue-400 focus:border-blue-500 focus:outline-none rounded-2xl p-5 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 group-hover:bg-blue-50 rounded-xl flex items-center justify-center text-2xl transition-colors flex-shrink-0">
                        🏫
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors text-sm">Sou uma escola</p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Publico solicitações, busco professores e gerencio as substituições.</p>
                      </div>
                      <svg className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-700 leading-relaxed">
                    <strong>Protótipo:</strong> o cadastro entra direto na demonstração com dados fictícios.
                  </p>
                </div>
              </>
            )}

            {/* Back to home */}
            <div className="mt-8 text-center">
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:underline"
              >
                ← Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
