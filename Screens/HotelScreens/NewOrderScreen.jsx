// screens/NewOrdersScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext"; // adjust path

const NewOrdersScreen = () => {
  const { auth } = useAuth();
  const [socket, setSocket] = useState(null);
  const [newOrders, setNewOrders] = useState([]);

  useEffect(() => {
    if (!auth) return;

    const newSocket = io("https://food-delivery-backend-qk0w.onrender.com", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // Register restaurant
    newSocket.emit("register", { role: "delivery", userId: auth.userId });

    // Debug: log any event
    newSocket.onAny((event, ...args) => {
      console.log("Socket received event:", event, args);
    });

    // Listen for new orders
    newSocket.on("order-assigned", (order) => {
      console.log("New order received:", order);
      Alert.alert("New Order!", `Order #${order.orderNumber} has been placed.`);
      setNewOrders((prevOrders) => [order, ...prevOrders]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [auth]);

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
      <Text>Customer: {item.userId?.userName || "Unknown"}</Text>
      <Text>Total: ₹{item.orderTotal}</Text>
      <Text>Status: {item.orderStatus}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {newOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No new orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={newOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </View>
  );
};

export default NewOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
});
