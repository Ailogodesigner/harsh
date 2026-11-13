"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Download,
  Upload,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  DollarSign,
  Percent,
  Search,
  Save,
  FolderOpen,
  Sigma,
  Filter,
  Check,
  X,
  Grid,
  ChevronDown,
  Sparkles,
  Maximize2,
  Minimize2,
  FileText,
  Copy,
  Scissors,
  Clipboard,
  Layers,
  Share2,
  MessageSquare,
  HelpCircle,
  Sun,
  Diamond,
  AlertTriangle,
  Minus,
  Square,
  ArrowUpDown,
  Table,
  Sliders,
  PaintBucket,
  Printer,
  FileImage,
  RefreshCw,
  BarChart3,
  PieChart,
  HelpCircle as QuestionIcon,
  Shield,
  Eye,
  Info,
  Lock,
  ZoomIn,
  ZoomOut,
  Replace,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";

// =============================================================================
// CELL & SHEET TYPE DEFINITIONS
// =============================================================================

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  bgColor?: string;
  align?: "left" | "center" | "right";
  fontFamily?: string;
  fontSize?: number;
  format?: "general" | "currency" | "percent" | "number";
  border?: boolean;
}

export interface CellData extends CellFormat {
  raw: string; // The formula or raw text (e.g. "=SUM(B4:B6)" or "69")
  computed?: string | number;
}

export type SheetGrid = Record<string, CellData>; // key: "row:col" e.g. "8:4" for E9

export interface SheetTab {
  id: string;
  name: string;
  grid: SheetGrid;
  maxRows: number;
  maxCols: number;
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

const DEFAULT_ROWS = 65;
const DEFAULT_COLS = 26; // A - Z

// =============================================================================
// COORDINATE & ADDRESS HELPERS
// =============================================================================

export function colToLetter(col: number): string {
  let temp = col;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function letterToCol(letter: string): number {
  let col = 0;
  const str = letter.toUpperCase();
  for (let i = 0; i < str.length; i++) {
    col = col * 26 + (str.charCodeAt(i) - 64);
  }
  return col - 1;
}

export function parseCoord(coord: string): CellCoord | null {
  const match = coord.trim().match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;
  const col = letterToCol(match[1]);
  const row = parseInt(match[2], 10) - 1;
  if (isNaN(row) || col < 0) return null;
  return { row, col };
}

// Clean and parse numeric values, stripping ₹, $, commas, and spaces
export function parseNumeric(val: any): number {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[₹$,\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Format numerical values into currency ₹, commas, or percentages
export function formatCellValue(val: string | number | undefined, format?: string): string {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "string" && val.startsWith("#")) return val;

  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[₹$,]/g, ""));
  if (isNaN(num)) return String(val);

  if (format === "currency") {
    const formattedNum =
      num % 1 === 0
        ? num.toLocaleString("en-IN")
        : num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `₹${formattedNum}`;
  }
  if (format === "percent") {
    return `${(num * 100).toFixed(1)}%`;
  }
  if (format === "number") {
    return num.toLocaleString("en-IN");
  }

  if (typeof val === "string" && (val.includes("₹") || val.includes("$"))) {
    return val;
  }

  return typeof val === "number" && !Number.isInteger(val) ? Number(val.toFixed(2)).toString() : String(val);
}

// =============================================================================
// COMPREHENSIVE FORMULA EVALUATOR
// =============================================================================

export function evaluateFormula(
  formula: string,
  grid: SheetGrid,
  visited = new Set<string>()
): string | number {
  if (!formula || typeof formula !== "string" || !formula.startsWith("=")) {
    return formula;
  }

  const expr = formula.substring(1).trim();

  // Helper to extract values from comma-separated arguments or ranges
  const extractArgs = (argsStr: string): (string | number)[] => {
    const tokens: string[] = [];
    let current = "";
    let inQuote = false;
    let parenDepth = 0;

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i];
      if (char === '"' || char === "'") inQuote = !inQuote;
      if (!inQuote) {
        if (char === "(") parenDepth++;
        else if (char === ")") parenDepth--;
        else if (char === "," && parenDepth === 0) {
          tokens.push(current.trim());
          current = "";
          continue;
        }
      }
      current += char;
    }
    if (current.trim()) tokens.push(current.trim());

    const results: (string | number)[] = [];

    for (const token of tokens) {
      // Range check: e.g. B4:B6
      const rangeMatch = token.match(/^([A-Za-z]+\d+):([A-Za-z]+\d+)$/);
      if (rangeMatch) {
        const start = parseCoord(rangeMatch[1]);
        const end = parseCoord(rangeMatch[2]);
        if (start && end) {
          const rMin = Math.min(start.row, end.row);
          const rMax = Math.max(start.row, end.row);
          const cMin = Math.min(start.col, end.col);
          const cMax = Math.max(start.col, end.col);
          for (let r = rMin; r <= rMax; r++) {
            for (let c = cMin; c <= cMax; c++) {
              const key = `${r}:${c}`;
              if (visited.has(key)) continue;
              const cell = grid[key];
              if (cell && cell.raw !== undefined && cell.raw !== "") {
                let val: string | number = cell.raw;
                if (typeof val === "string" && val.startsWith("=")) {
                  visited.add(key);
                  val = evaluateFormula(val, grid, visited);
                  visited.delete(key);
                }
                const num = parseNumeric(val);
                results.push(num);
              }
            }
          }
        }
        continue;
      }

      // Single Cell check: e.g. D4
      const singleCoord = parseCoord(token);
      if (singleCoord) {
        const key = `${singleCoord.row}:${singleCoord.col}`;
        if (visited.has(key)) continue;
        const cell = grid[key];
        if (cell && cell.raw !== undefined && cell.raw !== "") {
          let val: string | number = cell.raw;
          if (typeof val === "string" && val.startsWith("=")) {
            visited.add(key);
            val = evaluateFormula(val, grid, visited);
            visited.delete(key);
          }
          const num = parseNumeric(val);
          results.push(num);
        }
        continue;
      }

      // Quoted string: "Hello"
      if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
        results.push(token.slice(1, -1));
        continue;
      }

      // Number: 45 or 3.14
      const cleaned = token.replace(/[₹$,]/g, "");
      const num = parseFloat(cleaned);
      if (!isNaN(num)) {
        results.push(num);
        continue;
      }

