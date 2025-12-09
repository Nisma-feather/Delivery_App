import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { api } from "../../api/apiConfig";
import Color from "../../constants/Color";
import { Ionicons } from "@expo/vector-icons";

const AssignDeliveryPartner = ({ route, navigation }) => {
  const { orderId } = route.params || {};
  console.log("orderId",orderId)
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);

  useEffect(() => {
    fetchDeliveryPartners();
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      const res = await api.get("/delivery/partners");
      setPartners(res.data.partners);
    } catch (err) {
      console.log(err);
    }
  };

  const confirmAssign = async () => {
    if (!selectedPartner) return;
  if(!orderId){
    return
  }
    try {
     console.log(orderId)
      await api.post("/hotel/assign-delivery", {
        orderId,
        deliveryPartnerId: selectedPartner,
      });

      navigation.replace("Status Update");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Select Delivery Partner</Text>

        {partners.map((p) => {
          const isSelected = selectedPartner === p._id;

          return (
            <TouchableOpacity
              key={p._id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelectedPartner(p._id)}
            >
              {/* Profile Icon */}
              <View style={styles.iconBox}>
                <Ionicons name="person-circle-outline" size={45} color="#888" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{p.userName}</Text>
                <Text style={styles.mobile}>{p.mobile}</Text>
              </View>

              {/* Radio Button */}
              <View
                style={[
                  styles.radioOuter,
                  isSelected && { borderColor: Color.DARK },
                ]}
              >
                {isSelected && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.confirmBtn, !selectedPartner && { opacity: 0.5 }]}
        disabled={!selectedPartner}
        onPress={confirmAssign}
      >
        <Text style={styles.confirmText}>Confirm Assignment</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AssignDeliveryPartner;

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardSelected: {
    backgroundColor: "#e6f7ff",
    borderColor: "#00aaff",
  },
  iconBox: {
    marginRight: 15,
  },
  name: {
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
  mobile: {
    fontSize: 14,
    color: "#555",
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    backgroundColor: Color.DARK,
    borderRadius: 20,
  },
  confirmBtn: {
    backgroundColor: Color.DARK,
    padding: 16,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 17,
    color: "#fff",
    fontFamily: "Poppins-Bold",
  },
});
