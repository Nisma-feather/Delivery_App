import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import Color from "../../constants/Color";
import { api } from "../../api/apiConfig";
import { useFocusEffect } from "@react-navigation/native";

const DeliveryPartnerManagementScreen = ({ navigation }) => {
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter partners by search
  const filteredPartners = partners.filter((p) =>
    p.userName.toLowerCase().includes(search.toLowerCase())
  );

  const fetchDeliveryPartners = async () => {
    try {
      setLoading(true);
      const res = await api.get("/delivery/partners");
      setPartners(res.data.partners);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to fetch delivery partners");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partnerId) => {
    Alert.alert(
      "Delete confirmation",
      "Are you sure you want to delete this delivery partner?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await api.delete(`/delivery/${partnerId}`);
              if (res.data.success) {
                Alert.alert("Deleted", "Delivery partner deleted successfully");
                fetchDeliveryPartners();
              }
            } catch (e) {
              console.log(e);
              Alert.alert("Error", "Failed to delete partner");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderPartner = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("Add New Partner", { ...item })}
    >
      <View>
        <Text style={styles.name}>{item.userName}</Text>
        <Text style={styles.subText}>📞 {item.mobile}</Text>
        <Text style={styles.subText}>✉ {item.email}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Add New Partner", { ...item })}
        >
          <Feather name="edit" size={18} color={Color.DARK} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginLeft: 14 }}
          onPress={() => handleDelete(item._id)}
        >
          <Feather name="trash-2" size={18} color={Color.DARK} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  useFocusEffect(
    useCallback(() => {
      fetchDeliveryPartners();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.topContainer}>
        <View style={styles.headingContainer}>
          <Text style={styles.title}>Delivery Partner Management</Text>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#444" />
          <TextInput
            style={styles.searchInput}
            value={search}
            placeholder="Search delivery partners..."
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* List */}
      <View style={{ flex: 1, padding: 15 }}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Color.DARK}
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={filteredPartners}
            keyExtractor={(item) => item._id}
            renderItem={renderPartner}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 130 }}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No delivery partners found.</Text>
            )}
          />
        )}
      </View>

      {/* Add Button (Floating) */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("Add New Partner")}
      >
        <MaterialIcons name="add" size={22} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DeliveryPartnerManagementScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  topContainer: { backgroundColor: "white", padding: 15, paddingBottom: 20 },
  headingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 18, fontFamily: "Poppins-SemiBold", color: "#000" },
  searchContainer: {
    marginTop: 12,
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
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 7,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: { fontSize: 15, fontFamily: "Poppins-SemiBold" },
  subText: { fontSize: 13, color: "#555", fontFamily: "Poppins-Regular" },
  actionsContainer: { flexDirection: "row", alignItems: "center" },
  addButton: {
    position: "absolute",
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: Color.DARK,
    borderRadius: 30,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
});
