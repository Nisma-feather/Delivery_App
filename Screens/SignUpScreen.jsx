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
import { MaterialCommunityIcons, Fontisto, Octicons, Ionicons } from "@expo/vector-icons";
import { api } from "../api/apiConfig";

// --- Colors ---
const MOCK_COLORS = {
  background: "#f8fbfdff", // Light beige/off-white background
  primaryText: "#252525", // Dark text
  secondaryText: "#666666", // Grey text
  accent: "#48b1c5", // Dark Orange for links/main color
  buttonStart: "#48b1c5", // Light Orange (top of gradient)
  buttonEnd: "#48b1c5", // Dark Orange (bottom of gradient)
  inputBackground: "#FFFFFF",
};

const { width } = Dimensions.get("window");

// --- Helper Component for Styled Inputs ---
const PasswordInput = ({ 
    label, 
    value, 
    onChangeText, 
    secureTextEntry,
    isPasswordVisible,
    onTogglePassword,
    error
}) => {
    return (
        <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputContainer, error && { borderWidth: 1, borderColor: 'red' }]}>
                {/* Lock Icon */}
                <Octicons name="lock" color="#888" size={22} style={styles.inputIcon} />
                
                {/* TextInput */}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!isPasswordVisible}
                    placeholder="••••••••"
                    placeholderTextColor={MOCK_COLORS.secondaryText + 'AA'}
                    autoCapitalize="none"
                />
                
                {/* Password Visibility Toggle */}
                <TouchableOpacity 
                    style={styles.eyeButton} 
                    onPress={onTogglePassword}
                >
                    <Ionicons name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} color="#777" size={24} />
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const EmailInput = ({ label, value, onChangeText, error }) => {
    return (
        <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputContainer, error && { borderWidth: 1, borderColor: 'red' }]}>
                <Fontisto name="email" color="#888" size={22} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="your email"
                    placeholderTextColor={MOCK_COLORS.secondaryText + 'AA'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const NameInput = ({ label, value, onChangeText, error }) => {
    return (
        <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputContainer, error && { borderWidth: 1, borderColor: 'red' }]}>
                <Ionicons name="person-outline" color="#888" size={22} style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="your name"
                    placeholderTextColor={MOCK_COLORS.secondaryText + 'AA'}
                    autoCapitalize="words"
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

// --- Checkbox Component ---
const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.checkbox, checked && styles.checkboxChecked]}
    >
        {checked && <Text style={styles.checkboxCheckmark}>✓</Text>}
    </TouchableOpacity>
);

