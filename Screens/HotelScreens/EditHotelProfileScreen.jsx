import React, { useEffect, useState } from "react";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { api } from "../../api/apiConfig";

const EditHotelProfile = ({ navigation }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [contact, setContact] = useState("");
  const [loading,setLoading] = useState(false);
  const [updating,setUpdating] = useState(false);
  // Store Date objects directly
  const [openingTime, setOpeningTime] = useState(null);
  const [closingTime, setClosingTime] = useState(null);

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

  // Format Date for display only
  const formatTimeForDisplay = (date) => {
    if (!date) return "Select Time";

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
    if (!street.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!stateName.trim()) newErrors.stateName = "State is required";
    if (!pincode.trim()) newErrors.pincode = "Pincode is required";
    if (!contact.trim()) newErrors.contact = "Contact Number is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;

    const data = {
      email: "admin@gmail.com",
      restaurantName,
      address: {
        street,
        city,
        stateName,
        pincode,
      },
      contact,
      openingTime: openingTime.toISOString(), // Send ISO string to backend
      closingTime: closingTime.toISOString(), // Send ISO string to backend
      profileImage,
    };

    console.log("Saved Data:", data);

    try {
      // Send to backend - backend will convert ISO string to Date
      setUpdating(true)
      await api.put("/hotel/profile", data);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving data:", error);
    }
    finally{
      setUpdating(false)
    }
  };

  const getHotelData = async () => {
    try {
      const res = await api.get("/hotel");
      console.log("Hotel data:", res.data.restaurantData);

      const data = res.data.restaurantData;

      // Set all fields
      setRestaurantName(data.restaurantName || "");
      setStreet(data.address?.street || "");
      setCity(data.address?.city || "");
      setStateName(data.address?.stateName || "");
      setPincode(data.address?.pincode || "");
      setContact(data.contact || "");
      setProfileImage(data.profileImage || null);

      // Backend now returns Date objects or ISO strings
      if (data.openingTime) {
        // If it's already a Date object
        const openingDate = new Date(data.openingTime);
        setOpeningTime(openingDate);
      }

      if (data.closingTime) {
        // If it's already a Date object
        const closingDate = new Date(data.closingTime);
        setClosingTime(closingDate);
      }
    } catch (e) {
      console.log("Error fetching hotel data:", e);
    }
  };

  useEffect(() => {
    getHotelData();
  }, []);

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
           value={street}
           placeholder="Street / Area"
           onChangeText={setStreet}
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
           <Text>{formatTimeForDisplay(openingTime)}</Text>
         </TouchableOpacity>
         {errors.openingTime && (
           <Text style={styles.error}>{errors.openingTime}</Text>
         )}
         {showOpenPicker && (
           <DateTimePicker
             mode="time"
             value={openingTime || new Date()}
             onChange={(event, selected) => {
               setShowOpenPicker(false);
               if (selected) setOpeningTime(selected);
             }}
           />
         )}

         {/* Closing Time */}
         <Text style={styles.label}>Closing Time</Text>
         <TouchableOpacity
           style={styles.input}
           onPress={() => setShowClosePicker(true)}
         >
           <Text>{formatTimeForDisplay(closingTime)}</Text>
         </TouchableOpacity>
         {errors.closingTime && (
           <Text style={styles.error}>{errors.closingTime}</Text>
         )}
         {showClosePicker && (
           <DateTimePicker
             mode="time"
             value={closingTime || new Date()}
             onChange={(event, selected) => {
               setShowClosePicker(false);
               if (selected) setClosingTime(selected);
             }}
           />
         )}
       </View>
     </ScrollView>

     {/* Save Button */}
     <TouchableOpacity
       style={styles.saveBtn}
       onPress={onSave}
       disabled={updating}
     >
       {updating ? (
         <ActivityIndicator size="small" />
       ) : (
         <Text style={styles.saveText}>Save Changes</Text>
       )}
     </TouchableOpacity>
   </SafeAreaView>
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
