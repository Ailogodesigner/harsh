import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats integer minor currency units (paise/cents) to human readable currency.
 * Never uses floating-point arithmetic.
 * Example: 49900 paise -> "₹499.00" or "₹499"
 */
export function formatCurrency(minorUnits: number, currency = "INR"): string {
  const majorUnits = minorUnits / 100;
  if (currency.toUpperCase() === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: minorUnits % 100 === 0 ? 0 : 2,
    }).format(majorUnits);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: minorUnits % 100 === 0 ? 0 : 2,
  }).format(majorUnits);
}

/**
 * Generates an internal order identifier with Harsh Unlimited branding
 * e.g. HU-ORD-20261025-A1B2C3
 */
export function generateInternalOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HU-ORD-${dateStr}-${randomHex}`;
}

/**
 * Generates an in-game verification code
 * e.g. HU-94821
 */
export function generateVerificationCode(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `HU-${num}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
