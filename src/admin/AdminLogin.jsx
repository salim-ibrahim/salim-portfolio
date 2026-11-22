
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            navigate("/admin", { replace: true });
        } catch (err) {
            setError(err.message || "Unable to sign in.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center px-5">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11151f] p-8 shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                        <LockKeyhole size={26} />
                    </div>

                    <h1 className="text-2xl font-semibold text-white">
                        Admin Login
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Sign in to manage your portfolio.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Email address
                        </label>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />

                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full rounded-xl border border-white/10 bg-[#0b0e14] py-3 pl-11 pr-4 text-white outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                className="w-full rounded-xl border border-white/10 bg-[#0b0e14] py-3 pl-4 pr-12 text-white outline-none focus:border-amber-400"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-amber-400 py-3 font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
