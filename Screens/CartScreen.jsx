import React, { useEffect, useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Pressable,
  Text,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Ionicons } from "@expo/vector-icons"; // Added Ionicons for back button
import Color from "../constants/Color";
import { useLayoutEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/apiConfig";
// --- MOCK DATA & CONSTANTS (Replace with your actual imports) ---

// Mock Color Constant


// Mock dummyCart Data
const dummyCart = [
  {
    _id: "cartItem1",
    quantity: 1,
    foodId: {
      _id: "food1",
      name: "Chicken Biriyani",
      price: 15.99,
      image: require("../assets/biriyani.png"), // Assuming you have an image at this path
    },
  },
  {
    _id: "cartItem2",
    quantity: 3,
    foodId: {
      _id: "food2",
      name: "Veggie Burger",
      price: 8.5,
      image: require("../assets/biriyani.png"), // Using the same mock image for all items
    },
  },
  {
    _id: "cartItem3",
    quantity: 2,
    foodId: {
      _id: "food3",
      name: "Coca-Cola",
      price: 2.0,
      image: require("../assets/biriyani.png"), // Using the same mock image for all items
    },
  },
];




const CartCard = ({ item, onhandleSelect, checked }) => {
  console.log(item); // Keeping the console.log as requested
  return (
    <Pressable style={styles.foodCard}>
      {/* Checkbox/Selector Area */}
      <TouchableOpacity
        style={[
          checked
            ? { backgroundColor: Color.DARK }
            : { borderWidth: 2, borderColor: "#888" },
          styles.checkboxContainer, // Applied new style for consistency
        ]}
        onPress={onhandleSelect}
      >
        {checked && <FontAwesome name="check" color="#fff" size={15} />}
      </TouchableOpacity>

      {/* Food Image */}
      <View style={{ width: 80, height: 75, borderRadius: 10 }}>
        <Image
          source={item.foodId.image} // Using the mock image from dummyCart
          style={{ width: "100%", height: "100%", borderRadius: 15 }}
        />
      </View>

      {/* Food Details (Name, Price, Quantity Control) */}
      <View style={styles.detailsContainer}>
        <Text style={styles.foodName}>{item.foodId.name}</Text>
        <Text style={styles.priceLabel}>
          Price:{" "}
          <Text style={styles.priceValue}>${item.foodId.price.toFixed(2)}</Text>
        </Text>

        {/* Quantity Control */}
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            disabled={item.quantity === 1} // Disable when quantity is 1
            onPress={() => console.log("Decrement tapped")} // Added mock onPress
          >
            <Text style={[styles.quantityButtonText, { color: "#333" }]}>
              -
            </Text>
          </TouchableOpacity>

          <Text style={styles.quantityCount}>{item.quantity}</Text>

          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: Color.DARK }]}
            onPress={() => console.log("Increment tapped")} // Added mock onPress
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Total Price for Item */}
      <View style={styles.itemTotalPriceContainer}>
        <View style={{flexDirection:'row'}}>
          <Text> ₹</Text>
          <Text style={[styles.itemTotalPrice,{ fontSize: 18 }]}>
            {(item.foodId.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

// --- CartScreen Component ---

const CartScreen = ({navigation}) => {
  
  const {auth} = useAuth();
  
  const [cart, setCart] = useState([]); // Kept as requested, though dummyCart is used for display
  const [selectedItems, setSelectedItems] = useState([]);

    useLayoutEffect(() => {
      // Hide the tab bar when this screen is focused
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });

      // Restore when leaving the screen
      return () => {
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: "flex" },
        });
      };
    }, [navigation]);
  const handleAddToCheckout = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Calculate total for selected items
  const totalAmount = dummyCart
    .filter((item) => selectedItems.includes(item.foodId._id))
    .reduce((sum, item) => sum + item.foodId.price * item.quantity, 0);
  console.log("auth",auth);

  const fetchCartProducts=async()=>{
    try{
      console.log(auth.userId)
      const res = await api.get(`/cart/${auth.userId}`);
       setCart(res.data?.cartItems)
    }
    catch(e){
      console.log(e)
    }
  }

  useEffect(()=>{
    fetchCartProducts();
  },[]);


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={()=>navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 24 }} /> {/* Spacer to align title */}
      </View>

      <FlatList
        data={dummyCart}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CartCard
            item={item}
            onhandleSelect={() => handleAddToCheckout(item?.foodId?._id)}
            checked={selectedItems.includes(item.foodId._id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />

      {/* Checkout/Total Footer */}
      {/* Checkout/Total Footer */}
      <View style={styles.footer}>
        {/* Promo code input */}
        <View
          style={{
            backgroundColor: "#f8f8f8",
            borderRadius: 10,
            paddingHorizontal: 15,
            paddingVertical: 12,
            marginBottom: 15,
          }}
        >
          <Text style={{ color: "#999" }}>Enter your promo code</Text>
        </View>

        {/* Subtotal */}
        <View style={styles.totalContainer}>
          <Text style={[styles.totalText, { color: "#444" }]}>Subtotal</Text>
          <Text style={[styles.totalPriceText, { color: "#444" }]}>
            ₹{totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* Shipping */}
        <View style={styles.totalContainer}>
          <Text style={[styles.totalText, { color: "#444" }]}>Shipping</Text>
          <Text style={[styles.totalPriceText, { color: "#444" }]}>₹40.00</Text>
        </View>

        {/* Divider */}
        <View
          style={{
            borderBottomColor: "#ccc",
            borderStyle: "dashed",
            borderBottomWidth: 1,
            marginVertical: 8,
          }}
        />

        {/* Total Amount */}
        <View style={styles.totalContainer}>
          <Text
            style={[
              styles.totalText,
              { fontFamily: "Inter-Bold", color: "#000" },
            ]}
          >
            Total amount
          </Text>
          <Text style={[styles.totalPriceText, { fontSize: 19 }]}>
            ₹{(totalAmount + 40).toFixed(2)}
          </Text>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            {
              backgroundColor: selectedItems.length === 0 ? "#ccc" : Color.DARK,
              marginTop: 10,
            },
          ]}
          disabled={selectedItems.length === 0}
          onPress={() => console.log("Proceed to Checkout")}
        >
          <Text style={[styles.checkoutButtonText, { fontSize: 17 }]}>
            CHECKOUT
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Stylesheet ---

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 0 : 0, // Removed padding: 10 from container, moved to listContent
    backgroundColor: "#fff",
    flex: 1,
  },
  // --- Header Styles ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Inter-Bold",
    color: "#333",
  },
  // --- FlatList Styles ---
  listContent: {
    padding: 10, // Apply padding here for content
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically
    paddingVertical: 15,

    backgroundColor: "#fff",
    borderRadius: 15,
    // Shadow for foodCard
    borderBottomWidth: 1,
    borderBottomColor: "#e7dfdfff",
  },
  // --- Checkbox/Selector Styles ---
  checkboxContainer: {
    height: 20,
    width: 20, // Reduced width to match height for a square button
    borderRadius: 4, // Added border radius
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  // --- Details Styles ---
  detailsContainer: {
    flex: 1, // Allows this view to take up available space
    paddingHorizontal: 15,
  },
  foodName: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: "#333",
    marginBottom: 5,
  },
  priceLabel: {
    fontSize: 14,
    color: "#888",
    fontFamily:"Inter-Regular",
    marginBottom: 10,
  },
  priceValue: {
    fontWeight: "600",
    color: "#333",
  },
  // --- Quantity Control Styles (Copied exactly) ---
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#f5f5f5", // Light background for the control area
    borderRadius: 15,
    padding: 5,
    width: 110,
  },
  quantityButton: {
    backgroundColor: "#fff", // White background for buttons
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
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
    fontSize: 15,
    color: "#fff",
    fontFamily:"Inter-Bold"
  },
  quantityCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },
  // --- Item Total Price Styles ---
  itemTotalPriceContainer: {
    // aligns with flex-end of foodCard
    alignSelf: "flex-end", // Align to start of the row (top), then pushed to the right by flex:1 in detailsContainer
    marginLeft: "auto", // Pushes it to the far right
    paddingRight: 10,
   
  },
  itemTotalPrice: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Inter-Bold",
  },
  // --- Footer/Checkout Styles ---
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalText: {
    fontSize: 15,
    fontFamily:"Inter-Regular",
    color: "#888",
  },
  totalPriceText: {
    fontSize: 17,
    fontFamily:"Inter-Bold",
    color: Color.DARK,
  },
  checkoutButton: {
    backgroundColor: Color.DARK,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutButtonDisabled: {
    backgroundColor: "#ccc",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 17,
    fontFamily:"Inter-Bold"
  },
});

export default CartScreen;
