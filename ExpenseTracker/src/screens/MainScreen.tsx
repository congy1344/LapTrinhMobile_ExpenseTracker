import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import TransactionItem from "../components/TransactionItem";
import { Transaction } from "../types/Transaction";

const MainScreen: React.FC = () => {
  // Sample data for demonstration
  const sampleTransactions: Transaction[] = [
    {
      id: "1",
      title: "Lương tháng 11",
      amount: 15000000,
      createdAt: new Date("2025-11-01"),
      type: "income",
    },
    {
      id: "2",
      title: "Mua sắm siêu thị",
      amount: 500000,
      createdAt: new Date("2025-11-02"),
      type: "expense",
    },
    {
      id: "3",
      title: "Tiền điện tháng 10",
      amount: 350000,
      createdAt: new Date("2025-11-03"),
      type: "expense",
    },
    {
      id: "4",
      title: "Bán đồ cũ",
      amount: 1200000,
      createdAt: new Date("2025-11-04"),
      type: "income",
    },
    {
      id: "5",
      title: "Ăn uống",
      amount: 250000,
      createdAt: new Date("2025-11-05"),
      type: "expense",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>EXPENSE TRACKER</Text>
        </View>

        {/* Transaction List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.listContainer}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            {sampleTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
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
    padding: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 16,
    marginBottom: 12,
  },
});

export default MainScreen;
