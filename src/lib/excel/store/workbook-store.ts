import { create } from "zustand";
import { WorkbookData, SheetTab, SheetGrid, CellData, ChartConfig, SelectionRange } from "../types";
import { evaluateFormula } from "../engine/formula-engine";
import { normalizeRange } from "../engine/range-manager";

const STORAGE_KEY = "notixnode_excel_365_data_v4";

// Initial NotixNode Cluster Starter Dataset
export const initialClusterGrid: SheetGrid = {
  // Row 1 (index 0) - Title Block
  "0:0": {
    raw: "NOTIXNODE CLUSTER SPREADSHEET 2026",
    fontSize: 16,
    bold: true,
    textColor: "#ffffff",
    bgColor: "#1E293B",
  },

  // Row 3 (index 2) - Table Headers
  "2:0": { raw: "Server Node", bold: true, align: "left" },
  "2:1": { raw: "RAM (GB)", bold: true, align: "right" },
  "2:2": { raw: "CPU Cores", bold: true, align: "right" },
  "2:3": { raw: "Monthly Cost (₹)", bold: true, align: "right" },
  "2:4": { raw: "Active Clients", bold: true, align: "right" },
  "2:5": { raw: "Monthly Revenue (₹)", bold: true, align: "right" },

  // Row 4 (index 3) - Basic Node Tier-1
  "3:0": { raw: "Basic Node Tier-1", align: "left" },
  "3:1": { raw: 1, align: "right", format: "number" },
  "3:2": { raw: 1, align: "right", format: "number" },
  "3:3": { raw: 69, align: "right", format: "currency" },
  "3:4": { raw: 24, align: "right", format: "number" },
  "3:5": { raw: "=D4*E4", computed: "1656", align: "right", format: "currency" },

  // Row 5 (index 4) - Standard Node Tier-2
  "4:0": { raw: "Standard Node Tier-2", align: "left" },
  "4:1": { raw: 1, align: "right", format: "number" },
  "4:2": { raw: 2, align: "right", format: "number" },
  "4:3": { raw: 149, align: "right", format: "currency" },
  "4:4": { raw: 15, align: "right", format: "number" },
  "4:5": { raw: "=D5*E5", computed: "2235", align: "right", format: "currency" },

  // Row 6 (index 5) - Premium Node Tier-3
  "5:0": { raw: "Premium Node Tier-3", align: "left" },
  "5:1": { raw: 1, align: "right", format: "number" },
  "5:2": { raw: 3, align: "right", format: "number" },
  "5:3": { raw: 249, align: "right", format: "currency" },
  "5:4": { raw: 8, align: "right", format: "number" },
  "5:5": { raw: "=D6*E6", computed: "1992", align: "right", format: "currency" },

  // Row 7 (index 6) - Total Infrastructure
  "6:0": {
    raw: "Total Infrastructure",
    bold: true,
    align: "left",
    borders: { doubleBottom: true },
  },
  "6:1": {
    raw: "=SUM(B4:B6)",
    computed: 3,
    bold: true,
    align: "right",
    borders: { doubleBottom: true },
  },
  "6:2": {
    raw: "=SUM(C4:C6)",
    computed: 6,
    bold: true,
    align: "right",
    borders: { doubleBottom: true },
  },
  "6:3": {
    raw: "=AVERAGE(D4:D6)",
    computed: 155.67,
    bold: true,
    align: "right",
    format: "currency",
    borders: { doubleBottom: true },
  },
  "6:4": {
    raw: "=SUM(E4:E6)",
    computed: 47,
    bold: true,
    align: "right",
    borders: { doubleBottom: true },
  },
  "6:5": {
    raw: "=SUM(F4:F6)",
    computed: 5883,
    bold: true,
    align: "right",
    format: "currency",
    borders: { doubleBottom: true },
  },
};

const defaultSheets: SheetTab[] = [
  {
    id: "sheet-1",
    name: "Cluster Nodes",
    grid: initialClusterGrid,
    maxRows: 65,
    maxCols: 26,
    tabColor: "#107c41",
  },
];

