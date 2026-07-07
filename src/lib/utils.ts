import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stringAvatar = (name: string) => {
  if (!name || typeof name !== "string") {
    return "";
  }

  const nameParts = name
    .trim()
    .split(" ")
    .filter((part) => part.length > 0);

  if (nameParts.length === 0) {
    return "";
  }

  const firstInitial = nameParts[0]?.[0] || "";
  const secondInitial = nameParts[1]?.[0] || "";

  return `${firstInitial}${secondInitial}`.toUpperCase();
};

export { formatCurrency } from '@/lib/formatting';

export const currentYear = new Date().getFullYear();

export const year = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - (4 - i);
  return { id: y, label: String(y) };
});