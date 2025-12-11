import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  StyleSheet
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext"; // adjust import
 // adjust import
import Color from "../../constants/Color"; // adjust import
import { api } from "../../api/apiConfig";


const DeliveryHome = ({ navigation }) => {
  const { auth } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("CONFIRMED");

  // Fetch orders from backend with pagination and optional search
  const fetchOrders = async (pageNumber = 1, searchText = search) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

     const response = await api.post(
       `/delivery/my-orders/${activeTab}?page=${pageNumber}&limit=${limit}&search=${searchText}`,
       {
         deliveryPartnerId: auth.userId,
       }
     );


      const newOrders = response.data.orders;

      if (pageNumber === 1) {
        setOrders(newOrders);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
      }

      // Determine if more pages are available
      const totalPages = response.data.totalPages;
      setHasMore(pageNumber < totalPages);
    } catch (error) {
      console.log("Error fetching orders", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch — when auth or activeTab changes
  useFocusEffect(
    useCallback(() => {
      if (auth) {
        setPage(1);
        fetchOrders(1, search);
      }
    }, [auth, activeTab])
  );

  // Handler for search input
  const handleSearch = (text) => {
    setSearch(text);
    setPage(1);
    fetchOrders(1, text);
  };

  // Load more when user scrolls near bottom
  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, search);
  };

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>

        <Text style={styles.statusBadge}>
          {item.orderStatus
            ? "DELIVERED"
            : item.deliveryAccepted
            ? "ASSIGNED"
            : "NEW"}
        </Text>
      </View>

      <Text style={styles.addressText}>
        {item.userId?.userName}, {item.deliveryAddress?.fullAddress}
      </Text>
      <Text style={styles.addressText}>{item.deliveryAddress?.city}</Text>

      <View style={styles.rowBetween}>
        <Text style={styles.totalAmount}>₹ {item.orderTotal}</Text>
        <Text style={styles.itemsCount}>{item.items.length} items</Text>
      </View>

      <TouchableOpacity
        style={styles.acceptBtn}
        onPress={() =>
          navigation.navigate("Delivery Orders Details", { orderId: item._id })
        }
      >
        <Text style={styles.acceptText}>
          {!item.deliveryAccepted ? "View & Accept" : "View"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />

      {/* HEADER */}
      <View style={styles.topContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.title}>Orders</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order number, city, address..."
            value={search}
            onChangeText={handleSearch}
          />
        </View>

        {/* TABS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("CONFIRMED")}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "CONFIRMED" && styles.activeTabText,
              ]}
            >
              NEW
            </Text>
            {activeTab === "CONFIRMED" && (
              <View style={styles.activeUnderline} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("DELIVERED")}
            style={styles.tab}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "DELIVERED" && styles.activeTabText,
              ]}
            >
              DELIVERED
            </Text>
            {activeTab === "DELIVERED" && (
              <View style={styles.activeUnderline} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* LIST */}
      <View style={{ paddingHorizontal: 15, flex: 1 }}>
        {loading && page === 1 ? (
          <ActivityIndicator size="large" color={Color.DARK} />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderCard}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.2}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text>No orders found</Text>
              </View>
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  size="small"
                  color={Color.DARK}
                  style={{ marginVertical: 10 }}
                />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default DeliveryHome;




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  topContainer: {
    backgroundColor: "white",
    padding: 15,
    paddingBottom: 15,
    marginBottom: 15,
  },

  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },

  searchContainer: {
    marginTop: 10,
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
      color: "#222",
    },
    activeUnderline: {
      width: 40,
      height: 3,
      backgroundColor: Color.DARK,
      marginTop: 4,
      borderRadius: 20,
    },
  

  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  orderNumber: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
  },

  statusBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },

  addressText: {
    fontFamily: "Poppins-Regular",
    color: "#555",
    marginTop: 4,
  },

  totalAmount: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: Color.DARK,
  },

  itemsCount: {
    fontFamily: "Poppins-Medium",
    color: "#666",
  },

  acceptBtn: {
    marginTop: 8,
    backgroundColor: Color.DARK,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-end",
  },

  acceptText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },

  empty: {
    alignItems: "center",
    marginTop: 40,
  },
});
