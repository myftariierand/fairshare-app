import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import axios from 'axios'
import {
  BabyIcon,
  BedDoubleIcon,
  BeerIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CarIcon,
  CoffeeIcon,
  DumbbellIcon,
  FileTextIcon,
  GiftIcon,
  HandHeartIcon,
  HeartPulseIcon,
  LandmarkIcon,
  PackageIcon,
  PartyPopperIcon,
  PawPrintIcon,
  PlaneIcon,
  ScissorsIcon,
  ShieldIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TvIcon,
  UtensilsIcon,
  WrenchIcon,
  ZapIcon,
} from 'lucide-react-native'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const msg = e.response?.data?.message ?? 'Could not reach the server'
    // NestJS validation errors come back as string[]
    if (Array.isArray(msg)) return msg.join('\n')
    if (typeof msg === 'string') return msg
  }
  return 'Something went wrong'
}

export function formatAmount(
  number: number,
  currency: string,
  signDisplay?: keyof Intl.NumberFormatOptionsSignDisplayRegistry
) {
  const userLocale = new Intl.NumberFormat().resolvedOptions().locale

  return new Intl.NumberFormat(userLocale, {
    style: 'currency',
    minimumFractionDigits: 2,
    currency,
    signDisplay,
  }).format(number)
}

export const transactionCategories = {
  DRINKS: {
    label: 'Drinks',
    icon: BeerIcon,
  },
  FOOD: {
    label: 'Food',
    icon: UtensilsIcon,
  },
  GROCERIES: {
    label: 'Groceries',
    icon: ShoppingCartIcon,
  },
  ACCOMMODATION: {
    label: 'Accommodation',
    icon: BedDoubleIcon,
  },
  TRANSPORTATION: {
    label: 'Transportation',
    icon: CarIcon,
  },
  COFFEE: {
    label: 'Coffee',
    icon: CoffeeIcon,
  },
  FEES: {
    label: 'Fees',
    icon: FileTextIcon,
  },
  ENTERTAINMENT: {
    label: 'Entertainment',
    icon: PartyPopperIcon,
  },
  SHOPPING: {
    label: 'Shopping',
    icon: ShoppingBagIcon,
  },
  OTHER: {
    label: 'Other',
    icon: PackageIcon,
  },

  SUBSCRIPTIONS: {
    label: 'Subscriptions',
    icon: TvIcon,
  },
  EDUCATION: {
    label: 'Education',
    icon: BookOpenIcon,
  },
  SPORTS: {
    label: 'Sports',
    icon: DumbbellIcon,
  },
  PETS: {
    label: 'Pets',
    icon: PawPrintIcon,
  },
  GIFTS: {
    label: 'Gifts',
    icon: GiftIcon,
  },
  TRAVEL: {
    label: 'Travel',
    icon: PlaneIcon,
  },
  HEALTH: {
    label: 'Health',
    icon: HeartPulseIcon,
  },
  TAXES: {
    label: 'Taxes',
    icon: LandmarkIcon,
  },
  MAINTENANCE: {
    label: 'Maintenance',
    icon: WrenchIcon,
  },
  INSURANCE: {
    label: 'Insurance',
    icon: ShieldIcon,
  },
  CHILDCARE: {
    label: 'Childcare',
    icon: BabyIcon,
  },
  WORK: {
    label: 'Work',
    icon: BriefcaseIcon,
  },
  DONATIONS: {
    label: 'Donations',
    icon: HandHeartIcon,
  },
  PERSONAL_CARE: {
    label: 'Personal Care',
    icon: ScissorsIcon,
  },
  UTILITIES: {
    label: 'Utilities',
    icon: ZapIcon,
  },
} as const

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
  let newValue = value.replace(/[^0-9.,]/g, '') // Remove non-numeric characters except '.' and ','

  const parts = newValue.split(/[,.]/) // Split on '.' or ','

  if (parts.length > 1) {
    newValue = parts[0] + '.' + parts.slice(1).join('') // Ensure only one decimal separator (.)
  }

  return newValue.replace(/^0+(?=\d)/, '') // Remove leading zeros
}

export function parseNumberInput(value: string): number {
  return parseFloat(value) || 0
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
}

export function toMinorUnit(amount: number, currency: string): number {
  const decimals = currencyDecimals[currency] ?? 2
  return Math.round(amount * Math.pow(10, decimals))
}

export function fromMinorUnit(amount: number, currency: string): string {
  const decimals = currencyDecimals[currency] ?? 2
  return (amount / Math.pow(10, decimals)).toFixed(decimals)
}
