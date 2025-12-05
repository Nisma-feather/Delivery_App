import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { api } from "../api/apiConfig";
import Color from "../constants/Color";

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleReset = async () => {
    if (!password || !confirm) return Alert.alert("Error", "All fields required");
    if (password !== confirm) return Alert.alert("Error", "Passwords do not match");

    try {
      await api.post("/auth/forgot/reset-password", { email, password });
      Alert.alert("Success", "Password reset! Please login.");
      navigation.navigate("Login");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to reset password");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="New Password"
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Confirm Password"
        value={confirm}
        onChangeText={setConfirm}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Password →</Text>
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
    fontSize: 20,
  
    marginBottom: 30,
    textAlign: "center",
    fontFamily: "Poppins-Bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginVertical: 8,
    fontFamily: "Poppins-Regular",
  },
  button: {
    backgroundColor: Color.DARK,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    
    fontFamily: "Poppins-SemiBold",
  },
});
export default ResetPasswordScreen;
