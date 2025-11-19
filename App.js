import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useFonts } from "expo-font";

import HomeScreen from "./Screens/HomeScreen";
import FoodDetailScreen from "./Screens/FoodDetailScreen";
import CartScreen from "./Screens/CartScreen";
import LoginScreen from "./Screens/LoginScreen";
import SignUpScreen from "./Screens/SignUpScreen";
import EmailOTPVerification from "./Screens/EmailOTPVerification";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainProfileScreen from "./Screens/ProfileSection/MainProfileScreen";
import AddressScreen from "./Screens/ProfileSection/AddressScreen";
import AddressChoose from "./Screens/AddressChoose";
import EditAddressScreen from "./Screens/EditAddressScreen";
import PaymentMethodScreen from "./Screens/PaymentMethodScreen";
import OrderSuccessfulScreen from "./Screens/OrderSuccessfulScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Food Details" component={FoodDetailScreen} />
  </Stack.Navigator>
);


//CART STACK

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Cart Screen" component={CartScreen} />
    <Stack.Screen name="CheckoutScreen" component={AddressChoose} />
    <Stack.Screen name="Choose Address" component={EditAddressScreen} />
    <Stack.Screen name="Payment Method" component={PaymentMethodScreen} />
    <Stack.Screen name="Order Successful" component={OrderSuccessfulScreen} />
  </Stack.Navigator>
);

const ProfileStack=()=>{
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    
    >
      <Stack.Screen name="Main Profile" component={MainProfileScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
     
    </Stack.Navigator>
  );
}

const UserTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="HomeStack" component={HomeStack} />
    <Tab.Screen name="Profile" component={ProfileStack} />
    <Tab.Screen name="Cart" component={CartStack} />
  </Tab.Navigator>
);


function RootNavigator() {
  const { auth, loading } = useAuth();

  // Show loading spinner while verifying token
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff6600" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {auth?.token ? (
        // ✅ If token verified → show main app
        <Stack.Screen name="User Home" component={UserTabs} />
      ) : (
        // ❌ No token → show login/signup flow
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignUpScreen} />
          <Stack.Screen
            name="Email Verification"
            component={EmailOTPVerification}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("./assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Medium": require("./assets/fonts/Inter_18pt-Medium.ttf"),
    "Inter-SemiBold": require("./assets/fonts/Inter_18pt-SemiBold.ttf"),
    "Inter-Bold": require("./assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-ExtraBold": require("./assets/fonts/Inter_18pt-ExtraBold.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading fonts...</Text>;
  }

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
