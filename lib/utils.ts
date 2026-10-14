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

/**
 * Sanitizes a numeric input string by allowing only digits, a single decimal separator,
 * and removing unnecessary characters.
 *
 * @param {string} value - The input string to be sanitized.
 * @returns {number} The sanitized numeric string with at most one decimal separator.
 *
 * @example
 * sanitizeNumberInput("12,34.56") // Returns 12.3456
 * sanitizeNumberInput("abc123") // Returns 123
 * sanitizeNumberInput("00123.45") // Returns 123.45
 */
export function sanitizeNumberInput(value: string) {
  let newValue = value.replace(/[^0-9.,]/g, ''); // Remove non-numeric characters except '.' and ','

  const parts = newValue.split(/[,.]/); // Split on '.' or ','

  if (parts.length > 1) {
    newValue = parts[0] + '.' + parts.slice(1).join(''); // Ensure only one decimal separator (.)
  }

  return newValue.replace(/^0+(?=\d)/, ''); // Remove leading zeros
}

export function parseNumberInput(value: string): number {
  return parseFloat(value) || 0;
}

const currencyDecimals: Record<string, number> = {
  EUR: 2, // eurocents
  ALL: 2, // qindarka (but rarely used)
  USD: 2, // cents
  GBP: 2, // pence
  JPY: 0, // no decimals
  CHF: 2, // rappen
  CNY: 2, // jiao/fen
  INR: 2, // paise
};

export function toMinorUnit(amount: number, currency: string): number {
  const decimals = currencyDecimals[currency] ?? 2;
  return Math.round(amount * Math.pow(10, decimals));
}

export function fromMinorUnit(amount: number, currency: string): string {
  const decimals = currencyDecimals[currency] ?? 2;
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
}
