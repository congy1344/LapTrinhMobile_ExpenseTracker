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
import { getAllTransactions, deleteTransaction } from "../services/database";
import { syncToApi } from "../services/apiService";

type MainScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Main">;
};

type FilterType = "all" | "income" | "expense";

const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");

  // Load transactions from database
  const loadTransactions = async () => {
    try {
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
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

  // Filter transactions based on search query and filter type
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filterType !== "all" && transaction.type !== filterType) {
      return false;
    }

    // Filter by search query
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      transaction.title.toLowerCase().includes(query) ||
      transaction.amount.toString().includes(query) ||
      (transaction.type === "income" ? "thu" : "chi").includes(query)
    );
  });

  // Handle sync to API
  const handleSync = () => {
    Alert.alert(
      "Đồng bộ dữ liệu",
      "Bạn có muốn đồng bộ tất cả dữ liệu lên API?\n\nLưu ý: Dữ liệu cũ trên API sẽ bị xóa và thay thế bằng dữ liệu hiện tại.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng bộ",
          onPress: async () => {
            try {
              setIsSyncing(true);
              // Sync all active transactions (already filtered by getAllTransactions)
              await syncToApi(transactions);
              Alert.alert("Thành công", "Đã đồng bộ dữ liệu lên API! ✅");
            } catch (error) {
              console.error("Sync error:", error);
              Alert.alert(
                "Lỗi",
                "Không thể đồng bộ dữ liệu. Vui lòng kiểm tra:\n• Kết nối internet\n• Cấu hình API trong Settings"
              );
            } finally {
              setIsSyncing(false);
            }
          },
        },
      ]
    );
  };

  // Handle delete transaction
  const handleDelete = (transaction: Transaction) => {
    Alert.alert("Xóa giao dịch", `Bạn có muốn xóa "${transaction.title}"?`, [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransaction(transaction.id);
            Alert.alert("Thành công", "Đã chuyển vào thùng rác");
            loadTransactions();
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa giao dịch");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>EXPENSE TRACKER</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.syncButton}
                onPress={handleSync}
                disabled={isSyncing}
              >
                <Text style={styles.syncButtonText}>
                  {isSyncing ? "⏳" : "🔄"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate("Settings")}
              >
                <Text style={styles.settingsButtonText}>⚙️</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.trashButton}
                onPress={() => navigation.navigate("Trash")}
              >
                <Text style={styles.trashButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "all" && styles.filterTabActive,
            ]}
            onPress={() => setFilterType("all")}
          >
            <Text
              style={[
                styles.filterTabText,
                filterType === "all" && styles.filterTabTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "income" && styles.filterTabActiveIncome,
            ]}
            onPress={() => setFilterType("income")}
          >
            <Text
              style={[
                styles.filterTabText,
                filterType === "income" && styles.filterTabTextActive,
              ]}
            >
              Thu
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filterType === "expense" && styles.filterTabActiveExpense,
            ]}
            onPress={() => setFilterType("expense")}
          >
            <Text
              style={[
                styles.filterTabText,
                filterType === "expense" && styles.filterTabTextActive,
              ]}
            >
              Chi
            </Text>
          </TouchableOpacity>
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
                {searchQuery ? "Kết quả tìm kiếm" : "Giao dịch gần đây"}
              </Text>
              <Text style={styles.transactionCount}>
                ({filteredTransactions.length}
                {searchQuery && `/${transactions.length}`})
              </Text>
            </View>

            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery
                    ? "Không tìm thấy kết quả"
                    : "Chưa có giao dịch nào"}
                </Text>
                <Text style={styles.emptySubText}>
                  {searchQuery
                    ? `Không có giao dịch nào khớp với "${searchQuery}"`
                    : 'Nhấn nút "Add" để thêm giao dịch mới'}
                </Text>
              </View>
            ) : (
              filteredTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() =>
                    navigation.navigate("EditTransaction", {
                      transactionId: transaction.id,
                    })
                  }
                  onLongPress={() => handleDelete(transaction)}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddTransaction")}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
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
    padding: 20,
    backgroundColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  syncButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  syncButtonText: {
    fontSize: 18,
  },
  settingsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsButtonText: {
    fontSize: 18,
  },
  trashButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  trashButtonText: {
    fontSize: 18,
  },
  filterContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterTabActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterTabActiveIncome: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterTabActiveExpense: {
    backgroundColor: "#F44336",
    borderColor: "#F44336",
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTabTextActive: {
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
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default MainScreen;
