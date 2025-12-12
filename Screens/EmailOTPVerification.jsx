import React, { useEffect, useRef, useState } from "react";
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
  const { login } = useAuth();
  const { email, userName, password } = route?.params;

  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);
  const firstSend = useRef(true); // ⬅ FIRST send flag

  // HEADER
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialCommunityIcons name="arrow-left" color="#666" size={25} />
      </TouchableOpacity>
    </View>
  );

  // SEND OTP (initial + resend)
  const handleSendOTP = async () => {
    try {
      // 🔥 Only show "Resending..." after the first send
      if (!firstSend.current) {
        setIsResending(true);
      }

      const res = await api.post("/auth/send-otp", { email });
      console.log("OTP sent!");

      setTimeLeft(120);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to send OTP");
    } finally {
      // ❗ Stop loader only on resend
      if (!firstSend.current) {
        setIsResending(false);
      }

      // After first run → always false
      firstSend.current = false;
    }
  };

  // TIMER HANDLER
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // SEND OTP ON MOUNT
  useEffect(() => {
    handleSendOTP();
  }, []);

  // OTP INPUT HANDLER
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

  // BACKSPACE HANDLER
  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // VERIFY OTP
  const handleVerify = async () => {
    const code = otp.join("");
    console.log("Entered OTP:", code);

    try {
      setVerifying(true);

      const res = await api.post("/auth/verify-otp", {
        email,
        otp: code,
        password,
        userName,
      });

      alert("Login successful!");
      navigation.replace("User Home");
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Invalid or expired OTP");
    } finally {
      setVerifying(false);
    }
  };

  // TIMER FORMATTER
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

        {/* OTP Inputs */}
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

        {/* VERIFY BUTTON */}
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          activeOpacity={0.8}
        >
          <Text style={styles.verifyText}>
            {verifying ? "Verifying..." : "Verify"}
          </Text>
        </TouchableOpacity>

        {/* TIMER + RESEND */}
        <View style={styles.resendContainer}>
          {timeLeft > 0 && !isResending ? (
            <Text style={styles.timerText}>
              OTP expires in{" "}
              <Text style={styles.timerHighlight}>{formatTime()}</Text>
            </Text>
          ) : (
            <>
              <Text style={styles.resendText}>Didn’t receive code?</Text>
              <TouchableOpacity
                disabled={isResending}
                onPress={handleSendOTP}
                activeOpacity={0.8}
              >
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

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#222",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    alignSelf: "flex-start",
    marginTop: 8,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
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
    fontSize: 15,
    fontFamily: "Poppins-Medium",
    color: "#222",
  },
  verifyButton: {
    backgroundColor: Color.DARK,
    width: "80%",
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 50,
  },
  verifyText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
  resendContainer: {
    flexDirection: "row",
    marginTop: 25,
    alignItems: "center",
  },
  resendText: {
    color: "#666",
    fontFamily: "Poppins-Medium",
  },
  resendLink: {
    color: Color.DARK,
    fontFamily: "Poppins-SemiBold",
    marginLeft: 5,
  },
  timerText: {
    color: "#444",
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
  timerHighlight: {
    color: Color.DARK,
    fontFamily: "Poppins-Bold",
  },
});

export default EmailOTPVerification;
