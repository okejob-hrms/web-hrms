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
