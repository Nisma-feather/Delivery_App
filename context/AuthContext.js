import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/apiConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    userId: null,
    role: null,
  });

  const [loading, setLoading] = useState(true);

  const [cartLength, setCartLength] = useState(0);

  const [favourites, setFavourites] = useState([]); // ⭐ NEW FAVOURITE STATE

  // ----------------------------
  // AUTH & LOGIN LOGIC (same)
  // ----------------------------
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

        if (res.data?.userId && res.data?.role) {
          setAuth({
            token: storedToken,
            userId: res.data.userId,
            role: res.data.role,
          });
        } else {
          await AsyncStorage.removeItem("token");
        }
      }
    } catch (e) {
      console.log("Auth verification failed:", e.message);
      await AsyncStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (token, userId, role) => {
    try {
      await AsyncStorage.setItem("token", token);
      setAuth({ token, userId, role });
    } catch (e) {
      console.log("Login storage error:", e);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setAuth({ token: null, userId: null, role: null });
    setFavourites([]); // clear favourites on logout
    setCartLength(0);
  };

  // ----------------------------
  // CART LOGIC
  // ----------------------------
  const updateCartCount = async () => {
    try {
      if (!auth.userId) return;console.log(auth.userId,);
      const res = await api.get(`/cart/${auth.userId}`);
      setCartLength(res.data?.Items?.cartItems.length || 0);
    } catch (e) {
      console.log(e);
    }
  };

  // ----------------------------
  // FAVOURITES LOGIC ⭐
  // ----------------------------

  const fetchFavourites = async () => {
    try {
      if (!auth.userId) return;

      const res = await api.get(`/favourite/${auth.userId}`);

      setFavourites(res.data?.favouriteItems || []);
    } catch (e) {
      console.log("Favourite fetch error:", e);
    }
  };

  const toggleFavourite = async (foodId) => {
    try {
      console.log(auth.userId, foodId);

      const res = await api.post("/favourite/toggle", {
        userId: auth.userId,
        foodId,
      });

      // Refresh updated favourites from DB (populated)
      fetchFavourites();

      // Optimistic UI update
      setFavourites((prev) => {
        const exists = prev.some((item) => item._id === foodId);

        if (exists) {
          return prev.filter((item) => item._id !== foodId);
        } else {
          // Add temporary object (so UI updates instantly)
          return [...prev, { _id: foodId }];
        }
      });
    } catch (e) {
      console.log("Favourite toggle error:", e);
    }
  };
  // Load auth on first render
  useEffect(() => {
    authLoad();
  }, []);

  // When user logs in → load favourites + cart
  useEffect(() => {
    if (auth?.userId) {
      updateCartCount();
      fetchFavourites();
    }
  }, [auth?.userId]);
  console.log("favourites",favourites)
  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        loading,

        cartLength,
        updateCartCount,

        favourites, // 🔥 ADD THIS
        toggleFavourite, // 🔥 ADD THIS
        fetchFavourites, // 🔥 ADD THIS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
