"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "@/axios.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await axios.get("/api/me", {
          withCredentials: true,
        });

        console.log("hello");

        console.log(res.data);

        if (res.data?.user) {
          setUser(res.data.user);
          return;
        } else {
          setUser(null);
        }
      } catch (err) {
        console.log(err.statusCode);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
