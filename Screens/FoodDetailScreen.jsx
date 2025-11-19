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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Octicons } from "@expo/vector-icons";
import Color from "../constants/Color";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";

const PRIMARY_COLOR = Color.DARK || "#EB3E3E";

const FoodDetailScreen = ({ navigation, route }) => {
  const { foodItemId } = route.params;
  const { auth } = useAuth();

  const [food, setFood] = useState({});
  const [favourite, setFavourite] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // ✅ Fetch Food Details
  const fetchFoodDetails = async () => {
    try {
      const res = await api.get(`/foodItem/${foodItemId}`);
      setFood(res.data?.foodItem);
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

      const res = await api.post("/cart", {
        FoodId: foodItemId,
        userId: auth.userId,
        quantity: change,
      });

      if (res.data && res.data.updatedItem) {
        setQuantity(res.data.updatedItem.quantity);
        setTotalPrice(res.data.updatedItem.totalPrice);
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
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* --- Header Image Section --- */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../assets/biriyani.png")}
            style={styles.image}
            resizeMode="cover"
          />

          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setFavourite(!favourite)}
            >
              <Octicons
                name={favourite ? "heart-fill" : "heart"}
                color={favourite ? PRIMARY_COLOR : "#000"}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Food Details --- */}
        <View style={styles.content}>
          <Text style={styles.title}>{food.name}</Text>

          <View style={styles.priceQuantityRow}>
            <View>
              <Text style={styles.priceLabel}>Item Price</Text>
              <Text style={styles.priceValue}>₹ {food.price}</Text>
            </View>

            {quantity === 0 ? (
              <TouchableOpacity
                style={{
                  backgroundColor: Color.DARK,
                  padding: 10,
                  paddingVertical: 6,
                  borderRadius: 5,
                }}
                onPress={() => handleCartUpdate("+")}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontFamily: "Inter-Bold",
                    fontSize: 15,
                  }}
                >
                  Add to Cart
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => handleCartUpdate("-")}
                  disabled={quantity === 0}
                >
                  <Text style={[styles.quantityButtonText, { color: "#333" }]}>
                    -
                  </Text>
                </TouchableOpacity>

                <Text style={styles.quantityCount}>{quantity}</Text>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    { backgroundColor: PRIMARY_COLOR },
                  ]}
                  onPress={() => handleCartUpdate("+")}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descLabel}>Description</Text>
            <Text style={styles.descText}>{food.description}</Text>
          </View>
        </View>
      </ScrollView>

      {/* --- Footer --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() =>
            console.log("Order Now:", {
              foodId: foodItemId,
              quantity,
              totalPrice,
            })
          }
        >
          <Text style={styles.orderButtonText}>Order Now | ₹ {totalPrice}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart", { screen: "Cart Screen" })
        }
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
  // --- Image Header Styles ---
  imageContainer: {
    position: "relative",
  },
  image: {
    height: 250,
    width: "100%",
  },
  headerContainer: {
    position: "absolute",
    // Adjust top padding for a better look and safe area consistency
    top: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
    left: 15,
    right: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    // Subtle shadow for lift
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
    }),
  },

  // --- Content Styles ---
  content: {
    padding: 16,
    paddingTop: 10, // Reduced top padding
  },
  title: {
    fontSize: 25,
    fontFamily: "Inter-Bold",

    marginBottom: 15,
    color: "#333",
  },

  // --- Price & Quantity Row ---
  priceQuantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  priceLabel: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Inter-Regular",
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: PRIMARY_COLOR,
    fontFamily: "Inter-Bold",
    marginTop: 2,
  },

  // --- Quantity Control Styles ---
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#f5f5f5", // Light background for the control area
    borderRadius: 15,
    padding: 5,
  },
  quantityButton: {
    backgroundColor: "#fff", // White background for buttons
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    // Add shadow to quantity buttons
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: { elevation: 3 },
    }),
  },
  quantityButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  quantityCount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },

  // --- Description Styles ---
  descriptionSection: {
    paddingVertical: 15,
  },
  descLabel: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  descText: {
    fontSize: 16,
    color: "#555",
    fontFamily: "Inter-Medium",
    lineHeight: 24,
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
    padding: 15,
    paddingBottom: Platform.OS === "ios" ? 30 : 15, // Safe area padding
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // Strong shadow to make it look floating
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 15 },
    }),
  },
  footerPriceBox: {
    // Styling the total price to be prominent
    paddingVertical: 8,
  },
  footerPriceLabel: {
    fontSize: 14,
    color: "#888",
    fontFamily: "Inter-Regular",
  },
  footerPriceValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333", // Dark text for total price
    fontFamily: "Inter-Bold",
    marginTop: 2,
  },
  orderButton: {
    flex: 1, // Takes up more space
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 12,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  orderButtonText: {
    color: "#fff",
    fontSize: 15,

    fontFamily: "Inter-Bold",
  },
  cartButton: {
    backgroundColor: "#333", // Dark color for the secondary button
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  cartButtonText: {
    color: "white",
    fontSize: 16,

    fontFamily: "Inter-Bold",
  },
});
