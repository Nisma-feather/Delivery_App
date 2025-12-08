import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Color from "../../constants/Color";
import { api } from "../../api/apiConfig";

const AddDeliveryPartnerScreen = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // PICK IMAGE
//   const pickImage = async () => {
//     let result = await ImagePicker.launchImageLibraryAsync({
//       base64: true,
//       allowsEditing: true,
//       quality: 0.7,
//     });

//     if (!result.canceled) {
//       const base64 = "data:image/jpeg;base64," + result.assets[0].base64;
//       setProfileImage(base64);
//     }
//   };

  // VALIDATION
  const validate = () => {
    const newErrors = {};

    if (!fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!mobile.trim()) newErrors.mobile = "Mobile Number is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;

    const data = {
      name: fullName,
      mobile,
      email,
      password,
      role: "delivery",
 
    };
 
    try {
      setLoading(true);
      await api.post("/hotel/create-delivery-partner", data);
      alert("Delivery Partner Added Successfully!");
      navigation.goBack();
    } catch (e) {
      console.log("Error:", e);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Delivery Partner</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Image */}
        {/* <View style={styles.imageWrap}>
          <TouchableOpacity onPress={pickImage}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Feather name="camera" size={28} color="#777" />
              </View>
            )}
          </TouchableOpacity>
        </View> */}

        {/* FORM */}
        <View style={styles.form}>
          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            placeholder="Enter full name"
            onChangeText={(text) => {
              setFullName(text);
              setErrors({ ...errors, fullName: "" });
            }}
          />
          {errors.fullName && (
            <Text style={styles.error}>{errors.fullName}</Text>
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
        style={styles.saveBtn}
        onPress={onSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <Text style={styles.saveText}>Create Delivery Partner</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
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
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  imageWrap: { alignItems: "center", marginTop: 20 },
  profileImage: { width: 110, height: 110, borderRadius: 60 },
  imagePlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 60,
    backgroundColor: "#EDEDED",
    justifyContent: "center",
    alignItems: "center",
  },
  form: { paddingHorizontal: 20, marginTop: 20 },
  label: {
    fontSize: 14,
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
    fontSize: 12,
    marginTop: 3,
    marginBottom: -5,
    fontFamily: "Poppins-Regular",
  },
  saveBtn: {
    backgroundColor: Color.DARK,
    padding: 18,
    alignItems: "center",
  },
  saveText: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: "#000",
  },
});
