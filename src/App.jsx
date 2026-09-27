// src/App.jsx

import { useEffect, useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import { auth } from "./firebase/config";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Enquiries from "./pages/Enquiries";
import Clients from "./pages/Clients";
import Properties from "./pages/Properties";
import FollowUps from "./pages/FollowUps";

/* =========================================================
   LOGIN PAGE
========================================================= */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
    } catch (error) {
      console.error("Firebase login error:", error);

      switch (error.code) {
        case "auth/invalid-credential":
          setError("Invalid email or password.");
          break;

        case "auth/user-not-found":
          setError("No account found with this email.");
          break;

        case "auth/wrong-password":
          setError("Incorrect password.");
          break;

        case "auth/operation-not-allowed":
          setError(
            "Email/Password login is not enabled in Firebase."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many login attempts. Please try again later."
          );
          break;

        default:
          setError(
            error.message || "Unable to sign in."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Logo */}
        <div className="brand-logo login-logo">
          S
        </div>

        {/* Heading */}
        <p className="eyebrow">
          SWASTIK PROPERTIES
        </p>

        <h1>Admin Login</h1>

        <p className="page-subtitle">
          Sign in to manage your property business.
        </p>

        {/* Login Form */}
        <form
          className="form-stack"
          onSubmit={handleLogin}
        >

          {/* Email */}
          <label>
            Email

            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
              required
            />
          </label>

          {/* Password */}
          <label>
            Password

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>
          </label>

          {/* Error */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            className="primary-button full-width"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
}

/* =========================================================
   PROTECTED ERP
========================================================= */

function ProtectedERP() {
  return (
    <Layout>

      <Routes>

        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/enquiries"
          element={<Enquiries />}
        />

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route
          path="/clients"
          element={<Clients />}
        />

        <Route
          path="/followups"
          element={<FollowUps />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </Layout>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return unsubscribe;
  }, []);

  /* Firebase auth loading */
  if (user === undefined) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>

      {user ? (
        <ProtectedERP />
      ) : (
        <Routes>

          <Route
            path="*"
            element={<Login />}
          />

        </Routes>
      )}

    </BrowserRouter>
  );
}