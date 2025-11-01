import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types/Transaction';

const API_URL_KEY = '@expense_tracker_api_url';
const DEFAULT_API_URL = 'https://68e7865610e3f82fbf3f86d0.mockapi.io/expensetracker';

// Get saved API URL from AsyncStorage
export const getApiUrl = async (): Promise<string> => {
  try {
    const savedUrl = await AsyncStorage.getItem(API_URL_KEY);
    return savedUrl || DEFAULT_API_URL;
  } catch (error) {
    console.error('Error getting API URL:', error);
    return DEFAULT_API_URL;
  }
};

// Save API URL to AsyncStorage
export const saveApiUrl = async (url: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(API_URL_KEY, url);
  } catch (error) {
    console.error('Error saving API URL:', error);
    throw error;
  }
};

// Get all transactions from API
export const getTransactionsFromApi = async (): Promise<Transaction[]> => {
  try {
    const apiUrl = await getApiUrl();
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching from API:', error);
    throw error;
  }
};

// Delete a transaction from API
export const deleteTransactionFromApi = async (id: string): Promise<void> => {
  try {
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting from API:', error);
    throw error;
  }
};

// Delete all transactions from API
export const deleteAllTransactionsFromApi = async (): Promise<void> => {
  try {
    const transactions = await getTransactionsFromApi();
    
    // Delete each transaction
    const deletePromises = transactions.map((transaction) =>
      deleteTransactionFromApi(transaction.id)
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting all from API:', error);
    throw error;
  }
};

// Add a transaction to API
export const addTransactionToApi = async (
  transaction: Omit<Transaction, 'id'>
): Promise<Transaction> => {
  try {
    const apiUrl = await getApiUrl();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transaction),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding to API:', error);
    throw error;
  }
};

// Sync local data to API (delete all API data, then upload all local data)
export const syncToApi = async (localTransactions: Transaction[]): Promise<void> => {
  try {
    // Step 1: Delete all data from API
    await deleteAllTransactionsFromApi();
    
    // Step 2: Upload all local transactions to API
    const uploadPromises = localTransactions.map((transaction) =>
      addTransactionToApi({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        createdAt: transaction.createdAt,
      })
    );
    
    await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error syncing to API:', error);
    throw error;
  }
};

// Test API connection
export const testApiConnection = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch (error) {
    console.error('Error testing API connection:', error);
    return false;
  }
};

