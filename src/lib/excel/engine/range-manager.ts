import { CellCoord, SelectionRange } from "../types";

export function colToLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function letterToCol(letter: string): number {
  let col = 0;
  const upper = letter.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    col = col * 26 + (upper.charCodeAt(i) - 64);
  }
  return col - 1;
}

export interface ParsedAddress {
  sheetName?: string;
  row: number;
  col: number;
  isRowAbs?: boolean;
  isColAbs?: boolean;
}

export function parseCoord(address: string): ParsedAddress | null {
  if (!address || typeof address !== "string") return null;

  let sheetName: string | undefined;
  let cellPart = address.trim();

  // Check for cross-sheet syntax: Sheet1!A1 or 'Sheet Name'!A1
  const exclIndex = cellPart.lastIndexOf("!");
  if (exclIndex !== -1) {
    sheetName = cellPart.substring(0, exclIndex).trim();
    if (
      (sheetName.startsWith("'") && sheetName.endsWith("'")) ||
      (sheetName.startsWith('"') && sheetName.endsWith('"'))
    ) {
      sheetName = sheetName.substring(1, sheetName.length - 1);
    }
    cellPart = cellPart.substring(exclIndex + 1).trim();
  }

  // Regex matching optional $ for col and row: e.g. $A$1, A$1, $A1, A1
  const match = cellPart.match(/^(\$?)([A-Za-z]+)(\$?)(\d+)$/);
  if (!match) return null;

  const isColAbs = match[1] === "$";
  const colStr = match[2].toUpperCase();
  const isRowAbs = match[3] === "$";
  const rowNum = parseInt(match[4], 10);

  if (rowNum < 1) return null;

  const res: ParsedAddress = {
    row: rowNum - 1,
    col: letterToCol(colStr),
  };
  if (sheetName) res.sheetName = sheetName;
  if (isRowAbs) res.isRowAbs = true;
  if (isColAbs) res.isColAbs = true;
  return res;
}

export function coordToAddress(
  row: number,
  col: number,
  isRowAbs = false,
  isColAbs = false,
  sheetName?: string
): string {
  const colLetter = colToLetter(col);
  const rowPart = `${isRowAbs ? "$" : ""}${row + 1}`;
  const colPart = `${isColAbs ? "$" : ""}${colLetter}`;
  const cellRef = `${colPart}${rowPart}`;

  if (sheetName) {
    const safeSheet = sheetName.includes(" ") ? `'${sheetName}'` : sheetName;
    return `${safeSheet}!${cellRef}`;
  }
  return cellRef;
}

export interface ParsedRange {
  sheetName?: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export function parseRange(rangeStr: string): ParsedRange | null {
  if (!rangeStr || typeof rangeStr !== "string") return null;

  let sheetName: string | undefined;
  let cleanRange = rangeStr.trim();

  const exclIndex = cleanRange.lastIndexOf("!");
  if (exclIndex !== -1) {
    sheetName = cleanRange.substring(0, exclIndex).trim();
    if (
      (sheetName.startsWith("'") && sheetName.endsWith("'")) ||
      (sheetName.startsWith('"') && sheetName.endsWith('"'))
    ) {
      sheetName = sheetName.substring(1, sheetName.length - 1);
    }
    cleanRange = cleanRange.substring(exclIndex + 1).trim();
  }

  const parts = cleanRange.split(":");
  if (parts.length === 1) {
    const c = parseCoord(parts[0]);
    if (!c) return null;
    return {
      sheetName: c.sheetName || sheetName,
      startRow: c.row,
      startCol: c.col,
      endRow: c.row,
      endCol: c.col,
    };
  }

  if (parts.length === 2) {
    const c1 = parseCoord(parts[0]);
    const c2 = parseCoord(parts[1]);
    if (!c1 || !c2) return null;

    return {
      sheetName: c1.sheetName || c2.sheetName || sheetName,
      startRow: Math.min(c1.row, c2.row),
      startCol: Math.min(c1.col, c2.col),
      endRow: Math.max(c1.row, c2.row),
      endCol: Math.max(c1.col, c2.col),
    };
  }

  return null;
}

export function normalizeRange(range: SelectionRange): {
  rMin: number;
  rMax: number;
  cMin: number;
  cMax: number;
} {
  return {
    rMin: Math.min(range.startRow, range.endRow),
    rMax: Math.max(range.startRow, range.endRow),
    cMin: Math.min(range.startCol, range.endCol),
    cMax: Math.max(range.startCol, range.endCol),
  };
}

export function expandRange(range: SelectionRange): CellCoord[] {
  const norm = normalizeRange(range);
  const coords: CellCoord[] = [];
  for (let r = norm.rMin; r <= norm.rMax; r++) {
    for (let c = norm.cMin; c <= norm.cMax; c++) {
      coords.push({ row: r, col: c });
    }
  }
  return coords;
}
