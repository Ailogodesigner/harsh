import * as XLSX from "xlsx";
import { WorkbookData, SheetTab, SheetGrid, CellData } from "../types";
import { colToLetter, letterToCol } from "../engine/range-manager";

export function exportWorkbookToXLSX(workbook: WorkbookData, filename = "Workbook.xlsx") {
  const wb = XLSX.utils.book_new();

  workbook.sheets.forEach((sheet) => {
    const sheetData: any[][] = [];

    // Find bounds
    let maxR = 0;
    let maxC = 0;
    Object.keys(sheet.grid).forEach((key) => {
      const [rStr, cStr] = key.split(":");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (r > maxR) maxR = r;
      if (c > maxC) maxC = c;
    });

    for (let r = 0; r <= Math.max(maxR, 10); r++) {
      const rowArr: any[] = [];
      for (let c = 0; c <= Math.max(maxC, 6); c++) {
        const cell = sheet.grid[`${r}:${c}`];
        rowArr.push(cell ? (cell.computed !== undefined ? cell.computed : cell.raw) : "");
      }
      sheetData.push(rowArr);
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, sheet.name.substring(0, 31));
  });

  const safeName = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  XLSX.writeFile(wb, safeName);
}

export function exportSheetToCSV(sheet: SheetTab, filename = "Sheet.csv") {
  const rows: string[][] = [];
  let maxR = 0;
  let maxC = 0;

  Object.keys(sheet.grid).forEach((key) => {
    const [rStr, cStr] = key.split(":");
    const r = parseInt(rStr, 10);
    const c = parseInt(cStr, 10);
    if (r > maxR) maxR = r;
    if (c > maxC) maxC = c;
  });

  for (let r = 0; r <= maxR; r++) {
    const rowArr: string[] = [];
    for (let c = 0; c <= maxC; c++) {
      const cell = sheet.grid[`${r}:${c}`];
      const val = cell ? (cell.computed !== undefined ? cell.computed : cell.raw) : "";
      const strVal = String(val ?? "").replace(/"/g, '""');
      rowArr.push(`"${strVal}"`);
    }
    rows.push(rowArr);
  }

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function importFileToWorkbook(file: File): Promise<WorkbookData> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: "array" });

  const sheets: SheetTab[] = wb.SheetNames.map((sheetName, idx) => {
    const ws = wb.Sheets[sheetName];
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:Z65");
    const grid: SheetGrid = {};

    for (let r = range.s.r; r <= range.e.r; r++) {
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[cellAddr];
        if (cell && cell.v !== undefined && cell.v !== null) {
          const raw = cell.f ? `=${cell.f}` : cell.v;
          grid[`${r}:${c}`] = {
            raw,
            computed: cell.v,
            format: cell.t === "n" && String(cell.w || "").includes("%") ? "percentage" : "general",
          };
        }
      }
    }

    return {
      id: `sheet-${idx + 1}-${Date.now()}`,
      name: sheetName,
      grid,
      maxRows: Math.max(range.e.r + 15, 65),
      maxCols: Math.max(range.e.c + 5, 26),
    };
  });

  return {
    id: `wb-${Date.now()}`,
    title: file.name.replace(/\.[^/.]+$/, "") + ".xlsx",
    sheets: sheets.length > 0 ? sheets : [
      { id: "sheet-1", name: "Sheet1", grid: {}, maxRows: 65, maxCols: 26 },
    ],
    activeSheetId: sheets[0]?.id || "sheet-1",
  };
}

export function triggerPrint() {
  if (typeof window !== "undefined") {
    window.print();
  }
}

