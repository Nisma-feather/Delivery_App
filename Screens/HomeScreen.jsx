import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, AntDesign, Octicons } from "@expo/vector-icons";
import Color from "../constants/Color";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/apiConfig";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

// Component to render individual food cards
export const FoodCard = ({ item, handlePress, isFav, onToggleFav }) => (
  <TouchableOpacity style={styles.newCardContainer} onPress={handlePress}>
    {/* Image + Heart Button */}
    <View style={styles.cardImageWrapper}>
      {item?.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.newCardImage}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={require("../assets/biriyani.png")}
          style={styles.newCardImage}
          resizeMode="cover"
        />
      )}

      {/* ❤️ Heart Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => onToggleFav(item._id)}
      >
        <Octicons
          name={isFav ? "heart-fill" : "heart"}
          size={20}
          color={isFav ? "red" : "black"}
        />
      </TouchableOpacity>
    </View>

    {/* Text Details */}
    <View style={styles.newCardDetails}>
      <Text style={styles.cardTitle}>{item.title || item.name}</Text>

      <Text style={styles.cardDescription} numberOfLines={1}>
        {item.description || item.subText}
      </Text>

      <View style={styles.cardBottomRow}>
        <Text style={styles.cardPrice}>
          ₹{item.price ? item.price.toFixed(2) : "0.00"}
        </Text>

       
      </View>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { favourites, toggleFavourite } = useAuth();
    const [categories, setCategoriesList] = useState([]);
   const [foodItems, setFoodItems] = useState([]);
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(true);
const [fetchingMore, setFetchingMore] = useState(false);
const [search, setSearch] = useState("");
const [activeCategory, setActiveCategory] = useState("ALL");

  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch Food Items with search and category filtering
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
      setFoodItems((prev) => {
        const newItems =
          nextPage === 1
            ? res.data.foodItems
            : [...prev, ...res.data.foodItems];

        // ✅ SAME duplicate removal as OrdersScreen
        return Array.from(
          new Map(newItems.map((item) => [item._id, item])).values()
        );
      });

      // ✅ SAME pagination logic as OrdersScreen
      setHasMore(nextPage < res.data.totalPages);
    } else {
      setFoodItems([]);
      setHasMore(false);
    }
  } catch (e) {
    console.log("Error fetching food items", e);
  } finally {
    setLoading(false);
    setFetchingMore(false);
  }
};

const handleLoadMore = () => {
  if (!hasMore || fetchingMore) return;

  const nextPage = page + 1;
  setPage(nextPage);
  fetchFoodItems(nextPage, search);
};


useEffect(() => {
  setPage(1);
  setHasMore(true);
  setFoodItems([]);
  fetchFoodItems(1, search);
}, [activeCategory]);


