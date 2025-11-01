import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/Navigation';
import { updateTransaction, getAllTransactions } from '../services/database';
import { TransactionType, Transaction } from '../types/Transaction';

type EditTransactionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditTransaction'>;
  route: RouteProp<RootStackParamList, 'EditTransaction'>;
};

const EditTransactionScreen: React.FC<EditTransactionScreenProps> = ({
  navigation,
  route,
}) => {
  const { transactionId } = route.params;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // useRef để clear input
  const titleInputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);

  // Load transaction data
  useEffect(() => {
    loadTransaction();
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      setIsLoading(true);
      const transactions = await getAllTransactions();
      const transaction = transactions.find((t) => t.id === transactionId);

      if (transaction) {
        setTitle(transaction.title);
        setAmount(transaction.amount.toString());
        setType(transaction.type);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy giao dịch');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu giao dịch');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên khoản chi');
      return;
    }

    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      setIsSaving(true);
      await updateTransaction(transactionId, title.trim(), Number(amount), type);

      Alert.alert('Thành công', 'Đã cập nhật giao dịch', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật giao dịch. Vui lòng thử lại.');
      console.error('Error updating transaction:', error);
    } finally {
      setIsSaving(false);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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
            <Text style={styles.headerTitle}>Chỉnh sửa giao dịch</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên khoản chi *</Text>
              <TextInput
                ref={titleInputRef}
                style={styles.input}
                placeholder="Ví dụ: Mua sắm, Lương..."
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số tiền (VNĐ) *</Text>
              <TextInput
                ref={amountInputRef}
                style={styles.input}
                placeholder="0"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                maxLength={15}
              />
            </View>

            {/* Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại giao dịch *</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'expense' && styles.typeButtonActiveExpense,
                  ]}
                  onPress={() => setType('expense')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'expense' && styles.typeButtonTextActive,
                    ]}
                  >
                    Chi
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === 'income' && styles.typeButtonActiveIncome,
                  ]}
                  onPress={() => setType('income')}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      type === 'income' && styles.typeButtonTextActive,
                    ]}
                  >
                    Thu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  typeButtonActiveExpense: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  typeButtonActiveIncome: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditTransactionScreen;

