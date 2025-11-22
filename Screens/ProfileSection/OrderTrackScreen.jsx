import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// Import the FontAwesome library you want to use (e.g., FontAwesome, MaterialFontAwesomes)
// I'm using FontAwesome as an example.
import {FontAwesome} from "@expo/vector-icons"

// --- Dummy Data ---
const DUMMY_ORDER_TRACKING_DATA = {
  orderId: "8888",
  currentStatus: "Order Confirmed", // Active status
};

// --- Order Tracking Steps Configuration (Using React Native FontAwesome Names) ---
const TRACKING_STEPS = [
  {
    title: "Order Placed",
    date: "22 Nov 2025",
    time: "10:00 AM",
    
    FontAwesomeName: "clipboard", // FontAwesome FontAwesome
  },
  {
    title: "Order Confirmed",
    date: "22 Nov 2025",
    time: "10:15 AM",
  
    FontAwesomeName: "check-circle", // FontAwesome FontAwesome
  },
  {
    title: "Out For Delivery",
    date: "22 Nov 2025",
    time: "11:00 AM",
    description: "We are preparing your order.",
    FontAwesomeName: "cutlery", // FontAwesome FontAwesome
  },
  {
    title: "Order Delivered",
    date: "22 Nov 2025",
    time: "12:00 PM", // Added a time for consistency
    
    FontAwesomeName: "home", // FontAwesome FontAwesome
  },
];

// ====================================================================
// MAIN SCREEN COMPONENT
// ====================================================================
const OrderTrackScreen = ({ navigation }) => {
  const [orderData] = useState(DUMMY_ORDER_TRACKING_DATA);

  // Determine the index of the current active status
  const activeStatusIndex = TRACKING_STEPS.findIndex(
    (step) => step.title === orderData.currentStatus
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          {/* Using FontAwesome for Back Button (optional) */}
          <FontAwesome name="chevron-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.orderIdText}>#**{orderData.orderId}**</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.trackingHeader}>Order Status</Text>
        <View style={styles.separator} />

        {/* Order Status Timeline */}
        <View style={timelineStyles.timelineContainer}>
          {TRACKING_STEPS.map((step, index) => {
            // Check if this step is active or has been completed
            const isActiveOrComplete = index <= activeStatusIndex;

            return (
              <View key={step.title} style={timelineStyles.timelineItem}>
                {/* Vertical Line and Dot */}
                <View style={timelineStyles.timelineConnector}>
                  {/* Dot with FontAwesome */}
                  <View
                    style={[
                      timelineStyles.timelineDot,
                      isActiveOrComplete && timelineStyles.timelineDotActive,
                    ]}
                  >
                    {/* The FontAwesome inside the circle */}
                    <FontAwesome
                      name={step.FontAwesomeName}
                      size={14}
                      // Apply Yellow color if the dot is active (Red)
                      color={isActiveOrComplete ? "#FFF" : "#fff"}
                    />
                  </View>

                  {/* Vertical Line */}
                  {index < TRACKING_STEPS.length - 1 && (
                    <View
                      style={[
                        timelineStyles.timelineLine,
                        isActiveOrComplete && timelineStyles.timelineLineActive,
                      ]}
                    />
                  )}
                </View>

                {/* Status Content */}
                <View style={timelineStyles.timelineContent}>
                  <View style={timelineStyles.statusInfo}>
                    <View>
                      {/* Status Title */}
                      <Text
                        style={[
                          timelineStyles.statusTitle,
                          isActiveOrComplete &&
                            timelineStyles.statusTitleActive,
                        ]}
                      >
                        {step.title}
                      </Text>

                      {/* Date and Time (Placed below status title) */}
                      <Text style={timelineStyles.statusDateText}>
                        {step.date} • {step.time}
                      </Text>

                      {/* Description (Smaller text) */}
                      <Text style={timelineStyles.statusDescription}>
                        {step.description}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Optional: Add a tracking map placeholder here if needed */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>[Image of tracking map component]</Text>
        </View>
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
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E74C3C", // Red background
    paddingHorizontal: 15,
    height: 60,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  trackingHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  separator: {
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  mapText: {
    color: "#999",
    fontSize: 16,
  },
});

const timelineStyles = StyleSheet.create({
  timelineContainer: {
    // No specific style needed here
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 30,
  },
  timelineConnector: {
    width: 30, // Width for the line and dot area
    alignItems: "center",
    marginRight: 15,
  },
  timelineDot: {
    width: 28, // Slightly larger circle for FontAwesome
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ccc", // Inactive dot color
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: "#E74C3C", // Active dot color (Red)
    borderColor: "#FADBD8", // Lighter red border
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#eee", // Inactive line color
    position: "absolute",
    top: 28, // Start below the dot (height 28)
    bottom: -30, // Extend to the next item's dot
  },
  timelineLineActive: {
    backgroundColor: "#E74C3C", // Active line color (Red)
  },
  timelineContent: {
    flex: 1,
    justifyContent: "center",
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#666", // Inactive title color
    marginBottom: 2,
  },
  statusTitleActive: {
    color: "#000", // Active title color
  },
  statusDateText: {
    fontSize: 13,
    color: "#999",
    marginBottom: 5,
  },
  statusDescription: {
    fontSize: 13,
    color: "#999",
  },
});

export default OrderTrackScreen;
