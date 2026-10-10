import type { User } from '@/lib/auth';

export type Group = {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  createdById: string;
  remainingDebts: number;
  cover?: string;
  _count: {
    members: number;
    transactions: number;
  };
};

type BaseTransaction = {
  id: string;
  description: string;
  createdAt: Date;
  paidBy: User;
  amount: number;
  balance: number;
  splits: { userId: string; amount: number }[];
};

export enum TransactionType {
  expense = 'EXPENSE',
  settlement = 'SETTLEMENT',
}

export type Transaction =
  | (BaseTransaction & {
      type: TransactionType.expense;
      category: TransactionCategory;
    })
  | (BaseTransaction & {
      type: TransactionType.settlement;
      category: null;
    });

export enum TransactionCategory {
  FOOD = 'FOOD',
  GROCERIES = 'GROCERIES',
  ACCOMMODATION = 'ACCOMMODATION',
  TRANSPORTATION = 'TRANSPORTATION',
  UTILITIES = 'UTILITIES',
  ENTERTAINMENT = 'ENTERTAINMENT',
  SHOPPING = 'SHOPPING',
  TRAVEL = 'TRAVEL',
  GIFTS = 'GIFTS',
  HEALTH = 'HEALTH',
  FEES = 'FEES',
  OTHER = 'OTHER',
}

export type SingleGroup = {
  createdBy: User;
  members: Member[];
  transactions: Transaction[];
  settlements: Debt[];
} & Group;

export type Member = {
  email: string;
  id: string;
  name: string;
  joinedAt: Date;
};

export type Debt = {
  from: {
    id: string;
    name: string;
  };
  to: {
    id: string;
    name: string;
  };
  amount: number;
};
