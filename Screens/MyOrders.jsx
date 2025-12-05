import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import Color from "../constants/Color";


const OrderItem = ({ item, navigation }) => {
  console.log(item)
  const foodNames = item.items
    .slice(0, 2)
    .map((food) => food.foodItemId?.name)
    .join(", ");
  console.log("Item",item);
  const image =
    item.items[0].foodItemId?.image || item.items[1]?.foodItemId?.image;
  console.log(image)
  const moreCount =
    item.items.length > 2 ? ` +${item.items.length - 2} more` : "";

  return (
    <View style={styles.orderItemContainer}>
      {/* Food Icon */}
      <Image
        source={require("../assets/biriyani.png")}
        style={styles.orderImage}
      />

      {/* Order Details */}
      <View style={styles.orderDetailContainer}>
        <Text style={styles.orderName}>{foodNames + moreCount}</Text>
        <Text style={styles.orderDescription}>
          Order ID: {item.orderNumber}
        </Text>
        <Text style={styles.orderPrice}>
          ₹ {item.orderTotal + item?.packingCharge + item?.shippingCost}
        </Text>

        {/* View Details Button */}
        <TouchableOpacity
          style={styles.viewDetailsButton}
          onPress={() =>
            navigation.navigate("Order Details", { orderDetails: item })
          }
        >
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Track Button (only if not delivered) */}
   
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => navigation.navigate("Track Order",{
             trackOrder:{
               orderStatus: item.orderStatus,
               timeline: item.timeline
             }
          })}
        >
          <Text style={styles.trackButtonText}>Track</Text>
        </TouchableOpacity>
   
    </View>
  );
};


const MyOrders = ({ navigation }) => {
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState("Ongoing");
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/order/${auth.userId}`);
      setOrders(res.data.orders);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders
  const filteredOrders =
    activeTab === "Ongoing"
      ? orders.filter((o) => o.orderStatus !== "DELIVERED")
      : orders.filter((o) => o.orderStatus === "DELIVERED");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
       
        <Text style={styles.headerTitle}>My Orders</Text>
       
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Ongoing" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Ongoing")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Ongoing" && styles.activeTabText,
            ]}
          >
            Ongoing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "Completed" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("Completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OrderItem item={item} navigation={navigation} />
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 19,
    fontFamily: "Poppins-Bold",
  },
  iconButton: { padding: 5 },
  iconText: { fontSize: 24 },

  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginVertical: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  tabButton: { flex: 1, paddingVertical: 7, alignItems: "center" },
  tabText: { fontSize: 15, fontFamily: "Poppins-Medium", color: "#000" },
  activeTab: { backgroundColor: Color.DARK, borderRadius: 30 },
  activeTabText: { color: "#fff", fontFamily: "Poppins-SemiBold" },

  listContent: { paddingHorizontal: 15 },

  orderItemContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  orderImage: { width: 70, height: 70, marginRight: 15, borderRadius: 10 },
  orderDetailContainer: { flex: 1 },

  orderName: { fontSize: 13, fontFamily: "Poppins-SemiBold" },
  orderDescription: {
    fontSize: 13,
    fontFamily: "Poppins-Regular",
    color: "#777",
    marginTop: 2,
  },
  orderPrice: { marginTop: 5, fontSize: 13, fontFamily: "Poppins-Bold" },

  trackButton: {
    backgroundColor: Color.DARK,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  trackButtonText: { color: "#fff", fontFamily: "Poppins-SemiBold" },

  viewDetailsButton: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: Color.DARK,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    width: 120,
  },
  viewDetailsText: {
    color: Color.DARK,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
});

 

export default MyOrders;
