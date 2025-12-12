import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { api } from "../api/apiConfig";
import Color from "../constants/Color";

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({ password: "", confirm: "" });

  // States for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    let valid = true;
    const newErrors = { password: "", confirm: "" };

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (!confirm) {
      newErrors.confirm = "Confirm Password is required";
      valid = false;
    } else if (password && password !== confirm) {
      newErrors.confirm = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleReset = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await api.post("/auth/forgot/reset-password", { email, password });
      Alert.alert("Success", "Password reset! Please login.");
      navigation.replace("Login");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      {/* Password Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          placeholder="New Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors({ ...errors, password: "" });
          }}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye" : "eye-off"}
            size={22}
            color="#777"
          />
        </TouchableOpacity>
      </View>
      {errors.password ? (
        <Text style={styles.errorText}>{errors.password}</Text>
      ) : null}

      {/* Confirm Password Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showConfirm}
          placeholder="Confirm Password"
          value={confirm}
          onChangeText={(text) => {
            setConfirm(text);
            if (errors.confirm) setErrors({ ...errors, confirm: "" });
          }}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirm((prev) => !prev)}
        >
          <MaterialCommunityIcons
            name={showConfirm ? "eye" : "eye-off"}
            size={22}
            color="#777"
          />
        </TouchableOpacity>
      </View>
      {errors.confirm ? (
        <Text style={styles.errorText}>{errors.confirm}</Text>
      ) : null}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleReset}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading..." : "Reset Password →"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    color:"#222",
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
  inputContainer: {
    position: "relative",
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    paddingRight: 40, // space for eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  errorText: {
    color: "red",
    fontSize: 11,
    marginBottom: 5,
    marginLeft: 5,
    fontFamily: "Poppins-Regular",
  },
  button: {
    backgroundColor: Color.DARK,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },
});

export default ResetPasswordScreen;
