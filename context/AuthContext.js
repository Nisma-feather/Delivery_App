import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/apiConfig"; // your axios baseURL

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    userId: null,
    role: null,
  });
  const [loading, setLoading] = useState(true);

  // 🔐 Load and verify token on app start
  const authLoad = async () => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        const res = await api.post(
          "/user/check-auth",
          {},
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        );

        console.log(res.data)

        if (res.data?.userId && res.data?.role) {
          console.log("This executed")
          setAuth({
            token: storedToken,
            userId: res.data.userId,
            role: res.data.userRole,
          });
        } else {
          await AsyncStorage.removeItem("token");
        }
      }
    } catch (e) {
      console.error("Auth verification failed:", e.message);
      await AsyncStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Login
  const login = async (token, userId, role) => {
    try {
      await AsyncStorage.setItem("token", token);
      setAuth({ token, userId, role });
    } catch (e) {
      console.log("Login storage error:", e);
    }
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      setAuth({ token: null, userId: null, role: null });
    } catch (e) {
      console.error("Failed to remove auth data", e);
    }
  };
  
  useEffect(() => {
    authLoad();
  }, []);

  console.log("Auth State:", auth);

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
