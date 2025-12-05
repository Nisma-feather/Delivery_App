import React, { useEffect, useState,useCallback} from "react";
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
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import Color from "../constants/Color";
import { useLayoutEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/apiConfig";

const CartCard = ({
  item,
  onhandleSelect,
  checked,
  onDelete,
  updateItem

}) => {
  console.log(item);
  const { auth } = useAuth();
 console.log("Item Image",item?.foodItem.image)

  const handleCartUpdate = async (op) => {
    try {
      const change = op === "+" ? 1 : -1;
      const res = await api.post("/cart", {
        FoodId: item.foodItem._id,
        userId: auth.userId,
        quantity: change,
      });
      if (res.data && res.data.updatedItem) {
       updateItem({
  foodItem: item.foodItem._id,
  quantity: res.data.updatedItem.quantity,
  totalPrice: res.data.updatedItem.totalPrice,
});

      }
    } catch (e) {
      console.log("Error updating cart:", e.message);
    }
  };

  return (
    <Pressable style={styles.foodCard}>
      {/* Checkbox/Selector Area */}
      <TouchableOpacity
        style={[
          checked
            ? { backgroundColor: Color.DARK }
            : { borderWidth: 2, borderColor: "#888" },
          styles.checkboxContainer,
        ]}
        onPress={onhandleSelect}
      >
        {checked && <FontAwesome name="check" color="#fff" size={15} />}
      </TouchableOpacity>

      {/* Food Image */}
      <View style={{ width: 80, height: 75, borderRadius: 10 }}>
        <Image
          source={require("../assets/biriyani.png")}
          style={{ width: "100%", height: "100%", borderRadius: 15 }}
        />
      </View>

      {/* Food Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.foodName}>{item.foodItem.name}</Text>
        <Text style={styles.priceLabel}>
          Price:{" "}
          <Text style={styles.priceValue}>${item.totalPrice.toFixed(2)}</Text>
        </Text>

        {/* Quantity Control */}
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityButton}
            disabled={item.quantity === 1}
            onPress={() => handleCartUpdate("-")}
          >
            <Text
              style={[
                styles.quantityButtonText,
                item.quantity === 1
                  ? { color: "#ccc" }
                  : { color: "#333" },
              ]}
            >
              -
            </Text>
          </TouchableOpacity>

          <Text style={styles.quantityCount}>{item.quantity}</Text>

          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: Color.DARK }]}
            onPress={() => handleCartUpdate("+")}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Total Price for Item */}
      <View style={styles.itemTotalPriceContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDelete} // Fixed: Now calls the delete function
        >
          <Ionicons name="close-circle" size={24} color={Color.DARK} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row" }}>
          <Text> ₹</Text>
          <Text style={[styles.itemTotalPrice, { fontSize: 18 }]}>
            {item.totalPrice}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const CartScreen = ({ navigation }) => {
  const { auth,updateCartCount } = useAuth();
  const [cart, setCart] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmount,setTotalAmount] = useState(0);
  const [loading,setLoading] = useState(false)

  useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
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
  
   const handleTotalAmountCaluclation=()=>{
       const updatedAmount = cart
      .filter((item) => selectedItems.includes(item.foodItem._id))
      .reduce((sum, item) => sum + item.totalPrice, 0);

      setTotalAmount(updatedAmount)
   }
  useEffect(()=>{
    if(cart && !loading){
          handleTotalAmountCaluclation();
    }

  },[cart,selectedItems])
 

  const fetchCartProducts = async () => {
    try {
      
      setLoading(true)
      const res = await api.get(`/cart/${auth.userId}`);
      const cartData = res.data?.Items?.cartItems;
      setCart(cartData);
      setSelectedItems(cartData.map((item) => item.foodItem._id));
    } catch (e) {
      console.log(e);
    }
    finally{
      setLoading(false)
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchCartProducts(); // 🔥 Runs every time Cart tab becomes active
    return () => {}; // cleanup not needed
  }, [])
);
  const handleCartDelete = async (foodId) => {
    try {
      console.log(auth.userId)
      const res = await api.delete(`/cart/removeItem/${foodId}`,{
        data: { userId: auth.userId } 
      });
      if (res.status === 200) {
        const updatedcart = cart.filter((item) => item.foodItem._id !== foodId);
        setCart(updatedcart);
        updateCartCount()
        
      }
    } catch (e) {
      console.log(e);
    }
  };
