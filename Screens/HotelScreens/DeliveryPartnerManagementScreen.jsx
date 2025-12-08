import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import Color from "../../constants/Color";
import { api } from "../../api/apiConfig";

const DeliveryPartnerManagementScreen = ({ navigation }) => {
  const [partners, setPartners] = useState([
    {
      _id: "1",
      userName: "Ramesh Kumar",
      mobile: "9876543210",
      email: "ramesh@example.com",
    },
    {
      _id: "2",
      userName: "Suresh Singh",
      mobile: "9123456780",
      email: "suresh@example.com",
    },
  ]);

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newPartner, setNewPartner] = useState({
    userName: "",
    mobile: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [updateId, setUpdateId] = useState(null);

  // Filter partners by search
  const filteredPartners = partners.filter((p) =>
    p.userName.toLowerCase().includes(search.toLowerCase())
  );

  // Add new partner
  const handleAddPartner = () => {
    if (!newPartner.userName.trim() || !newPartner.mobile.trim()) {
      setError("userName and Mobile Number are required");
      return;
    }

    const newEntry = {
      _id: Math.random().toString(),
      ...newPartner,
    };

    setPartners([...partners, newEntry]);
    closeModal();
  };

  // Update partner
  const handleUpdatePartner = () => {
    const updatedList = partners.map((p) =>
      p._id === updateId ? { ...p, ...newPartner } : p
    );

    setPartners(updatedList);
    closeModal();
  };

  // Delete partner
  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this delivery partner?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK",
          onPress: () => setPartners(partners.filter((p) => p._id !== id)),
        },
      ]
    );
  };

  const openModalForAdd = () => {
    setNewPartner({ userName: "", mobile: "", email: "" });
    setUpdateId(null);
    setError("");
    setModalVisible(true);
  };

  const openModalForEdit = (item) => {
    setUpdateId(item._id);
    setNewPartner({
      userName: item.userName,
      mobile: item.mobile,
      email: item.email,
    });
    setError("");
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewPartner({ userName: "", mobile: "", email: "" });
    setError("");
    setUpdateId(null);
  };

  // Render each delivery partner row
  const renderPartner = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.userName}</Text>
        <Text style={styles.subText}>📞 {item.mobile}</Text>
        <Text style={styles.subText}>✉ {item.email}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => openModalForEdit(item)}>
          <Feather name="edit" size={18} color={Color.DARK} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginLeft: 14 }}
          onPress={() => handleDelete(item._id)}
        >
          <Feather name="trash-2" size={18} color={Color.DARK} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const fetchDeliveryPartners=async()=>{
    try{
     const res = await api.get("/hotel/delivery-partner");
     console.log("delivery",res.data);
     setPartners(res.data.partners)
    }
    catch(e){
      console.log(e);
    }
  }

  useEffect(()=>{
   fetchDeliveryPartners()
  },[])

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
      <View style={{ padding: 15 }}>
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
      </View>

      {/* Add Button (Floating) */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("Add New Partner")}
      >
        <MaterialIcons name="add" size={22} color="white" />
      </TouchableOpacity>

      {/* Add / Update Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.bottomOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeModal} />

          <View style={styles.bottomSheet}>
            <Text style={styles.modalTitle}>
              {updateId ? "Update Delivery Partner" : "Add Delivery Partner"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newPartner.name}
              onChangeText={(text) => {
                setNewPartner({ ...newPartner, name: text });
                if (error) setError("");
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Mobile Number"
              keyboardType="numeric"
              value={newPartner.mobile}
              onChangeText={(text) => {
                setNewPartner({ ...newPartner, mobile: text });
                if (error) setError("");
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Email (optional)"
              value={newPartner.email}
              onChangeText={(text) =>
                setNewPartner({ ...newPartner, email: text })
              }
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={updateId ? handleUpdatePartner : handleAddPartner}
              >
                <Text style={styles.confirmButtonText}>
                  {updateId ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },

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

  name: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
  },

  subText: {
    fontSize: 13,
    color: "#555",
    fontFamily: "Poppins-Regular",
  },

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

  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    height: "55%",
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },

  modalTitle: {
    fontSize: 17,
    marginBottom: 20,
    fontFamily: "Poppins-Bold",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 9,
    marginBottom: 15,
    fontFamily: "Poppins-Regular",
  },

  errorText: {
    color: "red",
    fontFamily: "Poppins-Regular",
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: 15,
  },

  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },

  confirmButton: {
    backgroundColor: Color.DARK,
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
  },

  cancelButtonText: {
    textAlign: "center",
    color: "#333",
    fontSize: 15,
    fontFamily: "Poppins-Bold",
  },

  confirmButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 15,
    fontFamily: "Poppins-Bold",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
});
