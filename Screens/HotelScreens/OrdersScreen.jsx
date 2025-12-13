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
import { io } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";

const OrdersScreen = ({navigation}) => {
  const {auth} = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("PLACED");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page,setPage] =useState(1);
  const [hasMore,setHasMore] = useState(true);
  const [fetchingMore,setFetchingMore] = useState(false);
  const [unreadCount,setUnReadCount] = useState(0)
  const [socket,setSocket] =useState(null);


  //socket connection
useEffect(() => {
    if (!auth) return;

    const newSocket = io("https://food-delivery-backend-qk0w.onrender.com", {
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // Register restaurant
    newSocket.emit("register", { role: "restaurant", userId: auth.userId });

    // Debug: log any event
    newSocket.onAny((event, ...args) => {
      console.log("Socket received event:", event, args);
    });

    // Listen for new orders
    newSocket.on("new-order", (order) => {
      console.log("New order received:", order);
        // setTimeout(() => {
        //   Alert.alert(
        //     "New Order!",
        //     `Order #${order.orderNumber} has been placed.`
        //   );
        // }, 0);
        setUnReadCount((prev) => prev + 1);
        if(activeTab === "PLACED"){
          setOrders((prevOrders) => [...prevOrders,order ]);
        }
     
    });

    return () => {
      newSocket.disconnect();
    };
  }, [auth]);

  /* ---------------- API CALL TO FETCH ORDERS ---------------- */
const fetchOrders = async (nextPage = 1, searchText = "") => {
  try {
    if (nextPage === 1) {
      setLoading(true);
    } else {
      setFetchingMore(true);
    }

    setError(null);
    let sort = activeTab ==="DELIVERED"? -1 :1;

    const res = await api.get(
      `/order/based-status?status=${activeTab}&page=${nextPage}&limit=2&search=${searchText}&sort=${sort}`
    );
 

    if (res.data?.orders) {
      setOrders((prev) => {
        const newOrders =
          nextPage === 1 ? res.data.orders : [...prev, ...res.data.orders];

        // Remove duplicates by _id
        const uniqueOrders = Array.from(
          new Map(newOrders.map((item) => [item._id, item])).values()
        );
       

        return uniqueOrders;
      });
       if (nextPage === 1) {
         setUnReadCount(res.data.unreadCount || 0);
       }
      setHasMore(nextPage < res.data.totalPages);
    } else {
      setOrders([]);
      setHasMore(false);
    }
  } catch (e) {
    console.log("Error fetching orders:", e);
    setError("Failed to load orders");
  } finally {
    setLoading(false);
    setFetchingMore(false);
  }
};

const handleLoadMore = () => {
  if (!hasMore || fetchingMore) return;

  const nextPage = page + 1;
  setPage(nextPage);
  fetchOrders(nextPage, search);
};

const handleSearchText = (text) => {
  setSearch(text);
  setPage(1);
  fetchOrders(1, text);
};



  useEffect(() => {
    setPage(1);  
     setHasMore(true); // reset pagination state
     setOrders([]); 
    fetchOrders(1,search);
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
 

  /* ---------------- ORDER CARD COMPONENT ---------------- */
  const OrderCard = ({ item }) => {
    // Calculate total items
    const totalItems = item.items?.reduce((sum, currentItem) => {
      return sum + (currentItem.quantity || 0);
    }, 0) || 0;

    // Get display date - use placedAt if available, otherwise use createdAt
    const displayDate = item.timeline?.placedAt || item.createdAt;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("Status Update", { orderId: item._id })
        }
      >
        {!item.readByRestaurant && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{item.userId?.userName || "Customer"}</Text>
        </View>

        <Text style={styles.subText}>Ordered on {formatDate(displayDate)}</Text>

        <View style={styles.rowBetween}>
          <Text style={styles.subText}>
            Order #{item.orderNumber || item._id?.slice(-6)} • {totalItems}{" "}
            Items
          </Text>

          <Text
            style={[styles.status, { color: getStatusColor(item.orderStatus) }]}
          >
            {item.orderStatus === "CONFIRMED" && item.deliveryPartnerId
              ? "ASsIGNED"
              : item.orderStatus?.replace(/_/g, " ") || "UNKNOWN"}
          </Text>
        </View>
        <Text style={styles.price}>Total Amount - ₹ {item.orderTotal || 0}</Text>

        {/* Display payment method */}
        <Text style={[styles.subText, { marginTop: 4 }]}>
          Payment: {item.paymentMethod} • {item.paymentStatus}
        </Text>
      </TouchableOpacity>
    );
  };

  

  /* ---------------- RENDER ERROR STATE ---------------- */
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff6b6b" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />

      {/* SEARCH BAR */}
      <View style={styles.topContainer}>
        <View style={styles.headingContainer}>
          {/* Title */}
          <Text style={styles.title}>Orders Management</Text>

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
            onChangeText={handleSearchText}
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
              <View style={{flexDirection:"row"}}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === item.key && styles.activeTabText,
                  ]}
                >
                  {item.label}
                </Text>
                {item.key === "PLACED" && unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              {activeTab === item.key && (
                <View style={styles.activeUnderline} />
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ORDER LIST */}
      {loading ? (
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={Color.DARK} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {search ? "No orders found" : "No orders in this category"}
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
          data={orders} // 👈 NO filteredOrders
          renderItem={({ item }) => <OrderCard item={item} />}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={() => {
            setPage(1);
            setHasMore(true); // reset pagination state
            setOrders([]);
            fetchOrders(1, search);
          }}
          onEndReached={handleLoadMore} // 👈 Pagination
          onEndReachedThreshold={0.5} // 👈 Load when 50% from bottom
          ListFooterComponent={
            fetchingMore ? (
              <ActivityIndicator
                style={{ marginVertical: 20 }}
                size="small"
                color={Color.DARK}
              />
            ) : null
          }
        />
      )}
    </View>
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
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#666",
  },

  errorText: {
    marginTop: 16,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: Color.DARK,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "white",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  emptyText: {
    marginTop: 16,
    fontSize: 13,
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
    height: 50,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins-Medium",
    fontSize: 12,
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
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    color: "#b0b0b0",
  },
  activeTabText: {
    color: "#222",
  },
  activeUnderline: {
    width: 40,
    height: 3,
    backgroundColor: Color.DARK,
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
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },
  price: {
    fontSize: 13,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  subText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontFamily: "Poppins-Regular",
  },
  status: {
    fontSize: 11,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
  },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    justifyContent: "space-between", // TITLE LEFT | MENU RIGHT
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#222",
  },
  badge: {
    backgroundColor: "red",
    minWidth: 19,
    height: 19,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontFamily: "Poppins-Bold",
  },
  newBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#FF3B30", // red color for visibility
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },

  newBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Poppins-SemiBold",
    textTransform: "uppercase",
  },
});