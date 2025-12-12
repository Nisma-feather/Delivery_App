import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Platform,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Color from "../constants/Color";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";
import {Fontisto,Octicons,Ionicons} from '@expo/vector-icons';

// If you have react-native-vector-icons installed, you can use:
// import Icon from 'react-native-vector-icons/Ionicons';

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
    onForgotPress 
}) => {
    
    const handleForgotPress = () => {
        if (onForgotPress) {
            onForgotPress();
        } else {
            Alert.alert("Forgot Password", "Navigating to reset password screen...");
        }
    };

    return (
        <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                {/* Lock Icon */}
                <Text style={styles.inputIcon}> <Octicons name="lock" color="#888" size={18} /></Text>
                
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
                    
                      <Ionicons name={isPasswordVisible ?"eye-outline":"eye-off-outline"} color="#777" size={20} />
                       
                  
                </TouchableOpacity>
            </View>
            
            {/* Forgot Password Link below the input */}
            <TouchableOpacity 
                style={styles.forgotContainer} 
                onPress={handleForgotPress}
            >
                <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
        </View>
    );
};

const EmailInput = ({ label, value, onChangeText }) => {
    return (
        <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}><Fontisto name="email" color="#888" size={18} /></Text>
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
        </View>
    );
};

// --- Checkbox Component (for Remember Me) ---
const Checkbox = ({ checked, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={[styles.checkbox, checked && styles.checkboxChecked]}
    >
        {checked && <Text style={styles.checkboxCheckmark}>✓</Text>}
    </TouchableOpacity>
);

// --- Main Login Screen Component ---
const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();

    const handleLogin = async () => {
        try {
            console.log("Login attempt...");
            
            if (!email || !password) {
                Alert.alert("Error", "Please enter both email and password");
                return;
            }

            setIsLoading(true);
            const res = await api.post("/user/login", { email, password });
            console.log("Login response:", res.data);
            
            if (res.data?.token && res.data?.user) {
                // ✅ Store in context + AsyncStorage
                await login(
                    res.data.token, 
                    res.data.user.userId, 
                    res.data.user.role
                );

                Alert.alert("Success", "Login successful!");
                // navigation.navigate("User Home");
            } else {
                Alert.alert("Error", "Invalid response from server");
            }
        } catch (error) {
            console.log("Login error:", error);
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               "Login failed. Try again.";
            Alert.alert("Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
      navigation.navigate("Forgot Email")
    }
        
    

    const handleSignUp = () => {
        navigation.navigate('Signup');
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
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
                    {/* Header Section: Login + Subtitle */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>Login</Text>
                        <Text style={styles.subtitle}>Please sign in to continue.</Text>
                    </View>

                    {/* Email Input */}
                    <EmailInput
                        label="EMAIL"
                        value={email}
                        onChangeText={setEmail}
                    />
                    
                    {/* Password Input with Toggle and Forgot Password */}
                    <PasswordInput
                        label="PASSWORD"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!isPasswordVisible}
                        isPasswordVisible={isPasswordVisible}
                        onTogglePassword={togglePasswordVisibility}
                        onForgotPress={handleForgotPassword}
                    />

                    {/* Remember Me Option */}
                    <View style={styles.rememberMeContainer}>
                       
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity 
                        style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} 
                        onPress={handleLogin} 
                        activeOpacity={0.8}
                        disabled={isLoading}
                    >
                        <Text style={styles.loginButtonText}>
                            {isLoading ? "LOGGING IN..." : "LOGIN"}
                        </Text>
                        {!isLoading && <Text style={styles.loginButtonArrow}>→</Text>}
                    </TouchableOpacity>

                    {/* Footer / Sign Up Link */}
                    <View style={styles.signUpContainer}>
                        <Text style={styles.signUpText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signUpLink}>Sign up</Text>
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
        paddingHorizontal: width * 0.06, 
        paddingTop: width * 0.15, // Reduced slightly for better balance
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
        marginBottom: 40, // Reduced for better spacing
        marginTop: 10,
    },
    title: {
        fontSize: 20, // Increased slightly for prominence
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
        marginBottom: 20, // Increased for better spacing
        width: '100%',
    },
    inputLabel: {
        fontSize: 12,
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
        borderRadius: 16, // Slightly more rounded
        height: 53, // Increased height
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
        fontSize: 16,
        marginRight: 14,
        color: MOCK_COLORS.secondaryText,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: 12,
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
    eyeIcon: {
        fontSize: 22,
        color: MOCK_COLORS.secondaryText,
    },
    
    // Forgot Password Styles (below input)
    forgotContainer: {
        marginTop: 10,
        marginLeft: 12,
        alignSelf: 'flex-end', // Align to the right
    },
    forgotText: {
        fontSize: 13,
        fontFamily: 'Poppins-SemiBold',
        color: MOCK_COLORS.accent,
        letterSpacing: 0.3,
    },

    // --- Remember Me Styles ---
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 35, // Increased spacing
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
    },

    // --- Login Button Styles ---
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
        height: 50,
        borderRadius: 31,
        width: '65%', // Slightly wider
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
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: MOCK_COLORS.inputBackground,
        fontSize: 13,
        fontFamily: 'Poppins-Bold',
        marginRight: 12,
        letterSpacing: 0.8,
    },
    loginButtonArrow: {
        color: MOCK_COLORS.inputBackground,
        fontSize: 16,
        fontFamily: 'Poppins-Bold',
        marginTop: 2,
    },

    // --- Footer Styles ---
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        paddingVertical: 20,
    },
    signUpText: {
        fontSize: 13,
        fontFamily: 'Poppins-Regular',
        color: MOCK_COLORS.secondaryText,
        marginRight: 8,
        letterSpacing: 0.3,
    },
    signUpLink: {
        fontSize: 14,
        fontFamily: 'Poppins-SemiBold',
        color: MOCK_COLORS.accent,
        letterSpacing: 0.3,
    },
});

export default LoginScreen;