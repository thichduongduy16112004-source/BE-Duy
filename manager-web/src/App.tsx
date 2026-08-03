import { useState } from "react";
import { clearSession, getStoredSession } from "./lib/api";
import { Login } from "./pages/Login";
import { Overview } from "./pages/Overview";
import type { AuthSession } from "./types/teacher";

function App() {
  const [session, setSession] = useState<AuthSession | null>(() => getStoredSession());

  function handleLogin(nextSession: AuthSession) {
    setSession(nextSession);
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  if (!session || !["manager", "teacher", "admin"].includes(session.user.role)) {
    return <Login onLogin={handleLogin} />;
  }

  return <Overview user={session.user} onLogout={handleLogout} />;
}

export default App;
