import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator,Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFonts } from "expo-font";
import {
  Ionicons,
  Foundation,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
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
import FavouriteScreen from "./Screens/FavouriteScreen";
import MyOrders from "./Screens/MyOrders";
import OrderDetailsScreen from "./Screens/ProfileSection/OrderDetailsScreen";
import OrderTrackScreen from "./Screens/ProfileSection/OrderTrackScreen";
import MenuManagement from "./Screens/HotelScreens/MenuManagement";
import CategoryManagement from "./Screens/HotelScreens/CategoryManagement";
import AddNewMenu from "./Screens/HotelScreens/AddNewMenu";
import OrdersScreen from "./Screens/HotelScreens/OrdersScreen";
import OrderStatusUpdateScreen from "./Screens/HotelScreens/OrdersStatusUpdateScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Color from "./constants/Color";
import HotelProfileScreen from "./Screens/HotelScreens/HotelProfileScreen";
import EditHotelProfile from "./Screens/HotelScreens/EditHotelProfileScreen";
import TermsAndConditionsScreen from "./Screens/HotelScreens/TermsAndConditionsScreen";
import ForgotPasswordEmailScreen from "./Screens/ForgotPasswordEmailScreen";
import ForgotOTPVerification from "./Screens/ForgotOTPVerification";
import ResetPasswordScreen from "./Screens/ResetPasswordScreen";
import EditProfileScreen from "./Screens/ProfileSection/EditProfileScreen";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Food Details" component={FoodDetailScreen} />
  </Stack.Navigator>
);


//CART STACK

const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CartScreen" component={CartScreen} />
    <Stack.Screen name="CheckoutScreen" component={AddressChoose} />
    <Stack.Screen name="Choose Address" component={EditAddressScreen} />
    <Stack.Screen name="Payment Method" component={PaymentMethodScreen} />
    <Stack.Screen name="Order Successful" component={OrderSuccessfulScreen} />
  </Stack.Navigator>
);

//FavouriteStack 
const FavouriteStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FavouriteScreen" component={FavouriteScreen} />
  </Stack.Navigator>
);


