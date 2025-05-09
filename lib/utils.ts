import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// This is for the class name for the MemeKage
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
