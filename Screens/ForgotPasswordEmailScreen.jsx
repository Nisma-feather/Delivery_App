import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { api } from "../api/apiConfig";
import Color from '../constants/Color';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordEmailScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading,setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) {
      return Alert.alert("Enter email", "Please enter your email");
    }


    try {
      setLoading(true);

      const res = await api.post("/auth/forgot/send-otp", { email });
      Alert.alert("Success", "OTP sent to your email");
      setLoading(false); //
      navigation.replace("ForgotOTPVerification", { email });
    } catch (err) {
      Alert.alert(
        "Failed to send OTP",
        err.response?.data?.message || "Please enter the registered email"
      );
      console.log(err);
       setLoading(false);
    }
    
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter registered email to reset password
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#aaa"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSend}
        disabled={loading}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          {loading ? "Loading...." : "Send OTP →"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backLogin}>Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:{ 
    flex:1,
    backgroundColor:"#fff",
      marginTop: 40,
    paddingHorizontal:30 
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#222",
     textAlign:"center",
   
  },
 subtitle: {
    fontSize: 13,
    color: "#666",
  
    alignSelf: "flex-start",
    marginTop: 8,
    lineHeight: 20,

    fontFamily: "Poppins-Regular",
     marginBottom:12,
  },
  input:{ 
    backgroundColor:"#fff",
    elevation:3,
    borderRadius:10,
    paddingHorizontal:15,
    height:50,
    fontSize:12,
    fontFamily:"Poppins-Regular",
    marginBottom:20 
  },
  button:{ 
    backgroundColor:Color.DARK,
    paddingVertical:10,
    borderRadius:25,
    alignItems:"center",
    marginTop:10,
    elevation:5 
  },
  buttonText:{ 
    color:"#fff",
    fontSize:13,
    fontFamily:"Poppins-SemiBold"
  },
  backLogin:{ 
    textAlign:"center",
    color:Color.DARK,
    fontFamily:"Poppins-Medium",
    fontSize:13,
    marginTop:20 
  },
});

export default ForgotPasswordEmailScreen;
