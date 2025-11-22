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

// --- Dummy Data (Simulating data that might be passed via navigation or fetched) ---
const DUMMY_ORDER_DETAILS = {
  orderId: "ORD-20251122-87532",
  date: "22 Nov, 2025 at 11:15 AM",
  status: "Preparing", // or 'Delivered', 'Cancelled', etc.
  items: [
    {
      _id: "i1",
      quantity: 1,
      totalPrice: 12.6,
      foodItem: {
        name: "Sweet Lemon Indonesian Tea",
        imageUrl: "https://picsum.photos/seed/tea_detail/100/100", // Placeholder
      },
    },
    {
      _id: "i2",
      quantity: 2,
      totalPrice: 25.2, // 2 * 12.6
      foodItem: {
        name: "Creamy Mocha Ome Coffee",
        imageUrl: "https://picsum.photos/seed/mocha_detail/100/100", // Placeholder
      },
    },
    {
      _id: "i3",
      quantity: 1,
      totalPrice: 12.6,
      foodItem: {
        name: "Arabica Latte Ombe Coffee (Iced)",
        imageUrl: "https://picsum.photos/seed/latte_detail/100/100", // Placeholder
      },
    },
  ],
  subtotal: 50.4, // 12.6 + 25.2 + 12.6
  deliveryFee: 5.0,
  tax: 2.5,
  totalAmount: 57.9,
};
// ----------------------------------------------------------------------------------

// ====================================================================
// COMPONENT 1: Items Chosen (Based on your provided structure)
// We modify this slightly to include the actual image.
// ====================================================================
const ItemsChosen = ({ items }) => {
  return (
    <View style={itemsStyles.itemsContainer}>
      <Text style={styles.sectionTitle}>Your Items</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={itemsStyles.itemRow}>
            <Image
              source={require("../../assets/biriyani.png")}
              style={itemsStyles.itemImage}
            />

            <View style={itemsStyles.infoContainer}>
              <Text style={itemsStyles.itemName} numberOfLines={1}>
                {item.foodItemId?.name}
              </Text>
              <Text style={itemsStyles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>

            <Text style={itemsStyles.itemPrice}>₹{item.totalPrice}</Text>
          </View>
        )}
      />
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

  if (!orderDetails) {
    return <Text style={{ padding: 20 }}>Loading Order Details...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
    </SafeAreaView>
  );
};



// ====================================================================
// STYLES
// ====================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light grey background
  },
  scrollContent: {
    padding: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 13,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily:"Inter-Bold",
    color: "#000",
  },
  iconButton: {
    padding: 5,
  },
  iconText: {
    fontSize: 24,
    color: "#000",
  },
  placeholderIcon: {
    width: 24, // Matches icon size for centering the title
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily:"Poppins-Bold",
    color: "#333",
    marginBottom: 10,
    marginTop: 10,
  },

  // --- Order Info Card Styles ---
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
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  orderDateText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#C8E6C9", // Light green
    borderRadius: 15,
    paddingHorizontal: 12,

    paddingVertical: 8,
  },
  statusText: {
    color: "#2E7D32", // Darker green
    fontFamily: "Inter-SemiBold",
    fontSize: 13,
  },
});

// --- Items Chosen Styles ---
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
    backgroundColor: "#ccc", // Fallback color
  },
  infoContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
  },
  itemQuantity: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E8449", // Green color for price
  },
});

// --- Price Breakdown Styles ---
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
    fontSize: 15,
    color: "#666",
  },
  priceValue: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginVertical: 10,
  },
  totalRow: {
    paddingVertical: 10,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1E8449", // Highlighted green for total
  },
});

export default OrderDetailsScreen;
