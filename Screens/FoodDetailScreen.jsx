import React, { useLayoutEffect, useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Octicons } from "@expo/vector-icons";
import Color from "../constants/Color";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";

const PRIMARY_COLOR = Color.DARK ;
const { width, height } = Dimensions.get("window");

const FoodDetailScreen = ({ navigation, route }) => {
  const { foodItemId } = route.params;

  const { auth } = useAuth();
  const { updateCartCount } = useAuth();
  const [food, setFood] = useState({});
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const { favourites, toggleFavourite } = useAuth();

  const isFav = favourites.some((food) => food._id === foodItemId);

  // ✅ Fetch Food Details
  const fetchFoodDetails = async () => {
    try {
      const res = await api.get(`/foodItem/${foodItemId}`);
      setFood(res.data?.foodItem || {});
    } catch (e) {
      console.log("Error fetching food:", e.message);
    }
  };

  // ✅ Check if item exists in cart
  const checkItemExists = async () => {
    try {
      const res = await api.post(`/cart/check-item/${auth.userId}`, {
        foodId: foodItemId,
      });
      if (res.data.exists) {
        setTotalPrice(res.data.price);
        setQuantity(res.data.quantity);
      } else {
        setQuantity(0);
        setTotalPrice(0);
      }
    } catch (e) {
      console.log("Error checking cart:", e.message);
    }
  };

  // ✅ Add / Remove from Cart
  const handleCartUpdate = async (op) => {
    try {
      const change = op === "+" ? 1 : -1;
      if (quantity === 1 && op === "-") {
        const res = await api.delete(`/cart/removeItem/${foodItemId}`, {
          data: { userId: auth.userId },
        });
        setQuantity(0);
        setTotalPrice(0);
        updateCartCount();
      } else {
        const res = await api.post("/cart", {
          FoodId: foodItemId,
          userId: auth.userId,
          quantity: change,
        });

        if (res.data && res.data.updatedItem) {
          setQuantity(res.data.updatedItem.quantity);
          setTotalPrice(res.data.updatedItem.totalPrice);
        }

        if (quantity === 0) {
          updateCartCount();
        }
      }
    } catch (e) {
      console.log("Error updating cart:", e.message);
    }
  };

  useEffect(() => {
    fetchFoodDetails();
  }, [foodItemId]);

  useEffect(() => {
    checkItemExists();
  }, [foodItemId]);

  // Hide header
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="rgba(255,255,255,0.2)"
        barStyle="dark-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- Header Image Section --- */}
        <View style={styles.imageContainer}>
          {food?.image ? (
            <Image
              source={{ uri: food.image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require("../assets/biriyani.png")}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={20} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => toggleFavourite(foodItemId)}
            >
              <Octicons
                name={isFav ? "heart-fill" : "heart"}
                color={isFav ? "red" : "#000"}
                size={18}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Food Details --- */}
        <View style={styles.content}>
          <Text style={styles.title}>{food.name || "Food Item"}</Text>

          <View style={styles.priceQuantityRow}>
            <View>
              <Text style={styles.priceLabel}>Item Price</Text>
              <Text style={styles.priceValue}>
                ₹ {food.price?.toFixed(2) || "0.00"}
              </Text>
            </View>

            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={() => handleCartUpdate("+")}
              >
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={[styles.quantityButton, styles.minusButton]}
                  onPress={() => handleCartUpdate("-")}
                  disabled={quantity === 0}
                >
                  <Text style={styles.minusButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.quantityCount}>{quantity}</Text>

                <TouchableOpacity
                  style={[styles.quantityButton, styles.plusButton]}
                  onPress={() => handleCartUpdate("+")}
                >
                  <Text style={styles.plusButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>
              {food.description || "No description available"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* --- Footer --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() => {
            if (quantity === 0) {
              handleCartUpdate("+");
            }
            navigation.navigate("Cart", { screen: "Cart Screen" });
          }}
        >
          <Text style={styles.orderButtonText}>
            Order Now | ₹ {totalPrice?.toFixed(2) || "0.00"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart", { screen: "Cart Screen" })}
        >
          <Text style={styles.cartButtonText}>Go to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FoodDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // --- Image Header Styles ---
  imageContainer: {
    position: "relative",
    height: height * 0.35, // Reduced from fixed 300 to 35% of screen height
  },
  image: {
    width: "100%",
    height: "100%",
  },
  headerContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    height: 36,
    width: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },

  // --- Content Styles ---
  content: {
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 17, // Reduced from 28
    fontFamily: "Poppins-SemiBold",
    marginBottom: 12,
    color: "#333",
    lineHeight: 28,
  },

  // --- Price & Quantity Row ---
  priceQuantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: "#888",
    fontFamily: "Poppins-Regular",
  },
  priceValue: {
    fontSize: 20, // Reduced from 24
    color: PRIMARY_COLOR,
    fontFamily: "Poppins-SemiBold",
    marginTop: 2,
  },
  addToCartButton: {
    backgroundColor: Color.DARK,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addToCartText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },

  // --- Quantity Control Styles ---
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 36, // Reduced from 40
    height: 36, // Reduced from 40
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  minusButton: {
    backgroundColor: "#fff",
  },
  plusButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  minusButtonText: {
    fontSize: 20, // Reduced from 24
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 20,
  },
  plusButtonText: {
    fontSize: 20, // Reduced from 24
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    lineHeight: 20,
  },
  quantityCount: {
    fontSize: 16, // Reduced from 18
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    minWidth: 28,
    textAlign: "center",
  },

  // --- Description Styles ---
  descriptionSection: {
    paddingVertical: 8,
  },
  descLabel: {
    fontSize: 16, // Reduced from 18
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: 8,
  },
  descText: {
    fontSize: 14, // Reduced from 15
    color: "#555",
    fontFamily: "Poppins-Regular",
    lineHeight: 22,
  },

  // --- Sticky Footer Styles ---
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    paddingBottom: Platform.OS === "ios" ? 25 : 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 10 },
    }),
  },
  orderButton: {
    flex: 1,
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 13,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
  },
  cartButton: {
    backgroundColor: "#333",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cartButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
  },
});
