"use client";

import { useAuth } from "@/context/AuthContext";
import { login, register } from "@/lib/api";
import { X, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export function AuthModal() {
  const { showAuthModal, authView, closeAuth } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showAuthModal]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-[3px] z-[500] transition-opacity duration-300 ${
          showAuthModal ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeAuth}
      />
      <div
        className={`fixed inset-0 z-[501] flex items-center justify-center p-4 transition-all duration-300 ${
          showAuthModal ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`bg-white rounded-3xl w-full max-w-[400px] overflow-hidden transition-all duration-300 ${
            showAuthModal ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={closeAuth}
              className="p-2 rounded-full text-[#141414]/25 hover:text-[#141414]/50 hover:bg-black/[0.03] transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
          <div className="px-8 pb-8 pt-2">
            {authView === "login" ? <LoginView /> : <RegisterView />}
          </div>
        </div>
      </div>
    </>
  );
}

function LoginView() {
  const { setAuthView, onLoginSuccess } = useAuth();
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!emailOrUsername.trim() || !password.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await login(emailOrUsername, password);
      onLoginSuccess(res.token, res.user);
      router.push("/experiences");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Amally" width={72} height={72} />
      </div>
      <h2 className="text-[24px] font-semibold tracking-tight text-[#141414] leading-tight text-center">
        Qaytib kelganingizdan xursandmiz
      </h2>
      <p className="mt-2 text-[14px] text-[#141414]/40 leading-relaxed text-center">
        Hisobingizga kiring va tajribalaringizni ulashing
      </p>

      {error && (
        <div className="mt-4 px-4 py-2.5 rounded-xl bg-red-50 text-[13px] text-red-500 text-center">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-3">
        <input
          type="text"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          placeholder="Email yoki foydalanuvchi nomi"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[14px] text-[#141414] placeholder:text-[#141414]/25 outline-none focus:border-black/[0.16] transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Parol"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[14px] text-[#141414] placeholder:text-[#141414]/25 outline-none focus:border-black/[0.16] transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !emailOrUsername.trim() || !password.trim()}
        className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#69824f] text-white text-[14px] font-medium hover:bg-[#576d42] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Kirish <ArrowRight size={15} strokeWidth={2} /></>}
      </button>

      <div className="mt-6 text-center">
        <span className="text-[13px] text-[#141414]/35">Hisobingiz yo&apos;qmi? </span>
        <button onClick={() => setAuthView("register")} className="text-[13px] font-medium text-[#69824f] hover:underline underline-offset-2">
          Ro&apos;yxatdan o&apos;ting
        </button>
      </div>
    </>
  );
}

function RegisterView() {
  const { setAuthView, onLoginSuccess } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await register(username, fullName, email, password);
      onLoginSuccess(res.token, res.user);
      router.push("/experiences");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Amally" width={72} height={72} />
      </div>
      <h2 className="text-[24px] font-semibold tracking-tight text-[#141414] leading-tight text-center">
        Jamoamizga qo&apos;shiling
      </h2>
      <p className="mt-2 text-[14px] text-[#141414]/40 leading-relaxed text-center">
        Hisob yarating va tajribalaringizni ulashing
      </p>

      {error && (
        <div className="mt-4 px-4 py-2.5 rounded-xl bg-red-50 text-[13px] text-red-500 text-center">
          {error}
        </div>
      )}

      <div className="mt-8 space-y-3">
        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="To'liq ism"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[14px] text-[#141414] placeholder:text-[#141414]/25 outline-none focus:border-black/[0.16] transition-colors" />
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Foydalanuvchi nomi"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[14px] text-[#141414] placeholder:text-[#141414]/25 outline-none focus:border-black/[0.16] transition-colors" />
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[14px] text-[#141414] placeholder:text-[#141414]/25 outline-none focus:border-black/[0.16] transition-colors" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Parol (kamida 6 ta belgi)"
          className="w-full px-4 py-3 rounded-xl border border-black/[0.08] text-[14px] text-[#141414] placeholder:text-[#141414]/25 outline-none focus:border-black/[0.16] transition-colors"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !fullName.trim() || !username.trim() || !email.trim() || !password.trim()}
        className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-[#69824f] text-white text-[14px] font-medium hover:bg-[#576d42] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <>Ro&apos;yxatdan o&apos;tish <ArrowRight size={15} strokeWidth={2} /></>}
      </button>

      <div className="mt-6 text-center">
        <span className="text-[13px] text-[#141414]/35">Hisobingiz bormi? </span>
        <button onClick={() => setAuthView("login")} className="text-[13px] font-medium text-[#69824f] hover:underline underline-offset-2">
          Kirish
        </button>
      </div>
    </>
  );
}
