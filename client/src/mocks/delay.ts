export const delay = (ms = 250) => new Promise<void>((resolve) => setTimeout(resolve, ms));
