import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { api } from "../api/apiConfig";
import Color from "../constants/Color";
import { SafeAreaView } from "react-native-safe-area-context";

const ForgotOTPVerification = ({ navigation, route }) => {
  const { email } = route.params;
  const [verifying,setVerifying] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 5) {
      return Alert.alert("Error", "Please enter full OTP");
    }

    try {
      setVerifying(true)
      const res = await api.post("/auth/forgot/verify-otp", { email, otp: code });
      Alert.alert("Verified", "OTP Verified Successfully!");
      setVerifying(false)
      navigation.replace("ResetPasswordScreen", { email });

    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Invalid OTP");
      setVerifying(false)
    }
  };

  const handleInputChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const updated = [...otp];
      updated[index] = text;
      setOtp(updated);
      if (text && index < otp.length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Verify OTP</Text>
      <Text style={styles.subtitle}>Enter the OTP sent to your email</Text>

      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleInputChange(text, index)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, verifying && { opacity: 0.6 }]}
        disabled={verifying}
        onPress={() => !verifying && handleVerify()}
      >
        <Text style={styles.verifyText}>
          {verifying ? "Veryfying..." : "Verify"}
        </Text>
      </TouchableOpacity>

      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    alignItems: "center",
    marginTop:40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    color:"#222",
    fontFamily: "Poppins-SemiBold", // Poppins bold
  },
  subtitle: {
    color: "#666",
    marginBottom: 30,
    fontSize:13,
    fontFamily: "Poppins-Regular", // Poppins regular
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 13,
    marginHorizontal: 5,
    color: "#222",
    fontFamily: "Poppins-Regular", // Poppins regular
  },
  verifyButton: {
    backgroundColor: Color.DARK,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 40,
    width: "70%",
  },
  verifyText: {
    color: "#fff",
    fontSize: 13,
    
    fontFamily: "Poppins-SemiBold", // Poppins semi-bold
  },


});

export default ForgotOTPVerification;
