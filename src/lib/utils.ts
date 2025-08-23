import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stringAvatar = (name: string) => {
  return `${name.split(" ")?.[0]?.[0]}${name.split(" ")?.[1]?.[0]}`;
};
