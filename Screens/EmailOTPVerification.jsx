import React, { useContext, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Color from "../constants/Color";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";

const EmailOTPVerification = ({ navigation, route }) => {

   const {login} = useAuth();
  const { email, userName, password } = route?.params;
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // ⏱️ 2-minute timer
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // 🧭 Header Component
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" color="#666" size={25} />
      </TouchableOpacity>
    </View>
  );

  // 📩 Send OTP (initial + resend)
  const handleSendOTP = async () => {
    try {
      
      const res = await api.post("/auth/send-otp", { email });
      console.log("OTP sent successfully");
      setTimeLeft(120); // reset timer
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to resend OTP");
    } finally {
   
    }
  };

  // ⏳ Timer countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Send OTP on mount
  useEffect(() => {
    handleSendOTP();
  }, []);

  // ✅ Handle OTP input
  const handleChange = (text, index) => {
    if (/^\d?$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // ✅ Handle backspace navigation
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 🧩 Verify OTP
  const handleVerify = async () => {
    const code = otp.join("");
    console.log("Entered OTP:", code);
    try {
      const res = await api.post("/auth/verify-otp", {
        email,
        otp: code,
        password,
        userName,
      });
     
         alert("Login successful!");
         navigation.navigate("User Home");
      
      
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Invalid or expired OTP");
    }
  };

  // Format timer as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          We have sent the verification code to your email address.
        </Text>

        {/* OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                focusedIndex === index && { borderColor: "#ff7b00" },
              ]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyText}>Confirm</Text>
        </TouchableOpacity>

        {/* Timer + Resend Section */}
        <View style={styles.resendContainer}>
          {timeLeft > 0 && ! isResending ? (
            <Text style={styles.timerText}>
              OTP expires in{" "}
              <Text style={styles.timerHighlight}>{formatTime()}</Text>
            </Text>
          ) : (
            <>
              <Text style={styles.resendText}>Didn’t receive code?</Text>
              <TouchableOpacity disabled={isResending} onPress={handleSendOTP}>
                <Text style={styles.resendLink}>
                  {isResending ? "Resending..." : "Resend"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: { fontSize: 20, fontFamily: "Inter-Bold", color: "#222" },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    alignSelf: "flex-start",
    marginTop: 8,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    width: "100%",
    maxWidth: 340,
  },
  otpInput: {
    width: 55,
    height: 55,
    borderWidth: 1.5,
    borderColor: "#ddd",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    color: "#222",
  },
  verifyButton: {
    backgroundColor: Color.DARK,
    width: "80%",
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 50,
  },
  verifyText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  resendContainer: {
    flexDirection: "row",
    marginTop: 25,
    alignItems: "center",
  },
  resendText: { color: "#666", fontFamily: "Inter-Medium" },
  resendLink: { color: Color.DARK, fontFamily: "Inter-Medium", marginLeft: 5 },
  timerText: { color: "#444", fontSize: 14 },
  timerHighlight: { color: Color.DARK, fontWeight: "bold" },
});

export default EmailOTPVerification;
