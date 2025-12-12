import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { FoodCard } from "./HomeScreen";
import Color from "../constants/Color";

const FavouriteScreen = ({ navigation }) => {
  const { favourites, toggleFavourite } = useAuth();

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Favourites Yet</Text>
      <Text style={styles.emptyText}>
        Tap the heart icon on any food item to add it here
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.browseButtonText}>Browse Menu</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Favourites</Text>
      </View>

      {/* Favourites List */}
      <FlatList
        data={favourites}
        numColumns={2}
        contentContainerStyle={[
          styles.listContainer,
          favourites.length === 0 && styles.emptyListContainer,
        ]}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={renderEmptyComponent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FoodCard
            item={item}
            handlePress={() =>
              navigation.navigate("Food Details", { foodItemId: item._id })
            }
            isFav={true}
            onToggleFav={toggleFavourite}
          />
        )}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom:5
  
    
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: "#222",
    flex: 1,
    // textAlign: "center",
    marginHorizontal: 10,
  },
  headerRight: {
    width: 60,
    alignItems: "flex-end",
  },
  favCount: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#666",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  listContainer: {
    paddingVertical: 16,
    paddingBottom: 80,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: Color.DARK,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },
});

export default FavouriteScreen;
