import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";
import { api } from "../../api/apiConfig";
import Color from "../../constants/Color";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState("");
  const [updateId, setUpdateId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/category?search=${search}`);
      setCategories(res.data.categories);
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddNewCategory = async () => {
    try {
      if (!newCategory.trim()) {
        setError("Category name is required");
        return;
      }

      await api.post("/category", { name: newCategory });
      setModalVisible(false);
      setNewCategory("");
      setError("");
      fetchCategories();
    } catch (e) {
      console.log(e);
    }
  };

  const handleCategoryUpdate = async () => {
    try {
      if (!updateId) return;

      if (!newCategory.trim()) {
        setError("Category name is required");
        return;
      }

      await api.put(`/category/${updateId}`, { name: newCategory });

      setModalVisible(false);
      setNewCategory("");
      setError("");
      setUpdateId(null);
      fetchCategories();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDelete = async (deleteId) => {
    try {
      await api.delete(`/category/${deleteId}`);
      fetchCategories();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const renderCategory = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.title}>{item.name}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {/* Edit */}
          <TouchableOpacity
            onPress={() => {
              setUpdateId(item._id);
              setNewCategory(item.name);
              setModalVisible(true);
            }}
          >
            <Feather name="edit" size={18} color={Color.DARK} />
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity
            style={{ marginLeft: 14 }}
            onPress={() =>
              Alert.alert(
                "Confirm Delete",
                "Are you sure you want to delete the category?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: () => handleDelete(item._id),
                  },
                ]
              )
            }
          >
            <Feather name="trash-2" size={18} color={Color.DARK} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const closeModal = () => {
    setModalVisible(false);
    setNewCategory("");
    setError("");
    setUpdateId(null);
  };

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
          placeholder="Search category"
          onChangeText={setSearch}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          closeModal();
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={22} color="white" />
        <Text style={styles.addButtonText}>Add New Category</Text>
      </TouchableOpacity>

      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        renderItem={renderCategory}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No categories found.</Text>
        )}
      />

      {/* Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.bottomOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={closeModal} />

          <View style={styles.bottomSheet}>
            <Text style={styles.modalTitle}>
              {updateId ? "Update Category" : "Add New Category"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter category name"
              value={newCategory}
              onChangeText={(text) => {
                setNewCategory(text);
                if (error) setError("");
              }}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={updateId ? handleCategoryUpdate : handleAddNewCategory}
              >
                <Text style={styles.confirmButtonText}>
                  {updateId ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CategoryManagement;

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

  addButton: {
    flexDirection: "row",
    backgroundColor: "#ed8835",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 15,
    marginLeft: 6,
    fontFamily: "Poppins-Bold",
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 20,
    marginVertical: 8,
    elevation: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
  },

  actionsContainer: { flexDirection: "row", alignItems: "center" },

  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  bottomSheet: {
    height: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    elevation: 10,
  },

  modalTitle: {
    fontSize: 17,
    marginBottom: 20,
    color: "#333",
    fontFamily: "Poppins-Bold",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 7,
    marginBottom: 30,
    fontFamily: "Poppins-Regular",
  },
  errorText: { color: "red", marginBottom: 10 },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: "center",
    color: "#333",
    fontSize: 15,
    fontFamily: "Poppins-Bold",
  },

  confirmButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  confirmButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 15,
    fontFamily: "Poppins-Bold",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#888",
  },
});
