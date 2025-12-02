import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditHotelProfile = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [contact, setContact] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");

  const [showOpenPicker, setShowOpenPicker] = useState(false);
  const [showClosePicker, setShowClosePicker] = useState(false);

  // Error states
  const [errors, setErrors] = useState({});

  // PICK IMAGE
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const base64 = "data:image/jpeg;base64," + result.assets[0].base64;
      setProfileImage(base64);
    }
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    return `${hours}:${minutes} ${ampm}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!restaurantName.trim())
      newErrors.restaurantName = "Restaurant Name is required";
    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!stateName.trim()) newErrors.stateName = "State is required";
    if (!pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!contact.trim()) newErrors.contact = "Contact Number is required";
    if (!openingTime.trim()) newErrors.openingTime = "Opening Time is required";
    if (!closingTime.trim()) newErrors.closingTime = "Closing Time is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const onSave = () => {
    if (!validate()) return;

    const data = {
      restaurantName,
      address,
      city,
      stateName,
      pincode,
      contact,
      openingTime,
      closingTime,
      profileImage,
    };

    console.log("Saved Data:", data);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Image */}
        <View style={styles.imageWrap}>
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
        </View>

        {/* Inputs */}
        <View style={styles.form}>
          {/* Restaurant Name */}
          <Text style={styles.label}>Restaurant Name</Text>
          <TextInput
            style={styles.input}
            value={restaurantName}
            placeholder="Enter restaurant name"
            onChangeText={setRestaurantName}
          />
          {errors.restaurantName && (
            <Text style={styles.error}>{errors.restaurantName}</Text>
          )}

          {/* Address */}
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            placeholder="Street / Area"
            onChangeText={setAddress}
          />
          {errors.address && <Text style={styles.error}>{errors.address}</Text>}

          {/* City */}
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            placeholder="Ex: Chennai"
            onChangeText={setCity}
          />
          {errors.city && <Text style={styles.error}>{errors.city}</Text>}

          {/* State */}
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={stateName}
            placeholder="Ex: Tamil Nadu"
            onChangeText={setStateName}
          />
          {errors.stateName && (
            <Text style={styles.error}>{errors.stateName}</Text>
          )}

          {/* Pincode */}
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            value={pincode}
            keyboardType="number-pad"
            placeholder="Ex: 600001"
            onChangeText={setPincode}
          />
          {errors.pincode && <Text style={styles.error}>{errors.pincode}</Text>}

          {/* Contact */}
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={styles.input}
            value={contact}
            keyboardType="phone-pad"
            placeholder="Restaurant phone number"
            onChangeText={setContact}
          />
          {errors.contact && <Text style={styles.error}>{errors.contact}</Text>}

          {/* Opening Time */}
          <Text style={styles.label}>Opening Time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowOpenPicker(true)}
          >
            <Text>{openingTime || "Select Opening Time"}</Text>
          </TouchableOpacity>
          {errors.openingTime && (
            <Text style={styles.error}>{errors.openingTime}</Text>
          )}
          {showOpenPicker && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              onChange={(event, selected) => {
                setShowOpenPicker(false);
                if (selected) setOpeningTime(formatTime(selected));
              }}
            />
          )}

          {/* Closing Time */}
          <Text style={styles.label}>Closing Time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowClosePicker(true)}
          >
            <Text>{closingTime || "Select Closing Time"}</Text>
          </TouchableOpacity>
          {errors.closingTime && (
            <Text style={styles.error}>{errors.closingTime}</Text>
          )}
          {showClosePicker && (
            <DateTimePicker
              mode="time"
              value={new Date()}
              onChange={(event, selected) => {
                setShowClosePicker(false);
                if (selected) setClosingTime(formatTime(selected));
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditHotelProfile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F8F8" },
  header: {
    flexDirection: "row",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    elevation: 1,
  },
  headerTitle: { fontSize: 18, fontFamily: "Poppins-SemiBold" },
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
    color: "#444",
    fontFamily: "Poppins-Medium",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    fontFamily: "Poppins-Regular",
  },
  saveBtn: { backgroundColor: "#F6A725", padding: 18, alignItems: "center" },
  saveText: { fontSize: 16, fontFamily: "Poppins-Bold", color: "#000" },
  error: { color: "red", fontSize: 12, marginTop: 3, marginBottom: -5 },
});
