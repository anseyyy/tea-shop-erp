"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "../../api/apiService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, skip login page
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const performLogin = async (credentials) => {
    setError("");
    setLoading(true);

    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      if (data.role === 'admin') {
        router.push("/dashboard");
      } else {
        router.push("/sales");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
      setActiveRole(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin({ email, password });
  };

  const handleQuickLogin = async (role) => {
    setActiveRole(role);
    const credentials =
      role === "admin"
        ? { email: "admin@teashop.com", password: "admin123" }
        : { email: "ahamedansil43@gmail.com", password: "ansil123" };

    setEmail(credentials.email);
    setPassword(credentials.password);
    await performLogin(credentials);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
            TeaShop ERP
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your shop
          </p>
        </div>

        {/* Quick Role Login Buttons */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">
            Instant One-Click Login
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("admin")}
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 transition-all shadow-xs"
            >
              <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {loading && activeRole === 'admin' ? 'Logging in...' : 'Login as Admin'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin("employee")}
              className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-2.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all shadow-xs"
            >
              <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {loading && activeRole === 'employee' ? 'Logging in...' : 'Login as Employee'}
            </button>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400 font-medium">Or enter manually</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-3.5 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="relative block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:z-10 focus:border-amber-500 focus:outline-none focus:ring-amber-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 disabled:opacity-50 transition-colors shadow-xs"
            >
              {loading && !activeRole ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

