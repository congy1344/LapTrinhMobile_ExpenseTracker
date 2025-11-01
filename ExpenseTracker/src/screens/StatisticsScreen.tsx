import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import { RootStackParamList } from "../types/Navigation";
import { getAllTransactions } from "../services/database";
import { Transaction } from "../types/Transaction";

type StatisticsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Statistics">;
};

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  // Load transactions from database
  const loadTransactions = async () => {
    try {
      const data = await getAllTransactions();
      setTransactions(data);
      calculateMonthlyData(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };

  // Calculate monthly income and expense
  const calculateMonthlyData = (transactions: Transaction[]) => {
    const monthlyMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }

      const data = monthlyMap.get(monthKey)!;
      if (transaction.type === "income") {
        data.income += transaction.amount;
      } else {
        data.expense += transaction.amount;
      }
    });

    // Convert to array and sort by date (most recent first)
    const dataArray: MonthlyData[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }))
      .sort((a, b) => {
        const [monthA, yearA] = a.month.split("/").map(Number);
        const [monthB, yearB] = b.month.split("/").map(Number);
        return yearB * 12 + monthB - (yearA * 12 + monthA);
      });

    // Take last 6 months
    setMonthlyData(dataArray.slice(0, 6).reverse());
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

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Prepare chart data
  const chartData = {
    labels: monthlyData.map((d) => d.month),
    datasets: [
      {
        data: monthlyData.map((d) => d.income),
        color: () => "#4CAF50", // Green for income
      },
      {
        data: monthlyData.map((d) => d.expense),
        color: () => "#F44336", // Red for expense
      },
    ],
    legend: ["Thu", "Chi"],
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thống kê</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Tổng thu</Text>
            <Text style={styles.summaryAmount}>
              {totalIncome.toLocaleString("vi-VN")} ₫
            </Text>
          </View>

          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Tổng chi</Text>
            <Text style={styles.summaryAmount}>
              {totalExpense.toLocaleString("vi-VN")} ₫
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              balance >= 0 ? styles.balancePositive : styles.balanceNegative,
            ]}
          >
            <Text style={styles.summaryLabel}>Số dư</Text>
            <Text style={styles.summaryAmount}>
              {balance.toLocaleString("vi-VN")} ₫
            </Text>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Biểu đồ thu chi theo tháng</Text>
          {monthlyData.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={chartData}
                width={Math.max(screenWidth - 32, monthlyData.length * 80)}
                height={280}
                yAxisLabel=""
                yAxisSuffix="k"
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: "",
                    stroke: "#e0e0e0",
                    strokeWidth: 1,
                  },
                  propsForLabels: {
                    fontSize: 12,
                  },
                }}
                style={styles.chart}
                fromZero
                showValuesOnTopOfBars
              />
            </ScrollView>
          ) : (
            <View style={styles.emptyChart}>
              <Text style={styles.emptyChartText}>
                Chưa có dữ liệu để hiển thị
              </Text>
              <Text style={styles.emptyChartSubText}>
                Thêm giao dịch để xem biểu đồ thống kê
              </Text>
            </View>
          )}
        </View>

        {/* Monthly Details */}
        {monthlyData.length > 0 && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Chi tiết theo tháng</Text>
            {monthlyData.map((data, index) => (
              <View key={index} style={styles.detailCard}>
                <Text style={styles.detailMonth}>{data.month}</Text>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Thu:</Text>
                    <Text style={[styles.detailValue, styles.incomeText]}>
                      +{data.income.toLocaleString("vi-VN")} ₫
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Chi:</Text>
                    <Text style={[styles.detailValue, styles.expenseText]}>
                      -{data.expense.toLocaleString("vi-VN")} ₫
                    </Text>
                  </View>
                </View>
                <View style={styles.detailBalance}>
                  <Text style={styles.detailLabel}>Chênh lệch:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      data.income - data.expense >= 0
                        ? styles.incomeText
                        : styles.expenseText,
                    ]}
                  >
                    {(data.income - data.expense).toLocaleString("vi-VN")} ₫
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    backgroundColor: "#673AB7",
    padding: 20,
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
  summaryContainer: {
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  incomeCard: {
    backgroundColor: "#4CAF50",
  },
  expenseCard: {
    backgroundColor: "#F44336",
  },
  balancePositive: {
    backgroundColor: "#2196F3",
  },
  balanceNegative: {
    backgroundColor: "#FF9800",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  chartContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChart: {
    padding: 40,
    alignItems: "center",
  },
  emptyChartText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  emptyChartSubText: {
    fontSize: 14,
    color: "#999",
  },
  detailsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  detailMonth: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailBalance: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  incomeText: {
    color: "#4CAF50",
  },
  expenseText: {
    color: "#F44336",
  },
});

export default StatisticsScreen;

