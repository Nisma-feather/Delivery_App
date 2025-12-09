import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Color from "../../constants/Color";
import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons";

import { api } from "../../api/apiConfig"; // your axios instance
import { useFocusEffect } from "@react-navigation/native";

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);

  // useEffect(() => {
  //   if (orderId) {
  //     fetchOrderDetails();
  //   }
  // }, [orderId]);

  useFocusEffect(useCallback(() => {
     if (orderId) {
       fetchOrderDetails();
     }
  }, [orderId]));

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/order/getById/${orderId}`);
      setOrder(res.data.order);
    } catch (err) {
      console.log("Fetch order error:", err);
    }
  };

  const updateStatus = async () => {
    let nextStatus =
      order.orderStatus === "PLACED"
        ? "CONFIRMED"
        : order.orderStatus === "CONFIRMED"
        ? "OUT_FOR_DELIVERY"
        : order.orderStatus === "OUT_FOR_DELIVERY"
        ? "DELIVERED"
        : "";

    if (!nextStatus) return;

    try {
      await api.post(`/order/update/update-status`, {
        orderId: orderId,
        status: nextStatus,
      });
      fetchOrderDetails(); // Update local state first
    } catch (err) {
      console.log("Status update error:", err);
    }
  };

  if (!order) return <Text>Loading...</Text>;

  const formattedDate = new Date(order.createdAt).toLocaleString();

  const renderDeliveryPartnerSection = () => {
    if (!order.deliveryPartnerId) {
      return (
        <View style={styles.partnerStickyCard}>
          <Text style={styles.partnerSub}>Delivery Person not Assigned</Text>
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() =>
              navigation.navigate("AssignDeliveryPartner", {
                orderId: order._id,
              })
            }
          >
            <Text style={styles.assignButtonText}>Assign Delivery Person</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.partnerStickyCard}>
        <Ionicons
          name="person-circle-outline"
          size={45}
          color="#555"
          style={{ marginRight: 10 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.partnerName}>
            {order.deliveryPartnerId?.userName}
          </Text>
          <Text style={styles.partnerSub}>Delivery Partner Assigned</Text>
          <Text style={styles.partnerMobile}>
            {order.deliveryPartnerId?.mobile}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="paper-plane-outline" size={22} color={Color.DARK} />
        </TouchableOpacity>
      </View>
    );
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
          style={[styles.bottomBtn, styles.disabledBtn]}
          disabled={true}
        >
          <Text style={styles.bottomText}>Delivery Assigned</Text>
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
      <TouchableOpacity style={styles.bottomBtn} onPress={updateStatus}>
        <Text style={styles.bottomText}>
          {order.orderStatus === "PLACED"
            ? "Confirm Order"
            : order.orderStatus === "OUT_FOR_DELIVERY"
            ? "Mark Delivered"
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

        {/* ITEMS */}
        <Text style={styles.sectionTitle}>ITEM(S)</Text>

        {order.items.map((item) => (
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

        {/* PAYMENT INFO */}
        <Text style={styles.sectionTitle}>PAYMENT INFO</Text>

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
            {order.paymentMethod === "COD" ? "Cash on Delivery" : "Paid Online"}
          </Text>
          <Text style={[styles.payValue, { fontWeight: "700" }]}>
            ₹ {order.orderTotal + order.packingCharge + order.shippingCost}
          </Text>
        </View>

        {/* Delivery Address */}
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
      </ScrollView>

      {/* Delivery Partner Section */}
      {renderDeliveryPartnerSection()}

      {/* Bottom Button */}
      {renderBottomButton()}
    </View>
  );
};

export default OrderDetailsScreen;

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
    fontSize: 20,
    color: "#000",
    fontFamily: "Poppins-Bold",
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
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 20,
    fontSize: 13,
    color: "#6c6c6c",
    fontFamily: "Poppins-SemiBold",
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
    fontSize: 15,
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
    fontSize: 15,
    color: "#000",
    fontFamily: "Poppins-Medium",
  },
  paymentRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  payLabel: {
    fontSize: 15,
    color: "#6c6c6c",
    fontFamily: "Poppins-Regular",
  },
  payValue: {
    fontSize: 15,
    color: "#000",
    fontFamily: "Poppins-Medium",
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
    fontSize: 14,
    color: "#444",
    marginBottom: 3,
    fontFamily: "Poppins-Regular",
  },
  bottomBtn: {
    backgroundColor: Color.DARK,
    padding: 18,
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
  partnerStickyCard: {
    position: "absolute",
    bottom: 70, // stays above bottom button
    left: 10,
    right: 10,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  partnerName: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#000",
  },
  partnerSub: {
    fontSize: 12,
    color: "#777",
    fontFamily: "Poppins-Regular",
  },
  partnerMobile: {
    fontSize: 13,
    marginTop: 2,
    color: "#000",
    fontFamily: "Poppins-Regular",
  },
  assignButton: {
    backgroundColor: Color.DARK,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  assignButtonText: {
    color: "#000",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
});
