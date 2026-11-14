import { SheetGrid, CellData } from "../types";
import { colToLetter, letterToCol } from "./range-manager";

// Adjust relative formula cell references when dragging/filling
export function adjustFormulaReferences(
  formula: string,
  deltaRow: number,
  deltaCol: number
): string {
  if (!formula.startsWith("=")) return formula;

  // Match cell references like $A$1, A$1, $A1, A1, Sheet1!A1
  return formula.replace(
    /(?:('?[A-Za-z0-9_ ]+'?!)?)(\$?)([A-Za-z]+)(\$?)(\d+)/g,
    (match, sheetPrefix, colDollar, colLetters, rowDollar, rowDigits) => {
      const isColAbs = colDollar === "$";
      const isRowAbs = rowDollar === "$";

      let finalCol = colLetters;
      let finalRow = parseInt(rowDigits, 10);

      if (!isColAbs && deltaCol !== 0) {
        const cIdx = letterToCol(colLetters) + deltaCol;
        if (cIdx >= 0 && cIdx < 50) {
          finalCol = colToLetter(cIdx);
        }
      }

      if (!isRowAbs && deltaRow !== 0) {
        finalRow = Math.max(1, finalRow + deltaRow);
      }

      return `${sheetPrefix || ""}${isColAbs ? "$" : ""}${finalCol}${isRowAbs ? "$" : ""}${finalRow}`;
    }
  );
}

// Compute auto-fill series values across a range
export function computeAutoFillUpdates(
  grid: SheetGrid,
  sourceRange: { startRow: number; startCol: number; endRow: number; endCol: number },
  targetCell: { row: number; col: number }
): { row: number; col: number; data: Partial<CellData> }[] {
  const rMin = Math.min(sourceRange.startRow, sourceRange.endRow);
  const rMax = Math.max(sourceRange.startRow, sourceRange.endRow);
  const cMin = Math.min(sourceRange.startCol, sourceRange.endCol);
  const cMax = Math.max(sourceRange.startCol, sourceRange.endCol);

  const updates: { row: number; col: number; data: Partial<CellData> }[] = [];

  // Determine fill direction (mostly vertical down/up or horizontal right/left)
  const isVertical = Math.abs(targetCell.row - rMax) >= Math.abs(targetCell.col - cMax);

  if (isVertical) {
    const isDown = targetCell.row >= rMax;
    const fillStartRow = isDown ? rMax + 1 : targetCell.row;
    const fillEndRow = isDown ? targetCell.row : rMin - 1;

    for (let c = cMin; c <= cMax; c++) {
      // Gather source values in this column
      const sourceCells: CellData[] = [];
      for (let r = rMin; r <= rMax; r++) {
        sourceCells.push(grid[`${r}:${c}`] || { raw: "" });
      }

      const numRows = sourceCells.length;
      if (numRows === 0) continue;

      // Check if series of numbers
      const isNumericSeries =
        numRows >= 2 &&
        typeof sourceCells[0].raw === "number" &&
        typeof sourceCells[1].raw === "number";

      const step = isNumericSeries
        ? (Number(sourceCells[numRows - 1].raw) - Number(sourceCells[0].raw)) / (numRows - 1)
        : 0;

      for (let r = fillStartRow; r <= fillEndRow; r++) {
        const offset = isDown ? r - rMax : r - fillStartRow;
        const sourceIndex = (offset - 1) % numRows;
        const baseCell = sourceCells[sourceIndex < 0 ? sourceCells.length + sourceIndex : sourceIndex];

        let newRaw = baseCell.raw;

        if (typeof baseCell.raw === "string" && baseCell.raw.startsWith("=")) {
          const deltaR = isDown ? r - (rMin + sourceIndex) : r - (rMin + sourceIndex);
          newRaw = adjustFormulaReferences(baseCell.raw, deltaR, 0);
        } else if (isNumericSeries) {
          const lastNum = Number(sourceCells[numRows - 1].raw);
          newRaw = lastNum + step * (isDown ? r - rMax : 1);
        }

        updates.push({
          row: r,
          col: c,
          data: {
            ...baseCell,
            raw: newRaw,
          },
        });
      }
    }
  } else {
    // Horizontal fill
    const isRight = targetCell.col >= cMax;
    const fillStartCol = isRight ? cMax + 1 : targetCell.col;
    const fillEndCol = isRight ? targetCell.col : cMin - 1;

    for (let r = rMin; r <= rMax; r++) {
      const sourceCells: CellData[] = [];
      for (let c = cMin; c <= cMax; c++) {
        sourceCells.push(grid[`${r}:${c}`] || { raw: "" });
      }

      const numCols = sourceCells.length;
      if (numCols === 0) continue;

      for (let c = fillStartCol; c <= fillEndCol; c++) {
        const offset = isRight ? c - cMax : c - fillStartCol;
        const sourceIndex = (offset - 1) % numCols;
        const baseCell = sourceCells[sourceIndex < 0 ? sourceCells.length + sourceIndex : sourceIndex];

        let newRaw = baseCell.raw;
        if (typeof baseCell.raw === "string" && baseCell.raw.startsWith("=")) {
          const deltaC = isRight ? c - (cMin + sourceIndex) : c - (cMin + sourceIndex);
          newRaw = adjustFormulaReferences(baseCell.raw, 0, deltaC);
        }

        updates.push({
          row: r,
          col: c,
          data: {
            ...baseCell,
            raw: newRaw,
          },
        });
      }
    }
  }

  return updates;
}