interface HistoryEntry {
  sheetId: string;
  grid: SheetGrid;
}

interface WorkbookState {
  workbook: WorkbookData;
  history: HistoryEntry[];
  historyIndex: number;
  autoSaveOn: boolean;
  saveStatus: string;

  // Actions
  setWorkbook: (wb: WorkbookData) => void;
  setTitle: (title: string) => void;
  setActiveSheetId: (id: string) => void;
  setAutoSaveOn: (on: boolean) => void;
  setSaveStatus: (status: string) => void;

  // Cell Updates
  updateCell: (row: number, col: number, data: Partial<CellData>) => void;
  updateCells: (updates: { row: number; col: number; data: Partial<CellData> }[]) => void;
  recalculateSheet: (sheetId?: string) => void;

  // Sheet Management
  addSheet: (name?: string) => void;
  removeSheet: (sheetId: string) => void;
  renameSheet: (sheetId: string, newName: string) => void;
  duplicateSheet: (sheetId: string) => void;
  reorderSheets: (fromIndex: number, toIndex: number) => void;
  setSheetTabColor: (sheetId: string, color?: string) => void;

  // Structural (Rows / Columns)
  insertRow: (atRow: number) => void;
  deleteRow: (atRow: number) => void;
  insertCol: (atCol: number) => void;
  deleteCol: (atCol: number) => void;
  resizeRow: (row: number, height: number) => void;
  resizeCol: (col: number, width: number) => void;
  freezePanes: (rows: number, cols: number) => void;

  // Data operations
  sortRange: (range: SelectionRange, colIndex: number, ascending: boolean) => void;
  clearCells: (range: SelectionRange, clearType?: "all" | "contents" | "formats") => void;

