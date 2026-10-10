"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, Mail } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import RoundTableLogo from "@/components/common/RoundTableLogo";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/admin-login", { email, password });
      login(res.data.user);
      router.push("/admin/dashboard");
    } catch (loginError) {
      setError(loginError.message || "Unable to log in as administrator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-purple-500/20 shadow-2xl">
        <div className="text-center mb-8">
          <RoundTableLogo size={60} className="mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg" showGlow />
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">Admin Login</h2>
          <p className="text-xs text-zinc-400 mt-2">Use your administrator email and password.</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Admin password"
              className="w-full bg-[#090a0f] border border-[#202230] rounded-2xl pl-11 pr-4 py-3 text-xs text-white focus:outline-none focus:border-purple-400"
            />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-tactile-lime flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <ClipLoader color="#090a0f" size={15} /> : "Sign in as administrator"}
          </button>
        </form>
      </div>
    </div>
  );
}
