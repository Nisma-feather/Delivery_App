import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Color from "../constants/Color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../api/apiConfig";

const { width } = Dimensions.get("window");

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.checkbox, checked && styles.checkboxChecked]}
    >
      {checked && <Text style={{ color: "white", fontSize: 10 }}>✓</Text>}
    </TouchableOpacity>
  );

  // ✨ Validation logic
  const validate = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Enter a valid email address";

    // Username validation
    if (!userName.trim()) newErrors.userName = "Username is required";
    else if (userName.trim().length < 3)
      newErrors.userName = "Username must be at least 3 characters";

    // Password validation
    if (!password.trim()) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    // Confirm password validation
    if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";

    // Privacy policy validation
    if (!rememberMe) newErrors.policy = "You must agree to the Privacy Policy";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // ✅ Returns true if no errors
  };

 const handleSignUp = async () => {
   if (!validate()) return;

   try {
     console.log("user data exists")
     const res = await api.post("/user/exists-user", { email });

     if (res.status === 200) {
       console.log("✅ Email available, proceeding to verification...");
       navigation.navigate("Email Verification", { email, password, userName });
     }
   } catch (error) {
     if (error.response?.status === 409) {
       Alert.alert("Email already exists","Login to continue",[{
        text:"Ok",
        onPress: ()=>navigation.navigate("Login")
       }]);
     } else {
       console.error("Error checking email:", error);
       Alert.alert("Error", "Unable to verify email. Please try again later.");
     }
   }
 };


  return (
    <View style={styles.fullScreenContainer}>
      <View style={styles.topBackground} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollStyle}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            {/* Email */}
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, errors.email && { borderColor: "red" }]}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Username */}
            <Text style={styles.label}>User Name</Text>
            <TextInput
              style={[styles.input, errors.userName && { borderColor: "red" }]}
              placeholder="Enter your name"
              value={userName}
              onChangeText={setUserName}
            />
            {errors.userName && (
              <Text style={styles.errorText}>{errors.userName}</Text>
            )}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View
              style={[
                styles.passwordContainer,
                errors.password && { borderColor: "red" },
              ]}
            >
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
                <MaterialCommunityIcons
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  color="#777"
                  size={24}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View
              style={[
                styles.passwordContainer,
                errors.confirmPassword && { borderColor: "red" },
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                secureTextEntry={!isPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <MaterialCommunityIcons
                  name={isPasswordVisible ? "eye" : "eye-off"}
                  color="#777"
                  size={24}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}

            {/* Privacy Policy */}
            <View style={styles.bottomRow}>
              <View style={styles.rememberMeContainer}>
                <Checkbox
                  checked={rememberMe}
                  onPress={() => setRememberMe(!rememberMe)}
                />
                <Text style={styles.rememberMeText}>
                  I read and agree{" "}
                  <Text style={{ color: Color.DARK, fontFamily: "Inter-Bold" }}>
                    Privacy Policy
                  </Text>
                </Text>
              </View>
            </View>
            {errors.policy && <Text style={styles.errorText}>{errors.policy}</Text>}

            {/* Sign Up Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleSignUp}>
              <Text style={styles.loginButtonText}>Sign Up</Text>
            </TouchableOpacity>

            {/* Social Signup */}
            <View style={styles.separatorContainer}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>Or Signup with</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialIcon}>
                <Image
                  source={require("../assets/google.png")}
                  style={{ width: 25, height: 25 }}
                />
                <Text style={{ fontFamily: "Inter-Regular", color: "#444" }}>
                  Sign Up with Google
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};


export const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  topBackground: {
    height: "25%",
    backgroundColor: Color.DARK,
  },
  safeArea: {
    flex: 1,
  },
  scrollStyle: {
    paddingHorizontal: 25,
    zIndex: 1,
    alignItems: "center",
  },
  logoContainer: {
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  formCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: "Inter-Bold",
    color: "#333",
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    height: 50,
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    backgroundColor: "white",
    fontFamily: "Inter-Regular",
    fontSize: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderColor: "#eee",
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: "white",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
    position: "absolute",
    right: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Color.DARK,
    borderColor: Color.DARK,
  },
  rememberMeText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Inter-Regular",
  },
  loginButton: {
    backgroundColor: Color.DARK,
    padding: 12,
    borderRadius: 30,
    marginTop: 30,
    alignItems: "center",
  },
  loginButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: "Inter-Bold",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  separatorText: {
    width: 120,
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialIcon: {
    width: "100%",
    height: 50,
    gap: 10,
    borderRadius: 25,
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  signUpContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingBottom: 20,
    alignSelf: "center",
  },
  signUpText: {
    color: "#555",
    fontFamily: "Inter-Medium",
  },
  signInLink: {
    color: Color.DARK,
    fontFamily: "Inter-Bold",
    fontSize: 15,
    marginLeft: 5,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 4,
    fontFamily: "Inter-Regular",
  },
});

export default SignUpScreen;
