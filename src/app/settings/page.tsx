"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          setUserId(null);
          return;
        }
        const data = await res.json();
        setUserId(data.userId || null);
      })
      .catch(() => setUserId(null));

    apiFetch("/api/settings/api-key")
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        setHasApiKey(!!data.hasApiKey);
      })
      .catch(() => undefined);
  }, []);

  async function saveApiKey() {
    if (!userId) {
      setMessage("Please login first.");
      return;
    }

    setMessage("");

    if (!apiKey.trim()) {
      setMessage("Enter an API key to save.");
      return;
    }

    const res = await apiFetch("/api/settings/api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: apiKey.trim() })
    });

    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Failed to save API key");
      return;
    }

    setHasApiKey(true);
    setApiKey("");
    setMessage("API key saved.");
  }

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUserId(null);
    setHasApiKey(false);
    setMessage("Logged out.");
  }

  return (
    <section className="panel">
      <h1>Settings</h1>
      <p className="muted">Your API key is tied to your logged-in user.</p>

      {!userId ? (
        <p>
          You are not logged in. <Link href="/login">Go to Login</Link>.
        </p>
      ) : (
        <>
          <p>
            Logged in as <strong>{userId}</strong>
          </p>

          <label>
            OpenAI API Key
            <input
              type="password"
              placeholder={hasApiKey ? "Stored. Enter to replace." : "sk-..."}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </label>

          <div className="row">
            <button onClick={saveApiKey}>Save API Key</button>
            <button className="button-secondary" onClick={logout}>
              Logout
            </button>
          </div>

          {hasApiKey && <p>API key is configured.</p>}
        </>
      )}

      {message && <p>{message}</p>}
    </section>
  );
}