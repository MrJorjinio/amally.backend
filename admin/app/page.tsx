"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await adminLogin(email, password);
    setLoading(false);
    if (result) {
      router.push("/dashboard");
    } else {
      setError("Noto'g'ri email yoki parol");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-[24px] font-bold text-center mb-1">Amally Admin</h1>
        <p className="text-[14px] text-[#141414]/40 text-center mb-8">Kirish</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#141414]/50 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[14px] outline-none focus:border-[#69824F] transition-colors"
              placeholder="admin@amally.uz"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#141414]/50 mb-1.5">Parol</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.08] bg-white text-[14px] outline-none focus:border-[#69824F] transition-colors"
              placeholder="Parolni kiriting"
            />
          </div>

          {error && <p className="text-[13px] text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#69824F] text-white text-[14px] font-medium hover:bg-[#576d42] transition-colors disabled:opacity-50"
          >
            {loading ? "Kirish..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}