const ProfileStack=()=>{
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    
    >
      <Stack.Screen name="Main Profile" component={MainProfileScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="My Orders" component = {MyOrders}/>
      <Stack.Screen name="Profile Edit" component={EditProfileScreen}/>
      <Stack.Screen name="Order Details" component={OrderDetailsScreen} />
      <Stack.Screen name="Track Order" component={OrderTrackScreen} />
      <Stack.Screen name="Terms" component={TermsAndConditionsScreen}/>
    </Stack.Navigator>
  );
}

 const UserTabs = () => {
  const { cartLength } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
          },
          // REMOVE position: 'absolute' and use flexbox approach
          tabBarStyle: {
            height: 70,
            backgroundColor: "#ffffff",
            elevation: 8,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            paddingBottom: 5,
            paddingTop: 5,
          },
          tabBarActiveTintColor: Color.DARK,
          tabBarInactiveTintColor: "#8e8e8e",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            textTransform: "uppercase",
            marginBottom: 0,
            fontFamily: "Inter-SemiBold",
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            const iconSize = 22;

            if (route.name === "HomeStack") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            } else if (route.name === "Favourite") {
              iconName = focused ? "heart" : "heart-outline";
            } else if (route.name === "Cart") {
              iconName = focused ? "cart" : "cart-outline";
            }

            return (
              <Ionicons
                name={iconName}
                size={iconSize}
                color={color}
              />
            );
          },
        })}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStack}
          options={{ tabBarLabel: "Home" }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{ tabBarLabel: "Profile" }}
        />
        <Tab.Screen
          name="Favourite"
          component={FavouriteStack}
          options={{ tabBarLabel: "Favourite" }}
        />
        <Tab.Screen
          name="Cart"
          component={CartStack}
          options={{
            tabBarLabel: "Cart",
            tabBarBadge: cartLength > 0 ? cartLength : null,
            tabBarBadgeStyle: {
              backgroundColor: Color.DARK,
              color: "white",
              fontSize: 10,
              fontWeight: Color.DARK,
            },
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

function RootNavigator() {
  const { auth, loading } = useAuth();
  console.log(auth)
  // Show loading spinner while verifying token
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={Color.DARK}/>
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {(auth?.token && auth?.role === "user") ? (
      <Stack.Screen name="User Home" component={UserTabs} />
    ) : (auth?.token && auth?.role === "restaurant") ? (
      <Stack.Screen name="Restaurant" component={MainRestaurantNavigator} />
    ) : (
      <>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignUpScreen} />
        <Stack.Screen name="Email Verification" component={EmailOTPVerification} />
         <Stack.Screen name="Forgot Email" component={ForgotPasswordEmailScreen}/>
     <Stack.Screen name="ForgotOTPVerification" component={ForgotOTPVerification}/>
     <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen}/>
      </>
    )}
  </Stack.Navigator>
  );
}

   const HotelNavigator = () => {
     return (
       <Stack.Navigator
         screenOptions={{ headerShown: false }}
         initialRouteName="Orders"
       >
         <Stack.Screen name="Menu Management" component={MenuManagement} />
         <Stack.Screen name="Add Menu" component={AddNewMenu} />
         <Stack.Screen
           name="Category Management"
           component={CategoryManagement}
         />
         <Stack.Screen name="Orders" component={OrdersScreen} />
         <Stack.Screen
           name="Status Update"
           component={OrderStatusUpdateScreen}
         />
       </Stack.Navigator>
     );
   };
   const HotelProfileStack = () => {
     return (
       <Stack.Navigator screenOptions={{ headerShown: false }}>
         <Stack.Screen name="MainProfile" component={HotelProfileScreen} />
         <Stack.Screen name="Profile Edit" component={EditHotelProfile} />
         <Stack.Screen name="Terms Conditions" component={TermsAndConditionsScreen}/>
         
       </Stack.Navigator>
     );
   };

   const MenuManagementStack=()=>{
    return(
      <Stack.Navigator screenOptions={{headerShown:false}}>
          <Stack.Screen name="Menu Manangement" component={MenuManagement} />
          <Stack.Screen name="Add Menu" component={AddNewMenu} />
      </Stack.Navigator>
     
    )
   }

   const HotelOrdersManagement=()=>{
    return (
      <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          
        />
        <Stack.Screen
          name="Status Update"
          component={OrderStatusUpdateScreen}
          
        />
      </Stack.Navigator>
    );
   }

   const MainRestaurantNavigator = () => {
     return (
       <Drawer.Navigator
         screenOptions={{
           headerShown: false,
           drawerActiveTintColor: Color.DARK,
           drawerInactiveTintColor: "#555",
           drawerActiveBackgroundColor: "#fff",
           drawerLabelStyle: {
             fontSize: 16,
             fontFamily: "Poppins-Medium", // example
           },
         }}
       >
         <Drawer.Screen
           name="Menu"
           component={MenuManagementStack}
           options={{
             drawerIcon: ({ focused, color }) => (
               <Ionicons name="restaurant-outline" color={color} size={26} />
             ),
           }}
         />

         <Drawer.Screen
           name="Category Management"
           component={CategoryManagement}
           options={{
             drawerIcon: ({ focused, color }) => (
               <Ionicons name="fast-food-outline" color={color} size={24} />
             ),
           }}
         />
         <Drawer.Screen
           name="Orders Screen"
           component={HotelOrdersManagement}
           options={{
             title: "Orders",
             drawerIcon: ({ focused, color }) => (
               <Feather name="shopping-bag" color={color} size={24} />
             ),
           }}
         />
         {/* <Drawer.Screen
           name="Status Update"
           component={OrderStatusUpdateScreen}
           options={{
             drawerIcon: ({ focused, color }) => (
               <MaterialCommunityIcons name="update" color={color} size={24} />
             ),
           }}
         /> */}
         <Drawer.Screen
           name="Profile"
           component={HotelProfileStack}
           options={{
             drawerIcon: ({ focused, color }) => (
               <Ionicons name="person-outline" color={color} size={24} />
             ),
           }}
         />
       </Drawer.Navigator>
     );
   };
  

export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("./assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Medium": require("./assets/fonts/Inter_18pt-Medium.ttf"),
    "Inter-SemiBold": require("./assets/fonts/Inter_18pt-SemiBold.ttf"),
    "Inter-Bold": require("./assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-ExtraBold": require("./assets/fonts/Inter_18pt-ExtraBold.ttf"),
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading fonts...</Text>;
  }
  

  const ForgotPasswordStack=()=>{
    return(
<Stack.Navigator>
    
     <Stack.Screen name="ForgotOTPVerification" component={ForgotOTPVerification}/>
     <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen}/>
   </Stack.Navigator>
    )
   
  }


  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        {/* <HotelNavigator/> */}
        {/* <MainRestaurantNavigator/> */}
       
     
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
