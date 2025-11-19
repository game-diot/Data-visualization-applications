export const safeJsonParse = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const safeJsonStringify = (value: any): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return "{}";
  }
};
