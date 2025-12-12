import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";
import Color from "../constants/Color";

// --- Mock Data for Payment Methods ---
const mockPayments = [
  {
    id: "online",
    type: "Online Payment",
    description: "Pay using card, wallet, or net banking.",
    icon: "credit-card-fast-outline",
    value:"ONLINE"
  },
  {
    id: "cash",
    type: "Cash on Delivery (COD)",
    description: "Pay by cash when your order arrives.",
    icon: "cash",
    value:"COD"
  },
];

const PaymentMethodScreen = ({route,navigation}) => {
  // Set default selection to Online Payment
  const {auth, updateCartCount} = useAuth();
  const [selectedMethod, setSelectedMethod] = useState("COD");
  const { deliveryAddress, checkoutItems, contactNo } = route?.params;
  const [loading,setLoading] = useState(false)

  console.log(
    "deliveryAddress",
    deliveryAddress,
    "items",
 checkoutItems,
   contactNo
  );

  const PaymentCard = ({ method }) => {
    const isSelected = method.value === selectedMethod;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => setSelectedMethod(method.value)}
      >
        <MaterialCommunityIcons
          name={method.icon}
          size={30}
          color={isSelected ? "#000" : "#6e6e6e"}
        />
        <View style={styles.cardDetails}>
          <Text style={styles.cardType}>{method.type}</Text>
          <Text style={styles.cardDescription}>{method.description}</Text>
        </View>

        {isSelected ? (
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={Color.DARK}
          />
        ) : (
          <View style={styles.unselectedCircle} />
        )}
      </TouchableOpacity>
    );
  };
  
  const handlePlaceOrder=async()=>{
    try{
      setLoading(true)
      if(!deliveryAddress || !checkoutItems || !contactNo || !selectedMethod){
        console.log("Missing required fields")
        return
      }
      const res = await api.post(`/order/${auth.userId}`,{
        deliveryAddress,
        checkoutItems,
        contactNo,
        paymentMethod: selectedMethod
        
      })
          updateCartCount()
        Alert.alert(
          "Order Successful",
          "Order placed successfully. For more details track your order.",
          [
            {
              text: "OK",
              onPress: () =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: "CartScreen" }],
                }),
            },
          ],
          { cancelable: false }
        );

      
      
      

    }
    catch(e){
      console.log(e)
    }
    finally{
      setLoading(false)
    }
  }
  
  return (
    <View style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Payment Method</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Choose an Option</Text>

        {/* List of simplified payment options */}
        {mockPayments.map((method) => (
          <PaymentCard key={method.id} method={method} />
        ))}
      </View>

      {/* Confirmation Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          <Text style={styles.confirmButtonText}>
            {loading
              ? "Placing Order...."
              : `Proceed with ${
                  selectedMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"
                }`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
    color: "#333",
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: 10,
  },

  // Card Styles
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  selectedCard: {
    borderColor: Color.DARK, // Red border for selected card
  },
  cardDetails: {
    flex: 1,
    marginLeft: 15,
  },
  cardType: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  cardDescription: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#6e6e6e",
    marginTop: 2,
  },
  unselectedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ccc",
  },

  // Footer and Confirm Button
  footer: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  confirmButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-Bold",
  },
});


export default PaymentMethodScreen;
