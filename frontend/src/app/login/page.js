"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { firebaseAuth, googleProvider } from "@/lib/firebase";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import RoundTableLogo from "@/components/common/RoundTableLogo";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      const idToken = await credential.user.getIdToken();
      const res = await api.post("/auth/firebase", { idToken });
      login(res.data.user);
      router.push("/dashboard");
    } catch (loginError) {
      setError(loginError.message || "Unable to continue with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-[#12131b] p-8 sm:p-10 rounded-3xl border border-[#202230] shadow-2xl">
        <div className="text-center mb-8">
          <RoundTableLogo size={60} className="mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg" showGlow />
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">Welcome to RoundCode</h2>
          <p className="text-xs text-zinc-400 mt-2">
            Sign in securely with your Google account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full rounded-2xl border border-[#202230] bg-white text-black py-3 text-sm font-bold flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <ClipLoader color="#090a0f" size={16} /> : "Continue with Google"}
        </button>

        <div className="mt-6 pt-5 border-t border-[#202230] text-center">
          <p className="text-xs text-zinc-500">
            Administrator?
            <Link
              href="/admin/login"
              className="ml-1.5 font-bold text-purple-300 hover:text-purple-200 hover:underline"
            >
              Login as Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
