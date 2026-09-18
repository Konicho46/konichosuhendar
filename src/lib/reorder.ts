export function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const currentItem = items[index];
  const targetItem = items[target];
  if (currentItem === undefined || targetItem === undefined) return items;
  return items.map((item, itemIndex) => {
    if (itemIndex === index) return targetItem;
    if (itemIndex === target) return currentItem;
    return item;
  });
}

export function normalizedOrder<T extends { id: string }>(items: T[]) {
  return items.map((item, index) => ({ id: item.id, sort_order: index + 1 }));
}