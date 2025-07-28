import React, { createContext, useState, useEffect } from "react";
import api from "../utils/api";

// PUBLIC_INTERFACE
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  /**
   * Provides authentication context, stores token and user.
   * Handles login, logout, registration, token refresh.
   */
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      setLoading(true);
      if (accessToken) {
        try {
          const me = await api.get("/users/me", { token: accessToken });
          setUser(me);
        } catch {
          setUser(null);
          setAccessToken(null);
        }
      }
      setLoading(false);
    }
    fetchMe();
  }, [accessToken]);

  // PUBLIC_INTERFACE
  async function login(username, password) {
    /**
     * Logs in by posting credentials, obtains JWT to store.
     */
    setLoading(true);
    try {
      const data = await api.postForm("/auth/token", {
        username,
        password,
        grant_type: "password",
      });
      setAccessToken(data.access_token);
      localStorage.setItem("token", data.access_token);
      setLoading(false);
      return true;
    } catch (e) {
      setLoading(false);
      throw e;
    }
  }

  // PUBLIC_INTERFACE
  async function register(details) {
    /**
     * Registers via POST /auth/register, then logs in.
     */
    await api.post("/auth/register", details);
    return login(details.email, details.password);
  }

  // PUBLIC_INTERFACE
  function logout() {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider value={{
      user, setUser, accessToken, setAccessToken, login, logout, register, loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}
