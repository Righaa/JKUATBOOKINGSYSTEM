import { createContext, useState, useEffect } from "react";
import { isTokenExpired, parseAuthUser } from "../utils/authUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        if (isTokenExpired(token)) {
          localStorage.removeItem("token");
          return;
        }
        setUser(parseAuthUser(token));
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    const authUser = parseAuthUser(token);
    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
