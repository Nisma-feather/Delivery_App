import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView ,
  Platform,
} from "react-native";
import { SafeAreaView} from "react-native-safe-area-context";
import Color from "../constants/Color";
import { styles } from "./SignUpScreen";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";
// You might need to install 'expo-checkbox' or use 'react-native-checkbox' or a custom component for the checkbox
// For simplicity, I'll use a basic state and a TouchableOpacity to represent the checkbox functionality and visual.
// In a real app, you'd use a dedicated CheckBox/Switch component.

// Icon imports (assuming you have a way to use icons like react-native-vector-icons)
// For this example, I'll use placeholder text/simple TouchableOpacity for icons.
// To truly match the UI, you'd need:
// - The Fork/Food logo image
// - Eye icon for password visibility (react-native-vector-icons 'Entypo' or 'Feather')
// - Facebook, Google, Apple logos (or react-native-vector-icons 'FontAwesome' or 'Ionicons')

// Placeholder for the logo image
const LOGO_URI = "https://via.placeholder.com/150/8BC34A/FFFFFF?text=Fork"; // Using a placeholder image URI

const { width } = Dimensions.get("window");

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState("");
  const {login} = useAuth();
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Helper component to represent the simple square checkbox
  const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.checkbox, checked && styles.checkboxChecked]}
    >
      {checked && <Text style={{ color: "white", fontSize: 10 }}>✓</Text>}
    </TouchableOpacity>
  );
const handleLogin = async () => {
  try {
    console.log("Login ");
    
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }

    const res = await api.post("/user/login", { email, password });
    console.log(res.data)
    if (res.data?.token && res.data?.user) {
      // ✅ Store in context + AsyncStorage
      await login(res.data.token, res.data.user.userId, res.data.user.role);

      alert("Login successful!");
      navigation.navigate("User Home");
    } else {
      alert("Invalid response from server");
    }
  } catch (error) {
    console.log("Login error:", error);
    alert(error.response?.data?.message || "Login failed. Try again.");
  }
};


  return (
    <View style={styles.fullScreenContainer}>
      {/* Top area - Light Green Background */}
      <View style={styles.topBackground} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}

          {/* Login Form Card */}
          <View style={styles.formCard}>
            {/* Email Input */}
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password Input */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {/* Placeholder for the eye icon */}
                <Text style={{ color: "#888", fontSize: 18 }}>
                  {isPasswordVisible ? "👁️" : "🔒"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Remember Me and Forgot Password */}
            <View style={styles.bottomRow}>
              <View style={styles.rememberMeContainer}>
                {/* Checkbox implementation */}
                <Checkbox
                  checked={rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                />
                <Text style={styles.rememberMeText}>Remember me</Text>
              </View>
              <TouchableOpacity
                onPress={() => console.log("Forgot Password Pressed")}
              >
                <Text style={styles.forgotPassword}>Forgot Password</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Or Login with Separator */}
            <View style={styles.separatorContainer}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>Or Login with</Text>
              <View style={styles.line} />
            </View>

            {/* Social Login Icons */}
            <View style={styles.socialContainer}>
              {/* Facebook Icon */}
              {/* <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}>f</Text>
            </TouchableOpacity> */}
              {/* Google Icon */}
              <TouchableOpacity style={styles.socialIcon}>
                <Image
                  source={require("../assets/google.png")}
                  style={{ width: 25, height: 25 }}
                />
                <Text style={{ fontFamily: "Inter-Regular", color: "#444" }}>
                  Login with Google
                </Text>
              </TouchableOpacity>
              {/* Apple Icon */}
              {/* <TouchableOpacity style={styles.socialIcon}>
              <Text style={styles.socialIconText}></Text>
            </TouchableOpacity> */}
            </View>
          </View>

          {/* Don't have an account? Sign in */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account?</Text>

            <TouchableOpacity onPress={()=>navigation.navigate('Signup')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};



export default LoginScreen;
