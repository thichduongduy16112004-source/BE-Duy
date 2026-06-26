import { useState } from "react";
import type { FormEvent } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { login, saveSession } from "../lib/api";
import type { AuthSession } from "../types/teacher";

interface LoginProps {
  onLogin: (session: AuthSession) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [identity, setIdentity] = useState("teacher.demo@historyalive.vn");
  const [password, setPassword] = useState("Teacher123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(identity, password);
      if (response.user.role !== "teacher") {
        setError("Tài khoản này không có quyền giáo viên");
        return;
      }

      const session = { token: response.access_token, user: response.user };
      saveSession(session);
      onLogin(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <section className="w-full max-w-md bg-white border border-[var(--color-border)] rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-header)] text-[var(--color-brand)] flex items-center justify-center">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-brand)] font-bold">Teacher Portal</p>
            <h1 className="text-2xl font-bold text-[var(--color-header)]">History Alive</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="identity" className="block text-sm font-semibold text-gray-700 mb-2">Email giáo viên</label>
            <input
              id="identity"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

          <button
            id="teacher-login-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-header)] text-white py-3 font-bold hover:bg-black disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Đăng nhập
          </button>
        </form>
      </section>
    </main>
  );
}
