export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  createdAt: Date;
  type: TransactionType;
}

