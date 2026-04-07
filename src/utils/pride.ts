export const PRIDE_COLORS = [
  '#ff4466',
  '#ff9933',
  '#ffdd00',
  '#33cc66',
  '#3399ff',
  '#7755dd',
  '#ee44cc',
] as const;

export function isPrideMonth(date: Date = new Date()): boolean {
  return date.getMonth() === 5; // June (0-indexed)
}

export function getPrideColor(index: number, date: Date = new Date()): string | undefined {
  if (!isPrideMonth(date)) return undefined;
  return PRIDE_COLORS[index % PRIDE_COLORS.length];
}
