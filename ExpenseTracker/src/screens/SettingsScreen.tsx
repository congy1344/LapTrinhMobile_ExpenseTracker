import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/Navigation";
import {
  getApiUrl,
  saveApiUrl,
  testApiConnection,
} from "../services/apiService";

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Settings">;
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [apiUrl, setApiUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadApiUrl();
  }, []);

  const loadApiUrl = async () => {
    try {
      setIsLoading(true);
      const url = await getApiUrl();
      setApiUrl(url);
    } catch (error) {
      console.error("Error loading API URL:", error);
      Alert.alert("Lỗi", "Không thể tải cấu hình API");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiUrl.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập URL API");
      return;
    }

    // Validate URL format
    try {
      new URL(apiUrl.trim());
    } catch (error) {
      Alert.alert("Lỗi", "URL không hợp lệ. Vui lòng nhập URL đúng định dạng.");
      return;
    }

    try {
      setIsSaving(true);
      await saveApiUrl(apiUrl.trim());
      Alert.alert("Thành công", "Đã lưu cấu hình API", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu cấu hình API");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiUrl.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập URL API");
      return;
    }

    try {
      setIsTesting(true);
      const isConnected = await testApiConnection(apiUrl.trim());

      if (isConnected) {
        Alert.alert("Thành công", "Kết nối API thành công! ✅");
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể kết nối đến API. Vui lòng kiểm tra lại URL."
        );
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kiểm tra kết nối API");
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cài đặt API</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📌 Hướng dẫn</Text>
            <Text style={styles.infoText}>
              1. Tạo API tại https://mockapi.io/{"\n"}
              2. Tạo project mới{"\n"}
              3. Tạo resource với tên "expensetracker"{"\n"}
              4. Thêm các field:{"\n"}
              {"   "}• title (string){"\n"}
              {"   "}• amount (number){"\n"}
              {"   "}• type (string){"\n"}
              {"   "}• createdAt (string){"\n"}
              5. Copy URL API và paste vào ô bên dưới
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL API MockAPI *</Text>
            <TextInput
              style={styles.input}
              placeholder="https://your-api.mockapi.io/expensetracker"
              value={apiUrl}
              onChangeText={setApiUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              multiline
            />
            <Text style={styles.hint}>
              Ví dụ: https://68e7865610e3f82fbf3f86d0.mockapi.io/expensetracker
            </Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>📋 Cấu trúc dữ liệu</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>
                {`{
  "id": "1",
  "title": "Mua sắm",
  "amount": 100000,
  "type": "expense",
  "createdAt": "2024-01-01T00:00:00.000Z"
}`}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.testButton, isTesting && styles.buttonDisabled]}
              onPress={handleTest}
              disabled={isTesting || isSaving}
            >
              <Text style={styles.testButtonText}>
                {isTesting ? "Đang kiểm tra..." : "🔍 Kiểm tra kết nối"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving || isTesting}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Đang lưu..." : "💾 Lưu cấu hình"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    backgroundColor: "#9C27B0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    padding: 16,
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976D2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#1565C0",
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 80,
    textAlignVertical: "top",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontStyle: "italic",
  },
  exampleBox: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  codeBlock: {
    backgroundColor: "#263238",
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontSize: 12,
    color: "#A5D6A7",
    lineHeight: 18,
  },
  buttonContainer: {
    gap: 12,
  },
  testButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  testButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default SettingsScreen;
