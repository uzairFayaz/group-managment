import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Svg, SvgXml } from "react-native-svg";
import { getGroupQr } from "../src/api/api";

const QrScreen = () => {
  const { groupId } = useLocalSearchParams();
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          throw new Error("Missing token");
        }
        if (!groupId) {
          throw new Error("Group ID is missing");
        }
        const qr = await getGroupQr(groupId as string);
        console.log(qr);
        setQrSvg(qr);
        setMessage("");
      } catch (err) {
        console.error("QR Fetch Error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setMessage("Failed to load QR code. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, [groupId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={{ pointerEvents: "auto" }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#4361ee" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Group QR Code</Text>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#4361ee" />
          </View>
        ) : qrSvg ? (
          <View style={styles.qrContainer}>
            <Svg width="100%" height={300} style={styles.qrBox}>
              <SvgXml xml={qrSvg} width="100%" height="100%" /> {/* Fallback to SvgXml if available */}
            </Svg>
            {message && <Text style={[styles.message, styles.error]}>{message}</Text>}
          </View>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.message}>
              {message || "No QR code available."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    textAlign: "center",
  },
  qrContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    maxWidth: 300,
  },
  qrBox: {
    width: "100%",
    aspectRatio: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  error: {
    color: "#dc2626",
  },
});

export default QrScreen;
