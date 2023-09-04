export function stringToBool(str: string | null | undefined) {
  return str != null && str != undefined;
}

export function R1C1toA1(row: number, column: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const base = chars.length;
  let columnRef = "";

  if (column < 1) {
    columnRef = chars[0];
  } else {
    let maxRoot = 0;
    while (base ** (maxRoot + 1) < column) {
      maxRoot++;
    }

    let remainder = column;
    for (let root = maxRoot; root >= 0; root--) {
      const value = Math.floor(remainder / base ** root);
      remainder -= value * base ** root;
      columnRef += chars[value - 1];
    }
  }
  // Use Math.max to ensure minimum row is 1
  return `${columnRef}${Math.max(row, 1)}`;
}
