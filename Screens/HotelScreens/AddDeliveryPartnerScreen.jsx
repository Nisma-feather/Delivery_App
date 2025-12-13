import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Color from "../../constants/Color";
import { api } from "../../api/apiConfig";


const AddDeliveryPartnerScreen = ({ navigation, route }) => {
  const [partnerId, setPartnerId] = useState(null);
  const [userName, setUserName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ---------- PREFILL WHEN EDITING ----------
  useEffect(() => {
    if (route?.params) {
      setPartnerId(route?.params?._id || null);
      setUserName(route?.params?.userName || "");
      setEmail(route?.params?.email || "");
      setMobile(route?.params?.mobile || "");

      // Plain password returned from backend
      setPassword(route?.params?.plainPassword || "");
    }
  }, [route?.params]);

  const validate = () => {
    const newErrors = {};

    if (!userName.trim()) newErrors.userName = "Full Name is required";
    if (!mobile.trim()) newErrors.mobile = "Mobile Number is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- CREATE OR UPDATE ----------
  const onSave = async () => {
    if (!validate()) return;

    const data = {
      userName,
      mobile,
      email,
      password,
      role: "delivery",
    };

    try {
      setLoading(true);

      if (partnerId) {
        // UPDATE
        await api.put(`/delivery/partner/${partnerId}`, data);
        alert("Delivery Partner Updated Successfully!");
      } else {
        // CREATE
        await api.post("/delivery/partner", data);
        alert("Delivery Partner Added Successfully!");
      }

      navigation.goBack();
    } catch (e) {
      console.log("Error:", e);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {partnerId ? "Edit Delivery Partner" : "Add Delivery Partner"}
          </Text>

          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={userName}
            placeholder="Enter full name"
            onChangeText={(text) => {
              setUserName(text);
              setErrors({ ...errors, userName: "" });
            }}
          />
          {errors.userName && (
            <Text style={styles.error}>{errors.userName}</Text>
          )}

          {/* Mobile */}
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            style={styles.input}
            value={mobile}
            keyboardType="phone-pad"
            placeholder="Enter phone number"
            onChangeText={(text) => {
              setMobile(text);
              setErrors({ ...errors, mobile: "" });
            }}
          />
          {errors.mobile && <Text style={styles.error}>{errors.mobile}</Text>}

          {/* Email */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            placeholder="Enter email"
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: "" });
            }}
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              value={password}
              placeholder="Enter password"
              secureTextEntry={!showPassword}
              onChangeText={(text) => {
                setPassword(text);
                setErrors({ ...errors, password: "" });
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#555"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.error}>{errors.password}</Text>
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, loading && {opacity:0.7}]}
        onPress={onSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.saveText}>
            {partnerId ? "Update Delivery Partner" : "Create Delivery Partner"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AddDeliveryPartnerScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    elevation: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },

  form: { paddingHorizontal: 20, marginTop: 20 },

  label: {
    fontSize: 13,
    marginTop: 12,
    marginBottom: 5,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontFamily: "Poppins-Regular",
    fontSize:12
  },

  passwordContainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  eyeIcon: { paddingHorizontal: 4 },

  error: {
    color: "red",
    fontSize: 11,
    marginTop: 3,
    fontFamily: "Poppins-Regular",
  },

  saveBtn: {
    backgroundColor: Color.DARK,
    padding: 15,
    alignItems: "center",
  },

  saveText: {
    fontSize: 13.5,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
});
