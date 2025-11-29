import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import Color from "../../constants/Color";
import { api } from "../../api/apiConfig";


// Reusable component for a single menu item row
const MenuItem = ({ item,handleOnPress}) => {
  const [available, setAvailable] = useState(item.isAvailable);

  // Function to toggle stock status
  const toggleStock = async () => {
    try {
      const newAvailability = !available;
      const res = await api.put(`foodItem/${item._id}`,{isAvailable:newAvailability})
      setAvailable(newAvailability);

     
     
    } catch (error) {
      // Revert state if API call fails
      setAvailable(!available);
      Alert.alert("Error", "Failed to update stock status");
    }
  };

  return (
    <TouchableOpacity style={styles.menuItemContainer} onPress={handleOnPress}>
      
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
         
          <Text style={styles.itemPrice}>
            ₹ {item.price?.toFixed(2) || "0.00"}
          </Text>
        </View>
      </View>

      <View style={styles.stockControl}>
        <Text
          style={[
            styles.stockText,
            { color: available ? "#FFB300" : "#888" },
          ]}
        >
          {available ? "Available" : "Not Available"}
        </Text>
        <Switch
          value={available}
          onValueChange={toggleStock}
          trackColor={{ false: "gray", true: Color.DARK }}
          thumbColor={available ? "#fff" : "#f4f3f4"}
        />
      </View>
    </TouchableOpacity>
  );
};

// Main Component
const MenuManagement = ({navigation}) => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([{ _id: "ALL", name: "ALL" }]);
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
  }, []);

  // Fetch food items with backend filtering
  const fetchFoodItems = async () => {
    try {
      setLoading(true);

      // Build query parameters for backend filtering
      const params = {};
      if (activeCategory !== "ALL") {
        params.category = activeCategory;
      }

      if (search.trim() !== "") {
        params.search = search.trim();
      }

      const res = await api.get("/foodItem", { params });
      setMenu(res.data?.foodItems || []);
    } catch (e) {
      console.log("Error fetching food items:", e);
      Alert.alert("Error", "Failed to load menu items");
      setMenu([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      const fetchedCategories = res.data?.categories || [];
      // Add "ALL" category at the beginning
      const allCategories = [{ _id: "ALL", name: "ALL" }, ...fetchedCategories];
      setCategories(allCategories);
    } catch (e) {
      console.log("Error fetching categories:", e);
      // Keep "ALL" category even if API fails
      setCategories([{ _id: "ALL", name: "ALL" }]);
    }
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Handle search with debouncing
  const handleSearch = (text) => {
    setSearch(text);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout for debouncing (500ms delay)
    const newTimeout = setTimeout(() => {
      fetchFoodItems();
    }, 500);

    setSearchTimeout(newTimeout);
  };

  // Fetch data when category changes
  useEffect(() => {
    fetchFoodItems();
  }, [activeCategory]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Update stock status on server and refresh data
  
  const renderMenuItem = ({ item }) => (

    <MenuItem item={item} handleOnPress={()=>navigation.navigate('Add Menu',{
      isUpdate:true,
      foodItem:item
    })}/>
  );

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
          onChangeText={handleSearch}
        />
      </View>

      {/* Category Tabs */}
      <View style={styles.tabsContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category._id}
            style={styles.tabContainer}
            onPress={() => handleCategoryChange(category._id)}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === category._id && styles.activeTabText,
              ]}
            >
              {category.name}
            </Text>
            {activeCategory === category._id && (
              <View style={styles.activeTabUnderline} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Menu List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading menu items...</Text>
        </View>
      ) : (
        <FlatList
          data={menu}
          keyExtractor={(item) => item.id || item._id} // Handle both id and _id
          renderItem={renderMenuItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>No menu items found</Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) - Orange '+' */}
      <TouchableOpacity style={styles.fab} onPress={()=>navigation.navigate("Add Menu")}>
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
  // --- Loading and Empty States ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
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
