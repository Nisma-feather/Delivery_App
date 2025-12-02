import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
      <Stack.Screen name="Order Details" component={OrderDetailsScreen} />
      <Stack.Screen name="Track Order" component={OrderTrackScreen} />
    </Stack.Navigator>
  );
}

const UserTabs = () => 
{
const {cartLength} = useAuth();

 return (
   <Tab.Navigator
     screenOptions={({ route }) => ({
       headerShown: false,

       // 1. SHOW THE LABEL
       tabBarShowLabel: true,
       tabBarItemStyle: {
         justifyContent: "center",
         alignItems: "center",
       },

       // 2. STYLING THE TAB BAR CONTAINER
       tabBarStyle: {
         height: 80, // Increased height for label + icon
         backgroundColor: "#ffffff",
         elevation: 8, // Android shadow
         borderTopWidth: 0,
         paddingBottom: 5,
         borderRadius: 50,
         marginBottom: 10,
       },

       // 3. COLOR FOR ACTIVE/INACTIVE ICONS AND LABELS
       tabBarActiveTintColor: "#ff5e00ff", // Primary color (e.g., orange)
       tabBarInactiveTintColor: "#8e8e8e", // Grey color

       // 4. STYLE THE LABEL TEXT (Set to UPPERCASE)
       tabBarLabelStyle: {
         fontSize: 10,
         fontWeight: "600",
         textTransform: "uppercase", // 🔥 Important: Set the text to CAPITALS
         marginBottom: 3,
         fontFamily: "Inter-SemiBold", // Assuming you want a custom font
       },

       // 5. ICON RENDERING
       tabBarIcon: ({ focused, color, size }) => {
         let iconName;
         // Use a slightly smaller size since the label is now displayed
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
             color={color} // Automatically uses active/inactive color
           />
         );
       },
     })}
   >
     {/* Setting individual tab options (like the label text) */}
     <Tab.Screen
       name="HomeStack"
       component={HomeStack}
       options={{ tabBarLabel: "Home" }} // Customize label here if needed
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
           backgroundColor: "#ff5e00ff",
           color: "white",
           fontSize: 10,
           fontWeight: "bold",
         },
       }}
     />
   </Tab.Navigator>
 );
}


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
    "Poppins-Bold": require("./assets/fonts/Poppins-Bold.ttf"),
    "Poppins-SemiBold": require("./assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Medium": require("./assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("./assets/fonts/Poppins-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return <Text>Loading fonts...</Text>;
  }


   const HotelNavigator = () => {
      return (
        <Stack.Navigator screenOptions={{headerShown:false}} initialRouteName="Orders">
          <Stack.Screen name="Menu Management" component={MenuManagement}/>
          <Stack.Screen name="Add Menu" component={AddNewMenu}/>
          <Stack.Screen name="Category Management" component={CategoryManagement}/>
           <Stack.Screen name="Orders" component={OrdersScreen}/>
           <Stack.Screen name="Status Update" component={OrderStatusUpdateScreen} />
        </Stack.Navigator>
      )
   }
   const HotelProfileStack=()=>{
       return (
         <Stack.Navigator>
           <Stack.Screen
             name="MainProfile"
             component={HotelProfileScreen}
           />
           <Stack.Screen name="Profile Edit" component={EditHotelProfile} />
         </Stack.Navigator>
       );
   }


   const MainRestaurantNavigator=()=>{
   
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
          name="Menu Management"
          component={MenuManagement}
          options={{
            drawerIcon: ({ focused, color }) => (
              <Ionicons name="fast-food-outline" color={color} size={26} />
            ),
          }}
        />

        <Drawer.Screen
          name="Add Menu"
          component={AddNewMenu}
          options={{
            drawerIcon: ({ focused, color }) => (
              <Feather name="shopping-bag" color={color} size={24} />
            ),
          }}
        />
        <Drawer.Screen
          name="Category Management"
          component={CategoryManagement}
          options={{
            drawerIcon: ({ focused, color }) => (
             <MaterialCommunityIcons name="silverware" color={color} size={24} />
            ),
          }}
        />
        <Drawer.Screen
          name="Orders"
          component={OrdersScreen}
          options={{
            drawerIcon: ({ focused, color }) => (
              <Feather name="shopping-bag" color={color} size={24} />
            ),
          }}
        />
        <Drawer.Screen
          name="Status Update"
          component={OrderStatusUpdateScreen}
        />
        <Drawer.Screen 
        name="Profile"
        component={HotelProfileStack}

        />
      </Drawer.Navigator>
    );
   }
  

  return (
    <AuthProvider>
      <NavigationContainer>
        {/* <RootNavigator /> */}
        {/* <HotelNavigator/> */}
        <MainRestaurantNavigator/>
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
