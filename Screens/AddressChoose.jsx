import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/apiConfig";

// ================= ITEMS =================
const ItemsChosen = ({ items }) => {
  return (
    <View style={itemsStyles.itemsContainer}>
      <Text style={styles.sectionTitle}>Your Items</Text>

      {items.map((item) => (
        <View key={item._id} style={itemsStyles.itemRow}>
          <View style={itemsStyles.imagePlaceholder}>
            <Text style={itemsStyles.imageText}>Img</Text>
          </View>

          <View style={itemsStyles.infoContainer}>
            <Text style={itemsStyles.itemName} numberOfLines={1}>
              {item.foodItem?.name}
            </Text>
            <Text style={itemsStyles.itemQuantity}>Qty: {item.quantity}</Text>
          </View>

          <Text style={itemsStyles.itemPrice}>₹{item.totalPrice}</Text>
        </View>
      ))}
    </View>
  );
};

// ================= MAIN SCREEN =================
const AddressChoose = ({ navigation, route }) => {
  const { selectedItems } = route?.params;
  const { auth } = useAuth();

  const [address, setAddress] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phone, setPhone] = useState(auth?.phone || auth?.userPhone);

  const updatePhone = async () => {
    try {
      
      setIsEditingPhone(false);
    } catch (error) {
      console.log("Phone Update Error:", error);
    }
  };

  

  const fetchItemsfromCart = async () => {
    try {
      const res = await api.post(`/cart/get-items/${auth.userId}`, {
        selectedItems,
      });
      const fetchedItems = res.data?.checkoutItems || [];
      setCheckoutItems(fetchedItems);
      calculateTotal(fetchedItems);
    } catch (e) {
      console.log("Fetch Cart Err:", e);
    }
  };

  useEffect(() => {
    if (selectedItems?.length > 0) fetchItemsfromCart();
  }, [selectedItems]);

  const calculateTotal = (items) => {
    let base = items.reduce((sum, i) => sum + i.totalPrice, 0);

    setTotalAmount(base);
  };

  const fetchChoosedAddress = async () => {
    try {
      const res = await api.get(`/user/${auth.userId}`);
      const addresses = res?.data?.user?.address || [];
      const selected = addresses.find((a) => a.chosen === true);
      setAddress(selected || null);
    } catch (e) {
      console.log("Address Fetch Err:", e);
    }
  };

  useEffect(() => {
    fetchChoosedAddress();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* TOP FIXED SECTION → Address + Phone */}
        <View>
          <View style={styles.whiteBox}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>

            <TouchableOpacity
              style={styles.addressCard}
              onPress={() =>
                navigation.navigate("Choose Address", { selectedItems })
              }
            >
              <MaterialCommunityIcons
                name="map-marker-radius"
                size={24}
                color="#6e6e6e"
              />

              <View style={styles.addressTextContainer}>
                {address ? (
                  <>
                    <Text style={styles.addrText}>
                      {address.fullAddress}, {address.city}, {address.state} -{" "}
                      {address.pincode}
                    </Text>
                    <Text style={styles.addrSub}>{address.country}</Text>
                  </>
                ) : (
                  <Text>Select Address</Text>
                )}
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#6e6e6e"
              />
            </TouchableOpacity>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
              Contact Number
            </Text>

            <View style={styles.phoneCard}>
              <MaterialCommunityIcons name="phone" size={22} color="#6e6e6e" />

              {isEditingPhone ? (
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  keyboardType="number-pad"
                  maxLength={10}
                  onChangeText={(text) => setPhone(text)}
                />
              ) : (
                <Text style={styles.phoneText}>{phone}</Text>
              )}

              <TouchableOpacity
                onPress={() => {
                  if (isEditingPhone) updatePhone();
                  else setIsEditingPhone(true);
                }}
              >
                <Text style={styles.changeText}>
                  {isEditingPhone ? "Save" : "Change"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SCROLLABLE MIDDLE SECTION */}
        <View style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ItemsChosen items={checkoutItems} />

            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Order Summary</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Items Total</Text>
                <Text style={styles.detailValue}>₹{totalAmount}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Delivery</Text>
                <Text style={styles.detailValue}>₹40</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Packing</Text>
                <Text style={styles.detailValue}>₹10</Text>
              </View>

              <View style={styles.divider} />

              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{totalAmount + 50}</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* FIXED BUTTON */}
        <TouchableOpacity
          style={styles.payNowButton}
          onPress={() =>
            navigation.navigate("Payment Method", {
              deliveryAddress: address,
              checkoutItems,
              contactNo: phone,
            })
          }
        >
          <Text style={styles.payNowText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ================= STYLES =================
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5f5f5" },
  container: { flex: 1, paddingHorizontal: 20 },

  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },

  whiteBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 25,
  },

  addressCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  addressTextContainer: { flex: 1, marginLeft: 15 },
  addrText: { fontSize: 14, fontWeight: "600" },
  addrSub: { fontSize: 12, color: "#666" },

  phoneCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
  },

  phoneText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "600",
  },

  phoneInput: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 2,
  },

  changeText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "600",
  },

  summarySection: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 120,
  },

  detailRow: { flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { fontSize: 14, color: "#777" },
  detailValue: { fontSize: 14, fontWeight: "500" },

  divider: { height: 1, backgroundColor: "#eee", marginVertical: 10 },

  totalRow: { marginTop: 10 },
  totalLabel: { fontSize: 16, fontWeight: "bold" },
  totalValue: { fontSize: 20, fontWeight: "bold", color: "black" },

  payNowButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "black",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  payNowText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

// Items styles
const itemsStyles = StyleSheet.create({
  itemsContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 25,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: "#eee",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  imageText: { fontSize: 10, color: "#999" },
  infoContainer: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600" },
  itemQuantity: { fontSize: 12, color: "#777" },
  itemPrice: { fontSize: 14, fontWeight: "bold" },
});

export default AddressChoose;
