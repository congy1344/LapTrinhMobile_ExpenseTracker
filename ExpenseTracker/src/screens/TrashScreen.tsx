import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import TransactionItem from "../components/TransactionItem";
import { Transaction } from "../types/Transaction";
import { RootStackParamList } from "../types/Navigation";
import {
  getDeletedTransactions,
  restoreTransaction,
  permanentlyDeleteTransaction,
} from "../services/database";

type TrashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Trash">;
};

const TrashScreen: React.FC<TrashScreenProps> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load deleted transactions from database
  const loadTransactions = async () => {
    try {
      const data = await getDeletedTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading deleted transactions:", error);
    }
  };

  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      transaction.title.toLowerCase().includes(query) ||
      transaction.amount.toString().includes(query) ||
      (transaction.type === "income" ? "thu" : "chi").includes(query)
    );
  });

  // Handle restore transaction
  const handleRestore = (transaction: Transaction) => {
    Alert.alert(
      "Khôi phục giao dịch",
      `Bạn có muốn khôi phục "${transaction.title}"?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Khôi phục",
          onPress: async () => {
            try {
              await restoreTransaction(transaction.id);
              Alert.alert("Thành công", "Đã khôi phục giao dịch");
              loadTransactions();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể khôi phục giao dịch");
            }
          },
        },
      ]
    );
  };

  // Handle permanent delete
  const handlePermanentDelete = (transaction: Transaction) => {
    Alert.alert(
      "Xóa vĩnh viễn",
      `Bạn có chắc chắn muốn xóa vĩnh viễn "${transaction.title}"? Hành động này không thể hoàn tác.`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa vĩnh viễn",
          style: "destructive",
          onPress: async () => {
            try {
              await permanentlyDeleteTransaction(transaction.id);
              Alert.alert("Thành công", "Đã xóa vĩnh viễn giao dịch");
              loadTransactions();
            } catch (error) {
              Alert.alert("Lỗi", "Không thể xóa giao dịch");
            }
          },
        },
      ]
    );
  };

  // Show action menu
  const showActionMenu = (transaction: Transaction) => {
    Alert.alert("Chọn hành động", `"${transaction.title}"`, [
      {
        text: "Khôi phục",
        onPress: () => handleRestore(transaction),
      },
      {
        text: "Xóa vĩnh viễn",
        style: "destructive",
        onPress: () => handlePermanentDelete(transaction),
      },
      {
        text: "Hủy",
        style: "cancel",
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thùng rác</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Tìm kiếm theo tên, số tiền, loại..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery("")}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.listContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? "Kết quả tìm kiếm" : "Giao dịch đã xóa"}
              </Text>
              <Text style={styles.transactionCount}>
                ({filteredTransactions.length}
                {searchQuery && `/${transactions.length}`})
              </Text>
            </View>

            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? "Không tìm thấy kết quả" : "Thùng rác trống"}
                </Text>
                <Text style={styles.emptySubText}>
                  {searchQuery
                    ? `Không có giao dịch nào khớp với "${searchQuery}"`
                    : "Các giao dịch đã xóa sẽ hiển thị ở đây"}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    💡 Nhấn vào item để xem menu hành động
                  </Text>
                </View>
                {filteredTransactions.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    onPress={() => showActionMenu(transaction)}
                  />
                ))}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FF5722",
    padding: 20,
    paddingTop: 10,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: "#333",
  },
  clearButton: {
    padding: 8,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: "#999",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  transactionCount: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#FFF3E0",
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  infoText: {
    fontSize: 14,
    color: "#E65100",
  },
});

export default TrashScreen;
