import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Color from "../constants/Color";

const MultiSelect = ({ items, selected, onChange }) => {
  const [open, setOpen] = useState(false);

  const toggleItem = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id)); // remove
    } else {
      onChange([...selected, id]); // add
    }
  };

  return (
    <View>
      {/* Dropdown Button */}
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setOpen(!open)}
      >
        <Text style={{ fontSize: 16 }}>
          {selected.length > 0
            ? `${selected.length} selected`
            : "Choose categories"}
        </Text>
        <AntDesign name={open ? "up" : "down"} size={18} color="#444" />
      </TouchableOpacity>

      {/* Dropdown List */}
      {open && (
        <View style={styles.dropdownBox}>
          <ScrollView style={{ maxHeight: 200 }}>
            {items.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.dropdownItem}
                onPress={() => toggleItem(cat.id)}
              >
                <Text style={{ fontSize: 15 }}>{cat.name}</Text>

                {selected.includes(cat.id) ? (
                  <AntDesign name="check" size={18} color={Color.DARK} />
                ) : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dropdownBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    marginTop: 5,
    paddingVertical: 5,
  },

  dropdownItem: {
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default MultiSelect;
