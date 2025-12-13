import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import Color from "../../constants/Color";
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";

import { api } from "../../api/apiConfig"; // your axios instance
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

const DeliveryPartnerOrderDetails = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { auth } = useAuth();
const [order, setOrder] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

  const [showItems, setShowItems] = useState(false); // State to toggle items visibility
  const [showPaymentDetails, setShowPaymentDetails] = useState(false); // State to toggle payment details visibility
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for update

  useFocusEffect(
    useCallback(() => {
      if (orderId) {
        fetchOrderDetails();
      }
    }, [orderId])
  );

  const markOrderAsReadByDelivery = async (orderId, isRead) => {
    try {
      if (isRead) return; // already read → do nothing

      await api.patch(`/order/read-status/${orderId}`, {
        readByDeliveryPartner: true,
      });
    } catch (err) {
      console.error("Failed to mark delivery order as read:", err);
    }
  };
  useEffect(() => {
    if (orderId && order && order.readByDeliveryPartner === false) {
      console.log("its running");
      markOrderAsReadByDelivery(orderId, order.readByDeliveryPartner);
    }
  }, [orderId, order?.readByDeliveryPartner]);



 const fetchOrderDetails = async () => {
   try {
     setLoading(true);
     setError(null);

     const res = await api.get(`/order/getById/${orderId}`);

     if (!res.data?.order) {
       setOrder(null);
       setError("Order not found");
       return;
     }

     setOrder(res.data.order);
   } catch (err) {
     console.log("Fetch order error:", err);
     setError("Unable to fetch order details");
   } finally {
     setLoading(false);
   }
 };

  const updateStatus = async () => {
    if (isUpdating) return;

    setIsUpdating(true);

    let nextStatus =
      order.orderStatus === "PLACED"
        ? "CONFIRMED"
        : order.orderStatus === "CONFIRMED"
        ? "OUT_FOR_DELIVERY"
        : order.orderStatus === "OUT_FOR_DELIVERY"
        ? "DELIVERED"
        : "";

    if (!nextStatus) {
      setIsUpdating(false);
      return;
    }

    try {
      // For COD orders being delivered, we need to update payment status to PAID
      const isCODToDelivered =
        order.paymentMethod === "COD" &&
        order.orderStatus === "OUT_FOR_DELIVERY" &&
        nextStatus === "DELIVERED";

      if (isCODToDelivered) {
        // Show confirmation alert for COD orders
        Alert.alert(
          "Confirm Payment Collection",
          "Have you collected the payment from the customer?",
          [
            {
              text: "No, Cancel",
              style: "cancel",
              onPress: () => {
                setIsUpdating(false);
              },
            },
            {
              text: "Yes, Collected",
              style: "destructive",
              onPress: async () => {
                try {
                  // Update order status
                  await api.post(`/order/update/update-status`, {
                    orderId: orderId,
                    status: nextStatus,
                  });

                  // Update payment status
                  await api.put(`/order/payment-status/${orderId}`, {
                 
                    paymentStatus: "PAID",
                  });

                  Alert.alert(
                    "Success",
                    "Order delivered and payment marked as collected",
                    [{ text: "OK" }]
                  );

                  fetchOrderDetails(); // Refresh order details
                } catch (err) {
                  console.log("Status update error:", err);
                  Alert.alert(
                    "Error",
                    "Failed to update order status. Please try again.",
                    [{ text: "OK" }]
                  );
                } finally {
                  setIsUpdating(false);
                }
              },
            },
          ]
        );
        return;
      } else {
        // For non-COD orders, just update status
        await api.post(`/order/update/update-status`, {
          orderId: orderId,
          status: nextStatus,
        });

        Alert.alert("Success", `Order status updated to ${nextStatus}`, [
          { text: "OK" },
        ]);

        fetchOrderDetails(); // Refresh order details
      }
    } catch (err) {
      console.log("Status update error:", err);
      Alert.alert("Error", "Failed to update order status. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsUpdating(false);
    }
  };

  const acceptOrders = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const res = await api.post("/delivery/accept-order", {
        deliveryPartnerId: auth.userId,
        orderId: orderId,
      });
      fetchOrderDetails();
      Alert.alert("Success", "Order accepted successfully", [{ text: "OK" }]);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to accept order. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Color.DARK} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }


  const formattedDate = new Date(order.createdAt).toLocaleString();
  const totalPrice =
    order.orderTotal + order.packingCharge + order.shippingCost;

  // Determine payment status display
  const getPaymentStatusDisplay = () => {
    // If order is delivered and payment method is COD, show as PAID
    if (order.orderStatus === "DELIVERED" && order.paymentMethod === "COD") {
      return "PAID";
    }
    return order.paymentStatus || "PENDING";
  };

  // Determine payment status badge color
  const getPaymentStatusColor = () => {
    const status = getPaymentStatusDisplay();
    if (status === "PAID") return "#4CAF50";
    if (status === "FAILED") return "#F44336";
    return "#FF9800";
  };

  const renderBottomButton = () => {
    // If order is DELIVERED
    if (order.orderStatus === "DELIVERED") {
      return (
        <TouchableOpacity style={[styles.bottomBtn, styles.completedBtn]}>
          <Text style={styles.bottomText}>Order Completed</Text>
        </TouchableOpacity>
      );
    }

    // If order is CONFIRMED AND delivery partner is assigned
    if (order.orderStatus === "CONFIRMED" && order.deliveryPartnerId) {
      return (
        <TouchableOpacity
          style={[styles.bottomBtn, isUpdating && styles.disabledBtn]}
          onPress={acceptOrders}
          disabled={isUpdating}
        >
          <Text style={styles.bottomText}>
            {isUpdating ? "Processing..." : "Accept & Mark as out for Delivery"}
          </Text>
        </TouchableOpacity>
      );
    }

    // If order is CONFIRMED but NO delivery partner assigned
    if (order.orderStatus === "CONFIRMED" && !order.deliveryPartnerId) {
      return (
        <TouchableOpacity
          style={[styles.bottomBtn, styles.disabledBtn]}
          disabled={true}
        >
          <Text style={styles.bottomText}>Confirmed</Text>
        </TouchableOpacity>
      );
    }

    // For other statuses (PLACED, OUT_FOR_DELIVERY)
    return (
      <TouchableOpacity
        style={[styles.bottomBtn, isUpdating && styles.disabledBtn]}
        onPress={updateStatus}
        disabled={isUpdating}
      >
        <Text style={styles.bottomText}>
          {order.orderStatus === "PLACED"
            ? isUpdating
              ? "Processing..."
              : "Confirm Order"
            : order.orderStatus === "OUT_FOR_DELIVERY"
            ? isUpdating
              ? "Processing..."
              : "Mark as Delivered"
            : ""}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Customer Section */}
        <View style={styles.customerCard}>
          <Text style={styles.customerName}>{order.userId?.userName}</Text>
          <Text style={styles.orderId}>
            #{order.orderNumber} | {formattedDate}
          </Text>

          <View style={styles.iconRow}>
            <Feather name="message-circle" size={22} color={Color.DARK} />
            <Feather name="phone-call" size={22} color={Color.DARK} />
          </View>
        </View>

        {/* ITEMS SECTION WITH TOGGLE BUTTON */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>ITEM(S)</Text>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => setShowItems(!showItems)}
          >
            <Text style={styles.viewDetailsButtonText}>
              {showItems ? "Hide Items" : "View Items Details"}
            </Text>
            <Ionicons
              name={showItems ? "chevron-up" : "chevron-down"}
              size={20}
              color={Color.DARK}
            />
          </TouchableOpacity>
        </View>

        {/* ITEMS LIST (Only visible when showItems is true) */}
        {showItems &&
          order.items.map((item) => (
            <View key={item._id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {item.foodItemId?.name || "Item"}
                </Text>
              </View>

              <Text style={styles.qty}>{item.quantity}</Text>
              <Text style={styles.price}>₹ {item.totalPrice}</Text>
            </View>
          ))}

        {/* PAYMENT INFO SECTION WITH TOGGLE BUTTON */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PAYMENT INFO</Text>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => setShowPaymentDetails(!showPaymentDetails)}
          >
            <Text style={styles.viewDetailsButtonText}>
              {showPaymentDetails ? "Hide Details" : "View Payment Details"}
            </Text>
            <Ionicons
              name={showPaymentDetails ? "chevron-up" : "chevron-down"}
              size={20}
              color={Color.DARK}
            />
          </TouchableOpacity>
        </View>

        {/* PAYMENT DETAILS (Only visible when showPaymentDetails is true) */}
        {showPaymentDetails && (
          <>
            <View style={styles.paymentRow}>
              <Text style={styles.payLabel}>Sub Total</Text>
              <Text style={styles.payValue}>₹ {order.orderTotal}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.payLabel}>Shipping Cost</Text>
              <Text style={styles.payValue}>₹ {order.shippingCost}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={styles.payLabel}>Packing Fee</Text>
              <Text style={styles.payValue}>₹ {order.packingCharge}</Text>
            </View>

            <View style={styles.paymentRow}>
              <Text style={[styles.payLabel, { fontWeight: "700" }]}>
                Total Amount
              </Text>
              <Text style={[styles.payValue, { fontWeight: "700" }]}>
                ₹ {totalPrice}
              </Text>
            </View>
          </>
        )}

        {/* TOTAL PRICE - Always visible */}
        <View style={[styles.paymentRow, styles.totalPriceRow]}>
          <Text style={[styles.payLabel, styles.totalPriceLabel]}>
            Total Price
          </Text>
          <Text style={[styles.payValue, styles.totalPriceValue]}>
            ₹ {totalPrice}
          </Text>
        </View>

        {/* PAYMENT STATUS AND METHOD SECTION */}
        <View style={styles.paymentStatusCard}>
          <View style={styles.paymentStatusRow}>
            <Text style={styles.paymentStatusLabel}>Payment Status:</Text>
            <View
              style={[
                styles.paymentStatusBadge,
                {
                  backgroundColor: getPaymentStatusColor(),
                },
              ]}
            >
              <Text style={styles.paymentStatusText}>
                {getPaymentStatusDisplay()}
              </Text>
            </View>
          </View>

          <View style={styles.paymentStatusRow}>
            <Text style={styles.paymentStatusLabel}>Payment Method:</Text>
            <View style={styles.paymentMethodBadge}>
              <Text style={styles.paymentMethodText}>
                {order.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Online Payment"}
              </Text>
            </View>
          </View>

          {/* COD payment note */}
          {order.paymentMethod === "COD" &&
            order.orderStatus !== "DELIVERED" && (
              <View style={styles.codNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="#666"
                />
                <Text style={styles.codNoteText}>
                  Mark as delivered only if you have collected the payment
                </Text>
              </View>
            )}

          {/* Already delivered COD note */}
          {order.paymentMethod === "COD" &&
            order.orderStatus === "DELIVERED" && (
              <View style={[styles.codNote, { backgroundColor: "#E8F5E9" }]}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={[styles.codNoteText, { color: "#2E7D32" }]}>
                  Payment collected and marked as PAID
                </Text>
              </View>
            )}
        </View>

        {/* Delivery Address */}
        <View
          style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 10 }}
        >
          <Text style={styles.sectionTitle}>DELIVERY ADDRESS</Text>

          <View style={styles.addressBox}>
            <View>
              <Ionicons name="location" size={24} color="#333" />
            </View>
            <View>
              <Text style={styles.addressText}>
                {order.deliveryAddress?.fullAddress || ""}
              </Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress?.city || ""},{" "}
                {order.deliveryAddress?.state || ""}
              </Text>
              <Text style={styles.addressText}>
                {order.deliveryAddress?.pincode || ""},{" "}
                {order.deliveryAddress?.country || ""}
              </Text>
            </View>
          </View>
          <View style={styles.addressBox}>
            <View>
              <FontAwesome name="phone" size={24} color="#333" />
            </View>
            <Text style={[styles.addressText, { marginTop: 5 }]}>
              {order.contactNo}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      {renderBottomButton()}
    </View>
  );
};

export default DeliveryPartnerOrderDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150, // Extra padding for the sticky elements
  },
  backBtn: {
    padding: 15,
    marginTop: 10,
  },
  customerCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  customerName: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
  orderId: {
    fontSize: 13,
    marginTop: 5,
    color: "#6c6c6c",
    fontFamily: "Poppins-Regular",
  },
  iconRow: {
    flexDirection: "row",
    position: "absolute",
    right: 20,
    top: 25,
    width: 70,
    justifyContent: "space-between",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#222",
    fontFamily: "Poppins-SemiBold",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Color.DARK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  viewDetailsButtonText: {
    fontSize: 12,
    color: "#000",
    fontFamily: "Poppins-Medium",
    marginRight: 5,
  },
  itemRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: "#000",
    fontFamily: "Poppins-Medium",
  },
  qty: {
    width: 30,
    textAlign: "center",
    fontSize: 15,
    color: "#444",
    fontFamily: "Poppins-Regular",
  },
  price: {
    width: 70,
    textAlign: "right",
    fontSize: 13,
    color: "#000",
    fontFamily: "Poppins-Medium",
  },
  paymentRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 13,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  totalPriceRow: {
    backgroundColor: "#f9f9f9",
    marginTop: 10,
    borderWidth: 1,
    borderColor: Color.DARK,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  totalPriceLabel: {
    fontSize: 14.5,
    color: "#000",
    fontFamily: "Poppins-Bold",
  },
  totalPriceValue: {
    fontSize: 16,
    color: "#000",
    fontFamily: "Poppins-Bold",
  },
  payLabel: {
    fontSize: 15,
    color: "#6c6c6c",
    fontFamily: "Poppins-Regular",
  },
  payValue: {
    fontSize: 14,
    color: "#000",
    fontFamily: "Poppins-Medium",
  },
  paymentStatusCard: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  paymentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  paymentStatusLabel: {
    fontSize: 13.5,
    color: "#6c6c6c",
    fontFamily: "Poppins-Regular",
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  paymentStatusText: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  paymentMethodBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  paymentMethodText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "Poppins-Medium",
  },
  codNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
  },
  codNoteText: {
    fontSize: 10,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginLeft: 5,
    fontStyle: "italic",
  },
  addressBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  addressText: {
    fontSize: 13,
    color: "#444",
    marginBottom: 3,
    fontFamily: "Poppins-Regular",
  },
  bottomBtn: {
    backgroundColor: Color.DARK,
    padding: 14,
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  disabledBtn: {
    backgroundColor: "#CCCCCC",
  },
  completedBtn: {
    backgroundColor: "#4CAF50",
  },
  bottomText: {
    fontSize: 18,
    color: "#000",
    fontFamily: "Poppins-Bold",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Poppins-Medium",
  },
});
