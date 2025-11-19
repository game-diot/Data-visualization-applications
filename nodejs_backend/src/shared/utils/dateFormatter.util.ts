export const formatDate = (
  date: Date | number | string,
  pattern = "YYYY-MM-DD HH:mm:ss"
): string => {
  const d = new Date(date);

  const pad = (n: number) => (n < 10 ? "0" + n : n.toString());

  return pattern
    .replace("YYYY", d.getFullYear().toString())
    .replace("MM", pad(d.getMonth() + 1))
    .replace("DD", pad(d.getDate()))
    .replace("HH", pad(d.getHours()))
    .replace("mm", pad(d.getMinutes()))
    .replace("ss", pad(d.getSeconds()));
};
