import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function replaceHost(url: string, hostname?: string): string {
  if (!url || !hostname) return url;

  try {
    const parsed = new URL(url);
    return `${hostname}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (err) {
    console.warn("Invalid URL passed to replaceS3Host:", url);
    console.error(err);
    return url;
  }
}
