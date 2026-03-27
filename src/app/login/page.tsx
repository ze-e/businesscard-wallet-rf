"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

const REGISTER_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{7,}$/;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data?.authenticated) {
          router.replace("/cards");
        }
      })
      .catch(() => undefined);
  }, [router]);

  const registerPasswordValid = REGISTER_PASSWORD_REGEX.test(password);

  async function submit() {
    setBusy(true);
    setMessage("");

    if (mode === "register" && !registerPasswordValid) {
      setBusy(false);
      setMessage(
        "Password must be at least 7 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await apiFetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Authentication failed");
        return;
      }

      setMessage(mode === "login" ? "Logged in." : "Account created and logged in.");
      router.push("/cards");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <h1>{mode === "login" ? "Login" : "Create Account"}</h1>
      <p className="muted">Use your user ID and password to access your card deck across sessions.</p>

      <div className="row">
        <button
          className={mode === "login" ? "" : "button-secondary"}
          onClick={() => setMode("login")}
          disabled={busy}
        >
          Login
        </button>
        <button
          className={mode === "register" ? "" : "button-secondary"}
          onClick={() => setMode("register")}
          disabled={busy}
        >
          Register
        </button>
      </div>

      <label>
        User ID
        <input value={userId} onChange={(e) => setUserId(e.target.value)} />
      </label>

      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>

      {mode === "register" && (
        <p className="muted">
          Password rules: at least 7 chars, with uppercase, lowercase, number, and special character.
        </p>
      )}

      <button
        disabled={
          busy ||
          !userId.trim() ||
          password.length < 7 ||
          (mode === "register" && !registerPasswordValid)
        }
        onClick={submit}
      >
        {mode === "login" ? "Login" : "Create Account"}
      </button>

      {message && <p>{message}</p>}
    </section>
  );
}