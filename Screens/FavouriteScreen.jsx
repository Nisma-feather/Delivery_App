import { useAuth } from "../context/AuthContext";
import { FlatList, StyleSheet} from "react-native";
import { FoodCard } from "./HomeScreen";
import { SafeAreaView } from "react-native-safe-area-context";

const FavouriteScreen = ({navigation}) => {
  const { favourites, toggleFavourite } = useAuth();
  console.log("favorites",favourites)

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
      data={favourites} // foods list from backend
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <FoodCard
          item={item}
          handlePress={() => navigation.navigate("Food Details", { foodItemId: item._id })}
          isFav={favourites.some((food)=>food._id === item._id)}
          onToggleFav={toggleFavourite}
        />
      )}
      keyExtractor={(item) => item._id}
    />

    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:10
  },
  row: {
    justifyContent: "space-between",
  },
  listContainer: {
    paddingBottom: 20,
  },
});


export default FavouriteScreen