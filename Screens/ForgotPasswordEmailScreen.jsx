import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from "../api/apiConfig";

const ForgotPasswordEmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handleSend = async () => {
    if (!email) {
      return Alert.alert("Error", "Please enter your email");
    }

    try {
      const res = await api.post("/auth/forgot/send-otp", { email });
      Alert.alert("Success", "OTP sent to your email");
      navigation.navigate("ForgotOTPVerification", { email });
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to send OTP");
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter registered email to reset password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={handleSend}>
        <Text style={styles.buttonText}>Send OTP →</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backLogin}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container:{ 
    flex:1,
    backgroundColor:"#fff",
    justifyContent:"center",
    paddingHorizontal:30 
  },
  title:{ 
    fontSize:20,
    fontFamily:"Poppins-Bold",
    marginBottom:10 
  },
  subtitle:{ 
    color:"#777",
    fontSize:14,
    fontFamily:"Poppins-Regular",
    marginBottom:30 
  },
  input:{ 
    backgroundColor:"#fff",
    elevation:3,
    borderRadius:10,
    paddingHorizontal:15,
    height:50,
    fontFamily:"Poppins-Regular",
    marginBottom:20 
  },
  button:{ 
    backgroundColor:"#f9a825",
    paddingVertical:10,
    borderRadius:25,
    alignItems:"center",
    marginTop:10,
    elevation:5 
  },
  buttonText:{ 
    color:"#fff",
    fontSize:16,
    fontFamily:"Poppins-SemiBold"
  },
  backLogin:{ 
    textAlign:"center",
    color:"#f9a825",
    fontFamily:"Poppins-Medium",
    marginTop:20 
  },
});

export default ForgotPasswordEmailScreen;
