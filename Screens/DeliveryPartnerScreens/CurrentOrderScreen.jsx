import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import Color from "../../constants/Color";
import { api } from "../../api/apiConfig";
import { useAuth } from "../../context/AuthContext";
import debounce from "lodash.debounce";

const CurrentOrderScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const { auth } = useAuth();

  // Fetch orders on screen focus
  useFocusEffect(
    useCallback(() => {
      if (auth) {
        setPage(1);
        fetchOrders(1, search, true); // fetch first page, reset
      }
    }, [auth])
  );

  // Fetch orders function
  const fetchOrders = async (
    pageNumber = 1,
    searchQuery = "",
    reset = false
  ) => {
    try {
      setIsFetchingMore(true);
      const res = await api.post(
        `/delivery/my-orders/OUT_FOR_DELIVERY?page=${pageNumber}&limit=10&search=${searchQuery}`,
        { deliveryPartnerId: auth.userId }
      );

      const newOrders = res.data?.orders || [];

      setOrders((prev) => (reset ? newOrders : [...prev, ...newOrders]));
      setHasMore(pageNumber < res.data.totalPages);
    } catch (error) {
      console.log("Error fetching orders", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Pagination
  const handleLoadMore = () => {
    if (!hasMore || isFetchingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, search);
  };

  // Backend search (debounced)
  const handleSearch = debounce((text) => {
    setSearch(text);
    setPage(1);
    fetchOrders(1, text, true); // fetch from backend with new search, reset list
  }, 500);

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>
        <Text style={styles.statusBadge}>
          {item.deliveryAccepted ? "ASSIGNED" : "NEW"}
        </Text>
      </View>

      <Text style={styles.addressText}>
        {item?.userId?.userName}, {item.deliveryAddress?.fullAddress}
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
        <Text style={styles.acceptText}>View & Accept</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="white" />

      {/* HEADER */}
      <View style={styles.topContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.title}>Current Orders</Text>
        </View>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by order number, city, address..."
            onChangeText={handleSearch}
          />
        </View>
      </View>

      {/* LIST */}
      <View style={{ paddingHorizontal: 15, flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={Color.DARK} />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderCard}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text>No orders found</Text>
              </View>
            }
            ListFooterComponent={
              isFetchingMore ? (
                <ActivityIndicator
                  size="small"
                  style={{ marginVertical: 20 }}
                />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default CurrentOrderScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  topContainer: { backgroundColor: "white", padding: 15, marginBottom: 15 },
  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 17, fontFamily: "Poppins-SemiBold", color: "#000" },
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
    fontSize: 12,
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 3,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  orderNumber: { fontFamily: "Poppins-SemiBold", fontSize: 15 },
  statusBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 5,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  addressText: { fontFamily: "Poppins-Regular", color: "#555", marginTop: 4 ,fontSize:12.5},
  totalAmount: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    color: Color.DARK,
  },
  itemsCount: { fontFamily: "Poppins-Medium", color: "#666" },
  acceptBtn: {
    marginTop: 8,
    backgroundColor: Color.DARK,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "flex-end",
  },
  acceptText: { color: "#fff", fontSize: 13, fontFamily: "Poppins-SemiBold" },
  empty: { alignItems: "center", marginTop: 40 },
});
