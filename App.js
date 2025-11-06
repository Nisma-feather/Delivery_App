import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './Screens/HomeScreen';
import { useFonts } from 'expo-font';
import FoodDetailScreen from './Screens/FoodDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
export default function App() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("./assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Medium": require("./assets/fonts/Inter_18pt-Medium.ttf"),
    "Inter-SemiBold": require("./assets/fonts/Inter_18pt-SemiBold.ttf"),
    "Inter-Bold": require("./assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-ExtraBold": require("./assets/fonts/Inter_18pt-ExtraBold.ttf"),
  });

  if(!fontsLoaded){
    return <Text>Loading.....</Text>
  }
  const HomeStack=()=>{
    return (
      <Stack.Navigator initialRouteName="Food Details">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Food Details"
        component={FoodDetailScreen}
        options={{headerShown:false}}
        />
      </Stack.Navigator>
    );
  }
  return (
  <NavigationContainer>
    <Tab.Navigator screenOptions={{headerShown:false}} >
      <Tab.Screen name="HomeStack" component={HomeStack}/>
   
    </Tab.Navigator>
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
