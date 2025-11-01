import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Transaction } from "../types/Transaction";

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const { title, amount, createdAt, type } = transaction;

  // Format date to DD/MM/YYYY
  const formatDate = (date: Date): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Format amount with thousand separators
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString("vi-VN");
  };

  const isIncome = type === "income";
  const typeColor = isIncome ? "#4CAF50" : "#F44336";
  const typeLabel = isIncome ? "Thu" : "Chi";
  const amountPrefix = isIncome ? "+" : "-";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left side - Type indicator */}
      <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Top row - Title and Amount */}
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.amount, { color: typeColor }]}>
            {amountPrefix}
            {formatAmount(amount)} ₫
          </Text>
        </View>

        {/* Bottom row - Date and Type */}
        <View style={styles.bottomRow}>
          <Text style={styles.date}>{formatDate(createdAt)}</Text>
          <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
            <Text style={styles.typeText}>{typeLabel}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: "hidden",
  },
  typeIndicator: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
});

export default TransactionItem;