      results.push(token);
    }

    return results;
  };

  // Match Function calls: FUNCTION(ARGS)
  const fnMatch = expr.match(/^([A-Za-z_]+)\(([\s\S]*)\)$/);
  if (fnMatch) {
    const fnName = fnMatch[1].toUpperCase();
    const argsStr = fnMatch[2].trim();
    const args = extractArgs(argsStr);
    const numArgs = args.filter((a): a is number => typeof a === "number");

    switch (fnName) {
      case "SUM":
        return numArgs.reduce((acc, curr) => acc + curr, 0);

      case "AVERAGE":
      case "AVG":
        return numArgs.length ? Number((numArgs.reduce((a, b) => a + b, 0) / numArgs.length).toFixed(2)) : 0;

      case "COUNT":
        return numArgs.length;

      case "COUNTA":
        return args.filter((a) => a !== "" && a !== null && a !== undefined).length;

      case "MAX":
        return numArgs.length ? Math.max(...numArgs) : 0;

      case "MIN":
        return numArgs.length ? Math.min(...numArgs) : 0;

      case "PRODUCT":
        return numArgs.length ? numArgs.reduce((a, b) => a * b, 1) : 0;

      case "ROUND": {
        const val = numArgs[0] ?? 0;
        const decimals = numArgs[1] ?? 0;
        const factor = Math.pow(10, decimals);
        return Math.round(val * factor) / factor;
      }

      case "ABS":
        return Math.abs(numArgs[0] ?? 0);

      case "SQRT":
        return Math.sqrt(Math.max(0, numArgs[0] ?? 0));

      case "POWER": {
        const base = numArgs[0] ?? 0;
        const exp = numArgs[1] ?? 1;
        return Math.pow(base, exp);
      }

      case "MOD": {
        const a = numArgs[0] ?? 0;
        const b = numArgs[1] ?? 1;
        return b !== 0 ? a % b : "#DIV/0!";
      }

      case "CONCAT":
      case "CONCATENATE":
        return args.join("");

      case "UPPER":
        return String(args[0] ?? "").toUpperCase();

      case "LOWER":
        return String(args[0] ?? "").toLowerCase();

      case "LEN":
        return String(args[0] ?? "").length;

      case "TRIM":
        return String(args[0] ?? "").trim();

      case "TODAY":
        return new Date().toISOString().split("T")[0];

      case "NOW":
        return new Date().toLocaleString();

      case "IF": {
        const parts = argsStr.split(",").map((s) => s.trim());
        if (parts.length >= 2) {
          let condStr = parts[0];
          condStr = condStr.replace(/[A-Za-z]+\d+/g, (m) => {
            const coord = parseCoord(m);
            if (!coord) return "0";
            const cVal = grid[`${coord.row}:${coord.col}`]?.raw ?? "0";
            return isNaN(Number(cVal)) ? `"${cVal}"` : cVal;
          });
          condStr = condStr.replace(/(?<![<>=!])=(?!=)/g, "==");
          let conditionResult = false;
          try {
            // eslint-disable-next-line no-eval
            conditionResult = Boolean(Function(`'use strict'; return (${condStr})`)());
          } catch {
            conditionResult = false;
          }

          const trueValRaw = parts[1];
          const falseValRaw = parts[2] ?? '""';
          const chosen = conditionResult ? trueValRaw : falseValRaw;
          return chosen.replace(/^["']|["']$/g, "");
        }
        return "#VALUE!";
      }
    }
  }

  // Arithmetic expression evaluation: =D4*E4 or =A1 + B1 * 2 or =2^3
  try {
    let replaced = expr.replace(/[A-Za-z]+\d+/g, (match) => {
      const coord = parseCoord(match);
      if (!coord) return "0";
      const key = `${coord.row}:${coord.col}`;
      if (visited.has(key)) return "0";
      const cell = grid[key];
      if (!cell || cell.raw === undefined || cell.raw === "") return "0";
      let cellVal: string | number = cell.raw;
      if (typeof cellVal === "string" && cellVal.startsWith("=")) {
        visited.add(key);
        cellVal = evaluateFormula(cellVal, grid, visited);
        visited.delete(key);
      }
      const num = parseNumeric(cellVal);
      return String(num);
    });

    // Exponent ^ -> **
    replaced = replaced.replace(/\^/g, "**");

    if (/^[0-9+\-*/().\s*]+$/.test(replaced)) {
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${replaced})`)();
      return typeof result === "number" && !isNaN(result)
        ? Number(result.toFixed(2)).toString()
        : String(result);
    }
  } catch {
    return "#VALUE!";
  }

  return formula;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ExcelEditorPage() {
  const [fileName, setFileName] = useState("Book4.xlsx");
  const [autoSaveOn, setAutoSaveOn] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving...">("Saved");
  const [activeTab, setActiveTab] = useState<
    "file" | "home" | "wps_pdf" | "insert" | "page_layout" | "formulas" | "data" | "review" | "view" | "help"
  >("home");

  // Selection & Active Cell (E9 default as requested)
  const [activeCell, setActiveCell] = useState<CellCoord>({ row: 8, col: 4 });
  const [selectionRange, setSelectionRange] = useState<CellRange | null>({
    startRow: 8,
    startCol: 4,
    endRow: 8,
    endCol: 4,
  });
  const [isSelecting, setIsSelecting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillTarget, setAutoFillTarget] = useState<CellCoord | null>(null);

  // Editing state
  const [editingCell, setEditingCell] = useState<CellCoord | null>(null);
  const [editValue, setEditValue] = useState("");
  const [formulaInput, setFormulaInput] = useState("");

  // Font & Style state
  const [currentFont, setCurrentFont] = useState("Calibri");
  const [currentFontSize, setCurrentFontSize] = useState("11");
  const [numberFormat, setNumberFormat] = useState("General");

  // View Options state
  const [showGridlines, setShowGridlines] = useState(true);
  const [showHeadings, setShowHeadings] = useState(true);
  const [showFormulaBar, setShowFormulaBar] = useState(true);
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSheetProtected, setIsSheetProtected] = useState(false);

  // Sheets & Undo/Redo History
  const [sheets, setSheets] = useState<SheetTab[]>([
    {
      id: "sheet-1",
      name: "Sheet1",
      grid: {},
      maxRows: DEFAULT_ROWS,
      maxCols: DEFAULT_COLS,
    },
  ]);
  const [activeSheetId, setActiveSheetId] = useState("sheet-1");
  const [history, setHistory] = useState<SheetGrid[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Modals & Popups
  const [showFileBackstage, setShowFileBackstage] = useState(false);
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showAutoSumMenu, setShowAutoSumMenu] = useState(false);
  const [showBordersMenu, setShowBordersMenu] = useState(false);
  const [showFunctionWizard, setShowFunctionWizard] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Find & Replace state
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [findMatches, setFindMatches] = useState<CellCoord[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Internal Clipboard for ranges
  const [clipboardData, setClipboardData] = useState<{
    cells: { relRow: number; relCol: number; data: CellData }[];
    isCut: boolean;
    sourceRange: CellRange;
  } | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const currentSheet = useMemo(
    () => sheets.find((s) => s.id === activeSheetId) || sheets[0],
    [sheets, activeSheetId]
  );

  // Bounding box of selection
  const normalizedRange = useMemo(() => {
    if (!selectionRange) {
      return {
        rMin: activeCell.row,
        rMax: activeCell.row,
        cMin: activeCell.col,
        cMax: activeCell.col,
      };
    }
    return {
      rMin: Math.min(selectionRange.startRow, selectionRange.endRow),
      rMax: Math.max(selectionRange.startRow, selectionRange.endRow),
      cMin: Math.min(selectionRange.startCol, selectionRange.endCol),
      cMax: Math.max(selectionRange.startCol, selectionRange.endCol),
    };
  }, [selectionRange, activeCell]);

  const activeCellCoord = useMemo(() => {
    if (
      selectionRange &&
      (selectionRange.startRow !== selectionRange.endRow || selectionRange.startCol !== selectionRange.endCol)
    ) {
      const { rMin, rMax, cMin, cMax } = normalizedRange;
      return `${colToLetter(cMin)}${rMin + 1}:${colToLetter(cMax)}${rMax + 1}`;
    }
    return `${colToLetter(activeCell.col)}${activeCell.row + 1}`;
  }, [selectionRange, activeCell, normalizedRange]);

  const activeCellKey = `${activeCell.row}:${activeCell.col}`;
  const currentCellData = currentSheet.grid[activeCellKey] || { raw: "" };

  // Sync Formula Input with Active Cell
  useEffect(() => {
    setFormulaInput(currentCellData.raw || "");
  }, [activeCellKey, currentCellData.raw]);

  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
    }
  }, [editingCell]);

  // Push to history helper
  const pushHistory = useCallback(
    (newGrid: SheetGrid) => {
      setHistory((prev) => {
        const upToCurrent = prev.slice(0, historyIndex + 1);
        const next = [...upToCurrent, newGrid];
        if (next.length > 35) next.shift();
        return next;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 34));
    },
    [historyIndex]
  );

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevGrid = history[historyIndex - 1];
      setSheets((prev) =>
        prev.map((s) => (s.id === activeSheetId ? { ...s, grid: prevGrid } : s))
      );
      setHistoryIndex((i) => i - 1);
    }
  }, [history, historyIndex, activeSheetId]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextGrid = history[historyIndex + 1];
      setSheets((prev) =>
        prev.map((s) => (s.id === activeSheetId ? { ...s, grid: nextGrid } : s))
      );
      setHistoryIndex((i) => i + 1);
    }
  }, [history, historyIndex, activeSheetId]);

  // Save to localStorage helper
  const saveToLocalStorage = useCallback(
    (newSheets: SheetTab[], name = fileName) => {
      setSaveStatus("Saving...");
      try {
        localStorage.setItem(
          "notixnode_excel_365_data_v3",
          JSON.stringify({ sheets: newSheets, fileName: name })
        );
        setTimeout(() => setSaveStatus("Saved"), 300);
      } catch (e) {
        console.error("Save error:", e);
      }
    },
    [fileName]
  );

  // Standard NotixNode Cluster Infrastructure Manager starter template
  const loadStarterTemplate = useCallback(() => {
    const clusterGrid: SheetGrid = {
      // Row 1 (index 0) - Title Block
      "0:0": {
        raw: "NOTIXNODE CLUSTER SPREADSHEET 2026",
        bold: true,
        fontSize: 16,
        bgColor: "#1E293B",
        color: "#ffffff",
        border: true,
      },

      // Row 3 (index 2) - Table Headers
      "2:0": { raw: "Server Node", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "left" },
      "2:1": { raw: "RAM (GB)", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "right" },
      "2:2": { raw: "CPU Cores", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "right" },
      "2:3": { raw: "Monthly Cost (₹)", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "right" },
      "2:4": { raw: "Active Clients", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "right" },
      "2:5": { raw: "Monthly Revenue (₹)", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "right" },

      // Row 4 (index 3) - Basic Node Tier-1 | 1 | 1 | 69 | 24
      "3:0": { raw: "Basic Node Tier-1", border: true, align: "left" },
      "3:1": { raw: "1", align: "right", border: true, format: "number" },
      "3:2": { raw: "1", align: "right", border: true, format: "number" },
      "3:3": { raw: "69", align: "right", border: true, format: "currency" },
      "3:4": { raw: "24", align: "right", border: true, format: "number" },
      "3:5": { raw: "=D4*E4", align: "right", border: true, format: "currency" },

      // Row 5 (index 4) - Standard Node Tier-2 | 1 | 2 | 149 | 15
      "4:0": { raw: "Standard Node Tier-2", border: true, align: "left" },
      "4:1": { raw: "1", align: "right", border: true, format: "number" },
      "4:2": { raw: "2", align: "right", border: true, format: "number" },
      "4:3": { raw: "149", align: "right", border: true, format: "currency" },
      "4:4": { raw: "15", align: "right", border: true, format: "number" },
      "4:5": { raw: "=D5*E5", align: "right", border: true, format: "currency" },

      // Row 6 (index 5) - Premium Node Tier-3 | 1 | 3 | 249 | 8
      "5:0": { raw: "Premium Node Tier-3", border: true, align: "left" },
      "5:1": { raw: "1", align: "right", border: true, format: "number" },
      "5:2": { raw: "3", align: "right", border: true, format: "number" },
      "5:3": { raw: "249", align: "right", border: true, format: "currency" },
      "5:4": { raw: "8", align: "right", border: true, format: "number" },
      "5:5": { raw: "=D6*E6", align: "right", border: true, format: "currency" },

      // Row 7 (index 6) - Summary & Calculation Engine
      "6:0": { raw: "Total Infrastructure", bold: true, border: true, align: "left" },
      "6:1": { raw: "=SUM(B4:B6)", bold: true, align: "right", border: true, format: "number" },
      "6:2": { raw: "=SUM(C4:C6)", bold: true, align: "right", border: true, format: "number" },
      "6:3": { raw: "=AVERAGE(D4:D6)", bold: true, align: "right", border: true, format: "currency" },
      "6:4": { raw: "=SUM(E4:E6)", bold: true, align: "right", border: true, format: "number" },
      "6:5": { raw: "=SUM(F4:F6)", bold: true, bgColor: "#dcfce7", color: "#166534", align: "right", border: true, format: "currency" },
    };

    const initialSheets: SheetTab[] = [
      {
        id: "sheet-1",
        name: "Sheet1",
        grid: clusterGrid,
        maxRows: DEFAULT_ROWS,
        maxCols: DEFAULT_COLS,
      },
    ];

    setSheets(initialSheets);
    setHistory([clusterGrid]);
    setHistoryIndex(0);
    saveToLocalStorage(initialSheets, "Book4.xlsx");
  }, [saveToLocalStorage]);

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem("notixnode_excel_365_data_v3");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sheets && parsed.sheets.length) {
          setSheets(parsed.sheets);
          setFileName(parsed.fileName || "Book4.xlsx");
          const initGrid = parsed.sheets[0].grid || {};
          setHistory([initGrid]);
          setHistoryIndex(0);
          return;
        }
      } catch (e) {
        console.error("Failed to restore excel session", e);
      }
    }
    loadStarterTemplate();
  }, [loadStarterTemplate]);

  // Update a single or multiple cells with full Undo support
  const updateCells = useCallback(
    (cellsToUpdate: { row: number; col: number; data: Partial<CellData> }[]) => {
      if (isSheetProtected) {
        alert("Sheet is protected against edits. Unlock it from the Review tab.");
        return;
      }

      setSheets((prev) => {
        const nextSheets = prev.map((s) => {
          if (s.id !== activeSheetId) return s;

          const updatedGrid = { ...s.grid };
          cellsToUpdate.forEach(({ row, col, data }) => {
            const key = `${row}:${col}`;
            const existing = updatedGrid[key] || { raw: "" };
            const updated = { ...existing, ...data };

            if (updated.raw && updated.raw.startsWith("=")) {
              updated.computed = evaluateFormula(updated.raw, updatedGrid);
            } else {
              updated.computed = undefined;
            }

            if (updated.raw === "" && !updated.bgColor && !updated.border) {
              delete updatedGrid[key];
            } else {
              updatedGrid[key] = updated;
            }
          });

          pushHistory(updatedGrid);

          return {
            ...s,
            grid: updatedGrid,
          };
        });

        if (autoSaveOn) {
          saveToLocalStorage(nextSheets);
        }
        return nextSheets;
      });
    },
    [activeSheetId, autoSaveOn, isSheetProtected, pushHistory, saveToLocalStorage]
  );

  const updateCell = useCallback(
    (row: number, col: number, data: Partial<CellData>) => {
      updateCells([{ row, col, data }]);
    },
    [updateCells]
  );

  // Apply formatting to all currently selected cells
  const formatSelectedCells = useCallback(
    (data: Partial<CellData>) => {
      const { rMin, rMax, cMin, cMax } = normalizedRange;
      const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
      for (let r = rMin; r <= rMax; r++) {
        for (let c = cMin; c <= cMax; c++) {
          updates.push({ row: r, col: c, data });
        }
      }
      updateCells(updates);
    },
    [normalizedRange, updateCells]
  );

  const commitEdit = () => {
    if (editingCell) {
      updateCell(editingCell.row, editingCell.col, { raw: editValue });
      setEditingCell(null);
    }
  };

  const commitFormula = () => {
    updateCell(activeCell.row, activeCell.col, { raw: formulaInput });
  };

  // Keyboard navigation & Shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showFindReplace && e.key !== "Escape") return;

    // Inside Cell Inline Editing
    if (editingCell) {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit();
        const nextRow = Math.min(activeCell.row + 1, currentSheet.maxRows - 1);
        setActiveCell({ row: nextRow, col: activeCell.col });
        setSelectionRange({ startRow: nextRow, startCol: activeCell.col, endRow: nextRow, endCol: activeCell.col });
      } else if (e.key === "Escape") {
        setEditingCell(null);
      } else if (e.key === "Tab") {
        e.preventDefault();
        commitEdit();
        const nextCol = e.shiftKey ? Math.max(0, activeCell.col - 1) : Math.min(currentSheet.maxCols - 1, activeCell.col + 1);
        setActiveCell({ row: activeCell.row, col: nextCol });
        setSelectionRange({ startRow: activeCell.row, startCol: nextCol, endRow: activeCell.row, endCol: nextCol });
      }
      return;
    }

    // Ctrl / Cmd Shortcuts
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
        return;
      }
      if (key === "y") {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (key === "b") {
        e.preventDefault();
        formatSelectedCells({ bold: !currentCellData.bold });
        return;
      }
      if (key === "i") {
        e.preventDefault();
        formatSelectedCells({ italic: !currentCellData.italic });
        return;
      }
      if (key === "u") {
        e.preventDefault();
        formatSelectedCells({ underline: !currentCellData.underline });
        return;
      }
      if (key === "f") {
        e.preventDefault();
        setShowFindReplace(true);
        return;
      }
      if (key === "c") {
        e.preventDefault();
        const { rMin, rMax, cMin, cMax } = normalizedRange;
        const copiedList: { relRow: number; relCol: number; data: CellData }[] = [];
        const textLines: string[] = [];
        for (let r = rMin; r <= rMax; r++) {
          const rowVals: string[] = [];
          for (let c = cMin; c <= cMax; c++) {
            const cData = currentSheet.grid[`${r}:${c}`] || { raw: "" };
            copiedList.push({ relRow: r - rMin, relCol: c - cMin, data: cData });
            rowVals.push(cData.raw || "");
          }
          textLines.push(rowVals.join("\t"));
        }
        setClipboardData({
          cells: copiedList,
          isCut: false,
          sourceRange: { startRow: rMin, startCol: cMin, endRow: rMax, endCol: cMax },
        });
        navigator.clipboard.writeText(textLines.join("\n"));
        return;
      }
      if (key === "x") {
        e.preventDefault();
        const { rMin, rMax, cMin, cMax } = normalizedRange;
        const copiedList: { relRow: number; relCol: number; data: CellData }[] = [];
        const textLines: string[] = [];
        for (let r = rMin; r <= rMax; r++) {
          const rowVals: string[] = [];
          for (let c = cMin; c <= cMax; c++) {
            const cData = currentSheet.grid[`${r}:${c}`] || { raw: "" };
            copiedList.push({ relRow: r - rMin, relCol: c - cMin, data: cData });
            rowVals.push(cData.raw || "");
          }
          textLines.push(rowVals.join("\t"));
        }
        setClipboardData({
          cells: copiedList,
          isCut: true,
          sourceRange: { startRow: rMin, startCol: cMin, endRow: rMax, endCol: cMax },
        });
        navigator.clipboard.writeText(textLines.join("\n"));
        return;
      }
      if (key === "v") {
        e.preventDefault();
        if (clipboardData && clipboardData.cells.length > 0) {
          const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
          clipboardData.cells.forEach((item) => {
            updates.push({
              row: activeCell.row + item.relRow,
              col: activeCell.col + item.relCol,
              data: { ...item.data },
            });
          });
          if (clipboardData.isCut) {
            const { startRow, startCol, endRow, endCol } = clipboardData.sourceRange;
            for (let r = startRow; r <= endRow; r++) {
              for (let c = startCol; c <= endCol; c++) {
                updates.push({ row: r, col: c, data: { raw: "" } });
              }
            }
            setClipboardData(null);
          }
          updateCells(updates);
        } else {
          navigator.clipboard.readText().then((clipText) => {
            if (clipText) {
              const rows = clipText.split("\n");
              const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
              rows.forEach((rStr, rIdx) => {
                const cols = rStr.split("\t");
                cols.forEach((val, cIdx) => {
                  updates.push({
                    row: activeCell.row + rIdx,
                    col: activeCell.col + cIdx,
                    data: { raw: val.trim() },
                  });
                });
              });
              updateCells(updates);
            }
          });
        }
        return;
      }
      if (key === "a") {
        e.preventDefault();
        setSelectionRange({
          startRow: 0,
          startCol: 0,
          endRow: Math.min(25, currentSheet.maxRows - 1),
          endCol: Math.min(10, currentSheet.maxCols - 1),
        });
        return;
      }
    }

    // Arrow navigation
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const newRow = Math.max(0, activeCell.row - 1);
      setActiveCell((prev) => ({ ...prev, row: newRow }));
      if (e.shiftKey && selectionRange) {
        setSelectionRange((prev) => (prev ? { ...prev, endRow: newRow } : null));
      } else {
        setSelectionRange({ startRow: newRow, startCol: activeCell.col, endRow: newRow, endCol: activeCell.col });
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const newRow = Math.min(currentSheet.maxRows - 1, activeCell.row + 1);
      setActiveCell((prev) => ({ ...prev, row: newRow }));
      if (e.shiftKey && selectionRange) {
        setSelectionRange((prev) => (prev ? { ...prev, endRow: newRow } : null));
      } else {
        setSelectionRange({ startRow: newRow, startCol: activeCell.col, endRow: newRow, endCol: activeCell.col });
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const newCol = Math.max(0, activeCell.col - 1);
      setActiveCell((prev) => ({ ...prev, col: newCol }));
      if (e.shiftKey && selectionRange) {
        setSelectionRange((prev) => (prev ? { ...prev, endCol: newCol } : null));
      } else {
        setSelectionRange({ startRow: activeCell.row, startCol: newCol, endRow: activeCell.row, endCol: newCol });
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const newCol = Math.min(currentSheet.maxCols - 1, activeCell.col + 1);
      setActiveCell((prev) => ({ ...prev, col: newCol }));
      if (e.shiftKey && selectionRange) {
        setSelectionRange((prev) => (prev ? { ...prev, endCol: newCol } : null));
      } else {
        setSelectionRange({ startRow: activeCell.row, startCol: newCol, endRow: activeCell.row, endCol: newCol });
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const newCol = e.shiftKey ? Math.max(0, activeCell.col - 1) : Math.min(currentSheet.maxCols - 1, activeCell.col + 1);
      setActiveCell({ row: activeCell.row, col: newCol });
      setSelectionRange({ startRow: activeCell.row, startCol: newCol, endRow: activeCell.row, endCol: newCol });
    } else if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      setEditingCell({ row: activeCell.row, col: activeCell.col });
      setEditValue(currentCellData.raw || "");
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      const { rMin, rMax, cMin, cMax } = normalizedRange;
      const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
      for (let r = rMin; r <= rMax; r++) {
        for (let c = cMin; c <= cMax; c++) {
          updates.push({ row: r, col: c, data: { raw: "" } });
        }
      }
      updateCells(updates);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setEditingCell({ row: activeCell.row, col: activeCell.col });
      setEditValue(e.key);
    }
  };

  // AutoSum function
  const applyAutoSum = (fn = "SUM") => {
    let startRow = activeCell.row - 1;
    while (startRow >= 0 && currentSheet.grid[`${startRow}:${activeCell.col}`]?.raw) {
      startRow--;
    }
    startRow++;
    const endRow = Math.max(startRow, activeCell.row - 1);
    const startCoord = `${colToLetter(activeCell.col)}${startRow + 1}`;
    const endCoord = `${colToLetter(activeCell.col)}${endRow + 1}`;
    const formula = `=${fn}(${startCoord}:${endCoord})`;
    updateCell(activeCell.row, activeCell.col, { raw: formula });
    setShowAutoSumMenu(false);
  };

  // Sort rows in active sheet by active column
  const handleSort = (direction: "asc" | "desc") => {
    const colIdx = activeCell.col;
    const rowsWithData: { rowIdx: number; cellVal: string | number; cells: Record<number, CellData> }[] = [];

    for (let r = 0; r < currentSheet.maxRows; r++) {
      let hasData = false;
      const rowCells: Record<number, CellData> = {};
      for (let c = 0; c < currentSheet.maxCols; c++) {
        const cell = currentSheet.grid[`${r}:${c}`];
        if (cell) {
          hasData = true;
          rowCells[c] = cell;
        }
      }
      if (hasData) {
        const targetVal = rowCells[colIdx]?.raw || "";
        rowsWithData.push({ rowIdx: r, cellVal: targetVal, cells: rowCells });
      }
    }

    if (rowsWithData.length <= 1) return;

    const hasHeader = rowsWithData[0].cells[colIdx]?.bold;
    const sortSlice = hasHeader ? rowsWithData.slice(1) : rowsWithData;

    sortSlice.sort((a, b) => {
      const numA = parseNumeric(a.cellVal);
      const numB = parseNumeric(b.cellVal);
      if (!isNaN(numA) && !isNaN(numB)) {
        return direction === "asc" ? numA - numB : numB - numA;
      }
      return direction === "asc"
        ? String(a.cellVal).localeCompare(String(b.cellVal))
        : String(b.cellVal).localeCompare(String(a.cellVal));
    });

    const finalRows = hasHeader ? [rowsWithData[0], ...sortSlice] : sortSlice;
    const newGrid: SheetGrid = {};

    finalRows.forEach((rObj, newRIdx) => {
      Object.entries(rObj.cells).forEach(([cIdxStr, cell]) => {
        const c = parseInt(cIdxStr, 10);
        newGrid[`${newRIdx}:${c}`] = cell;
      });
    });

    setSheets((prev) =>
      prev.map((s) => (s.id === activeSheetId ? { ...s, grid: newGrid } : s))
    );
    pushHistory(newGrid);
  };

  // Row and Column Insert / Delete
  const insertRowAt = (atRow: number) => {
    const newGrid: SheetGrid = {};
    Object.entries(currentSheet.grid).forEach(([key, cell]) => {
      const [rStr, cStr] = key.split(":");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (r >= atRow) {
        newGrid[`${r + 1}:${c}`] = cell;
      } else {
        newGrid[`${r}:${c}`] = cell;
      }
    });
    setSheets((prev) =>
      prev.map((s) => (s.id === activeSheetId ? { ...s, grid: newGrid, maxRows: s.maxRows + 1 } : s))
    );
    pushHistory(newGrid);
  };

  const deleteRowAt = (atRow: number) => {
    const newGrid: SheetGrid = {};
    Object.entries(currentSheet.grid).forEach(([key, cell]) => {
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
    setSheets((prev) =>
      prev.map((s) => (s.id === activeSheetId ? { ...s, grid: newGrid } : s))
    );
    pushHistory(newGrid);
  };

  const insertColAt = (atCol: number) => {
    const newGrid: SheetGrid = {};
    Object.entries(currentSheet.grid).forEach(([key, cell]) => {
      const [rStr, cStr] = key.split(":");
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      if (c >= atCol) {
        newGrid[`${r}:${c + 1}`] = cell;
      } else {
        newGrid[`${r}:${c}`] = cell;
      }
    });
    setSheets((prev) =>
      prev.map((s) => (s.id === activeSheetId ? { ...s, grid: newGrid, maxCols: s.maxCols + 1 } : s))
    );
    pushHistory(newGrid);
  };

  const deleteColAt = (atCol: number) => {
    const newGrid: SheetGrid = {};
    Object.entries(currentSheet.grid).forEach(([key, cell]) => {
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
    setSheets((prev) =>
      prev.map((s) => (s.id === activeSheetId ? { ...s, grid: newGrid } : s))
    );
    pushHistory(newGrid);
  };

  // Find & Replace Execution
  const runFind = (text: string) => {
    if (!text.trim()) {
      setFindMatches([]);
      return;
    }
    const matches: CellCoord[] = [];
    Object.entries(currentSheet.grid).forEach(([key, cell]) => {
      if (cell?.raw && String(cell.raw).toLowerCase().includes(text.toLowerCase())) {
        const [r, c] = key.split(":").map(Number);
        matches.push({ row: r, col: c });
      }
    });
    setFindMatches(matches);
    setCurrentMatchIndex(0);
    if (matches.length > 0) {
      setActiveCell(matches[0]);
      setSelectionRange({ startRow: matches[0].row, startCol: matches[0].col, endRow: matches[0].row, endCol: matches[0].col });
    }
  };

  const findNext = () => {
    if (!findMatches.length) return;
    const nextIdx = (currentMatchIndex + 1) % findMatches.length;
    setCurrentMatchIndex(nextIdx);
    const target = findMatches[nextIdx];
    setActiveCell(target);
    setSelectionRange({ startRow: target.row, startCol: target.col, endRow: target.row, endCol: target.col });
  };

  const replaceCurrent = () => {
    if (!findMatches.length) return;
    const target = findMatches[currentMatchIndex];
    const key = `${target.row}:${target.col}`;
    const cell = currentSheet.grid[key];
    if (cell && cell.raw) {
      const replaced = cell.raw.replace(new RegExp(findText, "gi"), replaceText);
      updateCell(target.row, target.col, { raw: replaced });
    }
    findNext();
  };

  const replaceAll = () => {
    if (!findText) return;
    const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
    findMatches.forEach((target) => {
      const key = `${target.row}:${target.col}`;
      const cell = currentSheet.grid[key];
      if (cell && cell.raw) {
        const replaced = cell.raw.replace(new RegExp(findText, "gi"), replaceText);
        updates.push({ row: target.row, col: target.col, data: { raw: replaced } });
      }
    });
    updateCells(updates);
    setFindMatches([]);
    alert(`Replaced ${updates.length} occurrences!`);
  };

  // File Upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const newSheets: SheetTab[] = workbook.SheetNames.map((sheetName, index) => {
          const ws = workbook.Sheets[sheetName];
          const rawAoa: (string | number)[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

          const newGrid: SheetGrid = {};
          let maxR = DEFAULT_ROWS;
          let maxC = DEFAULT_COLS;

          rawAoa.forEach((rowArr, r) => {
            if (r >= maxR) maxR = r + 10;
            rowArr.forEach((val, c) => {
              if (c >= maxC) maxC = c + 5;
              if (val !== undefined && val !== null) {
                newGrid[`${r}:${c}`] = {
                  raw: String(val),
                  border: true,
                };
              }
            });
          });

          return {
            id: `sheet-${index + 1}-${Date.now()}`,
            name: sheetName,
            grid: newGrid,
            maxRows: Math.max(maxR, DEFAULT_ROWS),
            maxCols: Math.max(maxC, DEFAULT_COLS),
          };
        });

        if (newSheets.length > 0) {
          setSheets(newSheets);
          setActiveSheetId(newSheets[0].id);
          setFileName(file.name);
          setHistory([newSheets[0].grid]);
          setHistoryIndex(0);
          saveToLocalStorage(newSheets, file.name);
        }
      } catch (err) {
        alert("Failed to parse Excel file: " + err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export to Excel Workbook (.xlsx)
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      sheets.forEach((sheet) => {
        const aoa: (string | number)[][] = [];
        for (let r = 0; r < sheet.maxRows; r++) {
          const row: (string | number)[] = [];
          for (let c = 0; c < sheet.maxCols; c++) {
            const cell = sheet.grid[`${r}:${c}`];
            if (!cell || cell.raw === undefined) {
              row.push("");
            } else {
              const comp = cell.raw.startsWith("=") ? evaluateFormula(cell.raw, sheet.grid) : cell.raw;
              row.push(comp ?? cell.raw);
            }
          }
          aoa.push(row);
        }

        while (aoa.length && aoa[aoa.length - 1].every((v) => v === "")) {
          aoa.pop();
        }

        const ws = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(wb, ws, sheet.name || "Sheet1");
      });

      const outName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
      XLSX.writeFile(wb, outName);
    } catch (err) {
      alert("Error generating Excel file: " + err);
    }
  };

  // Export to CSV
  const exportToCsv = () => {
    try {
      const aoa: (string | number)[][] = [];
      for (let r = 0; r < currentSheet.maxRows; r++) {
        const row: (string | number)[] = [];
        for (let c = 0; c < currentSheet.maxCols; c++) {
          const cell = currentSheet.grid[`${r}:${c}`];
          if (!cell || cell.raw === undefined) {
            row.push("");
          } else {
            const comp = cell.raw.startsWith("=") ? evaluateFormula(cell.raw, currentSheet.grid) : cell.raw;
            row.push(comp ?? cell.raw);
          }
        }
        aoa.push(row);
      }
      while (aoa.length && aoa[aoa.length - 1].every((v) => v === "")) {
        aoa.pop();
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const csvOutput = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(/\.xlsx$/i, "")}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("CSV Export error: " + err);
    }
  };

  // Add Sheet
  const addNewSheet = () => {
    const nextNum = sheets.length + 1;
    const newSheet: SheetTab = {
      id: `sheet-${Date.now()}`,
      name: `Sheet${nextNum}`,
      grid: {},
      maxRows: DEFAULT_ROWS,
      maxCols: DEFAULT_COLS,
    };
    const updated = [...sheets, newSheet];
    setSheets(updated);
    setActiveSheetId(newSheet.id);
    saveToLocalStorage(updated);
  };

  // Calculations for Status Bar across selected range
  const rangeCalculations = useMemo(() => {
    const { rMin, rMax, cMin, cMax } = normalizedRange;
    const numbers: number[] = [];
    let populatedCount = 0;

    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        const cell = currentSheet.grid[`${r}:${c}`];
        if (cell && cell.raw !== undefined && cell.raw !== "") {
          populatedCount++;
          const val = cell.raw.startsWith("=") ? evaluateFormula(cell.raw, currentSheet.grid) : cell.raw;
          const num = parseNumeric(val);
          if (!isNaN(num)) {
            numbers.push(num);
          }
        }
      }
    }

    if (numbers.length === 0) {
      return { count: populatedCount, sum: 0, avg: 0, min: 0, max: 0, hasNumbers: false };
    }

    const sum = numbers.reduce((a, b) => a + b, 0);
    const avg = Number((sum / numbers.length).toFixed(2));
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    return { count: populatedCount, sum, avg, min, max, hasNumbers: true };
  }, [normalizedRange, currentSheet.grid]);

  // Total sheet stats
  const sheetStats = useMemo(() => {
    let populated = 0;
    let formulas = 0;
    let numbers = 0;
    Object.values(currentSheet.grid).forEach((cell) => {
      if (cell.raw) {
        populated++;
        if (cell.raw.startsWith("=")) formulas++;
        if (!isNaN(parseNumeric(cell.raw))) numbers++;
      }
    });
    return { populated, formulas, numbers };
  }, [currentSheet.grid]);

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`min-h-screen flex flex-col bg-[#141414] text-slate-200 select-none font-sans outline-none ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP APPLICATION HEADER (EXACT OFFICE-STYLE HEADER)                     */}
      {/* ========================================================================= */}
      <div className="bg-[#121212] text-slate-200 px-3 py-1 flex items-center justify-between text-xs border-b border-[#252525] select-none z-30">
        {/* Left Section: Excel Icon + AutoSave On Switch + Quick Save/Undo/Redo + Document Title */}
        <div className="flex items-center gap-2">
          {/* Green Excel Icon */}
          <div className="w-5 h-5 rounded-[4px] bg-[#107c41] flex items-center justify-center shadow">
            <span className="text-white font-black text-xs font-mono">X</span>
          </div>

          {/* AutoSave Active Toggle (Green pill) */}
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-xs text-slate-300 font-medium">AutoSave</span>
            <button
              onClick={() => setAutoSaveOn(!autoSaveOn)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                autoSaveOn ? "bg-[#107c41] justify-end" : "bg-slate-700 justify-start"
              }`}
              title="Toggle AutoSave"
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center text-[8px] font-bold text-black">
                {autoSaveOn ? "On" : ""}
              </div>
            </button>
          </div>

          {/* Quick Action Icons: Save, Undo, Redo */}
          <div className="flex items-center gap-1 ml-1 text-slate-400">
            <button
              onClick={exportToExcel}
              className="p-1 hover:bg-[#252525] hover:text-white rounded transition-colors"
              title="Save Workbook (.xlsx)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1 rounded transition-colors ${
                historyIndex > 0 ? "hover:bg-[#252525] hover:text-white text-slate-200" : "text-slate-600 cursor-not-allowed"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1 rounded transition-colors ${
                historyIndex < history.length - 1 ? "hover:bg-[#252525] hover:text-white text-slate-200" : "text-slate-600 cursor-not-allowed"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <ChevronDown className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>

          <span className="text-slate-600 mx-1">|</span>

          {/* Document Title: "Book4.xlsx • Saved ⌄" */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-transparent hover:bg-[#252525] focus:bg-[#252525] px-1.5 py-0.5 rounded font-medium text-slate-200 border-none outline-none text-xs w-28 sm:w-36 transition-colors"
              title="Rename file"
            />
            <span className="text-[11px] text-slate-400">• {saveStatus}</span>
            <ChevronDown
              onClick={() => setShowFileBackstage(true)}
              className="w-3 h-3 text-slate-400 cursor-pointer hover:text-white"
            />
          </div>
        </div>

        {/* Center Section: Rounded Search Pill */}
        <div
          onClick={() => setShowFindReplace(true)}
          className="hidden md:flex items-center bg-[#252525] hover:bg-[#2e2e2e] px-3 py-1 rounded-full text-xs text-slate-300 w-80 justify-between cursor-pointer border border-slate-700/60 shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Search cells (Ctrl+F)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>17:03</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>29°</span>
          </div>
        </div>

        {/* Right Section: Upgrade Plan + Account Badge + Window Controls */}
        <div className="flex items-center gap-2">
          {/* Upgrade Plan Pill */}
          <div className="relative">
            <button
              onClick={() => alert("NOTIXNODE Excel Suite: All PRO features are already unlocked for free!")}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] hover:bg-[#323232] text-slate-200 font-semibold rounded-md border border-slate-700 text-xs shadow-sm transition-all"
            >
              <Diamond className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upgrade your plan</span>
            </button>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-[#121212]" />
          </div>

          {/* Alert Triangle */}
          <button
            onClick={() => setShowStatsModal(true)}
            className="p-0.5 hover:bg-[#252525] rounded transition-colors text-amber-400 ml-1 cursor-pointer"
            title="Sheet Health & Integrity"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
          </button>

          {/* Account Badge: Marcel */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-lime-400 p-[1px] flex items-center justify-center cursor-pointer">
            <div className="w-full h-full rounded-full bg-[#181818] flex items-center justify-center text-[10px] font-bold text-white">
              M
            </div>
          </div>

          <span className="text-slate-700 mx-1">|</span>

          {/* Window Controls */}
          <div className="flex items-center text-slate-400">
            <button
              onClick={() => setShowShortcutsModal(true)}
              className="p-1.5 hover:bg-[#252525] hover:text-white rounded"
              title="Keyboard Shortcuts"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-[#252525] hover:text-white rounded"
              title="Maximize / Restore Fullscreen"
            >
              <Square className="w-3 h-3" />
            </button>
            <Link
              href="/"
              className="p-1.5 hover:bg-rose-600 hover:text-white rounded transition-colors"
              title="Close & Return Home"
            >
              <X className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIBBON MENU TABS (File, Home, WPS PDF, Insert, Page Layout...)          */}
      {/* ========================================================================= */}
      <div className="bg-[#181818] border-b border-[#252525] px-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowFileBackstage(true)}
            className="px-3 py-1.5 font-bold text-slate-300 hover:text-white hover:bg-[#252525] rounded transition-colors"
          >
            File
          </button>

          {(
            [
              { id: "home", label: "Home" },
              { id: "wps_pdf", label: "WPS PDF" },
              { id: "insert", label: "Insert" },
              { id: "page_layout", label: "Page Layout" },
              { id: "formulas", label: "Formulas" },
              { id: "data", label: "Data" },
              { id: "review", label: "Review" },
              { id: "view", label: "View" },
              { id: "help", label: "Help" },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 font-semibold transition-colors relative ${
                  isActive ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#107c41] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right side: Comments & Share */}
        <div className="flex items-center gap-2 pr-1">
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-[#252525] rounded transition-colors text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white font-semibold rounded transition-all text-xs shadow-sm cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
            <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. FORMATTING TOOLBAR RIBBON (HOME TAB: ALL REQUIRED GROUPS)              */}
      {/* ========================================================================= */}
      {activeTab === "home" && (
        <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto scrollbar-thin text-xs text-slate-300 select-none">
          {/* GROUP 1: CLIPBOARD (Paste, Cut, Copy) */}
          <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.readText().then((clipText) => {
                    if (clipText) updateCell(activeCell.row, activeCell.col, { raw: clipText });
                  });
                }}
                className="flex flex-col items-center justify-center p-1 hover:bg-[#2c2c2c] rounded transition-colors group cursor-pointer"
                title="Paste (Ctrl+V)"
              >
                <div className="w-7 h-7 rounded border border-amber-400/40 bg-amber-400/10 flex items-center justify-center text-amber-300 mb-0.5">
                  <Clipboard className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-slate-300 flex items-center">
                  Paste <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-slate-500" />
                </span>
              </button>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    if (currentCellData.raw) {
                      navigator.clipboard.writeText(currentCellData.raw);
                      updateCell(activeCell.row, activeCell.col, { raw: "" });
                    }
                  }}
                  className="p-1 hover:bg-[#2c2c2c] rounded text-slate-400 hover:text-white flex items-center gap-1"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (currentCellData.raw) {
                      navigator.clipboard.writeText(currentCellData.raw);
                    }
                  }}
                  className="p-1 hover:bg-[#2c2c2c] rounded text-slate-400 hover:text-white flex items-center gap-1"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Clipboard ↘</div>
          </div>

          {/* GROUP 2: FONT (Calibri/Arial, Size 9-24, B, I, U, Border, Fill, Color) */}
          <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <select
                  value={currentFont}
                  onChange={(e) => {
                    setCurrentFont(e.target.value);
                    formatSelectedCells({ fontFamily: e.target.value });
                  }}
                  className="bg-[#2a2a2a] text-slate-200 border border-slate-700 text-xs rounded px-2 py-0.5 outline-none w-28 cursor-pointer"
                >
                  <option value="Calibri">Calibri</option>
                  <option value="Segoe UI">Segoe UI</option>
                  <option value="Arial">Arial</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Inter">Inter</option>
                </select>

                <select
                  value={currentFontSize}
                  onChange={(e) => {
                    setCurrentFontSize(e.target.value);
                    formatSelectedCells({ fontSize: parseInt(e.target.value, 10) });
                  }}
                  className="bg-[#2a2a2a] text-slate-200 border border-slate-700 text-xs rounded px-1.5 py-0.5 outline-none w-12 cursor-pointer"
                >
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                  <option value="14">14</option>
                  <option value="16">16</option>
                  <option value="18">18</option>
                  <option value="24">24</option>
                </select>

                <button
                  onClick={() => {
                    const next = Math.min(24, parseInt(currentFontSize, 10) + 1);
                    setCurrentFontSize(String(next));
                    formatSelectedCells({ fontSize: next });
                  }}
                  className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300 text-xs font-bold"
                  title="Increase Font Size"
                >
                  A<span className="text-[9px]">^</span>
                </button>

                <button
                  onClick={() => {
                    const next = Math.max(9, parseInt(currentFontSize, 10) - 1);
                    setCurrentFontSize(String(next));
                    formatSelectedCells({ fontSize: next });
                  }}
                  className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300 text-xs font-bold"
                  title="Decrease Font Size"
                >
                  A<span className="text-[9px]">v</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => formatSelectedCells({ bold: !currentCellData.bold })}
                  className={`w-6 h-6 flex items-center justify-center rounded font-bold transition-colors ${
                    currentCellData.bold ? "bg-[#333333] text-white border border-slate-600" : "hover:bg-[#2c2c2c] text-slate-300"
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  B
                </button>
                <button
                  onClick={() => formatSelectedCells({ italic: !currentCellData.italic })}
                  className={`w-6 h-6 flex items-center justify-center rounded font-serif italic transition-colors ${
                    currentCellData.italic ? "bg-[#333333] text-white border border-slate-600" : "hover:bg-[#2c2c2c] text-slate-300"
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  I
                </button>
                <button
                  onClick={() => formatSelectedCells({ underline: !currentCellData.underline })}
                  className={`w-6 h-6 flex items-center justify-center rounded underline transition-colors ${
                    currentCellData.underline ? "bg-[#333333] text-white border border-slate-600" : "hover:bg-[#2c2c2c] text-slate-300"
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  U
                </button>

                {/* Borders Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowBordersMenu(!showBordersMenu)}
                    className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
                      currentCellData.border ? "bg-[#333333] text-white border border-slate-600" : "hover:bg-[#2c2c2c] text-slate-300"
                    }`}
                    title="Borders"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  {showBordersMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-[#1e1e1e] border border-slate-700 rounded shadow-2xl py-1 w-32 z-50 text-[11px]">
                      <button
                        onClick={() => {
                          formatSelectedCells({ border: true });
                          setShowBordersMenu(false);
                        }}
                        className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d] flex items-center gap-1.5"
                      >
                        <Grid className="w-3 h-3" /> All Borders
                      </button>
                      <button
                        onClick={() => {
                          formatSelectedCells({ border: false });
                          setShowBordersMenu(false);
                        }}
                        className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d] text-rose-400"
                      >
                        No Border
                      </button>
                    </div>
                  )}
                </div>

                {/* Fill Color */}
                <div className="relative">
                  <button
                    onClick={() => setShowFillColorPicker(!showFillColorPicker)}
                    className="flex flex-col items-center justify-center w-6 h-6 hover:bg-[#2c2c2c] rounded cursor-pointer"
                    title="Fill Color"
                  >
                    <PaintBucket className="w-3.5 h-3.5 text-slate-200" />
                    <span className="w-3.5 h-1 bg-yellow-400 rounded-sm -mt-0.5" />
                  </button>
                  {showFillColorPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-[#1c1c1c] border border-slate-700 rounded-lg shadow-2xl grid grid-cols-4 gap-1.5 z-50">
                      {["#ffffff", "#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa", "#107c41", "transparent"].map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => {
                              formatSelectedCells({ bgColor: c === "transparent" ? undefined : c });
                              setShowFillColorPicker(false);
                            }}
                            className="w-5 h-5 rounded border border-slate-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c }}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Text Color */}
                <div className="relative">
                  <button
                    onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                    className="flex flex-col items-center justify-center w-6 h-6 hover:bg-[#2c2c2c] rounded cursor-pointer"
                    title="Font Color"
                  >
                    <span className="font-bold text-xs leading-none text-white">A</span>
                    <span className="w-3.5 h-1 bg-rose-500 rounded-sm mt-0.5" />
                  </button>
                  {showTextColorPicker && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-[#1c1c1c] border border-slate-700 rounded-lg shadow-2xl grid grid-cols-4 gap-1.5 z-50">
                      {["#ffffff", "#000000", "#ef4444", "#3b82f6", "#107c41", "#f59e0b", "#8b5cf6", "#ec4899"].map(
                        (c) => (
                          <button
                            key={c}
                            onClick={() => {
                              formatSelectedCells({ color: c });
                              setShowTextColorPicker(false);
                            }}
                            className="w-5 h-5 rounded border border-slate-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: c }}
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Font ↘</div>
          </div>

          {/* GROUP 3: ALIGNMENT (Wrap text [ab], Merge & Center, Alignments) */}
          <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => formatSelectedCells({ align: "left" })}
                  className={`p-1 rounded ${currentCellData.align === "left" ? "bg-[#333333] text-white" : "hover:bg-[#2c2c2c] text-slate-400"}`}
                  title="Left Align"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => formatSelectedCells({ align: "center" })}
                  className={`p-1 rounded ${currentCellData.align === "center" ? "bg-[#333333] text-white" : "hover:bg-[#2c2c2c] text-slate-400"}`}
                  title="Center Align"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => formatSelectedCells({ align: "right" })}
                  className={`p-1 rounded ${currentCellData.align === "right" ? "bg-[#333333] text-white" : "hover:bg-[#2c2c2c] text-slate-400"}`}
                  title="Right Align"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-serif text-slate-400 px-1">ab↗</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <button
                  onClick={() => formatSelectedCells({ border: true })}
                  className="hover:bg-[#2c2c2c] px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px]"
                >
                  Wrap Text
                </button>
                <button
                  onClick={() => formatSelectedCells({ align: "center", bold: true })}
                  className="hover:bg-[#2c2c2c] px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px]"
                >
                  Merge &amp; Center
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Alignment ↘</div>
          </div>

          {/* GROUP 4: NUMBER (General, Number, Currency [₹], Percentage [%], Comma) */}
          <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
            <div className="space-y-1">
              <select
                value={numberFormat}
                onChange={(e) => {
                  const fmt = e.target.value;
                  setNumberFormat(fmt);
                  if (fmt === "Currency") {
                    formatSelectedCells({ format: "currency" });
                  } else if (fmt === "Percentage") {
                    formatSelectedCells({ format: "percent" });
                  } else if (fmt === "Number") {
                    formatSelectedCells({ format: "number" });
                  } else {
                    formatSelectedCells({ format: "general" });
                  }
                }}
                className="bg-[#2a2a2a] text-slate-200 border border-slate-700 text-xs rounded px-2 py-0.5 outline-none w-24 cursor-pointer"
              >
                <option value="General">General</option>
                <option value="Number">Number</option>
                <option value="Currency">Currency (₹)</option>
                <option value="Percentage">Percentage (%)</option>
              </select>

              <div className="flex items-center gap-1 text-slate-300">
                <button
                  onClick={() => formatSelectedCells({ format: "currency" })}
                  className="p-1 hover:bg-[#2c2c2c] rounded font-bold text-xs"
                  title="Format Currency (₹)"
                >
                  ₹
                </button>
                <button
                  onClick={() => {
                    const val = parseNumeric(currentCellData.raw);
                    if (val) formatSelectedCells({ raw: `$${val}` });
                  }}
                  className="p-1 hover:bg-[#2c2c2c] rounded font-bold text-xs"
                  title="Format Currency ($)"
                >
                  $
                </button>
                <button
                  onClick={() => formatSelectedCells({ format: "percent" })}
                  className="p-1 hover:bg-[#2c2c2c] rounded font-bold text-xs"
                  title="Percentage (%)"
                >
                  %
                </button>
                <button
                  onClick={() => formatSelectedCells({ format: "number" })}
                  className="p-1 hover:bg-[#2c2c2c] rounded font-bold text-xs"
                  title="Comma Style (,)"
                >
                  ,
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Number ↘</div>
          </div>

          {/* GROUP 5: STYLES (Conditional Formatting, Format as Table, Cell Styles) */}
          <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
            <div className="flex flex-col gap-0.5 text-[11px]">
              <button
                onClick={() => formatSelectedCells({ bgColor: "#dcfce7", color: "#166534", bold: true })}
                className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left"
              >
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
                <span>Conditional Formatting ⌄</span>
              </button>
              <button
                onClick={() => formatSelectedCells({ bgColor: "#107c41", color: "#ffffff", bold: true, align: "center" })}
                className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left"
              >
                <Table className="w-3 h-3 text-cyan-400" />
                <span>Format as Table ⌄</span>
              </button>
              <button
                onClick={() => formatSelectedCells({ italic: true, border: true })}
                className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left"
              >
                <Sliders className="w-3 h-3 text-amber-400" />
                <span>Cell Styles ⌄</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Styles</div>
          </div>

          {/* GROUP 6: CELLS (Insert, Delete, Format) */}
          <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
            <div className="flex flex-col gap-0.5 text-[11px]">
              <button
                onClick={() => insertRowAt(activeCell.row)}
                className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left text-emerald-400"
                title="Insert row above"
              >
                <Plus className="w-3 h-3" />
                <span>Insert Row ⌄</span>
              </button>
              <button
                onClick={() => deleteRowAt(activeCell.row)}
                className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left text-rose-400"
                title="Delete active row"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Row ⌄</span>
              </button>
              <button
                onClick={() => insertColAt(activeCell.col)}
                className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left text-slate-300"
                title="Insert column left"
              >
                <Grid className="w-3 h-3" />
                <span>Insert Col ⌄</span>
              </button>
            </div>
            <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Cells</div>
          </div>

          {/* GROUP 7: EDITING (AutoSum [Σ], Clear [🧹], Templates, AI Tools, Export .XLSX) */}
          <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => setShowAutoSumMenu(!showAutoSumMenu)}
                    className="flex items-center gap-1 px-2 py-0.5 bg-[#2a2a2a] hover:bg-[#353535] rounded font-bold text-xs text-white"
                  >
                    <Sigma className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Σ ⌄</span>
                  </button>
                  {showAutoSumMenu && (
                    <div className="absolute top-full left-0 mt-1 bg-[#1e1e1e] border border-slate-700 rounded shadow-2xl py-1 w-32 z-50 text-[11px]">
                      <button onClick={() => applyAutoSum("SUM")} className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d]">Sum</button>
                      <button onClick={() => applyAutoSum("AVERAGE")} className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d]">Average</button>
                      <button onClick={() => applyAutoSum("COUNT")} className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d]">Count</button>
                      <button onClick={() => applyAutoSum("MAX")} className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d]">Max</button>
                      <button onClick={() => applyAutoSum("MIN")} className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d]">Min</button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => formatSelectedCells({ raw: "" })}
                  className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300"
                  title="Clear Selected Cells (Del)"
                >
                  🧹
                </button>
                <button
                  onClick={() => handleSort("asc")}
                  className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300"
                  title="Sort A to Z"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowFindReplace(true)}
                  className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300"
                  title="Find & Replace (Ctrl+F)"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Editing</div>
          </div>

          {/* GROUP 8: LIBRARY, AI TOOLS & DIRECT EXPORT .XLSX */}
          <div className="flex items-center gap-3 pr-2 min-w-max">
            {/* Templates Library */}
            <div
              onClick={loadStarterTemplate}
              className="flex flex-col items-center justify-center p-1 hover:bg-[#2c2c2c] rounded cursor-pointer"
              title="Reset to Starter Template"
            >
              <Layers className="w-4 h-4 text-amber-400 mb-0.5" />
              <span className="text-[10px] text-slate-300">Templates</span>
              <span className="text-[9px] text-slate-500 mt-1">Library</span>
            </div>

            {/* AI Data Analysis & Tools */}
            <div
              onClick={() => setShowAIModal(true)}
              className="flex flex-col items-center justify-center p-1 hover:bg-[#2c2c2c] rounded cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400 mb-0.5" />
              <span className="text-[10px] text-slate-300">AI Data Analysis</span>
              <span className="text-[9px] text-slate-500 mt-1">AI Tools</span>
            </div>

            {/* Direct Export .XLSX button */}
            <div
              onClick={exportToExcel}
              className="flex flex-col items-center justify-center p-1 hover:bg-[#2c2c2c] rounded cursor-pointer"
            >
              <FileImage className="w-4 h-4 text-cyan-400 mb-0.5" />
              <span className="text-[10px] text-slate-300">Export .XLSX</span>
              <span className="text-[9px] text-slate-500 mt-1">Output</span>
            </div>
          </div>
        </div>
      )}

      {/* OTHER TABS (Insert, Formulas, Data, Review, View, Help, WPS PDF) */}
      {activeTab === "insert" && (
        <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-2 flex items-center gap-4 text-xs text-slate-300">
          <button
            onClick={() => formatSelectedCells({ bgColor: "#107c41", color: "#ffffff", bold: true, border: true })}
            className="flex flex-col items-center p-1.5 hover:bg-[#2a2a2a] rounded"
          >
            <Table className="w-4 h-4 text-emerald-400 mb-1" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setShowChartModal(true)}
            className="flex flex-col items-center p-1.5 hover:bg-[#2a2a2a] rounded"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400 mb-1" />
            <span>Bar Chart</span>
          </button>
          <button
            onClick={() => setShowChartModal(true)}
            className="flex flex-col items-center p-1.5 hover:bg-[#2a2a2a] rounded"
          >
            <PieChart className="w-4 h-4 text-amber-400 mb-1" />
            <span>Pie Chart</span>
          </button>
          <button
            onClick={() => setShowFunctionWizard(true)}
            className="flex flex-col items-center p-1.5 hover:bg-[#2a2a2a] rounded"
          >
            <span className="font-serif italic font-bold text-slate-200 text-base mb-0.5">fx</span>
            <span>Function</span>
          </button>
          <button
            onClick={() => insertRowAt(activeCell.row)}
            className="flex flex-col items-center p-1.5 hover:bg-[#2a2a2a] rounded"
          >
            <Plus className="w-4 h-4 text-emerald-400 mb-1" />
            <span>Insert Row</span>
          </button>
          <button
            onClick={() => insertColAt(activeCell.col)}
            className="flex flex-col items-center p-1.5 hover:bg-[#2a2a2a] rounded"
          >
            <Plus className="w-4 h-4 text-blue-400 mb-1" />
            <span>Insert Column</span>
          </button>
        </div>
      )}

      {activeTab === "formulas" && (
        <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-2 flex items-center gap-3 overflow-x-auto text-xs text-slate-300">
          <button
            onClick={() => setShowFunctionWizard(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] text-white rounded font-bold"
          >
            <span className="font-serif italic text-base leading-none">fx</span>
            <span>Insert Function</span>
          </button>
          {["SUM", "AVERAGE", "COUNT", "MAX", "MIN", "IF", "CONCAT", "ROUND", "PRODUCT", "TODAY", "ABS", "SQRT"].map(
            (fn) => (
              <button
                key={fn}
                onClick={() => {
                  updateCell(activeCell.row, activeCell.col, { raw: `=${fn}()` });
                  setFormulaInput(`=${fn}()`);
                  formulaInputRef.current?.focus();
                }}
                className="px-2.5 py-1 bg-[#2a2a2a] hover:bg-[#353535] rounded font-mono text-[11px]"
              >
                {fn}
              </button>
            )
          )}
        </div>
      )}

      {activeTab === "data" && (
        <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-2 flex items-center gap-4 text-xs text-slate-300">
          <button
            onClick={() => handleSort("asc")}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sort Ascending (A-Z)</span>
          </button>
          <button
            onClick={() => handleSort("desc")}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-400 rotate-180" />
            <span>Sort Descending (Z-A)</span>
          </button>
          <button
            onClick={() => {
              if (confirm("Clear all data in this sheet?")) {
                setSheets((prev) =>
                  prev.map((s) => (s.id === activeSheetId ? { ...s, grid: {} } : s))
                );
                pushHistory({});
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/50 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Sheet Data</span>
          </button>
        </div>
      )}

      {(activeTab === "page_layout" || activeTab === "view") && (
        <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-2 flex items-center gap-6 text-xs text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showGridlines}
              onChange={(e) => setShowGridlines(e.target.checked)}
              className="accent-[#107c41]"
            />
            <span>View Gridlines</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHeadings}
              onChange={(e) => setShowHeadings(e.target.checked)}
              className="accent-[#107c41]"
            />
            <span>View Headings (A, B, C / 1, 2, 3)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFormulaBar}
              onChange={(e) => setShowFormulaBar(e.target.checked)}
              className="accent-[#107c41]"
            />
            <span>Formula Bar</span>
          </label>
          <div className="flex items-center gap-2 ml-4">
            <span>Zoom:</span>
            {[0.75, 1, 1.25, 1.5].map((scale) => (
              <button
                key={scale}
                onClick={() => setZoomScale(scale)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  zoomScale === scale ? "bg-[#107c41] text-white font-bold" : "bg-[#2a2a2a] text-slate-300"
                }`}
              >
                {Math.round(scale * 100)}%
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "review" && (
        <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-2 flex items-center gap-4 text-xs text-slate-300">
          <button
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Sheet Statistics</span>
          </button>
          <button
            onClick={() => setIsSheetProtected(!isSheetProtected)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-semibold transition-colors ${
              isSheetProtected ? "bg-amber-600 text-white" : "bg-[#2a2a2a] hover:bg-[#333333]"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isSheetProtected ? "Sheet Protected (Locked)" : "Protect Sheet"}</span>
          </button>
        </div>
      )}

      {activeTab === "help" && (
        <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-2 flex items-center gap-4 text-xs text-slate-300">
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded"
          >
            <QuestionIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Keyboard Shortcuts</span>
          </button>
          <button
            onClick={() => setShowFunctionWizard(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded"
          >
            <span className="font-serif italic font-bold">fx</span>
            <span>Formulas Reference</span>
          </button>
          <button
            onClick={loadStarterTemplate}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      )}

      {activeTab === "wps_pdf" && (
        <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-2 flex items-center gap-4 text-xs text-slate-300">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] text-white font-bold rounded"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print to PDF</span>
          </button>
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export .CSV</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333333] rounded"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export .XLSX</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FORMULA & NAME BOX BAR                                                 */}
      {/* ========================================================================= */}
      {showFormulaBar && (
        <div className="bg-[#181818] border-b border-[#252525] px-2 py-1 flex items-center gap-2 text-xs select-none">
          {/* Name Box showing active selection (e.g. E9) */}
          <div className="flex items-center justify-between min-w-[70px] max-w-[120px] px-2 py-1 rounded bg-[#202020] border border-slate-700/60 text-slate-100 font-mono text-xs font-semibold cursor-pointer truncate">
            <span>{activeCellCoord}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-1 shrink-0" />
          </div>

          <span className="text-slate-600 font-bold">:</span>

          {/* Action icons: ✕ ✓ fx */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => setFormulaInput(currentCellData.raw || "")}
              className="p-1 hover:text-rose-400 transition-colors"
              title="Cancel (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={commitFormula}
              className="p-1 hover:text-emerald-400 transition-colors"
              title="Enter"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <span
              onClick={() => setShowFunctionWizard(true)}
              className="font-serif italic font-bold text-slate-300 text-sm px-1 cursor-pointer hover:text-white"
              title="Insert Function Wizard"
            >
              fx
            </span>
          </div>

          {/* Interactive Formula Input Bar */}
          <input
            ref={formulaInputRef}
            type="text"
            value={formulaInput}
            onChange={(e) => setFormulaInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitFormula();
            }}
            placeholder="Enter a value or formula (e.g. =SUM(B4:B6) or =D4*E4)"
            className="flex-1 bg-[#202020] border border-slate-700/80 focus:border-[#107c41] px-3 py-1 rounded-md text-white font-mono text-xs outline-none transition-colors shadow-inner"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN SPREADSHEET GRID (SPREADSHEET GRID & STYLING)                     */}
      {/* ========================================================================= */}
      <div
        ref={gridContainerRef}
        className="flex-1 overflow-auto relative bg-[#121212] select-none scrollbar-thin"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDraggingFile(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        onMouseUp={() => {
          setIsSelecting(false);
          if (isAutoFilling && autoFillTarget) {
            const sourceRaw = currentCellData.raw || "";
            const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
            const rStart = Math.min(activeCell.row, autoFillTarget.row);
            const rEnd = Math.max(activeCell.row, autoFillTarget.row);
            for (let r = rStart; r <= rEnd; r++) {
              updates.push({ row: r, col: activeCell.col, data: { raw: sourceRaw, format: currentCellData.format } });
            }
            updateCells(updates);
            setIsAutoFilling(false);
            setAutoFillTarget(null);
          }
        }}
      >
        {isDraggingFile && (
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-4 border-dashed border-[#107c41] animate-pulse text-white">
            <Upload className="w-16 h-16 text-[#107c41] mb-4" />
            <h3 className="text-xl font-bold">Drop Excel or CSV file here</h3>
            <p className="text-sm text-emerald-200 mt-1">Instant in-browser opening with exact formulas and styles</p>
          </div>
        )}

        <div style={{ transform: `scale(${zoomScale})`, transformOrigin: "top left" }}>
          <table className="border-collapse table-fixed text-xs font-sans w-max">
            {showHeadings && (
              <thead>
                <tr className="sticky top-0 z-20 bg-[#1e1e1e]">
                  {/* Corner Select-All Triangle */}
                  <th
                    onClick={() => {
                      setSelectionRange({
                        startRow: 0,
                        startCol: 0,
                        endRow: currentSheet.maxRows - 1,
                        endCol: currentSheet.maxCols - 1,
                      });
                    }}
                    className="w-12 h-6 border-b border-r border-[#303030] bg-[#1a1a1a] sticky left-0 z-30 text-[10px] text-slate-500 font-mono text-center cursor-pointer hover:bg-[#282828]"
                  >
                    ◢
                  </th>

                  {/* Column Headers (A, B, C, D, E, F...) */}
                  {Array.from({ length: currentSheet.maxCols }).map((_, colIdx) => {
                    const letter = colToLetter(colIdx);
                    const isColActive =
                      activeCell.col === colIdx || (colIdx >= normalizedRange.cMin && colIdx <= normalizedRange.cMax);
                    return (
                      <th
                        key={colIdx}
                        onClick={() => {
                          setActiveCell({ row: 0, col: colIdx });
                          setSelectionRange({
                            startRow: 0,
                            startCol: colIdx,
                            endRow: currentSheet.maxRows - 1,
                            endCol: colIdx,
                          });
                        }}
                        className={`w-28 h-6 border-b border-r border-[#303030] text-center font-mono text-[11px] font-semibold transition-colors cursor-pointer select-none ${
                          isColActive
                            ? "bg-[#107c41] text-white font-bold border-b-2 border-emerald-300"
                            : "bg-[#1a1a1a] text-slate-300 hover:bg-[#282828]"
                        }`}
                      >
                        {letter}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}

            <tbody>
              {Array.from({ length: currentSheet.maxRows }).map((_, rowIdx) => {
                const isRowActive =
                  activeCell.row === rowIdx || (rowIdx >= normalizedRange.rMin && rowIdx <= normalizedRange.rMax);
                const isTotalRow = rowIdx === 6; // Row 7 total row styling

                return (
                  <tr key={rowIdx}>
                    {/* Row Header (1, 2, 3...) */}
                    {showHeadings && (
                      <td
                        onClick={() => {
                          setActiveCell({ row: rowIdx, col: 0 });
                          setSelectionRange({
                            startRow: rowIdx,
                            startCol: 0,
                            endRow: rowIdx,
                            endCol: currentSheet.maxCols - 1,
                          });
                        }}
                        className={`w-12 h-6 border-b border-r border-[#303030] text-center font-mono text-[10px] font-semibold sticky left-0 z-10 select-none cursor-pointer ${
                          isRowActive
                            ? "bg-[#107c41] text-white font-bold border-r-2 border-emerald-300"
                            : "bg-[#1a1a1a] text-slate-400 hover:bg-[#282828]"
                        }`}
                      >
                        {rowIdx + 1}
                      </td>
                    )}

                    {/* Cells */}
                    {Array.from({ length: currentSheet.maxCols }).map((_, colIdx) => {
                      const key = `${rowIdx}:${colIdx}`;
                      const cell = currentSheet.grid[key];
                      const isFocused = activeCell.row === rowIdx && activeCell.col === colIdx;
                      const isInRange =
                        rowIdx >= normalizedRange.rMin &&
                        rowIdx <= normalizedRange.rMax &&
                        colIdx >= normalizedRange.cMin &&
                        colIdx <= normalizedRange.cMax;
                      const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;

                      let rawComputedVal: string | number = "";
                      if (cell && cell.raw) {
                        if (cell.raw.startsWith("=")) {
                          rawComputedVal = evaluateFormula(cell.raw, currentSheet.grid);
                        } else {
                          rawComputedVal = cell.raw;
                        }
                      }

                      // Apply formatting (currency ₹, numbers, etc.)
                      const displayVal = formatCellValue(rawComputedVal, cell?.format);

                      return (
                        <td
                          key={colIdx}
                          onMouseDown={() => {
                            setActiveCell({ row: rowIdx, col: colIdx });
                            setSelectionRange({ startRow: rowIdx, startCol: colIdx, endRow: rowIdx, endCol: colIdx });
                            setIsSelecting(true);
                            setEditingCell(null);
                          }}
                          onMouseEnter={() => {
                            if (isSelecting) {
                              setSelectionRange((prev) =>
                                prev ? { ...prev, endRow: rowIdx, endCol: colIdx } : null
                              );
                            }
                            if (isAutoFilling) {
                              setAutoFillTarget({ row: rowIdx, col: colIdx });
                            }
                          }}
                          onDoubleClick={() => {
                            setEditingCell({ row: rowIdx, col: colIdx });
                            setEditValue(cell?.raw || "");
                          }}
                          style={{
                            backgroundColor: isInRange ? undefined : cell?.bgColor,
                            color: cell?.color,
                            fontWeight: cell?.bold ? "bold" : "normal",
                            fontStyle: cell?.italic ? "italic" : "normal",
                            fontFamily: cell?.fontFamily,
                            fontSize: cell?.fontSize ? `${cell.fontSize}px` : undefined,
                            textDecoration: [cell?.underline ? "underline" : "", cell?.strike ? "line-through" : ""]
                              .filter(Boolean)
                              .join(" "),
                            textAlign: cell?.align || "left",
                          }}
                          className={`h-6 px-1.5 truncate relative cursor-cell transition-all font-sans select-none ${
                            showGridlines ? "border-b border-r border-[#262626]" : ""
                          } ${cell?.border ? "border border-slate-600" : ""} ${
                            isTotalRow ? "border-b-4 border-double border-slate-400 font-bold" : ""
                          } ${
                            isInRange
                              ? isFocused
                                ? "outline-2 outline-[#107c41] -outline-offset-1 bg-[#107c41]/20 z-10 shadow-sm"
                                : "bg-[#107c41]/15"
                              : "hover:bg-[#1a1a1a]"
                          }`}
                        >
                          {isEditing ? (
                            <input
                              ref={cellInputRef}
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={commitEdit}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  commitEdit();
                                  setActiveCell((prev) => ({ ...prev, row: Math.min(prev.row + 1, currentSheet.maxRows - 1) }));
                                }
                              }}
                              className="w-full h-full bg-[#121212] text-white border-none outline-none font-mono text-xs px-0.5"
                            />
                          ) : (
                            <span>{displayVal}</span>
                          )}

                          {/* Excel Green Fill Handle in Bottom Right */}
                          {isFocused && (
                            <div
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setIsAutoFilling(true);
                              }}
                              className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#107c41] border border-white z-20 cursor-crosshair shadow"
                              title="Drag to autofill"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BOTTOM SHEET TABS & STATUS BAR                                         */}
      {/* ========================================================================= */}
      <div className="bg-[#181818] border-t border-[#252525] px-3 py-1 flex items-center justify-between text-xs select-none z-30">
        {/* Left: Sheet Tabs */}
        <div className="flex items-center gap-1">
          {sheets.map((sheet) => {
            const isActive = sheet.id === activeSheetId;
            return (
              <button
                key={sheet.id}
                onClick={() => setActiveSheetId(sheet.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-t transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#121212] text-white border-b-2 border-[#107c41] font-bold shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#252525]"
                }`}
              >
                <span>{sheet.name}</span>
                {sheets.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete ${sheet.name}?`)) {
                        setSheets(sheets.filter((s) => s.id !== sheet.id));
                      }
                    }}
                    className="hover:text-rose-400 text-slate-500 ml-1"
                  >
                    ×
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={addNewSheet}
            className="p-1 rounded hover:bg-[#252525] text-slate-400 hover:text-white transition-colors"
            title="Add New Sheet"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Status Bar with Live Sum, Avg, Count */}
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
          <span>Ready</span>
          {rangeCalculations.hasNumbers && (
            <div className="hidden sm:flex items-center gap-3">
              <span>
                Average: <strong className="text-[#107c41]">{rangeCalculations.avg}</strong>
              </span>
              <span>
                Count: <strong className="text-[#107c41]">{rangeCalculations.count}</strong>
              </span>
              <span>
                Sum: <strong className="text-[#107c41]">{rangeCalculations.sum}</strong>
              </span>
            </div>
          )}

          {/* Interactive Zoom Controls */}
          <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.1))}
              className="p-1 hover:text-white"
              title="Zoom Out"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoomScale(1)}
              className="text-[#107c41] font-bold px-1 hover:underline"
              title="Reset to 100%"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              onClick={() => setZoomScale((z) => Math.min(2, z + 0.1))}
              className="p-1 hover:text-white"
              title="Zoom In"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. MODALS: FILE BACKSTAGE, FIND & REPLACE, FUNCTION WIZARD, AI & CHARTS   */}
      {/* ========================================================================= */}

      {/* FILE BACKSTAGE MODAL */}
      {showFileBackstage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#107c41] flex items-center justify-center font-bold text-white text-xs">
                  X
                </div>
                <h3 className="font-bold text-base text-white">File Menu - {fileName}</h3>
              </div>
              <button
                onClick={() => setShowFileBackstage(false)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-5">
              <button
                onClick={() => {
                  setSheets([
                    { id: `sheet-${Date.now()}`, name: "Sheet1", grid: {}, maxRows: DEFAULT_ROWS, maxCols: DEFAULT_COLS },
                  ]);
                  setShowFileBackstage(false);
                }}
                className="flex items-center gap-2 p-3 bg-[#242424] hover:bg-[#303030] rounded-lg text-left"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-xs text-white">New Sheet</div>
                  <div className="text-[10px] text-slate-400">Blank spreadsheet</div>
                </div>
              </button>

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setShowFileBackstage(false);
                }}
                className="flex items-center gap-2 p-3 bg-[#242424] hover:bg-[#303030] rounded-lg text-left"
              >
                <FolderOpen className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-semibold text-xs text-white">Open File</div>
                  <div className="text-[10px] text-slate-400">.xlsx, .xls, .csv</div>
                </div>
              </button>

              <button
                onClick={() => {
                  exportToExcel();
                  setShowFileBackstage(false);
                }}
                className="flex items-center gap-2 p-3 bg-[#242424] hover:bg-[#303030] rounded-lg text-left"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-semibold text-xs text-white">Save (.XLSX)</div>
                  <div className="text-[10px] text-slate-400">Excel format</div>
                </div>
              </button>

              <button
                onClick={() => {
                  exportToCsv();
                  setShowFileBackstage(false);
                }}
                className="flex items-center gap-2 p-3 bg-[#242424] hover:bg-[#303030] rounded-lg text-left"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-semibold text-xs text-white">Export CSV</div>
                  <div className="text-[10px] text-slate-400">Comma separated</div>
                </div>
              </button>

              <button
                onClick={() => {
                  loadStarterTemplate();
                  setShowFileBackstage(false);
                }}
                className="flex items-center gap-2 p-3 bg-[#242424] hover:bg-[#303030] rounded-lg text-left"
              >
                <RefreshCw className="w-4 h-4 text-purple-400" />
                <div>
                  <div className="font-semibold text-xs text-white">Reset Demo</div>
                  <div className="text-[10px] text-slate-400">Starter template</div>
                </div>
              </button>

              <button
                onClick={() => {
                  window.print();
                  setShowFileBackstage(false);
                }}
                className="flex items-center gap-2 p-3 bg-[#242424] hover:bg-[#303030] rounded-lg text-left"
              >
                <Printer className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="font-semibold text-xs text-white">Print / PDF</div>
                  <div className="text-[10px] text-slate-400">Printable sheet</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIND & REPLACE MODAL */}
      {showFindReplace && (
        <div className="fixed top-16 right-8 z-50 bg-[#1c1c1c] border border-slate-700 rounded-xl shadow-2xl p-4 w-84 text-xs text-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-cyan-400" /> Find &amp; Replace
            </span>
            <button onClick={() => setShowFindReplace(false)} className="hover:text-white text-slate-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 mt-3">
            <div>
              <label className="text-[11px] text-slate-400">Find What:</label>
              <input
                type="text"
                value={findText}
                onChange={(e) => {
                  setFindText(e.target.value);
                  runFind(e.target.value);
                }}
                placeholder="Text to find..."
                className="w-full mt-1 bg-[#252525] border border-slate-700 px-2 py-1 rounded text-white outline-none focus:border-[#107c41]"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400">Replace With:</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replacement text..."
                className="w-full mt-1 bg-[#252525] border border-slate-700 px-2 py-1 rounded text-white outline-none focus:border-[#107c41]"
              />
            </div>

            {findMatches.length > 0 && (
              <div className="text-[10px] text-emerald-400">
                Found {findMatches.length} match(es) (Showing {currentMatchIndex + 1}/{findMatches.length})
              </div>
            )}

            <div className="flex items-center gap-1.5 pt-2">
              <button
                onClick={findNext}
                className="flex-1 py-1 bg-[#2c2c2c] hover:bg-[#353535] rounded font-semibold text-slate-200"
              >
                Find Next
              </button>
              <button
                onClick={replaceCurrent}
                className="flex-1 py-1 bg-[#2c2c2c] hover:bg-[#353535] rounded font-semibold text-slate-200"
              >
                Replace
              </button>
              <button
                onClick={replaceAll}
                className="flex-1 py-1 bg-[#107c41] hover:bg-[#0e6b37] rounded font-semibold text-white"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FUNCTION WIZARD MODAL (fx) */}
      {showFunctionWizard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span className="font-serif italic text-emerald-400 text-lg">fx</span> Insert Function
              </h3>
              <button onClick={() => setShowFunctionWizard(false)} className="hover:text-white text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto my-3 scrollbar-thin">
              {[
                { name: "SUM", syntax: "=SUM(B4:B6)", desc: "Adds all the numbers in a range of cells." },
                { name: "AVERAGE", syntax: "=AVERAGE(D4:D6)", desc: "Calculates the average (arithmetic mean) of numbers." },
                { name: "MULTIPLY", syntax: "=D4*E4", desc: "Multiplies two cells together." },
                { name: "COUNT", syntax: "=COUNT(B4:B6)", desc: "Counts how many cells contain numbers." },
                { name: "MAX", syntax: "=MAX(D4:D6)", desc: "Returns the largest value in a set of values." },
                { name: "MIN", syntax: "=MIN(D4:D6)", desc: "Returns the smallest number in a set of values." },
                { name: "IF", syntax: '=IF(D4>100, "High", "Low")', desc: "Checks whether a condition is met." },
                { name: "ROUND", syntax: "=ROUND(D7, 2)", desc: "Rounds a number to a specified number of digits." },
                { name: "PRODUCT", syntax: "=PRODUCT(D4, E4)", desc: "Multiplies all the numbers given as arguments." },
                { name: "CONCAT", syntax: '=CONCAT(A4, " - ", B4)', desc: "Combines text from multiple cells." },
                { name: "TODAY", syntax: "=TODAY()", desc: "Returns the current date." },
                { name: "ABS", syntax: "=ABS(D4)", desc: "Returns the absolute value." },
                { name: "SQRT", syntax: "=SQRT(D4)", desc: "Returns the square root." },
              ].map((item) => (
                <div
                  key={item.name}
                  onClick={() => {
                    updateCell(activeCell.row, activeCell.col, { raw: item.syntax });
                    setFormulaInput(item.syntax);
                    setShowFunctionWizard(false);
                  }}
                  className="p-2.5 rounded bg-[#242424] hover:bg-[#2f2f2f] cursor-pointer transition-colors border border-transparent hover:border-[#107c41]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{item.name}</span>
                    <span className="text-[11px] text-emerald-400 font-mono">{item.syntax}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI ANALYSIS MODAL */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> AI Data Insights
              </h3>
              <button onClick={() => setShowAIModal(false)} className="hover:text-white text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-lg">
                <span className="font-bold text-purple-300 block mb-1">Executive Summary</span>
                <span>NotixNode cluster contains <strong>{sheetStats.populated}</strong> populated cells, <strong>{sheetStats.formulas}</strong> automated formulas, and <strong>{sheetStats.numbers}</strong> numerical entries. Total projected revenue is <strong>₹5,883/month</strong> across 47 active clients.</span>
              </div>
              <div className="p-3 bg-[#242424] rounded-lg">
                <span className="font-bold text-emerald-400 block mb-1">Key Metrics</span>
                <div className="grid grid-cols-2 gap-2 mt-1 font-mono text-[11px]">
                  <div>Sum of Selection: {rangeCalculations.sum}</div>
                  <div>Average: {rangeCalculations.avg}</div>
                  <div>Highest: {rangeCalculations.max}</div>
                  <div>Lowest: {rangeCalculations.min}</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAIModal(false)}
              className="w-full py-1.5 bg-[#107c41] text-white font-bold rounded text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* CHART PREVIEW MODAL */}
      {showChartModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Cluster Revenue Breakdown
              </h3>
              <button onClick={() => setShowChartModal(false)} className="hover:text-white text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="my-6 flex items-end justify-center gap-6 h-48 px-4 border-b border-slate-700 pb-2">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-emerald-400 font-bold">₹1,656</span>
                <div className="w-12 bg-emerald-500 rounded-t h-28 shadow" />
                <span className="text-[10px] text-slate-300">Tier-1 Basic</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-emerald-300 font-bold">₹2,235</span>
                <div className="w-12 bg-[#107c41] rounded-t h-38 shadow" />
                <span className="text-[10px] text-slate-300">Tier-2 Standard</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-cyan-400 font-bold">₹1,992</span>
                <div className="w-12 bg-cyan-500 rounded-t h-34 shadow" />
                <span className="text-[10px] text-slate-300">Tier-3 Premium</span>
              </div>
            </div>
            <button
              onClick={() => setShowChartModal(false)}
              className="w-full py-1.5 bg-[#107c41] text-white font-bold rounded text-xs"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* KEYBOARD SHORTCUTS MODAL */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <QuestionIcon className="w-4 h-4 text-amber-400" /> Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcutsModal(false)} className="hover:text-white text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="my-3 space-y-1.5 text-xs max-h-72 overflow-y-auto scrollbar-thin">
              {[
                { key: "Ctrl + Z", desc: "Undo last edit" },
                { key: "Ctrl + Y", desc: "Redo undone edit" },
                { key: "Ctrl + C", desc: "Copy cell / range" },
                { key: "Ctrl + X", desc: "Cut cell / range" },
                { key: "Ctrl + V", desc: "Paste cell / range" },
                { key: "Ctrl + B", desc: "Toggle Bold" },
                { key: "Ctrl + I", desc: "Toggle Italic" },
                { key: "Ctrl + U", desc: "Toggle Underline" },
                { key: "Ctrl + F", desc: "Open Find & Replace" },
                { key: "Ctrl + A", desc: "Select Used Range" },
                { key: "Enter / F2", desc: "Start inline editing" },
                { key: "Delete", desc: "Clear selected cell(s)" },
                { key: "Arrow Keys", desc: "Navigate active cell" },
                { key: "Shift + Arrows", desc: "Expand selection range" },
              ].map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2 bg-[#242424] rounded">
                  <span className="font-mono text-emerald-400 font-semibold">{s.key}</span>
                  <span className="text-slate-300">{s.desc}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-1.5 bg-[#107c41] text-white font-bold rounded text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" /> Sheet Health &amp; Statistics
              </h3>
              <button onClick={() => setShowStatsModal(false)} className="hover:text-white text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="my-4 space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-[#242424] rounded">
                <span className="text-slate-400">Active Sheet Name:</span>
                <span className="font-bold text-white">{currentSheet.name}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#242424] rounded">
                <span className="text-slate-400">Populated Cells:</span>
                <span className="font-bold text-emerald-400">{sheetStats.populated}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#242424] rounded">
                <span className="text-slate-400">Calculated Formulas:</span>
                <span className="font-bold text-cyan-400">{sheetStats.formulas}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#242424] rounded">
                <span className="text-slate-400">Numerical Data Points:</span>
                <span className="font-bold text-purple-400">{sheetStats.numbers}</span>
              </div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-1.5 bg-[#107c41] text-white font-bold rounded text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Adsterra Clean Banner */}
      <div className="bg-[#0f0f0f] border-t border-[#252525] py-2">
        <AdBanner label="Sponsored Partner" />
      </div>
    </div>
  );
}
