import * as SQLite from "expo-sqlite";
import { Transaction, TransactionType } from "../types/Transaction";

const db = SQLite.openDatabaseSync("expenseTracker.db");

// Initialize database
export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        createdAt TEXT NOT NULL,
        type TEXT NOT NULL,
        isDeleted INTEGER DEFAULT 0
      );
    `);

    // Add isDeleted column if it doesn't exist (for existing databases)
    try {
      await db.execAsync(`
        ALTER TABLE transactions ADD COLUMN isDeleted INTEGER DEFAULT 0;
      `);
    } catch (alterError) {
      // Column already exists, ignore error
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Add new transaction
export const addTransaction = async (
  title: string,
  amount: number,
  type: TransactionType
): Promise<void> => {
  try {
    const createdAt = new Date().toISOString();
    await db.runAsync(
      "INSERT INTO transactions (title, amount, createdAt, type) VALUES (?, ?, ?, ?)",
      [title, amount, createdAt, type]
    );
    console.log("Transaction added successfully");
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
};

// Get all transactions (not deleted)
export const getAllTransactions = async (): Promise<Transaction[]> => {
  try {
    const result = await db.getAllAsync<{
      id: number;
      title: string;
      amount: number;
      createdAt: string;
      type: TransactionType;
    }>(
      "SELECT * FROM transactions WHERE isDeleted = 0 ORDER BY createdAt DESC"
    );

    return result.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      amount: row.amount,
      createdAt: new Date(row.createdAt),
      type: row.type,
    }));
  } catch (error) {
    console.error("Error getting transactions:", error);
    throw error;
  }
};

// Get deleted transactions
export const getDeletedTransactions = async (): Promise<Transaction[]> => {
  try {
    const result = await db.getAllAsync<{
      id: number;
      title: string;
      amount: number;
      createdAt: string;
      type: TransactionType;
    }>(
      "SELECT * FROM transactions WHERE isDeleted = 1 ORDER BY createdAt DESC"
    );

    return result.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      amount: row.amount,
      createdAt: new Date(row.createdAt),
      type: row.type,
    }));
  } catch (error) {
    console.error("Error getting deleted transactions:", error);
    throw error;
  }
};

// Soft delete transaction (move to trash)
export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await db.runAsync("UPDATE transactions SET isDeleted = 1 WHERE id = ?", [
      parseInt(id),
    ]);
    console.log("Transaction moved to trash successfully");
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

// Restore transaction from trash
export const restoreTransaction = async (id: string): Promise<void> => {
  try {
    await db.runAsync("UPDATE transactions SET isDeleted = 0 WHERE id = ?", [
      parseInt(id),
    ]);
    console.log("Transaction restored successfully");
  } catch (error) {
    console.error("Error restoring transaction:", error);
    throw error;
  }
};

// Permanently delete transaction
export const permanentlyDeleteTransaction = async (
  id: string
): Promise<void> => {
  try {
    await db.runAsync("DELETE FROM transactions WHERE id = ?", [parseInt(id)]);
    console.log("Transaction permanently deleted");
  } catch (error) {
    console.error("Error permanently deleting transaction:", error);
    throw error;
  }
};

// Update transaction
export const updateTransaction = async (
  id: string,
  title: string,
  amount: number,
  type: TransactionType
): Promise<void> => {
  try {
    await db.runAsync(
      "UPDATE transactions SET title = ?, amount = ?, type = ? WHERE id = ?",
      [title, amount, type, parseInt(id)]
    );
    console.log("Transaction updated successfully");
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
};
