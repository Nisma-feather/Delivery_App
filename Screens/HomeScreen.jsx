import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,

} from "react-native";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Color from "../constants/Color";
import { categories } from "../data/dummyDatas";
// import { foodItems } from "../data/dummyDatas";
import { api } from "../api/apiConfig";

// Component to render individual food cards
const FoodCard = ({ item , handlePress}) => (
  
    <TouchableOpacity style={styles.newCardContainer} onPress={handlePress}>
        
        {/* Food Image Wrapper (with the orange add button) */}
        <View style={styles.cardImageWrapper}>
            <Image 
                source={require("../assets/biriyani.png")} 
                style={styles.newCardImage}
                resizeMode="cover" // Use 'cover' to fit the space
            />
            {/* Orange Plus Button */}
            <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
        </View>

        {/* Text Details */}
        <View style={styles.newCardDetails}>
            <Text style={styles.cardTitle}>{item.title || item.name}</Text>
            
            {/* Description/SubText */}
            <Text style={styles.cardDescription} numberOfLines={1}>
                {item.description || item.subText} 
            </Text>

            <View style={styles.cardBottomRow}>
                {/* Price */}
                <Text style={styles.cardPrice}>
                    ${item.price ? item.price.toFixed(2) : '0.00'} 
                </Text>
                
                {/* Rating */}
                <View style={styles.cardRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.cardRatingText}>{item.rating}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

const HomeScreen = ({navigation}) => {

  const [foodItems,setFoodItems] = useState([]);
  const [categories,setCategories] = useState([]);

  //Fetching the foodItems
  const fetchFoodItems=async(req,res)=>{
    try{
      const res= await api.get("/foodItem");
      setFoodItems(res.data.foodItems || [])
    }
    catch(e){
      console.log(e)
    }
  }

  //fetching the categories
  const fetchCategories=async(req,res)=>{
    try{
     const res = await api.get("/category");
     setCategories(res.data.categories || [])
    }
    catch(e){
      console.log(e)
    }
  }
  useEffect(()=>{
   fetchFoodItems()

  },[])

  useEffect(()=>{
   fetchCategories();
  },[])

  console.log(foodItems)
  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.headerConatiner}>
          <Text style={{ fontFamily: "Inter-Bold", fontSize: 20, flex: 1 }}>
            Order Your Favourite Food Anytime!
          </Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" color="#444" size={26} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            marginVertical: 20,
            gap: 10,
          }}
        >
          <View
            style={{
              position: "relative",

              borderWidth: 1,
              borderColor: "#999",
              borderRadius: 10,
              flex: 1,
            }}
          >
            <Ionicons
              name="search-outline"
              color="#444"
              size={24}
              style={{ position: "absolute", top: "25%", left: 10 }}
            />
            <TextInput placeholder="searchFood" style={{ paddingLeft: 40 }} />
          </View>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: Color.DARK,
              borderRadius: 7,
            }}
          >
            <Ionicons name="filter" color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

   
        <View>
          <FlatList
          showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <>
                <Image
                  source={require("../assets/Banner.png")}
                  style={{ width: "100%", height: 180 }}
                />
                <View style={{ marginVertical: 20 }}>
                  {
                    <FlatList
                      data={categories}
                      keyExtractor={(item) => item._id.toString()}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      renderItem={({ item }) => (
                        <View
                          style={{
                            padding: 5,
                            backgroundColor: Color.DARK,
                            marginLeft: 10,
                            paddingHorizontal: 15,
                            borderRadius: 5,
                          }}
                        >
                          <Text
                            style={{ color: "#fff", fontFamily: "Inter-Bold" }}
                          >
                            {item.name}
                          </Text>
                        </View>
                      )}
                    />
                  }
                </View>
              </>
            )}
            data={foodItems}
            keyExtractor={(item) => item._id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => <FoodCard item={item} handlePress={()=> navigation.navigate("Food Details", {foodItemId : item._id} ) }/>}
          />
        </View>
    
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor:"#fff"
  },
  headerConatiner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listContainer: {

    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between", // ensures even spacing between cards
    marginBottom:10,
  },
  // ... existing styles ...

  // --- New Food Item Card Styles (from image) ---
  newCardContainer: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    // Very subtle shadow to lift the card
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
      },
      android: {
        elevation: 4,
      },
    }),
    overflow: "hidden", // Ensures the image respects the border radius
  },
  cardImageWrapper: {
    position: "relative",
    width: "100%",
    height: 120, // Set a fixed height for the image area
  },
  newCardImage: {
    width: "100%",
    height: "100%",
    // The image naturally gets the card's rounded top corners due to overflow: 'hidden'
  },
  addButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 35,
    height: 35,
    borderRadius: 10, // Rounded square
    backgroundColor: "#FF8C00", // Bright Orange
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  newCardDetails: {
    padding: 10,
    paddingTop: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  cardDescription: {
    fontSize: 12,
    color: "#999",
    marginBottom: 5,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  cardRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardRatingText: {
    fontSize: 14,
    color: "#000",
    marginLeft: 4,
  },

  // ... rest of your styles ...
});

export default HomeScreen;