useEffect(()=>{
  fetchCategories()
})





  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/category");
      const fetchedCategories = res.data.categories || [];
      // Add "ALL" category at the beginning
      const allCategories = [{ _id: "ALL", name: "ALL" }, ...fetchedCategories];
      setCategoriesList(allCategories);
    } catch (e) {
      console.log("Category error:", e);
      // Keep "ALL" category even if API fails
      setCategoriesList([{ _id: "ALL", name: "ALL" }]);
    }
  };

  // Handle search input with debouncing
 const handleSearchChange = (text) => {
  setSearch(text);

  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  const timeout = setTimeout(() => {
    setPage(1);
    setHasMore(true);
    setFoodItems([]);
    fetchFoodItems(1, text);
  }, 500);

  setSearchTimeout(timeout);
};

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // Render function for category pills
  const renderCategoryPill = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryPill,
        activeCategory === item._id && styles.activeCategoryPill,
      ]}
      onPress={() => handleCategoryChange(item._id)}
    >
      <Text
        style={[
          styles.categoryText,
          activeCategory === item._id && styles.activeCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Fetch data on focus and when dependencies change


  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, []);

  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.fullScreenLoading}>
          <ActivityIndicator size="large" color={Color.DARK} />
          <Text style={styles.loadingText}>Loading food items...</Text>
        </View>
      );
    }

    return (
      
<FlatList
  data={foodItems}
  numColumns={2}
  keyExtractor={(item) => item._id}
  showsVerticalScrollIndicator={false}
  columnWrapperStyle={styles.row}
  contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
  renderItem={({ item }) => (
    <FoodCard
      item={item}
      handlePress={() =>
        navigation.navigate("Food Details", { foodItemId: item._id })
      }
      isFav={favourites.some((f) => f._id === item._id)}
      onToggleFav={toggleFavourite}
    />
  )}
  refreshing={loading}
  onRefresh={() => {
    setPage(1);
    setHasMore(true);
    setFoodItems([]);
    fetchFoodItems(1, search);
  }}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={
    fetchingMore ? (
      <ActivityIndicator
        style={{ marginVertical: 20 }}
        size="small"
        color={Color.DARK}
      />
    ) : null
  }
/>

    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Search */}
      <View style={styles.headerSection}>
        {/* <View style={styles.headerConatiner}>
          <Text style={styles.headerTitle}>
            Order Your Favourite Food Anytime!
          </Text>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" color="#444" size={26} />
          </TouchableOpacity>
        </View> */}

        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search-outline"
              color="#444"
              size={19}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search food..."
              style={styles.searchInput}
              value={search}
              onChangeText={handleSearchChange}
            />
            {search.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearch("")}
              >
                <Ionicons name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.categoriesSection}>
          <FlatList
            data={categories}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={renderCategoryPill}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>
      </View>

      {/* Main Content - Shows loading or food list */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // HEADER SECTION
  headerSection: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  headerConatiner: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    flex: 1,
    color: "#000",
  },

  // SEARCH BAR ROW
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  searchBox: {
    flex: 1,
    height: 50,
    backgroundColor: "#F2F2F2",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#333",
  },
  clearButton: {
    position: "absolute",
    right: 10,
    padding: 5,
    zIndex: 2,
  },

  // BANNER IMAGE
  bannerImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },

  // CATEGORIES SECTION
  categoriesSection: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  categoriesContainer: {
    paddingHorizontal: 0,
  },
  categoryPill: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  activeCategoryPill: {
    backgroundColor: Color.DARK,
    borderColor: Color.DARK ,
  },
  categoryText: {
    fontSize: 12.5,
    color: "#444",
    fontFamily: "Poppins-SemiBold",
  },
  activeCategoryText: {
    color: "#FFF",
    fontFamily: "Poppins-Bold",
  },

  // FULL SCREEN LOADING
  fullScreenLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Medium",
  },

  // LIST CONTAINER
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 60,
    backgroundColor: "#fff",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    paddingTop: 50,
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    fontFamily: "Poppins-Medium",
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: "#AAA",
    fontFamily: "Poppins-Regular",
  },

  // --- FOOD CARD STYLING ---
  newCardContainer: {
    width: (width - 45) / 2,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      },
    }),
    overflow: "hidden",
  },

  cardImageWrapper: {
    width: "100%",
    height: 130,
    overflow: "hidden",
  },

  newCardImage: {
    width: "100%",
    height: "100%",
  },

  addButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  newCardDetails: {
    padding: 12,
  },

  cardTitle: {
    fontSize: 12,
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },

  cardDescription: {
    fontSize: 10.5,
    color: "#777",
    marginVertical: 3,
    fontFamily: "Poppins-Regular",
  },

  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  cardPrice: {
    fontSize: 12.5,
    color: "#444",
    fontFamily: "Poppins-Bold",
  },

  cardRating: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardRatingText: {
    fontSize: 13,
    color: "#000",
    marginLeft: 4,
    fontFamily: "Poppins-Medium",
  },
});

export default HomeScreen;
