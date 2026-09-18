export function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function normalizedOrder<T extends { id: string }>(items: T[]) {
  return items.map((item, index) => ({ id: item.id, sort_order: index + 1 }));
}