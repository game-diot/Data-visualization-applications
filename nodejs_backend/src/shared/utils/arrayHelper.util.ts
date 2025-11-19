export const chunk = <T>(arr: T[], size: number): T[][] => {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const uniqueBy = <T>(arr: T[], keySelector: (item: T) => any): T[] => {
  const map = new Map();
  arr.forEach((item) => {
    const key = keySelector(item);
    if (!map.has(key)) map.set(key, item);
  });
  return Array.from(map.values());
};
