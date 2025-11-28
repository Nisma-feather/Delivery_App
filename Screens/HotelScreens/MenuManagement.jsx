import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Color from "../../constants/Color";
import { api } from "../../api/apiConfig";

// --- 1. Data Structure ---
const menuData = [
  {
    id: "1",
    name: "Veg Sandwich",
    price: 5.0,
    category: "FAST FOOD",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "2",
    name: "Veg Cheese Sandwich",
    price: 3.5,
    category: "FAST FOOD",
    isVeg: true,
    isAvailable: true,
  },
  {
    id: "3",
    name: "Veg Frankie",
    price: 4.0,
    category: "FAST FOOD",
    isVeg: true,
    isAvailable: false,
  },
  {
    id: "4",
    name: "Fried Chicken",
    price: 7.0,
    category: "FAST FOOD",
    isVeg: false,
    isAvailable: true,
  },
  {
    id: "5",
    name: "Farmville Pizza",
    price: 5.5,
    category: "FAST FOOD",
    isVeg: true,
    isAvailable: true,
  },
];
const fetchFoodItems=async()=>{
  try{
   const res = await api.get("/foodItem");
   console.log(res.data)
  }
  catch(e){
    console.log(e)
  }
}


 


// Reusable component for the category tab
const CategoryTab = ({ title, isActive }) => (
  <TouchableOpacity style={styles.tabContainer}>
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      {title}
    </Text>
    {isActive && <View style={styles.activeTabUnderline} />}
  </TouchableOpacity>
);

// Reusable component for a single menu item row
const MenuItem = ({ item }) => {
  const [isAvailable, setIsAvailable] = useState(item.isAvailable);

  // Function to toggle stock status
  const toggleStock = () => {
    setIsAvailable((previousState) => !previousState);
  };

  return (
    <View style={styles.menuItemContainer}>
      {item?.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.menuItemImage}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={require("../../assets/biriyani.png")}
          style={styles.menuItemImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.priceRow}>
          {/* Veg/Non-Veg Indicator */}
         
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.stockControl}>
        <Text
          style={[
            styles.stockText,
            { color: isAvailable ? "#FFB300" : "#888" },
          ]}
        >
          {isAvailable ? "In Stock" : "Out of Stock"}
        </Text>
        <Switch
          value={isAvailable}
          onValueChange={toggleStock}
          trackColor={{ false: "gray", true: Color.DARK }}
          thumbColor={isAvailable ? "#fff" : "#f4f3f4"}
        />
      </View>
    </View>
  );
};

// Main Component
const MenuManagement = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  // Filter menu items based on search and category
  const filteredMenuData = menuData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "ALL" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["ALL", "FAST FOOD", "BEVERAGES", "DESSERTS"]; // Add more categories as needed

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Food Management</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={22}
          color="#444"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={search}
          placeholder="Search menu items..."
          onChangeText={setSearch}
        />
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={styles.tabContainer}
            onPress={() => setActiveCategory(category)}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === category && styles.activeTabText,
              ]}
            >
              {category}
            </Text>
            {activeCategory === category && (
              <View style={styles.activeTabUnderline} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu List */}
      <FlatList
        data={filteredMenuData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MenuItem item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button (FAB) - Orange '+' */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
    marginBottom: 20,
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 15,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: "white",
  },
  searchIcon: { padding: 5, marginRight: 5 },
  searchInput: { flex: 1, paddingVertical: 10 },
  // --- Tabs Styles ---
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },
  tabContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "700",
  },
  activeTabUnderline: {
    height: 3,
    backgroundColor: "#FFB300",
    position: "absolute",
    bottom: 0,
    left: 15,
    right: 15,
  },
  // --- Menu Item Styles ---
  listContent: {
    paddingBottom: 20,
  },
  menuItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  vegIndicatorBox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 2,
  },
  vegIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  stockControl: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 5,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 5,
  },
  // --- FAB Styles ---
  fab: {
    position: "absolute",
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#FFB300",
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    fontSize: 30,
    color: "white",
    lineHeight: 30,
  },
});

export default MenuManagement;
