import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Switch, Text,  TouchableOpacity,View,Image } from 'react-native'
import { AntDesign, Octicons, Entypo } from "@expo/vector-icons";
import Color from '../../constants/Color'


const MenuManagement = () => {
  const [menu, setMenu] = useState({
    _id: "673a111be51b7b001f6c1234",
    name: "Veg Biryani",
    price: 180,
    description:
      "Aromatic basmati rice cooked with fresh vegetables and signature spices.",
    image: "https://example.com/images/veg-biryani.jpg",
    categories: ["673a0ffde51b7b001f6c9871", "673a1004e51b7b001f6c9872"],
    isAvailable: true,
    createdAt: "2025-01-01T10:00:00.000Z",
    updatedAt: "2025-01-01T10:00:00.000Z",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eee" }}>
      {/* Header */}

      <View
        style={{
          flexDirection: "row",
          height: 60,
          alignItems: "center",
          backgroundColor: "#fff",
          paddingHorizontal: 15,
          justifyContent: "space-between",
        }}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Octicons name="arrow-left" color="#000" size={25} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Edit Product</Text>

        {/* Availability Toggle */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 14 }}>
            {menu?.isAvailable ? "Available" : "Not Available"}
          </Text>

          <Switch
            value={menu?.isAvailable}
            onValueChange={(val) => setMenu({ ...menu, isAvailable: val })}
            trackColor={{ false: "gray", true: Color.DARK }}
            thumbColor={menu?.isAvailable ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>
      {/* Image Section */}
      <View style={{backgroundColor:"#fff", marginTop:10,padding:15}}>
        <Text>ITEM IMAGE</Text>
        <View style={{flexDirection:"row",gap:20}}>
           <Image source={require("../../assets/biriyani.png")} style={{height:100,width:100}}/>
          <View style={{flexDirection:"row", gap:10}}>
            <Entypo name="camera" color={Color.DARK} size={24} />
            <Text style={{color:Color.DARK}}>Upload Photo</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default MenuManagement