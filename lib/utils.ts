import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import axios from 'axios';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const msg = e.response?.data?.message ?? 'Could not reach the server';
    // NestJS validation errors come back as string[]
    if (Array.isArray(msg)) return msg.join('\n');
    if (typeof msg === 'string') return msg;
  }
  return 'Something went wrong';
}

export function formatAmount(
  number: number,
  currency: string,
  signDisplay?: keyof Intl.NumberFormatOptionsSignDisplayRegistry
) {
  const userLocale = new Intl.NumberFormat().resolvedOptions().locale;

  return new Intl.NumberFormat(userLocale, {
    style: 'currency',
    minimumFractionDigits: 2,
    currency,
    signDisplay,
  }).format(number);
}

export const transactionCategories = {
  DRINKS: {
    label: 'Drinks',
    emoji: '🍺',
  },
  FOOD: {
    label: 'Food',
    emoji: '🍔',
  },
  GROCERIES: {
    label: 'Groceries',
    emoji: '🛒',
  },
  ACCOMMODATION: {
    label: 'Accommodation',
    emoji: '🏠',
  },
  TRANSPORTATION: {
    label: 'Transportation',
    emoji: '🚗',
  },
  COFFEE: {
    label: 'Coffee',
    emoji: '☕',
  },
  FEES: {
    label: 'Fees',
    emoji: '📄',
  },
  ENTERTAINMENT: {
    label: 'Entertainment',
    emoji: '🎉',
  },
  SHOPPING: {
    label: 'Shopping',
    emoji: '🛍️',
  },
  OTHER: {
    label: 'Other',
    emoji: '📦',
  },

  SUBSCRIPTIONS: {
    label: 'Subscriptions',
    emoji: '📺',
  },
  EDUCATION: {
    label: 'Education',
    emoji: '📚',
  },
  SPORTS: {
    label: 'Sports',
    emoji: '⚽',
  },
  PETS: {
    label: 'Pets',
    emoji: '🐶',
  },
  GIFTS: {
    label: 'Gifts',
    emoji: '🎁',
  },
  TRAVEL: {
    label: 'Travel',
    emoji: '✈️',
  },
  HEALTH: {
    label: 'Health',
    emoji: '🏥',
  },
  TAXES: {
    label: 'Taxes',
    emoji: '💰',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    emoji: '🔧',
  },
  INSURANCE: {
    label: 'Insurance',
    emoji: '🛡️',
  },
  CHILDCARE: {
    label: 'Childcare',
    emoji: '🧸',
  },
  WORK: {
    label: 'Work',
    emoji: '💼',
  },
  DONATIONS: {
    label: 'Donations',
    emoji: '❤️',
  },
  PERSONAL_CARE: {
    label: 'Personal Care',
    emoji: '💇',
  },
  UTILITIES: {
    label: 'Utilities',
    emoji: '⚡',
  },
} as const;
