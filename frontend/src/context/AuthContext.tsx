"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type AuthView = "login" | "register";

interface User {
  id: string;
  username: string;
  fullName: string;
  profilePictureUrl: string | null;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  isReady: boolean;
  showAuthModal: boolean;
  authView: AuthView;
  openAuth: (view?: AuthView) => void;
  closeAuth: () => void;
  setAuthView: (view: AuthView) => void;
  onLoginSuccess: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isReady: false,
  user: null,
  token: null,
  showAuthModal: false,
  authView: "login",
  openAuth: () => {},
  closeAuth: () => {},
  setAuthView: () => {},
  onLoginSuccess: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");

  useEffect(() => {
    const savedToken = localStorage.getItem("amally_token");
    const savedUser = localStorage.getItem("amally_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsReady(true);

    // Listen for expired token events from API layer
    const handleExpired = () => {
      setToken(null);
      setUser(null);
      setShowAuthModal(true);
      setAuthView("login");
    };
    window.addEventListener("auth-expired", handleExpired);
    return () => window.removeEventListener("auth-expired", handleExpired);
  }, []);

  const openAuth = useCallback((view: AuthView = "login") => {
    setAuthView(view);
    setShowAuthModal(true);
  }, []);

  const closeAuth = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const onLoginSuccess = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("amally_token", newToken);
    localStorage.setItem("amally_user", JSON.stringify(newUser));
    setShowAuthModal(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("amally_token");
    localStorage.removeItem("amally_user");
  }, []);

  return (
    <AuthContext.Provider value={{
      isLoggedIn: !!token,
      isReady,
      user,
      token,
      showAuthModal,
      authView,
      openAuth,
      closeAuth,
      setAuthView,
      onLoginSuccess,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
