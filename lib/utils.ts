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
