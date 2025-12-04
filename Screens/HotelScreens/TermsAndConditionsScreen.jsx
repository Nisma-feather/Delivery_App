// TermsAndConditionsScreen.js
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TermsAndConditionsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms & Conditions</Text>

        <Text style={styles.heading}>1. Introduction</Text>
        <Text style={styles.text}>
          By using this application, you agree to follow the terms and
          conditions mentioned below. Please read them carefully before using
          the services.
        </Text>

        <Text style={styles.heading}>2. Account Usage</Text>
        <Text style={styles.text}>
          • You are responsible for maintaining the confidentiality of your
          login details.{"\n"}• All information provided must be accurate and
          up-to-date.{"\n"}• Any misuse of the app may lead to account
          suspension.
        </Text>

        <Text style={styles.heading}>3. Orders & Delivery</Text>
        <Text style={styles.text}>
          • Orders placed through the app must be handled promptly.{"\n"}•
          Delivery timelines may vary based on distance and availability.{"\n"}•
          The app is not responsible for delays caused by traffic, weather, or
          unforeseen circumstances.
        </Text>

        <Text style={styles.heading}>4. Payments</Text>
        <Text style={styles.text}>
          • All payments must be made through the approved methods provided in
          the app.{"\n"}• Refunds, if applicable, will follow platform
          guidelines.
        </Text>

        <Text style={styles.heading}>5. Prohibited Activities</Text>
        <Text style={styles.text}>
          • Fake orders, false information, or harmful content.{"\n"}•
          Attempting to hack, modify, or reverse engineer the app.{"\n"}•
          Violating any laws or policies while using the platform.
        </Text>

        <Text style={styles.heading}>6. Liability</Text>
        <Text style={styles.text}>
          We are not responsible for issues such as technical errors, network
          downtime, or loss of data.
        </Text>

        <Text style={styles.heading}>7. Updates</Text>
        <Text style={styles.text}>
          Terms & Conditions may be updated periodically. Continued use of the
          app implies acceptance of new terms.
        </Text>

      
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },
  text: {
    fontSize: 14,
    marginTop: 5,
    lineHeight: 20,
    color: "#555",
  },
  footer: {
    fontSize: 12,
    color: "#888",
    marginTop: 30,
    textAlign: "center",
    marginBottom: 20,
  },
});
