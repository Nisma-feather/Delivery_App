import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { api } from "../../api/apiConfig";
import Color from "../../constants/Color";

const OrdersScreen = ({navigation}) => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("PLACED");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- API CALL TO FETCH ORDERS ---------------- */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/order/based-status?status=${activeTab}`);
      
      if (res.data && res.data.orders) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.log("Error fetching orders:", e);
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  /* ---------------- FORMAT DATE FUNCTION ---------------- */
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " | " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).toLowerCase();
  };

  /* ---------------- GET STATUS COLOR ---------------- */
  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED":
        return "#ff8c00"; // Orange
      case "CONFIRMED":
        return "green";
      case "OUT_FOR_DELIVERY":
        return "#FF9800"; // Orange
      case "DELIVERED":
        return "#4CAF50"; // Green
      case "CANCELLED":
        return "#F44336"; // Red
      default:
        return "#757575"; // Gray
    }
  };

  /* ---------------- FILTER ORDERS BASED ON SEARCH ---------------- */
  const filteredOrders = orders.filter((order) => {
    if (!search) return true;
    
    const searchTerm = search.toLowerCase();
    const customerEmail = order.userId?.email?.toLowerCase() || "";
    const orderNumber = order.orderNumber?.toString() || "";
    
    return (
      customerEmail.includes(searchTerm) ||
      orderNumber.includes(searchTerm)
    );
  });

  /* ---------------- ORDER CARD COMPONENT ---------------- */
  const OrderCard = ({ item }) => {
    // Calculate total items
    const totalItems = item.items?.reduce((sum, currentItem) => {
      return sum + (currentItem.quantity || 0);
    }, 0) || 0;

    // Get display date - use placedAt if available, otherwise use createdAt
    const displayDate = item.timeline?.placedAt || item.createdAt;

    return (
      <TouchableOpacity style={styles.card} onPress={()=> navigation.navigate("Status Update",{orderId:item._id})}>
        <View style={styles.rowBetween}>
          <Text style={styles.name}>
            {item.userId?.userName || "Customer"}
          </Text>
          <Text style={styles.price}>₹{item.orderTotal || 0}</Text>
        </View>

        <Text style={styles.subText}>
          Ordered on {formatDate(displayDate)}
        </Text>

        <View style={styles.rowBetween}>
          <Text style={styles.subText}>
            Order #{item.orderNumber || item._id?.slice(-6)} • {totalItems} Items
          </Text>
          <Text 
            style={[
              styles.status, 
              { color: getStatusColor(item.orderStatus) }
            ]}
          >
            {item.orderStatus==="CONFIRMED" && item.deliveryPartnerId ? "ASsIGNED":item.orderStatus?.replace(/_/g, " ") || "UNKNOWN"}
          </Text>
        </View>

        {/* Display payment method */}
        <Text style={[styles.subText, { marginTop: 4 }]}>
          Payment: {item.paymentMethod} • {item.paymentStatus}
        </Text>
      </TouchableOpacity>
    );
  };

  /* ---------------- RENDER LOADING STATE ---------------- */
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Color.DARK} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </SafeAreaView>
    );
  }

  /* ---------------- RENDER ERROR STATE ---------------- */
  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />

      {/* SEARCH BAR */}
      <View style={styles.topContainer}>
        <View style={styles.headingContainer}>
                  {/* Title */}
                  <Text style={styles.title}>Menu Management</Text>
        
                  {/* Menu Icon (Right Side) */}
                  <TouchableOpacity onPress={() => navigation.openDrawer()}>
                    <Ionicons name="menu" size={28} color="#000" />
                  </TouchableOpacity>
                </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#444" />
          <TextInput
            style={styles.searchInput}
            value={search}
            placeholder="Search by email or order number..."
            onChangeText={setSearch}
          />
        </View>

        {/* ---------------- TABS ---------------- */}
        <FlatList 
          data={[
            { key: "PLACED", label: "NEW" },
            { key: "CONFIRMED", label: "CONFIRMED" },
            { key: "OUT_FOR_DELIVERY", label: "OUT FOR DELIVERY" },
            { key: "DELIVERED", label: "PAST" },
          ]} 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveTab(item.key)}
              style={styles.tab}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item.key && styles.activeTabText,
                ]}
              >
                {item.label}
              </Text>
              {activeTab === item.key && <View style={styles.activeUnderline} />}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ORDER LIST */}
      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {search ? "No orders found" : "No orders in this category"}
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
          data={filteredOrders}
          renderItem={({ item }) => <OrderCard item={item} />}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchOrders}
        />
      )}
    </SafeAreaView>
  );
};

export default OrdersScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#666",
  },

  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#f5a623",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: "Poppins-Medium",
    color: "#999",
    textAlign: "center",
  },

  topContainer: {
    backgroundColor: "white",
    padding: 15,
    paddingBottom: 5,
  },

  /* SEARCH */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 45,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
  },

  /* TABS */
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    flexWrap: "wrap",
  },
  tab: {
    marginHorizontal: 15,
    alignItems: "center",
    marginBottom: 8,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#b0b0b0",
  },
  activeTabText: {
    color: "#f5a623",
  },
  activeUnderline: {
    width: 40,
    height: 3,
    backgroundColor: "#f5a623",
    marginTop: 4,
    borderRadius: 20,
  },

  /* CARDS */
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontFamily: "Poppins-Bold",
    color: "#333",
  },
  price: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins-Bold",
  },
  subText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    fontFamily: "Poppins-Regular",
  },
  status: {
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom:10,
    backgroundColor: "#fff",
    justifyContent: "space-between", // TITLE LEFT | MENU RIGHT
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
   
  },
});