  // Charts
  addChart: (chart: ChartConfig) => void;
  deleteChart: (id: string) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;

  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

export const useWorkbookStore = create<WorkbookState>((set, get) => ({
  workbook: {
    id: "wb-notixnode-2026",
    title: "Book4.xlsx",
    sheets: defaultSheets,
    activeSheetId: "sheet-1",
    charts: [],
  },
  history: [{ sheetId: "sheet-1", grid: initialClusterGrid }],
  historyIndex: 0,
  autoSaveOn: true,
  saveStatus: "Saved",

  setWorkbook: (wb) => {
    set({
      workbook: wb,
      history: [{ sheetId: wb.activeSheetId, grid: wb.sheets.find((s) => s.id === wb.activeSheetId)?.grid || {} }],
      historyIndex: 0,
    });
    get().saveToStorage();
  },

  setTitle: (title) => {
    set((state) => ({
      workbook: { ...state.workbook, title },
    }));
    get().saveToStorage();
  },

  setActiveSheetId: (id) => {
    const sheet = get().workbook.sheets.find((s) => s.id === id);
    if (!sheet) return;
    set((state) => ({
      workbook: { ...state.workbook, activeSheetId: id },
      history: [{ sheetId: id, grid: sheet.grid }],
      historyIndex: 0,
    }));
  },

  setAutoSaveOn: (on) => set({ autoSaveOn: on }),
  setSaveStatus: (status) => set({ saveStatus: status }),

  updateCells: (updates) => {
    const { workbook, history, historyIndex, autoSaveOn } = get();
    const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!activeSheet) return;

    const newGrid: SheetGrid = { ...activeSheet.grid };

    updates.forEach(({ row, col, data }) => {
      const key = `${row}:${col}`;
      const existing = newGrid[key] || { raw: "" };
      const updated = { ...existing, ...data };

      if (updated.raw && String(updated.raw).startsWith("=")) {
        updated.computed = evaluateFormula(
          String(updated.raw),
          newGrid,
          workbook.sheets,
          activeSheet.name
        );
      } else {
        updated.computed = undefined;
      }

      if (
        (updated.raw === "" || updated.raw === undefined) &&
        !updated.bgColor &&
        !updated.borders
      ) {
        delete newGrid[key];
      } else {
        newGrid[key] = updated;
      }
    });

    // Also recalculate dependent formula cells in this sheet
    Object.keys(newGrid).forEach((k) => {
      const cell = newGrid[k];
      if (cell && String(cell.raw).startsWith("=")) {
        cell.computed = evaluateFormula(
          String(cell.raw),
          newGrid,
          workbook.sheets,
          activeSheet.name
        );
      }
    });

    const newSheets = workbook.sheets.map((s) =>
      s.id === workbook.activeSheetId ? { ...s, grid: newGrid } : s
    );

    const upToCurrent = history.slice(0, historyIndex + 1);
    const nextHistory = [...upToCurrent, { sheetId: activeSheet.id, grid: newGrid }];
    if (nextHistory.length > 50) nextHistory.shift();

    set({
      workbook: { ...workbook, sheets: newSheets },
      history: nextHistory,
      historyIndex: nextHistory.length - 1,
    });

    if (autoSaveOn) {
      get().saveToStorage();
    }
  },

  updateCell: (row, col, data) => {
    get().updateCells([{ row, col, data }]);
  },

  recalculateSheet: (sheetId) => {
    const { workbook } = get();
    const targetId = sheetId || workbook.activeSheetId;
    const sheet = workbook.sheets.find((s) => s.id === targetId);
    if (!sheet) return;

    const updatedGrid: SheetGrid = { ...sheet.grid };
    Object.keys(updatedGrid).forEach((k) => {
      const cell = updatedGrid[k];
      if (cell && String(cell.raw).startsWith("=")) {
        cell.computed = evaluateFormula(
          String(cell.raw),
          updatedGrid,
          workbook.sheets,
          sheet.name
        );
      }
    });

    const newSheets = workbook.sheets.map((s) =>
      s.id === targetId ? { ...s, grid: updatedGrid } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
  },

  addSheet: (name) => {
    const { workbook } = get();
    const sheetNum = workbook.sheets.length + 1;
    const sheetName = name || `Sheet${sheetNum}`;
    const newId = `sheet-${Date.now()}`;
    const newSheet: SheetTab = {
      id: newId,
      name: sheetName,
      grid: {},
      maxRows: 65,
      maxCols: 26,
    };

    set({
      workbook: {
        ...workbook,
        sheets: [...workbook.sheets, newSheet],
        activeSheetId: newId,
      },
      history: [{ sheetId: newId, grid: {} }],
      historyIndex: 0,
    });
    get().saveToStorage();
  },

  removeSheet: (sheetId) => {
    const { workbook } = get();
    if (workbook.sheets.length <= 1) return;
    const remaining = workbook.sheets.filter((s) => s.id !== sheetId);
    const newActiveId = remaining[0].id;
    set({
      workbook: {
        ...workbook,
        sheets: remaining,
        activeSheetId: newActiveId,
      },
      history: [{ sheetId: newActiveId, grid: remaining[0].grid }],
      historyIndex: 0,
    });
    get().saveToStorage();
  },

  renameSheet: (sheetId, newName) => {
    const { workbook } = get();
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updated = workbook.sheets.map((s) =>
      s.id === sheetId ? { ...s, name: trimmed } : s
    );
    set({ workbook: { ...workbook, sheets: updated } });
    get().saveToStorage();
  },

  duplicateSheet: (sheetId) => {
    const { workbook } = get();
    const target = workbook.sheets.find((s) => s.id === sheetId);
    if (!target) return;

    const newId = `sheet-${Date.now()}`;
    const copySheet: SheetTab = {
      ...target,
      id: newId,
      name: `${target.name} (Copy)`,
      grid: JSON.parse(JSON.stringify(target.grid)),
    };

    set({
      workbook: {
        ...workbook,
        sheets: [...workbook.sheets, copySheet],
        activeSheetId: newId,
      },
      history: [{ sheetId: newId, grid: copySheet.grid }],
      historyIndex: 0,
    });
    get().saveToStorage();
  },

  reorderSheets: (fromIndex, toIndex) => {
    const { workbook } = get();
    const sheets = [...workbook.sheets];
    const [moved] = sheets.splice(fromIndex, 1);
    sheets.splice(toIndex, 0, moved);
    set({ workbook: { ...workbook, sheets } });
    get().saveToStorage();
  },

  setSheetTabColor: (sheetId, color) => {
    const { workbook } = get();
    const sheets = workbook.sheets.map((s) =>
      s.id === sheetId ? { ...s, tabColor: color } : s
    );
    set({ workbook: { ...workbook, sheets } });
    get().saveToStorage();
  },

  insertRow: (atRow) => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;

    const newGrid: SheetGrid = {};
    Object.entries(active.grid).forEach(([key, cell]) => {
      const [rStr, cStr] = key.split(":");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (r >= atRow) {
        newGrid[`${r + 1}:${c}`] = cell;
      } else {
        newGrid[`${r}:${c}`] = cell;
      }
    });

    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, grid: newGrid, maxRows: s.maxRows + 1 } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
    get().saveToStorage();
  },

  deleteRow: (atRow) => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;

    const newGrid: SheetGrid = {};
    Object.entries(active.grid).forEach(([key, cell]) => {
      const [rStr, cStr] = key.split(":");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (r === atRow) return;
      if (r > atRow) {
        newGrid[`${r - 1}:${c}`] = cell;
      } else {
        newGrid[`${r}:${c}`] = cell;
      }
    });

    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, grid: newGrid } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
    get().saveToStorage();
  },

  insertCol: (atCol) => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;

    const newGrid: SheetGrid = {};
    Object.entries(active.grid).forEach(([key, cell]) => {
      const [rStr, cStr] = key.split(":");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (c >= atCol) {
        newGrid[`${r}:${c + 1}`] = cell;
      } else {
        newGrid[`${r}:${c}`] = cell;
      }
    });

    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, grid: newGrid, maxCols: s.maxCols + 1 } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
    get().saveToStorage();
  },

  deleteCol: (atCol) => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;

    const newGrid: SheetGrid = {};
    Object.entries(active.grid).forEach(([key, cell]) => {
      const [rStr, cStr] = key.split(":");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (c === atCol) return;
      if (c > atCol) {
        newGrid[`${r}:${c - 1}`] = cell;
      } else {
        newGrid[`${r}:${c}`] = cell;
      }
    });

    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, grid: newGrid } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
    get().saveToStorage();
  },

  resizeRow: (row, height) => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;
    const newHeights = { ...(active.rowHeights || {}), [row]: Math.max(18, height) };
    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, rowHeights: newHeights } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
  },

  resizeCol: (col, width) => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;
    const newWidths = { ...(active.colWidths || {}), [col]: Math.max(40, width) };
    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, colWidths: newWidths } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
  },

  freezePanes: (rows, cols) => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;
    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, freezeRows: rows, freezeCols: cols } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
  },

  sortRange: (range, colIndex, ascending) => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;

    const norm = normalizeRange(range);
    const rowObjs: { rIdx: number; keyVal: any; cells: Record<number, CellData> }[] = [];

    for (let r = norm.rMin; r <= norm.rMax; r++) {
      const rowCells: Record<number, CellData> = {};
      for (let c = norm.cMin; c <= norm.cMax; c++) {
        if (active.grid[`${r}:${c}`]) {
          rowCells[c] = active.grid[`${r}:${c}`];
        }
      }
      const targetCell = active.grid[`${r}:${colIndex}`];
      const keyVal = targetCell?.computed !== undefined ? targetCell.computed : targetCell?.raw;
      rowObjs.push({ rIdx: r, keyVal, cells: rowCells });
    }

    rowObjs.sort((a, b) => {
      const valA = a.keyVal ?? "";
      const valB = b.keyVal ?? "";
      const numA = Number(valA);
      const numB = Number(valB);

      if (!isNaN(numA) && !isNaN(numB)) {
        return ascending ? numA - numB : numB - numA;
      }
      return ascending
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    const newGrid = { ...active.grid };
    rowObjs.forEach((rObj, offset) => {
      const targetR = norm.rMin + offset;
      for (let c = norm.cMin; c <= norm.cMax; c++) {
        delete newGrid[`${targetR}:${c}`];
        if (rObj.cells[c]) {
          newGrid[`${targetR}:${c}`] = rObj.cells[c];
        }
      }
    });

    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, grid: newGrid } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
    get().saveToStorage();
  },

  clearCells: (range, clearType = "all") => {
    const { workbook } = get();
    const active = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
    if (!active) return;

    const norm = normalizeRange(range);
    const newGrid = { ...active.grid };

    for (let r = norm.rMin; r <= norm.rMax; r++) {
      for (let c = norm.cMin; c <= norm.cMax; c++) {
        const key = `${r}:${c}`;
        if (!newGrid[key]) continue;

        if (clearType === "all") {
          delete newGrid[key];
        } else if (clearType === "contents") {
          newGrid[key] = { ...newGrid[key], raw: "", computed: undefined };
        } else if (clearType === "formats") {
          const raw = newGrid[key].raw;
          const computed = newGrid[key].computed;
          newGrid[key] = { raw, computed };
        }
      }
    }

    const newSheets = workbook.sheets.map((s) =>
      s.id === active.id ? { ...s, grid: newGrid } : s
    );
    set({ workbook: { ...workbook, sheets: newSheets } });
    get().saveToStorage();
  },

  addChart: (chart) => {
    set((state) => ({
      workbook: {
        ...state.workbook,
        charts: [...(state.workbook.charts || []), chart],
      },
    }));
  },

  deleteChart: (id) => {
    set((state) => ({
      workbook: {
        ...state.workbook,
        charts: (state.workbook.charts || []).filter((c) => c.id !== id),
      },
    }));
  },

  undo: () => {
    const { history, historyIndex, workbook, autoSaveOn } = get();
    if (historyIndex > 0) {
      const prevEntry = history[historyIndex - 1];
      const newSheets = workbook.sheets.map((s) =>
        s.id === prevEntry.sheetId ? { ...s, grid: { ...prevEntry.grid } } : s
      );
      set({
        workbook: { ...workbook, sheets: newSheets },
        historyIndex: historyIndex - 1,
      });
      if (autoSaveOn) get().saveToStorage();
    }
  },

  redo: () => {
    const { history, historyIndex, workbook, autoSaveOn } = get();
    if (historyIndex < history.length - 1) {
      const nextEntry = history[historyIndex + 1];
      const newSheets = workbook.sheets.map((s) =>
        s.id === nextEntry.sheetId ? { ...s, grid: { ...nextEntry.grid } } : s
      );
      set({
        workbook: { ...workbook, sheets: newSheets },
        historyIndex: historyIndex + 1,
      });
      if (autoSaveOn) get().saveToStorage();
    }
  },

  saveToStorage: () => {
    const { workbook } = get();
    set({ saveStatus: "Saving..." });
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workbook));
      }
      setTimeout(() => set({ saveStatus: "Saved" }), 300);
    } catch (e) {
      console.error("Failed to save workbook:", e);
    }
  },

  loadFromStorage: () => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: WorkbookData = JSON.parse(cached);
          if (parsed && parsed.sheets && parsed.sheets.length > 0) {
            set({
              workbook: parsed,
              history: [
                {
                  sheetId: parsed.activeSheetId,
                  grid:
                    parsed.sheets.find((s) => s.id === parsed.activeSheetId)?.grid || {},
                },
              ],
              historyIndex: 0,
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to load workbook:", e);
    }
  },
}));

