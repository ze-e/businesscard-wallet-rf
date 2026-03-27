"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";

export function AuthNavAction() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then(async (res) => {
        if (!res.ok) {
          setAuthenticated(false);
          return;
        }
        const data = await res.json();
        setAuthenticated(!!data.authenticated);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setAuthenticated(false);
    router.push("/login");
    router.refresh();
  }

  if (authenticated) {
    return (
      <button className="nav-link-button" onClick={logout}>
        Logout
      </button>
    );
  }

  return <Link href="/login">Login</Link>;
}