import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api/apiConfig";
import { useFocusEffect } from "@react-navigation/native";
import Color from "../../constants/Color";

// Custom Component for Menu Items
const MenuItem = ({ label, icon, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color={color || "#444"} />
      <Text style={[styles.menuText, { color: color || "#000" }]}>{label}</Text>
    </TouchableOpacity>
  );
};

// Main Component
const DeliveryProfileScreen = ({ navigation }) => {
  const { logout, auth } = useAuth();
  const [userData, setUserData] = useState({
    userName: "",
    email: "",
    mobile: ""
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: () => logout() },
    ]);
  };

  const fetchUserData = async () => {
    if (!auth?.userId) {
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get(`/user/${auth.userId}`);
      if (res.data?.user) {
        setUserData({
          userName: res.data.user.userName || "User",
          email: res.data.user.email || "",
          mobile: res.data.user.mobile || ""
        });
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Use useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Profile screen focused, fetching data...");
      setLoading(true);
      fetchUserData();

      // Cleanup function (optional)
      return () => {
        console.log("Profile screen unfocused");
      };
    }, [auth?.userId]) // Dependency on userId
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.DARK} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Text style={styles.title}>My Account</Text>

        {/* PROFILE SECTION */}
        <View style={styles.profileRow}>
          <View style={styles.imageWrapper}>
            <View style={styles.profileIconContainer}>
              <Ionicons name="person" size={30} color="#666" />
            </View>
          </View>

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.userName}>{userData.userName}</Text>
            <Text style={styles.profileLink}>{userData?.mobile}</Text>
          </View>
        </View>

        {/* DIVIDER */}
        <View style={styles.divider} />

        {/* LOGOUT */}
        <MenuItem
          label="Logout"
          icon="log-out-outline"
          color="#D9534F"
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins-Regular",
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
  imageWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userName: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
  profileLink: {
    marginTop: 4,
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: Color.DARK,
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

export default DeliveryProfileScreen;