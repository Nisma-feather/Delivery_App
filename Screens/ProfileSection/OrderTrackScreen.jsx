import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome, Octicons } from "@expo/vector-icons";
import Color from "../../constants/Color";

const IMAGE_DARK = "#000";

// ---------------- MAP HEADER + PLACEHOLDER ----------------
const TrackingMapArea = ({ orderStatus }) => {
  const getStatusLabel = () => {
    switch (orderStatus) {
      case "PLACED":
        return "Order Placed";
      case "CONFIRMED":
        return "Confirmed";
      case "OUT_FOR_DELIVERY":
        return "On the way";
      case "DELIVERED":
        return "Delivered";
      case "CANCELLED":
        return "Cancelled";
      default:
        return "Tracking";
    }
  };

  return (
    <View style={mapStyles.mapContainer}>
      <View style={mapStyles.mapHeader}>
        <Text style={mapStyles.orderIdNumber}>Order Tracking</Text>

        <View style={mapStyles.statusBadge}>
          <Text style={mapStyles.statusBadgeText}>{getStatusLabel()}</Text>
        </View>
      </View>

      {/* <View style={mapStyles.mapPlaceholder}>
        <Text style={mapStyles.mapText}>[Map Component Placeholder]</Text>
      </View> */}
    </View>
  );
};

// -------------------- MAIN SCREEN --------------------
const OrderTrackScreen = ({ navigation, route }) => {
  const { trackOrder } = route?.params;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (trackOrder) setOrder(trackOrder);
  }, [trackOrder]);

  if (!order || !order.timeline) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Color.DARK} />
      </SafeAreaView>
    );
  }

  const TRACKING_STEPS = [
    {
      key: "placedAt",
      title: "Order Placed",
      icon: "clipboard",
      timestamp: order?.timeline?.placedAt,
    },
    {
      key: "confirmedAt",
      title: "Order Confirmed",
      icon: "check-circle",
      timestamp: order?.timeline?.confirmedAt,
    },
    {
      key: "outForDeliveryAt",
      title: "Out For Delivery",
      icon: "cutlery",
      timestamp: order?.timeline?.outForDeliveryAt,
    },
    {
      key: "deliveredAt",
      title: "Order Delivered",
      icon: "home",
      timestamp: order?.timeline?.deliveredAt,
    },
  ];

  // ACTIVE STEP
  const statusOrder = ["PLACED", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const activeStatusIndex = statusOrder.indexOf(order.orderStatus);

  // FORMATTERS
  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Octicons name="arrow-left" color={IMAGE_DARK} size={24} />
        </TouchableOpacity>

        <Text style={styles.orderIdText}>Order Tracking</Text>
      </View>

      {/* MAP AREA */}
      <TrackingMapArea orderStatus={order.orderStatus} />

      {/* TIMELINE */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.trackingHeader}>Order Status</Text>

        <View style={timelineStyles.timelineContainer}>
          {TRACKING_STEPS.map((step, index) => {
            const isActiveOrComplete = index <= activeStatusIndex;

            return (
              <View key={step.key} style={timelineStyles.timelineItem}>
                {/* DOT & LINE */}
                <View style={timelineStyles.timelineConnector}>
                  <View
                    style={[
                      timelineStyles.timelineDot,
                      isActiveOrComplete && timelineStyles.timelineDotActive,
                    ]}
                  >
                    <FontAwesome name={step.icon} size={14} color="#FFF" />
                  </View>

                  {index < TRACKING_STEPS.length - 1 && (
                    <View
                      style={[
                        timelineStyles.timelineLine,
                        isActiveOrComplete && timelineStyles.timelineLineActive,
                      ]}
                    />
                  )}
                </View>

                {/* TEXT */}
                <View style={timelineStyles.timelineContent}>
                  <Text
                    style={[
                      timelineStyles.statusTitle,
                      isActiveOrComplete && timelineStyles.statusTitleActive,
                    ]}
                  >
                    {step.title}
                  </Text>

                  {step.timestamp ? (
                    <Text style={timelineStyles.statusDateText}>
                      {formatDate(step.timestamp)} •{" "}
                      {formatTime(step.timestamp)}
                    </Text>
                  ) : (
                    <Text style={timelineStyles.statusDateText}></Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderTrackScreen;

// ------------------ STYLES ------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 60,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
    height: 40,
    width: 40,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  orderIdText: {
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
    color: IMAGE_DARK,
  },

  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  trackingHeader: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#333",
    marginBottom: 10,
  },
});

const mapStyles = StyleSheet.create({
  mapContainer: { width: "100%", height: 80, backgroundColor: "#f5f5f5" },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 10,
    position: "absolute",
    width: "100%",
    zIndex: 10,
  },
  orderIdNumber: { fontSize: 15, fontFamily: "Poppins-Medium" },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: Color.DARK,
    borderRadius: 20,
  },
  statusBadgeText: { color: "#fff", fontFamily: "Poppins-Bold" },
  mapPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapText: { color: "#555", fontFamily: "Poppins-Regular" },
});

const timelineStyles = StyleSheet.create({
  timelineContainer: {},
  timelineItem: { flexDirection: "row", marginBottom: 30 },
  timelineConnector: { width: 30, alignItems: "center", marginRight: 15 },
  timelineDot: {
    width: 35,
    height: 35,
    borderRadius: 35,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotActive: { backgroundColor: Color.DARK },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#eee",
    position: "absolute",
    top: 35,
    bottom: -30,
  },
  timelineLineActive: { backgroundColor: Color.DARK },
  timelineContent: { flex: 1 },
  statusTitle: { fontSize: 15, fontFamily: "Poppins-SemiBold", color: "#666" },
  statusTitleActive: { color: "#000", fontFamily: "Poppins-Bold" },
  statusDateText: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#999",
  },
});
