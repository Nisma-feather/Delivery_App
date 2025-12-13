import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import Color from "../../constants/Color";
import { FontAwesome, Octicons } from "@expo/vector-icons";

// --- Dummy Data (Simulating data that might be passed via navigation or fetched) ---

// ----------------------------------------------------------------------------------

// ====================================================================
// COMPONENT 1: Items Chosen (Based on your provided structure)
// We modify this slightly to include the actual image.
// ====================================================================
const ItemsChosen = ({ items }) => {
  return (
    <View style={itemsStyles.itemsContainer}>
      <Text style={styles.sectionTitle}>Your Items</Text>

      {/* Fixed: Removed FlatList for simple list rendering since it's inside ScrollView */}
      {items.map((item) => (
        <View key={item._id} style={itemsStyles.itemRow}>
          {item?.foodItemId?.image ? (
            <Image
              source={{ uri: item?.foodItemId?.image }}
              style={itemsStyles.itemImage}
            />
          ) : null}

          <View style={itemsStyles.infoContainer}>
            <Text style={itemsStyles.itemName} numberOfLines={1}>
              {item.foodItemId?.name}
            </Text>
            <Text style={itemsStyles.itemQuantity}>Qty: {item.quantity}</Text>
          </View>

          <Text style={itemsStyles.itemPrice}>₹{item.totalPrice}</Text>
        </View>
      ))}
    </View>
  );
};

// ====================================================================
// COMPONENT 2: Price Breakdown
// ====================================================================
const PriceBreakdown = ({ order }) => {
  const subtotal = order.orderTotal; // backend
  const packingCharge = order.packingCharge ?? 0;
  const deliveryFee = order.shippingCost ?? 0;

  const totalAmount = subtotal + packingCharge + deliveryFee;

  const Row = (label, value, bold = false) => (
    <View style={priceStyles.priceRow}>
      <Text style={[priceStyles.priceLabel, bold && priceStyles.totalLabel]}>
        {label}
      </Text>
      <Text style={[priceStyles.priceValue, bold && priceStyles.totalValue]}>
        ₹{value}
      </Text>
    </View>
  );

  return (
    <View style={priceStyles.priceContainer}>
      <Text style={styles.sectionTitle}>Payment Details</Text>

      {Row("Subtotal", subtotal)}
      {Row("Packing Charge", packingCharge)}
      {Row("Delivery Fee", deliveryFee)}

      <View style={priceStyles.separator} />

      {Row("Total Amount Paid", totalAmount, true)}
    </View>
  );
};

// ====================================================================
// MAIN SCREEN COMPONENT
// ====================================================================
const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderDetails } = route?.params;

  console.log(orderDetails.items);

  if (!orderDetails) {
    return <Text style={{ padding: 20 }}>Loading Order Details...</Text>;
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Octicons name="arrow-left" color="#000" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ORDER INFO */}
        <View style={styles.infoCard}>
          <Text style={styles.orderIdText}>
            Order No: {orderDetails.orderNumber}
          </Text>

          <Text style={styles.orderDateText}>
            Date: {new Date(orderDetails.timeline.placedAt).toLocaleString()}
          </Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              Status: {orderDetails.orderStatus}
            </Text>
          </View>
        </View>

        {/* ITEMS */}
        <ItemsChosen items={orderDetails.items} />

        {/* PRICE DETAILS */}
        <PriceBreakdown order={orderDetails} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// ====================================================================
// STYLES
// ====================================================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollContent: { padding: 15 },

  header: {
    flexDirection: "row",
    height: 70,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  iconButton: { padding: 5 },
  iconText: { fontSize: 24, color: "#000" },

  sectionTitle: {
    fontSize: 14,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },

  // --- Order Info Card ---
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderIdText: {
    fontSize: 13.5,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
    marginBottom: 5,
  },
  orderDateText: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: Color.DARK,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    color: "#000",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
  },
});

// --- Items Chosen ---
const itemsStyles = StyleSheet.create({
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  infoContainer: { flex: 1 },
  itemName: {
    fontSize: 12.5,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  itemQuantity: {
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    color: "#666",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontFamily: "Poppins-Bold",
    color: "#444",
  },
});

// --- Price Breakdown ---
const priceStyles = StyleSheet.create({
  priceContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#666",
  },
  priceValue: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 7,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  totalValue: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: Color.DARK,
  },
});

export default OrderDetailsScreen;
