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

export const month = [
  { id: 1, label: 'January' },
  { id: 2, label: 'February' },
  { id: 3, label: 'March' },
  { id: 4, label: 'April' },
  { id: 5, label: 'May' },
  { id: 6, label: 'June' },
  { id: 7, label: 'July' },
  { id: 8, label: 'August' },
  { id: 9, label: 'September' },
  { id: 10, label: 'October' },
  { id: 11, label: 'November' },
  { id: 12, label: 'December' },
];

export const currentYear = new Date().getFullYear();

export const year = Array.from({ length: 5 }, (_, i) => {
  const y = currentYear - (4 - i);
  return { id: y, label: String(y) };
});