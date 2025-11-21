import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image, // Import Image for the user avatar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Color from "../../constants/Color";
import { useAuth } from "../../context/AuthContext";

// --- Configuration Data ---
const userData = {
  name: "Jenny Wilson",
  editLabel: "Edit Account",
  avatarUri: "https://i.pravatar.cc/150?img=1", // Placeholder avatar
};

const settingsData = [
  // Icon Name, Color, Label
  {
    icon: "lock-closed-outline",

    label: "Change Password",
    key: "password",
  },
  {
    icon: "cart",
    label: "My Orders",
    key: "orders",
    path: "My Orders",
  },
  {
    icon: "notifications-outline",

    label: "Notifications",
    key: "notifications",
  },
  {
    icon: "location-outline",
    label: "Address",
    key: "address",
    path: "Address",
  },

  { icon: "help-circle-outline", label: "FAQ", key: "faq" },
  {
    icon: "chatbox-ellipses-outline",

    label: "Contact us",
    key: "contact",
  },
  {
    icon: "document-text-outline",

    label: "Terms & Conditions",
    key: "terms",
  },
];

// --- Custom Components ---

// Component for the colorful setting row
const ColorfulSettingRow = ({ iconName, iconColor, label, onPress }) => (
  <TouchableOpacity style={newStyles.rowContainer} onPress={onPress}>
    <View style={newStyles.rowLeft}>
      {/* Icon Circle Container */}
      <View
        style={[newStyles.iconCircle, { backgroundColor: Color.DARK }]}
      >
        <Ionicons name={iconName} size={22} color="#fff" style={{fontWeight:"bold"}}/>
      </View>
      <Text style={newStyles.label}>{label}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#888" />
  </TouchableOpacity>
);

// --- Main Component ---
const MainProfileScreen = ({navigation}) => {
  const {logout} = useAuth();

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    
  };

  const handleEditAccount = () => {
    console.log("Navigating to Edit Account...");
 
  };

  return (
    <SafeAreaView style={newStyles.container}>
      {/* Background Gradient Effect (Simulated) */}
      <View style={newStyles.gradientOverlay} />

      {/* Header */}
      <View style={newStyles.header}>
        <Ionicons name="chevron-back" size={28} color="#333" />
        <Text style={newStyles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40, 
        }}
      >
        {/* User Info Card */}
        <TouchableOpacity
          style={newStyles.userInfoCard}
          onPress={handleEditAccount}
        >
          <Image
            source={{ uri: userData.avatarUri }}
            style={newStyles.avatar}
          />
          <View style={newStyles.userInfoText}>
            <Text style={newStyles.userName}>{userData.name}</Text>
            <Text style={newStyles.editLabel}>{userData.editLabel}</Text>
          </View>
        </TouchableOpacity>

        {/* Settings List */}
        <View style={newStyles.settingsList}>
          {settingsData.map((item) => (
            <ColorfulSettingRow
              key={item.key}
              iconName={item.icon}
              iconColor={item.color}
              label={item.label}
              onPress={() => {
                if (item?.path) {
                  navigation.navigate(item.path);
                } else {
                  console.log("Navigation");
                }
              }}
            />
          ))}

          {/* Logout Row - styled slightly differently in the image */}
          <TouchableOpacity style={newStyles.logoutRow} onPress={handleLogout}>
            <View style={newStyles.rowLeft}>
              {/* Logout Icon Circle Container (similar style to others) */}
              <View
                style={[newStyles.iconCircle, { backgroundColor: "#FF634715" }]}
              >
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color="#FF6347"
                />
              </View>
              <Text style={newStyles.label}>Logout</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#888" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------- Styles (newStyles to clearly differentiate from your original) ----------
const newStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // White background
  },
  // Simulate the light gradient background shown in the image edges
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F7F7FD",
    opacity: 0.8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
  },
  // --- User Info Card ---
  userInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 20,
    elevation: 3, // Subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userInfoText: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  editLabel: {
    fontSize: 14,
    color: "#4A69FF", // Blue color for the link
    fontWeight: "500",
    marginTop: 2,
  },
  // --- Settings List ---
  settingsList: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginHorizontal: 10,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  logoutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginHorizontal: 10,
    marginTop: 5,
  },
});

export default MainProfileScreen;
