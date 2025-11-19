import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Used for the checkmark icon

const OrderSuccessfulScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="check" size={70} color="#fff" />
        </View>

        {/* Header Text */}
        <Text style={styles.headerTitle}>Order Placed Successfully!</Text>

        {/* Confirmation Details */}
        <Text style={styles.confirmationText}>
          Your order will be processed and delivered to your address shortly.
        </Text>

        {/* Order Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailLabel}>Order ID:</Text>
          <Text style={styles.detailValue}>#XDR7654321</Text>
          <View style={styles.divider} />
          <Text style={styles.detailLabel}>Estimated Delivery:</Text>
          <Text style={styles.detailValue}>30 - 45 Minutes</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
             navigation.navigate("HomeStack", { screen: "Home" });

            }}
          >
            <Text style={styles.primaryButtonText}>Back To Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Light background
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 80, // Space from the top
  },

  // --- Icon ---
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#4CAF50", // Green success color
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  // --- Text ---
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  confirmationText: {
    fontSize: 16,
    color: "#6e6e6e",
    textAlign: "center",
    marginBottom: 40,
    maxWidth: "85%",
  },

  // --- Details Card ---
  detailsCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6e6e6e",
    marginTop: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
  },

  // --- Buttons ---
  buttonGroup: {
    width: "100%",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  primaryButton: {
    backgroundColor: "#000", // Matches the Pay Now button style
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default OrderSuccessfulScreen;
