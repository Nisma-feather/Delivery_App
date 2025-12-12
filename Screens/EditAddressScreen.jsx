import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";
import Color from "../constants/Color";

const EditAddressScreen = ({ navigation,route }) => {
  const { auth } = useAuth();
  const {selectedItems} =route?.params
  const [addresses, setAddresses] = useState([]);
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState("");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(null);

  const [formData, setFormData] = useState({
    fullAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
  });

  // Fetch addresses
  const fetchAddress = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user/${auth.userId}`);
      const addrList = res.data?.user?.address || [];

      setAddresses(addrList);

      // Auto-select the chosen address from DB
      const chosen = addrList.find((a) => a.chosen === true);
      if (chosen) setSelectedAddress(chosen._id);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, []);

  // Validation
  const validate = () => {
    let valid = true;
    let newErrors = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        valid = false;
        newErrors[key] = "This field is required";
      }
    });

    setErrors(newErrors);
    return valid;
  };

  // Add or Update address
  const handleAddAddress = async () => {
    try {
      if (!validate()) return;
      setActionLoading(true);

      if (editId) {
        await api.put(
          `/user/update-address/${auth.userId}/${editId}`,
          formData
        );
        setEditId("");
      } else {
        await api.post(`/user/add-address/${auth.userId}`, formData);
      }

      setFormData({
        fullAddress: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
      });

      setModalVisible(false);
      fetchAddress();
    } catch (e) {
      console.log(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm delete
  const confirmDelete = (addressId) => {
    Alert.alert(
      "Delete Address?",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => handleDeleteAddress(addressId) },
      ]
    );
  };

  const handleDeleteAddress = async (id) => {
    try {
      setActionLoading(true);
      await api.delete(`/user/delete-address/${auth.userId}/${id}`);
      fetchAddress();
    } catch (e) {
      console.log(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Choose address (only one)
  const handleChoosenAddress = async () => {
    try {
      if (!selectedAddress) return;

      await api.put(`/user/choose-address/${auth.userId}/${selectedAddress}`);

      navigation.navigate("CheckoutScreen",{selectedItems});
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Addresses</Text>

      {loading ? (
        <ActivityIndicator size="large" color={Color.DARK} />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.addressCard}
              onPress={() => setSelectedAddress(item._id)}
            >
              <Ionicons
                name={
                  selectedAddress === item._id ? "checkbox" : "square-outline"
                }
                size={26}
                color={selectedAddress === item._id ? Color.DARK : "#555"}
              />

              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.addrText}>{item.fullAddress}</Text>
                <Text style={styles.addrSub}>
                  {item.city}, {item.state} - {item.pincode}
                </Text>
                <Text style={styles.addrSub}>{item.country}</Text>

                <View style={{ flexDirection: "row", gap: 20, marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setEditId(item._id);
                      setFormData(item);
                      setModalVisible(true);
                    }}
                    style={styles.editBtn}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                      Edit
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => confirmDelete(item._id)}
                    style={styles.deleteBtn}
                  >
                    <Text style={{ color: "#333", fontWeight: "bold" }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Continue */}
      <TouchableOpacity
        style={[
          styles.continueBtn,
          { backgroundColor: selectedAddress ? "#000" : "#ccc" },
        ]}
        disabled={!selectedAddress}
        onPress={handleChoosenAddress}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

      {/* Add Address */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Add Address</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalHeader}>
              {editId ? "Update Address" : "Add New Address"}
            </Text>

            {["fullAddress", "city", "state", "pincode", "country"].map(
              (field) => (
                <View key={field}>
                  <TextInput
                    placeholder={field.replace(/^\w/, (c) => c.toUpperCase())}
                    style={styles.input}
                    value={formData[field]}
                    onChangeText={(text) => {
                      setFormData({ ...formData, [field]: text });
                      setErrors({ ...errors, [field]: "" });
                    }}
                  />
                  {errors[field] && (
                    <Text style={styles.errorText}>{errors[field]}</Text>
                  )}
                </View>
              )
            )}

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleAddAddress}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {editId ? "Update Address" : "Save Address"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => {
                setModalVisible(false);
                setEditId("");
                setFormData({
                  fullAddress: "",
                  city: "",
                  state: "",
                  pincode: "",
                  country: "",
                });
                setErrors({});
              }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditAddressScreen;

// -----------------------------------------------------------
//                       STYLES
// -----------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },

  header: {
    fontSize: 16,
    COLOR:"#222",
    fontFamily: "Poppins-SemiBold",
    marginVertical: 20,
  },

  addressCard: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },

  addrText: {
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    lineHeight: 18,
  },

  addrSub: {
    fontSize: 12,
    color: "#555",
    fontFamily: "Poppins-Regular",
    marginTop: 2,
  },

  editBtn: {
    backgroundColor: "#000",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },

  deleteBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  deleteBtnText: {
    color: "#666",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },

  addBtn: {
    backgroundColor: Color.DARK,
    padding: 10,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 8,
  },

  continueBtn: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: Color.DARK,
  },
  continueText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "90%",
  },

  modalHeader: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },

  inputLabel: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    marginBottom: 6,
    color: "#333",
  },

  errorText: {
    color: "red",
    marginBottom: 10,
    fontSize: 11,
    fontFamily: "Poppins-Regular",
  },

  saveBtn: {
    backgroundColor: Color.DARK,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },

  cancelBtn: {
    marginTop: 10,
  },
  cancelBtnText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "red",
  },

  // Additional styles for better UI
  addressContainer: {
    flex: 1,
    marginLeft: 12,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },

  modalScrollView: {
    maxHeight: 400,
  },

  // Optional: Add some helper text styles
  helperText: {
    fontSize: 11,
    color: "#777",
    fontFamily: "Poppins-Regular",
    marginTop: 4,
  },

  // Optional: Add selected address indicator
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Color.DARK,
    marginRight: 8,
  },
});