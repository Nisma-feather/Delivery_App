import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import {
  Switch,
  Text,
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  TextInput,
  Animated,
  ScrollView,
  TouchableHighlight,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Octicons, Entypo } from "@expo/vector-icons";
import Color from "../../constants/Color";
import { api } from "../../api/apiConfig";

const FloatingInput = ({
  value,
  onValueChange,
  label,
  keyboardType,
  error,
  ismultiline = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: isFocused || value ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animation]);

  const labelStyle = {
    top: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ismultiline ? [40, 0] : [30, 0],
    }),
    fontSize: animation.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 14],
    }),
    color: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ["#777", Color.DARK],
    }),
  };

  return (
    <View style={floatingInputStyles.container}>
      <Animated.Text style={[floatingInputStyles.label, labelStyle]}>
        {label}
      </Animated.Text>

      <TextInput
        multiline={ismultiline}
        value={value}
        onChangeText={onValueChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType={keyboardType}
        style={[
          floatingInputStyles.input,
          ismultiline && floatingInputStyles.multilineInput,
          error && floatingInputStyles.inputError,
        ]}
        placeholderTextColor="transparent"
      />
      {error ? (
        <Text style={floatingInputStyles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

const AddNewMenu = () => {
  const [menu, setMenu] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    categories: [],
    isAvailable: true,
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Sorry, we need camera roll permissions to make this work!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log("filesixze",asset.fileSize)
        // Check file size (1MB limit)
        if (asset.fileSize && asset.fileSize > 1000000) {
          Alert.alert("Error", "Image size should not exceed 1 MB");
          return;
        }

        const base64 = `data:image/jpeg;base64,${asset.base64}`;
        setMenu((prev) => ({ ...prev, image: base64 }));
        // Clear any previous image errors
        setErrors((prev) => ({ ...prev, image: undefined }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleChange = (name, val) => {
    if (name === "price") {
      let cleaned = val.replace(/[^0-9.]/g, "");
      const dotCount = cleaned.split(".").length - 1;
      if (dotCount > 1) return;

      setMenu({ ...menu, price: cleaned });
    } else {
      setMenu({ ...menu, [name]: val });
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/category`);
      console.log("category", res.data.categories);
      setCategories(res.data?.categories || []);
    } catch (e) {
      console.log(e);
      Alert.alert("Error", "Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!menu.name.trim()) {
      valid = false;
      newErrors.name = "This field is required";
    }

    if (!menu.price) {
      valid = false;
      newErrors.price = "This field is required";
    } else if (isNaN(parseFloat(menu.price))) {
      valid = false;
      newErrors.price = "Please enter a valid price";
    }

    if (!menu.description.trim()) {
      valid = false;
      newErrors.description = "This field is required";
    }

    if (menu.categories.length < 1) {
      valid = false;
      newErrors.categories = "Choose at least one category";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleAddMenuItem = async () => {
    try {
      if (!validate()) {
        return;
      }

      setLoading(true);

      const menuData = {
        ...menu,
        price: parseFloat(menu.price), // Convert to number for backend
      };

      const res = await api.post("/foodItem", menuData);
      console.log(res.data);

      // Reset form after successful submission
      setMenu({
        name: "",
        price: "",
        description: "",
        image: "",
        categories: [],
        isAvailable: true,
      });
      setErrors({});

      Alert.alert("Success", "Menu item added successfully!");
    } catch (e) {
      console.log(e);
      console.log(e)
      Alert.alert("Error", "Failed to add menu item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setMenu((prev) => {
      const isSelected = prev.categories.includes(categoryId);
      const updatedCategories = isSelected
        ? prev.categories.filter((x) => x !== categoryId)
        : [...prev.categories, categoryId];

      // Clear category error when user selects at least one category
      if (updatedCategories.length > 0 && errors.categories) {
        setErrors((prev) => ({ ...prev, categories: undefined }));
      }

      return { ...prev, categories: updatedCategories };
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ backgroundColor: "#eee" }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => console.log("Go Back")}>
              <Octicons name="arrow-left" color="#000" size={25} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Add Menu Item</Text>

            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityText}>
                {menu.isAvailable ? "Available" : "Not Available"}
              </Text>
              <Switch
                value={menu.isAvailable}
                onValueChange={(val) => setMenu({ ...menu, isAvailable: val })}
                trackColor={{ false: "gray", true: Color.DARK }}
                thumbColor={menu.isAvailable ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Image Upload Section */}
          <View style={styles.section}>
            <Text style={styles.title}>ITEM IMAGE</Text>
            <View style={styles.imageSection}>
              {menu.image ? (
                <Image
                  source={{ uri: menu.image }}
                  style={styles.imagePreview}
                />
              ) : (
                <Image
                  source={require("../../assets/biriyani.png")}
                  style={styles.imagePreview}
                />
              )}
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Entypo name="camera" color={Color.DARK} size={25} />
                <Text style={styles.uploadText}>
                  {menu.image ? "Change Photo" : "Upload Photo"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Item Info Section */}
          <View style={styles.section}>
            <Text style={styles.title}>ITEM INFO</Text>
            <FloatingInput
              label="Name"
              value={menu.name}
              onValueChange={(val) => handleChange("name", val)}
              error={errors?.name}
            />

            <FloatingInput
              label="Price"
              value={menu.price}
              onValueChange={(val) => handleChange("price", val)}
              keyboardType="numeric"
              error={errors?.price}
            />
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <Text style={styles.title}>CATEGORIES</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => {
                const isSelected = menu.categories.includes(cat._id);
                return (
                  <TouchableOpacity
                    key={cat._id}
                    onPress={() => handleCategoryToggle(cat._id)}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.categoryTextSelected,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors?.categories && (
              <Text style={styles.errorText}>{errors.categories}</Text>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.title}>DESCRIPTION</Text>
            <FloatingInput
              ismultiline={true}
              label="Description"
              value={menu.description}
              onValueChange={(val) => handleChange("description", val)}
              error={errors?.description}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <TouchableHighlight
        style={[styles.buttonContainer, loading && styles.buttonDisabled]}
        onPress={handleAddMenuItem}
        disabled={loading}
      >
        <View style={styles.buttonContent}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Menu Item</Text>
          )}
        </View>
      </TouchableHighlight>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    height: 60,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
  },
  availabilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  availabilityText: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
    color: "#555",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 10,
    padding: 15,
  },
  title: {
    fontFamily: "Poppins-Bold",
    color: "#555",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  imageSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  imagePreview: {
    height: 100,
    width: 100,
    borderRadius: 8,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uploadText: {
    color: Color.DARK,
    fontFamily: "Poppins-Medium",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  categoryChipSelected: {
    borderColor: Color.DARK,
    backgroundColor: Color.DARK,
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins-Medium",
  },
  categoryTextSelected: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    fontFamily: "Poppins-Regular",
  },
  buttonContainer: {
    backgroundColor: Color.DARK,
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: "center",
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    height: 24,
    justifyContent: "center",
  },
  buttonText: {
    fontFamily: "Poppins-Bold",
    color: "#fff",
    fontSize: 16,
  },
});

const floatingInputStyles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingTop: 18,
    position: "relative",
  },
  label: {
    position: "absolute",
    left: 0,
    zIndex: 10,
    fontFamily: "Poppins-Medium",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    paddingHorizontal: 0,
    paddingVertical: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    height: 45,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  inputError: {
    borderBottomColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    fontFamily: "Poppins-Regular",
  },
});

export default AddNewMenu;
