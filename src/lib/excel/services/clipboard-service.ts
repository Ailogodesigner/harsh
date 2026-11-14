import { WorkbookData, SelectionRange, ClipboardState, CellData } from "../types";
import { normalizeRange } from "../engine/range-manager";

// Copy selected range to internal state and system clipboard
export async function copyToClipboard(
  workbook: WorkbookData,
  range: SelectionRange,
  setClipboard: (cb: ClipboardState | null) => void,
  isCut = false
) {
  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
  if (!activeSheet) return;

  const norm = normalizeRange(range);
  const cells: { relRow: number; relCol: number; data: CellData }[] = [];
  const tsvLines: string[] = [];

  for (let r = norm.rMin; r <= norm.rMax; r++) {
    const rowValues: string[] = [];
    for (let c = norm.cMin; c <= norm.cMax; c++) {
      const cell = activeSheet.grid[`${r}:${c}`] || { raw: "" };
      cells.push({
        relRow: r - norm.rMin,
        relCol: c - norm.cMin,
        data: { ...cell },
      });
      rowValues.push(String(cell.computed !== undefined && cell.computed !== null ? cell.computed : cell.raw ?? ""));
    }
    tsvLines.push(rowValues.join("\t"));
  }

  setClipboard({
    range: { ...range },
    isCut,
    cells,
  });

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(tsvLines.join("\n"));
    } catch (e) {
      console.warn("Could not write to system clipboard", e);
    }
  }
}

// Paste from internal clipboard or system clipboard
export async function pasteFromClipboard(
  workbook: WorkbookData,
  activeCell: { row: number; col: number },
  clipboard: ClipboardState | null,
  setClipboard: (cb: ClipboardState | null) => void,
  updateCells: (updates: { row: number; col: number; data: Partial<CellData> }[]) => void,
  clearCells: (range: SelectionRange, clearType?: "all" | "contents") => void,
  valuesOnly = false
) {
  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
  if (!activeSheet) return;

  // 1. If internal clipboard has data:
  if (clipboard && clipboard.cells.length > 0) {
    const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
    clipboard.cells.forEach(({ relRow, relCol, data }) => {
      const targetRow = activeCell.row + relRow;
      const targetCol = activeCell.col + relCol;
      if (targetRow < activeSheet.maxRows && targetCol < activeSheet.maxCols) {
        if (valuesOnly) {
          updates.push({
            row: targetRow,
            col: targetCol,
            data: {
              raw: data.computed !== undefined && data.computed !== null ? data.computed : data.raw,
            },
          });
        } else {
          updates.push({
            row: targetRow,
            col: targetCol,
            data: { ...data },
          });
        }
      }
    });

    updateCells(updates);

    if (clipboard.isCut) {
      clearCells(clipboard.range, "contents");
      setClipboard(null);
    }
    return;
  }

  // 2. Otherwise read from system clipboard (external TSV)
  if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      const lines = text.split(/\r?\n/);
      // Remove trailing empty line if present
      if (lines.length > 1 && lines[lines.length - 1] === "") {
        lines.pop();
      }

      const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
      lines.forEach((line, rIdx) => {
        const cols = line.split("\t");
        cols.forEach((val, cIdx) => {
          const targetRow = activeCell.row + rIdx;
          const targetCol = activeCell.col + cIdx;
          if (targetRow < activeSheet.maxRows && targetCol < activeSheet.maxCols) {
            const trimmed = val.trim();
            let parsedRaw: any = trimmed;
            if (trimmed !== "" && !trimmed.startsWith("=") && !isNaN(Number(trimmed))) {
              parsedRaw = Number(trimmed);
            }
            updates.push({
              row: targetRow,
              col: targetCol,
              data: { raw: parsedRaw },
            });
          }
        });
      });

      if (updates.length > 0) {
        updateCells(updates);
      }
    } catch (e) {
      console.warn("Could not read from system clipboard", e);
    }
  }
}