// --- Main SignUp Screen Component ---
const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading,setLoading] =useState(false);

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
      setLoading(true)
    
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
    finally{
      setLoading(false)
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleSignIn = () => {
    navigation.replace("Login");
  };

  return (
    <View style={styles.fullScreenContainer}>
      {/* Absolute positioned Top Right Design Blob (Orange/Yellow Gradient Simulation) */}
      <View style={styles.topBlobContainer}>
        <View style={[styles.topBlob, styles.topBlobMain]} />
        <View style={[styles.topBlob, styles.topBlobAccent]} />
      </View>

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section: Sign Up + Subtitle */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Create your account to continue.</Text>
          </View>

          {/* Email Input */}
          <EmailInput
            label="EMAIL"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />
          
          {/* Username Input */}
          <NameInput
            label="USER NAME"
            value={userName}
            onChangeText={setUserName}
            error={errors.userName}
          />
          
          {/* Password Input */}
          <PasswordInput
            label="PASSWORD"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            isPasswordVisible={isPasswordVisible}
            onTogglePassword={togglePasswordVisibility}
            error={errors.password}
          />

          {/* Confirm Password Input */}
          <PasswordInput
            label="CONFIRM PASSWORD"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isPasswordVisible}
            isPasswordVisible={isPasswordVisible}
            onTogglePassword={togglePasswordVisibility}
            error={errors.confirmPassword}
          />

          {/* Privacy Policy Checkbox */}
          <View style={styles.rememberMeContainer}>
            <Checkbox
              checked={rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
            />
            <Text style={styles.rememberMeText}>
              I read and agree{" "}
              <Text style={styles.privacyPolicyText}>Privacy Policy</Text>
            </Text>
          </View>
          {errors.policy && <Text style={styles.errorText}>{errors.policy}</Text>}

          {/* Sign Up Button */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            {
              loading ? <Text style={styles.loginButtonText}>Loading...</Text>
              : <>
               <Text style={styles.loginButtonText}>SIGN UP</Text>
            <Text style={styles.loginButtonArrow}>→</Text>
              </>
            }
           
          </TouchableOpacity>

          {/* Or Signup with Separator */}
         
          {/* Social Signup */}
        

          {/* Already have an account? Sign In */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: MOCK_COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: width * 0.1, 
        paddingTop: width * 0.15,
        paddingBottom: 40,
    },

    // --- Top Design Blob Styles ---
    topBlobContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: width,
        height: width * 0.8,
        overflow: 'hidden',
    },
    topBlob: {
        position: 'absolute',
        borderRadius: width * 0.4, 
    },
    topBlobMain: {
        top: -width * 0.4,
        right: -width * 0.4,
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: MOCK_COLORS.buttonEnd,
        transform: [{ rotate: '20deg' }], 
    },
    topBlobAccent: {
        top: -width * 0.25,
        right: -width * 0.35,
        width: width * 0.7,
        height: width * 0.7,
        backgroundColor: MOCK_COLORS.buttonStart,
        opacity: 0.7,
        transform: [{ rotate: '5deg' }], 
    },

    // --- Header Styles ---
    headerContainer: {
        marginBottom: 40,
        marginTop: 10,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: MOCK_COLORS.primaryText,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        color: MOCK_COLORS.secondaryText,
        marginTop: 8,
        letterSpacing: 0.3,
    },

    // --- Input Styles ---
    inputSection: {
        marginBottom: 20,
        width: '100%',
    },
    inputLabel: {
        fontSize: 13,
        fontFamily: 'Poppins-SemiBold',
        color: MOCK_COLORS.secondaryText,
        marginBottom: 10,
        marginLeft: 12,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MOCK_COLORS.inputBackground,
        borderRadius: 16,
        height: 48,
        paddingHorizontal: 18,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    inputIcon: {
        marginRight: 14,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        fontFamily: 'Poppins-Medium',
        color: MOCK_COLORS.primaryText,
        paddingVertical: 0,
        letterSpacing: 0.3,
    },
    
    // Eye Icon Styles
    eyeButton: {
        paddingLeft: 12,
        paddingRight: 4,
    },
    
    // Error Text Styles
    errorText: {
        color: 'red',
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        marginTop: 5,
        marginLeft: 12,
    },

    // --- Remember Me / Privacy Policy Styles ---
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
        marginLeft: 2,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: MOCK_COLORS.secondaryText,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: MOCK_COLORS.accent,
        borderColor: MOCK_COLORS.accent,
    },
    checkboxCheckmark: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
    },
    rememberMeText: {
        fontSize: 15,
        fontFamily: 'Poppins-Medium',
        color: MOCK_COLORS.secondaryText,
        letterSpacing: 0.2,
        flex: 1,
    },
    privacyPolicyText: {
        color: MOCK_COLORS.accent,
        fontFamily: 'Poppins-SemiBold',
    },

    // --- Sign Up Button Styles ---
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
        height: 45,
        borderRadius: 31,
        width: '65%',
        alignSelf: 'flex-end',
        backgroundColor: MOCK_COLORS.buttonStart,
        ...Platform.select({
            ios: {
                shadowColor: MOCK_COLORS.buttonEnd,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 18,
            },
            android: {
                elevation: 18,
            },
        }),
    },
    loginButtonText: {
        color: MOCK_COLORS.inputBackground,
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        marginRight: 12,
        letterSpacing: 0.8,
    },
    loginButtonArrow: {
        color: MOCK_COLORS.inputBackground,
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        marginTop: 2,
    },

    // --- Separator Styles ---
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 30,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: MOCK_COLORS.secondaryText + '40',
    },
    separatorText: {
        marginHorizontal: 15,
        color: MOCK_COLORS.secondaryText,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },

    // --- Social Login Styles ---
    socialContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    socialIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MOCK_COLORS.inputBackground,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    socialIconText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: MOCK_COLORS.primaryText,
        marginLeft: 10,
    },

    // --- Footer Styles ---
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
        paddingVertical: 10,
    },
    signUpText: {
        fontSize: 15,
        fontFamily: 'Poppins-Regular',
        color: MOCK_COLORS.secondaryText,
        marginRight: 8,
        letterSpacing: 0.3,
    },
    signInLink: {
        fontSize: 15,
        fontFamily: 'Poppins-SemiBold',
        color: MOCK_COLORS.accent,
        letterSpacing: 0.3,
    },
});

export default SignUpScreen;