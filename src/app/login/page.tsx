"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import { API_PATHS } from "@/config/api-endpoints";
import { validatePassword } from "@/lib/password-validator";

/**
 * Props for the authentication form
 */
interface AuthFormState {
  /** User ID entered by the user */
  userId: string;
  /** Password entered by the user */
  password: string;
  /** Whether the form is being submitted */
  isSubmitting: boolean;
  /** Current authentication mode */
  mode: "login" | "register";
  /** Status message to display */
  message: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthFormState>({
    userId: "",
    password: "",
    isSubmitting: false,
    mode: "login",
    message: "",
  });

  /**
   * Check if user is already authenticated on page load
   */
  useEffect(() => {
    apiFetch(API_PATHS.auth.me)
      .then(async (res) => {
        if (!res.ok) return;
        const data = await res.json();
        if (data?.authenticated) {
          router.replace("/cards");
        }
      })
      .catch(() => undefined);
  }, [router]);

  /**
   * Validates the entered password
   */
  function validateEnteredPassword(password: string): boolean {
    return validatePassword(password).isValid;
  }

  /**
   * Get the appropriate button label based on mode
   */
  function getButtonLabel(): string {
    return auth.mode === "login" ? "Login" : "Create Account";
  }

  /**
   * Get the appropriate title based on mode
   */
  function getTitle(): string {
    return auth.mode === "login" ? "Login" : "Create Account";
  }

  /**
   * Get the appropriate description text based on mode
   */
  function getDescription(): string {
    return "Use your user ID and password to access your card deck across sessions.";
  }

  /**
   * Handle form submission
   */
  async function handleSubmit() {
    if (auth.mode === "register" && !validateEnteredPassword(auth.password)) {
      const validation = validateEnteredPassword(auth.password);
      setAuth({ ...auth, message: validation.error || "Password validation failed." });
      return;
    }

    setAuth({ ...auth, isSubmitting: true, message: "" });

    try {
      const res = await apiFetch(API_PATHS.auth[auth.mode], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.userId.trim(),
          password: auth.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error messages from the server
        const specificErrors = {
          400: "Bad request - please check your input",
          401: "Invalid user ID or password",
          409: "User already exists. Please use login instead.",
          422: "Validation error - " + (data.error || "invalid input"),
        };
        setAuth({
          ...auth,
          isSubmitting: false,
          message: specificErrors[res.status] || data.error || "Authentication failed",
        });
        return;
      }

      setAuth({
        ...auth,
        isSubmitting: false,
        mode: "login",
        message: "Logged in successfully.",
      });

      router.push("/cards");
      router.refresh();
    } catch (e) {
      setAuth({
        ...auth,
        isSubmitting: false,
        message: e instanceof Error ? e.message : "Authentication failed",
      });
    }
  }

  return (
    <section className="panel">
      <h1>{getTitle()}</h1>
      <p className="muted">{getDescription()}</p>

      <div className="row">
        <button
          className={auth.mode === "login" ? "" : "button-secondary"}
          onClick={() => setAuth({ ...auth, mode: "login" })}
          disabled={auth.isSubmitting}
        >
          Login
        </button>
        <button
          className={auth.mode === "register" ? "" : "button-secondary"}
          onClick={() => setAuth({ ...auth, mode: "register" })}
          disabled={auth.isSubmitting}
        >
          Register
        </button>
      </div>

      <label>
        User ID
        <input
          value={auth.userId}
          onChange={(e) => setAuth({ ...auth, userId: e.target.value })}
          disabled={auth.isSubmitting}
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={auth.password}
          onChange={(e) => setAuth({ ...auth, password: e.target.value })}
          disabled={auth.isSubmitting}
        />
      </label>

      {auth.mode === "register" && (
        <p className="muted">
          Password rules: at least 7 chars, with uppercase, lowercase, number, and special character.
        </p>
      )}

      <button
        disabled={
          auth.isSubmitting ||
          !auth.userId.trim() ||
          auth.password.length < 7 ||
          (auth.mode === "register" && !validateEnteredPassword(auth.password))
        }
        onClick={handleSubmit}
      >
        {getButtonLabel()}
      </button>

      {auth.message && <p>{auth.message}</p>}
    </section>
  );
}