import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

const HotelProfileScreen = ({navigation}) => {
  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>My Account</Text>

      {/* PROFILE SECTION */}
      <View style={styles.profileRow}>
        <Image
          source={require("../../assets/biriyani.png")} // your hotel image
          style={styles.profileImage}
        />

        <View style={{ marginLeft: 12 }}>
          <Text style={styles.hotelName}>Food Junction</Text>

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#888" />
            <Text style={styles.locationText}>City Food Park</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Profile Edit")}>
            <Text style={styles.profileLink}>Restaurant Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DIVIDER */}
      <View style={styles.divider} />

      {/* MENU ITEMS */}
      <MenuItem label="Insights" icon="bar-chart" type="Feather" />
      <MenuItem label="Wallet" icon="wallet-outline" type="Ionicons" />
      <MenuItem label="My Reviews" icon="star-outline" type="Ionicons" />
      <MenuItem
        label="Authentication"
        icon="lock-closed-outline"
        type="Ionicons"
      />
      <MenuItem
        label="Terms & Conditions"
        icon="document-text-outline"
        type="Ionicons"
      />
      <MenuItem label="Support" icon="help-circle-outline" type="Ionicons" />

      {/* LOGOUT */}
      <MenuItem
        label="Logout"
        icon="log-out-outline"
        type="Ionicons"
        color="#D9534F"
      />
    </ScrollView>
  );
};

// ------------------ MENU COMPONENT ------------------

const MenuItem = ({ label, icon, type, color }) => {
  const IconComponent = type === "Feather" ? Feather : Ionicons;

  return (
    <TouchableOpacity style={styles.menuItem}>
      <IconComponent name={icon} size={22} color={color || "#444"} />
      <Text style={[styles.menuText, { color: color || "#000" }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// ------------------ STYLES ------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    marginBottom: 20,
    color: "#000",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  profileImage: {
    height: 70,
    width: 70,
    borderRadius: 10,
  },

  hotelName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },

  locationText: {
    marginLeft: 4,
    color: "#666",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
  },

  profileLink: {
    marginTop: 4,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#F4A609",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E2E2",
    marginVertical: 20,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },

  menuText: {
    fontSize: 16,
    marginLeft: 14,
    fontFamily: "Poppins-Medium",
  },
});

export default HotelProfileScreen;