const updateCartItem = (updatedItem) => {
  setCart((prev) =>
    prev.map((item) =>
      item.foodItem._id === updatedItem.foodItem
        ? {
            ...item,
            quantity: updatedItem.quantity,
            totalPrice: updatedItem.totalPrice,
          }
        : item
    )
  );
};
  return (
    <SafeAreaView style={styles.container}>
  {/* Header */}
  <View style={styles.header}>
    <Pressable onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="#333" />
    </Pressable>
    <Text style={styles.headerTitle}>My Cart</Text>
    <View style={{ width: 24 }} />
  </View>

  {cart.length === 0 && !loading ? (
    // Show "Cart is Empty" message
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Cart is Empty</Text>
    </View>
  ) : (
    <FlatList
      data={cart}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <CartCard
          item={item}
          onhandleSelect={() => handleAddToCheckout(item?.foodItem?._id)}
          onDelete={() => handleCartDelete(item.foodItem._id)}
          checked={selectedItems.includes(item.foodItem._id)}
          updateItem={updateCartItem}
        />
      )}
      contentContainerStyle={styles.listContent}
    />
  )}

  {/* Footer */}
  {cart.length > 0 && (
    <View style={styles.footer}>
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

      <View style={styles.totalContainer}>
        <Text style={[styles.totalText, { color: "#444" }]}>Subtotal</Text>
        <Text style={[styles.totalPriceText, { color: "#444" }]}>
          ₹{totalAmount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.totalContainer}>
        <Text style={[styles.totalText, { color: "#444" }]}>Shipping</Text>
        <Text style={[styles.totalPriceText, { color: "#444" }]}>₹40.00</Text>
      </View>

      <View
        style={{
          borderBottomColor: "#ccc",
          borderStyle: "dashed",
          borderBottomWidth: 1,
          marginVertical: 8,
        }}
      />

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

      <TouchableOpacity
        style={[
          styles.checkoutButton,
          {
            backgroundColor: selectedItems.length === 0 ? "#ccc" : Color.DARK,
            marginTop: 10,
          },
        ]}
        disabled={selectedItems.length === 0}
        onPress={() => navigation.navigate("CheckoutScreen", { selectedItems })}
      >
        <Text style={[styles.checkoutButtonText, { fontSize: 17 }]}>
          CHECKOUT
        </Text>
      </TouchableOpacity>
    </View>
  )}
</SafeAreaView>

  )
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 0 : 0,
    backgroundColor: "#fff",
    flex: 1,
  },
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
  listContent: {
    padding: 10,
  },
  foodCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e7dfdfff",
  },
  checkboxContainer: {
    height: 20,
    width: 20,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
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
    fontFamily: "Inter-Regular",
    marginBottom: 10,
  },
  priceValue: {
    fontWeight: "600",
    color: "#333",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 15,
    padding: 5,
    width: 110,
  },
  emptyContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  padding: 20,
},
emptyText: {
  fontSize: 20,
  color: "#888",
  fontFamily: "Inter-Bold",
},

  quantityButton: {
    backgroundColor: "#fff",
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
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
    fontFamily: "Inter-Bold",
  },
  quantityCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },
  itemTotalPriceContainer: {
    alignSelf: "flex-end",
    marginLeft: "auto",
    paddingRight: 10,
  },
  deleteButton: {
    // Added missing style
    marginBottom: 8,
    alignSelf: "flex-end",
  },
  itemTotalPrice: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Inter-Bold",
  },
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
    fontFamily: "Inter-Regular",
    color: "#888",
  },
  totalPriceText: {
    fontSize: 17,
    fontFamily: "Inter-Bold",
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
    fontFamily: "Inter-Bold",
  },
});

export default CartScreen;
