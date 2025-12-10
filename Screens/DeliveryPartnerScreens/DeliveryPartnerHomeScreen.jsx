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

const DeliveryHome = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const {auth} = useAuth();

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useFocusEffect(
    useCallback(() => {
        if(auth){
  fetchNewOrders();
        }
    
    }, [auth])
  );

  const fetchNewOrders = async () => {
    try {
      setLoading(true);
     console.log(auth.userId)
      const res = await api.post("/delivery/my-orders/CONFIRMED", {
        deliveryPartnerId:auth.userId
      }); // sample route
      console.log(res.data)
        setOrders(res.data.orders);
        setFilteredOrders(res.data.orders);
       
      
    } catch (error) {
      console.log("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  // SEARCH FUNCTION
  const handleSearch = (text) => {
    setSearch(text);

    if (!text.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const lower = text.toLowerCase();

    const results = orders.filter((o) => {
      const address = o.deliveryAddress?.fullAddress?.toLowerCase() || "";
      const city = o.deliveryAddress?.city?.toLowerCase() || "";
      const orderNum = o.orderNumber?.toString() || "";
      const contact = o.contactNo || "";

      return (
        orderNum.includes(text) ||
        contact.includes(text) ||
        address.includes(lower) ||
        city.includes(lower)
      );
    });

    setFilteredOrders(results);
  };

  const renderOrderCard = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.rowBetween}>
        <Text style={styles.orderNumber}>Order #{item.orderNumber}</Text>

        <Text style={styles.statusBadge}>
          {item.deliveryAccepted ? "ASSIGNED" : "NEW"}
        </Text>
      </View>

      <Text style={styles.addressText}>
        {item.deliveryAddress?.fullAddress}
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
          <Text style={styles.title}>New Orders</Text>
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
      </View>

      {/* LIST */}
      <View style={{ paddingHorizontal: 15, flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="large" color={Color.DARK} />
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrderCard}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text>No new orders found</Text>
              </View>
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
