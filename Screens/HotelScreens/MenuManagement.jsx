
import React, { useEffect, useState, useCallback } from "react";
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
import { StatusBar } from "expo-status-bar";
import { useFocusEffect } from "@react-navigation/native";
import Color from "../../constants/Color";

import { api } from "../../api/apiConfig";

// Reusable component for a single menu item row
const MenuItem = ({ item, handleOnPress }) => {
  const [available, setAvailable] = useState(item.isAvailable);

  // Function to toggle stock status
  const toggleStock = async () => {
    try {
      const newAvailability = !available;
      const res = await api.put(`foodItem/${item._id}`, {
        isAvailable: newAvailability,
      });
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
            { color: available ? Color.DARK : "#888" },
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
const MenuManagement = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([{ _id: "ALL", name: "ALL" }]);
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [fetchingMore, setFetchingMore] = useState(false);

  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    fetchFoodItems();
    fetchCategories();
  }, []);

  // Fetch food items with backend filtering
  const fetchFoodItems = async (nextPage = 1, searchText = "") => {
  try {
    if (nextPage === 1) {
      setLoading(true);
    } else {
      setFetchingMore(true);
    }

    const params = {
      page: nextPage,
      limit: 10,
      search: searchText,
    };

    if (activeCategory !== "ALL") {
      params.category = activeCategory;
    }

    const res = await api.get("/foodItem", { params });

    if (res.data?.foodItems) {
      setMenu((prev) => {
        const merged =
          nextPage === 1
            ? res.data.foodItems
            : [...prev, ...res.data.foodItems];

        // ✅ DUPLICATE SAFE (same as Orders)
        return Array.from(
          new Map(merged.map((item) => [item._id, item])).values()
        );
      });

      setHasMore(nextPage < res.data.totalPages);
    } else {
      setMenu([]);
      setHasMore(false);
    }
  } catch (e) {
    console.log("Error fetching food items:", e);
    Alert.alert("Error", "Failed to load menu items");
  } finally {
    setLoading(false);
    setFetchingMore(false);
  }
};

const handleSearchChange = (text) => {
  setSearch(text);

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  const timeout = setTimeout(() => {
    setPage(1);
    setHasMore(true);
    setMenu([]);
    fetchFoodItems(1, text);
  }, 500);

  setSearchTimeout(timeout);
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
 
  
  // Update stock status on server and refresh data

  const renderMenuItem = ({ item }) => (
    <MenuItem
      item={item}
      handleOnPress={() =>
        navigation.navigate("Add Menu", {
          isUpdate: true,
          foodItem: item,
        })
      }
    />
  );
  const handleCategoryChange = (categoryId) => {
  setActiveCategory(categoryId);
  setPage(1);
  setHasMore(true);
  setMenu([]);
};

const handleLoadMore = () => {
  if (!hasMore || fetchingMore) return;

  const nextPage = page + 1;
  setPage(nextPage);
  fetchFoodItems(nextPage, search);
};


  //fetching the menu on the focus

useFocusEffect(
  useCallback(() => {
    setPage(1);
    setHasMore(true);
    setMenu([]);
    fetchFoodItems(1, search);
  }, [activeCategory])
);





  // Render function for category tabs
  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={styles.tabContainer}
      onPress={() => handleCategoryChange(item._id)}
    >
      <Text
        style={[
          styles.tabText,
          activeCategory === item._id && styles.activeTabText,
        ]}
      >
        {item.name}
      </Text>
      {activeCategory === item._id && (
        <View style={styles.activeTabUnderline} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} >
      <StatusBar style="dark" backgroundColor="white" />

      {/* Header */}
      <View style={styles.topContainer}>
        <View style={styles.headingContainer}>
          {/* Title */}
          <Text style={styles.title}>Menu Management</Text>

          {/* Menu Icon (Right Side) */}
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Ionicons name="menu" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#444" />
          <TextInput
            style={styles.searchInput}
            value={search}
            placeholder="Search by email or order number..."
           onChangeText={handleSearchChange}
          />
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategoryTab}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        />
      </View>

      {/* Category Tabs - Now Horizontally Scrollable */}

      {/* Menu List */}
      <View style={{ padding: 15 }}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading menu items...</Text>
          </View>
        ) : (
          <FlatList
  data={menu}
  keyExtractor={(item) => item._id}
  renderItem={renderMenuItem}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
  showsVerticalScrollIndicator={false}
  ListFooterComponent={
    fetchingMore ? <Text style={{ textAlign: "center" }}>Loading...</Text> : null
  }
  ListEmptyComponent={
    <View style={styles.emptyContainer}>
      <Text>No menu items found</Text>
    </View>
  }
/>

        )}
      </View>
      {/* Floating Action Button (FAB) - Orange '+' */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("Add Menu")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  header: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    marginTop: 10,
    marginBottom: 20,
    color: "#333",
  },

  searchContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 48,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },

  // --- Tabs Styles ---
  tabsContainer: {
    marginBottom: 10,
  },
  tabsContentContainer: {
    paddingHorizontal: 8,
  },
  tabContainer: {
    paddingVertical: 6,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  tabText: {
    fontSize: 13,
    fontFamily: "Poppins-Medium",
    color: "#888",
  },
  activeTabText: {
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
  activeTabUnderline: {
    height: 3,
    backgroundColor: Color.DARK,
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
    fontSize: 12.5,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: 4,
  },

  topContainer: {
    backgroundColor: "white",
    padding: 15,
    paddingBottom: 5,
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
    fontSize: 13,
    color: "#555",
    fontFamily: "Poppins-Medium",
  },

  stockControl: {
    flexDirection: "column",
    alignItems: "center",
    marginRight: 5,
  },

  stockText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
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
    backgroundColor: Color.DARK,
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
    fontFamily: "Poppins-Medium",
  },

  headingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 17,
    fontFamily: "Poppins-SemiBold",
    color: "#000",
  },
});


export default MenuManagement;