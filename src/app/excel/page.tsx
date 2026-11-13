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
  ArrowLeft,
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
} from "lucide-react";
import AdBanner from "@/components/AdBanner";

// Types
export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  bgColor?: string;
  align?: "left" | "center" | "right";
  format?: "general" | "currency" | "percent" | "number";
  border?: boolean;
}

export interface CellData extends CellFormat {
  raw: string; // The formula or raw text (e.g. "=SUM(A1:A5)" or "450")
  computed?: string | number;
}

export type SheetGrid = Record<string, CellData>; // key is "row:col" e.g. "0:0" for A1

export interface SheetTab {
  id: string;
  name: string;
  grid: SheetGrid;
  maxRows: number;
  maxCols: number;
}

const DEFAULT_ROWS = 60;
const DEFAULT_COLS = 26; // A-Z

// Helper: 0 -> A, 25 -> Z, 26 -> AA
export function colToLetter(col: number): string {
  let temp = col;
  let letter = "";
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

// Helper: A -> 0, Z -> 25, AA -> 26
export function letterToCol(letter: string): number {
  let col = 0;
  const str = letter.toUpperCase();
  for (let i = 0; i < str.length; i++) {
    col = col * 26 + (str.charCodeAt(i) - 64);
  }
  return col - 1;
}

// Helper: "A1" -> { row: 0, col: 0 }
export function parseCoord(coord: string): { row: number; col: number } | null {
  const match = coord.trim().match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;
  const col = letterToCol(match[1]);
  const row = parseInt(match[2], 10) - 1;
  if (isNaN(row) || col < 0) return null;
  return { row, col };
}

// Formula Evaluator
export function evaluateFormula(
  formula: string,
  grid: SheetGrid,
  visited = new Set<string>()
): string | number {
  if (!formula.startsWith("=")) return formula;

  const expr = formula.substring(1).trim();

  // Basic function matching: SUM(A1:A5), AVERAGE(B1:B10), COUNT(A1:Z50), MAX, MIN
  const fnMatch = expr.match(/^([A-Za-z]+)\((.*)\)$/i);
  if (fnMatch) {
    const fnName = fnMatch[1].toUpperCase();
    const argsStr = fnMatch[2];

    // Range: A1:A5
    const rangeMatch = argsStr.match(/^([A-Za-z]+\d+):([A-Za-z]+\d+)$/);
    if (rangeMatch) {
      const start = parseCoord(rangeMatch[1]);
      const end = parseCoord(rangeMatch[2]);
      if (start && end) {
        const values: number[] = [];
        const rMin = Math.min(start.row, end.row);
        const rMax = Math.max(start.row, end.row);
        const cMin = Math.min(start.col, end.col);
        const cMax = Math.max(start.col, end.col);

        for (let r = rMin; r <= rMax; r++) {
          for (let c = cMin; c <= cMax; c++) {
            const key = `${r}:${c}`;
            if (visited.has(key)) continue; // avoid cycle
            const cell = grid[key];
            if (cell && cell.raw) {
              let val: string | number = cell.raw;
              if (typeof val === "string" && val.startsWith("=")) {
                visited.add(key);
                val = evaluateFormula(val, grid, visited);
                visited.delete(key);
              }
              const num = parseFloat(String(val));
              if (!isNaN(num)) values.push(num);
            }
          }
        }

        if (fnName === "SUM") {
          return values.reduce((acc, curr) => acc + curr, 0);
        }
        if (fnName === "AVERAGE" || fnName === "AVG") {
          if (values.length === 0) return 0;
          return Number((values.reduce((acc, curr) => acc + curr, 0) / values.length).toFixed(2));
        }
        if (fnName === "COUNT") {
          return values.length;
        }
        if (fnName === "MAX") {
          return values.length ? Math.max(...values) : 0;
        }
        if (fnName === "MIN") {
          return values.length ? Math.min(...values) : 0;
        }
      }
    }
  }

  // Simple cell reference math, e.g. "=A1 + B1" or "=A1 * 1.18"
  try {
    const replaced = expr.replace(/[A-Za-z]+\d+/g, (match) => {
      const coord = parseCoord(match);
      if (!coord) return "0";
      const key = `${coord.row}:${coord.col}`;
      if (visited.has(key)) return "0";
      const cell = grid[key];
      if (!cell || !cell.raw) return "0";
      let cellVal: string | number = cell.raw;
      if (typeof cellVal === "string" && cellVal.startsWith("=")) {
        visited.add(key);
        cellVal = evaluateFormula(cellVal, grid, visited);
        visited.delete(key);
      }
      const num = parseFloat(String(cellVal));
      return isNaN(num) ? "0" : String(num);
    });

    // Safe mathematical expression evaluation (numbers and basic arithmetic operators only)
    if (/^[0-9+\-*/().\s]+$/.test(replaced)) {
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${replaced})`)();
      return typeof result === "number" && !isNaN(result)
        ? Number(result.toFixed(4)).toString()
        : result;
    }
  } catch {
    return "#VALUE!";
  }

  return formula;
}

export default function ExcelEditorPage() {
  const [fileName, setFileName] = useState("Book1.xlsx");
  const [isAutoSaved, setIsAutoSaved] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "insert" | "formulas" | "data" | "view">("home");

  // Sheet Tabs
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

  // Current Active Cell
  const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [formulaInput, setFormulaInput] = useState("");

  // History for Undo/Redo
  const [history, setHistory] = useState<SheetGrid[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drag & Drop
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Formatting Palette Open
  const [showColorPicker, setShowColorPicker] = useState<"font" | "fill" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const formulaInputRef = useRef<HTMLInputElement>(null);

  const currentSheet = useMemo(
    () => sheets.find((s) => s.id === activeSheetId) || sheets[0],
    [sheets, activeSheetId]
  );

  const activeCellCoord = useMemo(
    () => `${colToLetter(activeCell.col)}${activeCell.row + 1}`,
    [activeCell]
  );

  const activeCellKey = `${activeCell.row}:${activeCell.col}`;
  const currentCellData = currentSheet.grid[activeCellKey] || { raw: "" };

  // Sync Formula Input with Active Cell
  useEffect(() => {
    setFormulaInput(currentCellData.raw || "");
  }, [activeCellKey, currentCellData.raw]);

  // Focus inline editor on edit
  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
    }
  }, [editingCell]);

  // Load sample starter data on fresh launch if empty
  useEffect(() => {
    const saved = localStorage.getItem("notixnode_excel_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sheets && parsed.sheets.length) {
          setSheets(parsed.sheets);
          setFileName(parsed.fileName || "Book1.xlsx");
          return;
        }
      } catch (e) {
        console.error("Failed to restore sheet", e);
      }
    }

    // Default Sample: Discord Server & Bot Financial Planner
    const sampleGrid: SheetGrid = {
      "0:0": { raw: "NOTIXNODE Financial & Bot Hosting Planner", bold: true, color: "#107c41", format: "general" },
      "2:0": { raw: "Month", bold: true, bgColor: "#107c41", color: "#ffffff", align: "center", border: true },
      "2:1": { raw: "Hosting Plan", bold: true, bgColor: "#107c41", color: "#ffffff", align: "center", border: true },
      "2:2": { raw: "Qty", bold: true, bgColor: "#107c41", color: "#ffffff", align: "center", border: true },
      "2:3": { raw: "Unit Price (₹)", bold: true, bgColor: "#107c41", color: "#ffffff", align: "right", border: true },
      "2:4": { raw: "Total Cost (₹)", bold: true, bgColor: "#107c41", color: "#ffffff", align: "right", border: true },

      "3:0": { raw: "January", align: "left" },
      "3:1": { raw: "Basic Node (1GB)", align: "left" },
      "3:2": { raw: "5", align: "center" },
      "3:3": { raw: "69", align: "right" },
      "3:4": { raw: "=C4*D4", bold: true, align: "right" },

      "4:0": { raw: "February", align: "left" },
      "4:1": { raw: "Standard Node (2GB)", align: "left" },
      "4:2": { raw: "3", align: "center" },
      "4:3": { raw: "149", align: "right" },
      "4:4": { raw: "=C5*D5", bold: true, align: "right" },

      "5:0": { raw: "March", align: "left" },
      "5:1": { raw: "Premium Node (4GB)", align: "left" },
      "5:2": { raw: "2", align: "center" },
      "5:3": { raw: "249", align: "right" },
      "5:4": { raw: "=C6*D6", bold: true, align: "right" },

      "6:0": { raw: "Summary Total", bold: true, color: "#107c41" },
      "6:1": { raw: "3 Months Total", italic: true },
      "6:2": { raw: "=SUM(C4:C6)", bold: true, align: "center" },
      "6:3": { raw: "AVG Cost:", align: "right" },
      "6:4": { raw: "=SUM(E4:E6)", bold: true, bgColor: "#dcfce7", color: "#166534", align: "right", border: true },
    };

    setSheets([
      {
        id: "sheet-1",
        name: "Hosting Budget",
        grid: sampleGrid,
        maxRows: DEFAULT_ROWS,
        maxCols: DEFAULT_COLS,
      },
    ]);
  }, []);

  // Save to LocalStorage
  const saveToLocalStorage = useCallback(
    (newSheets: SheetTab[], name = fileName) => {
      try {
        localStorage.setItem(
          "notixnode_excel_data",
          JSON.stringify({ sheets: newSheets, fileName: name })
        );
        setIsAutoSaved(true);
      } catch (e) {
        console.error("AutoSave error:", e);
      }
    },
    [fileName]
  );

  // Update a single cell
  const updateCell = useCallback(
    (row: number, col: number, data: Partial<CellData>) => {
      setSheets((prev) => {
        const nextSheets = prev.map((s) => {
          if (s.id !== activeSheetId) return s;
          const key = `${row}:${col}`;
          const existing = s.grid[key] || { raw: "" };
          const updated = { ...existing, ...data };

          // If formula, evaluate
          if (updated.raw && updated.raw.startsWith("=")) {
            updated.computed = evaluateFormula(updated.raw, s.grid);
          } else {
            updated.computed = undefined;
          }

          return {
            ...s,
            grid: {
              ...s.grid,
              [key]: updated,
            },
          };
        });

        saveToLocalStorage(nextSheets);
        return nextSheets;
      });
      setIsAutoSaved(true);
    },
    [activeSheetId, saveToLocalStorage]
  );

  // Commit Editing
  const commitEdit = () => {
    if (editingCell) {
      updateCell(editingCell.row, editingCell.col, { raw: editValue });
      setEditingCell(null);
    }
  };

  // Commit Formula Bar Edit
  const commitFormula = () => {
    updateCell(activeCell.row, activeCell.col, { raw: formulaInput });
  };

  // Keyboard navigation & Shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editingCell) {
      if (e.key === "Enter") {
        e.preventDefault();
        commitEdit();
        setActiveCell((prev) => ({ ...prev, row: Math.min(prev.row + 1, currentSheet.maxRows - 1) }));
      } else if (e.key === "Escape") {
        setEditingCell(null);
      }
      return;
    }

    // Grid Navigation when not in inline edit
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCell((prev) => ({ ...prev, row: Math.max(0, prev.row - 1) }));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCell((prev) => ({ ...prev, row: Math.min(currentSheet.maxRows - 1, prev.row + 1) }));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActiveCell((prev) => ({ ...prev, col: Math.max(0, prev.col - 1) }));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setActiveCell((prev) => ({ ...prev, col: Math.min(currentSheet.maxCols - 1, prev.col + 1) }));
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (e.shiftKey) {
        setActiveCell((prev) => ({ ...prev, col: Math.max(0, prev.col - 1) }));
      } else {
        setActiveCell((prev) => ({ ...prev, col: Math.min(currentSheet.maxCols - 1, prev.col + 1) }));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      setEditingCell({ row: activeCell.row, col: activeCell.col });
      setEditValue(currentCellData.raw || "");
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      updateCell(activeCell.row, activeCell.col, { raw: "" });
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      // Start typing immediately into cell
      setEditingCell({ row: activeCell.row, col: activeCell.col });
      setEditValue(e.key);
    }
  };

  // Formatting Helpers
  const toggleBold = () => updateCell(activeCell.row, activeCell.col, { bold: !currentCellData.bold });
  const toggleItalic = () => updateCell(activeCell.row, activeCell.col, { italic: !currentCellData.italic });
  const toggleUnderline = () => updateCell(activeCell.row, activeCell.col, { underline: !currentCellData.underline });
  const toggleStrike = () => updateCell(activeCell.row, activeCell.col, { strike: !currentCellData.strike });
  const setAlign = (align: "left" | "center" | "right") => updateCell(activeCell.row, activeCell.col, { align });

  const applyAutoSum = (fn = "SUM") => {
    // Find contiguous range above active cell
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
  };

  // File Upload Handler (Parses any .xlsx, .xls, .csv via SheetJS)
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
          saveToLocalStorage(newSheets, file.name);
        }
      } catch (err) {
        alert("Could not parse this Excel file. Please ensure it is a valid .xlsx, .xls, or .csv document.");
        console.error(err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export to Real .XLSX
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      sheets.forEach((sheet) => {
        // Convert grid to 2D array
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

        // Trim trailing empty rows
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
          const val = cell ? (cell.raw.startsWith("=") ? evaluateFormula(cell.raw, currentSheet.grid) : cell.raw) : "";
          row.push(val);
        }
        aoa.push(row);
      }
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName.replace(/\.[^/.]+$/, "")}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error generating CSV: " + err);
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

  // Clear Sheet
  const clearCurrentSheet = () => {
    if (confirm("Are you sure you want to clear all cells in this sheet?")) {
      setSheets((prev) =>
        prev.map((s) => (s.id === activeSheetId ? { ...s, grid: {} } : s))
      );
    }
  };

  // Status Bar Live Calculations
  const cellCalculations = useMemo(() => {
    const cell = currentCellData;
    if (!cell || !cell.raw) return { count: 0, sum: 0, avg: 0 };
    const val = cell.raw.startsWith("=")
      ? evaluateFormula(cell.raw, currentSheet.grid)
      : cell.raw;
    const num = parseFloat(String(val));
    if (isNaN(num)) return { count: 1, sum: 0, avg: 0 };
    return { count: 1, sum: num, avg: num };
  }, [currentCellData, currentSheet.grid]);

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`min-h-screen flex flex-col bg-[#08080f] text-slate-100 select-none font-sans outline-none ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
    >
      {/* 1. TOP EXCEL TITLE BAR (Iconic MS Excel Header) */}
      <div className="bg-[#107c41] text-white px-3 py-1.5 flex items-center justify-between text-xs border-b border-[#0d6535] shadow-md z-30">
        {/* Left: Quick Access Toolbar & App Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-black/20 text-white font-bold transition-colors"
            title="Return to NotixNode Home"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">NotixNode</span>
          </Link>

          <span className="text-white/40">|</span>

          {/* Excel Icon */}
          <div className="w-5 h-5 rounded bg-white flex items-center justify-center shadow-sm">
            <span className="text-[#107c41] font-black text-xs font-mono">X</span>
          </div>

          {/* Quick Buttons */}
          <button
            onClick={exportToExcel}
            className="p-1 hover:bg-black/20 rounded text-white/90 hover:text-white transition-colors"
            title="Save / Download (.xlsx)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 hover:bg-black/20 rounded text-white/90 hover:text-white transition-colors"
            title="Open / Upload File"
          >
            <FolderOpen className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={addNewSheet}
            className="p-1 hover:bg-black/20 rounded text-white/90 hover:text-white transition-colors"
            title="New Sheet"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          {/* File Name */}
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-transparent hover:bg-black/15 focus:bg-black/30 px-2 py-0.5 rounded font-bold text-white tracking-wide border-none outline-none text-xs w-36 sm:w-56 transition-colors"
            title="Click to rename document"
          />

          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/60 text-[10px] text-emerald-200 border border-emerald-400/30">
            <Check className="w-2.5 h-2.5" /> AutoSaved
          </span>
        </div>

        {/* Center: Search Box */}
        <div className="hidden lg:flex items-center bg-[#0d6535]/80 hover:bg-[#0d6535] px-3 py-1 rounded-md text-xs text-white/80 w-64 justify-between cursor-pointer border border-emerald-400/20">
          <div className="flex items-center gap-1.5">
            <Search className="w-3 h-3 text-white/60" />
            <span>Search or Formula (Alt+Q)</span>
          </div>
          <span className="text-[10px] text-white/50 font-mono">⌘F</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-3 py-1 bg-white text-[#107c41] font-bold rounded shadow hover:bg-slate-100 transition-all active:scale-95 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .XLSX</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-black/20 rounded text-white/90 hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. RIBBON MENU TABS (File, Home, Insert, Formulas, Data, View) */}
      <div className="bg-[#181824] border-b border-slate-800 px-3 flex items-center gap-1 text-xs">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 font-bold text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => setActiveTab("home")}
          className={`px-3.5 py-1.5 font-semibold transition-colors rounded-t ${
            activeTab === "home"
              ? "bg-[#202030] text-emerald-400 border-b-2 border-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Home
        </button>

        <button
          onClick={() => setActiveTab("formulas")}
          className={`px-3.5 py-1.5 font-semibold transition-colors rounded-t ${
            activeTab === "formulas"
              ? "bg-[#202030] text-emerald-400 border-b-2 border-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Formulas
        </button>

        <button
          onClick={() => setActiveTab("data")}
          className={`px-3.5 py-1.5 font-semibold transition-colors rounded-t ${
            activeTab === "data"
              ? "bg-[#202030] text-emerald-400 border-b-2 border-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Data &amp; Sort
        </button>

        <button
          onClick={() => setActiveTab("insert")}
          className={`px-3.5 py-1.5 font-semibold transition-colors rounded-t ${
            activeTab === "insert"
              ? "bg-[#202030] text-emerald-400 border-b-2 border-emerald-400 font-bold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Insert
        </button>

        <button
          onClick={exportToCsv}
          className="ml-auto text-xs text-slate-400 hover:text-lime-300 font-mono px-2 py-1 rounded hover:bg-slate-800 transition-colors flex items-center gap-1"
        >
          <FileText className="w-3 h-3" />
          <span>Export .CSV</span>
        </button>
      </div>

      {/* 3. RIBBON TOOLBAR (Iconic Excel Layout with Tool Groups) */}
      <div className="bg-[#202030] border-b border-slate-700/80 px-3 py-2 flex items-center gap-4 overflow-x-auto scrollbar-thin text-xs text-slate-200">
        {/* GROUP 1: Clipboard */}
        <div className="flex items-center gap-1 pr-3 border-r border-slate-700">
          <button
            onClick={() => {
              if (currentCellData.raw) {
                navigator.clipboard.writeText(currentCellData.raw);
              }
            }}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Copy (Ctrl+C)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateCell(activeCell.row, activeCell.col, { raw: "" })}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors text-rose-400"
            title="Cut / Clear"
          >
            <Scissors className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* GROUP 2: Font & Styling */}
        <div className="flex items-center gap-1 pr-3 border-r border-slate-700">
          <button
            onClick={toggleBold}
            className={`p-1.5 rounded transition-colors ${
              currentCellData.bold ? "bg-emerald-600 text-white font-bold" : "hover:bg-slate-700 text-slate-300"
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleItalic}
            className={`p-1.5 rounded transition-colors ${
              currentCellData.italic ? "bg-emerald-600 text-white" : "hover:bg-slate-700 text-slate-300"
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleUnderline}
            className={`p-1.5 rounded transition-colors ${
              currentCellData.underline ? "bg-emerald-600 text-white" : "hover:bg-slate-700 text-slate-300"
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleStrike}
            className={`p-1.5 rounded transition-colors ${
              currentCellData.strike ? "bg-emerald-600 text-white" : "hover:bg-slate-700 text-slate-300"
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          {/* Border Toggle */}
          <button
            onClick={() => updateCell(activeCell.row, activeCell.col, { border: !currentCellData.border })}
            className={`p-1.5 rounded transition-colors ${
              currentCellData.border ? "bg-emerald-600 text-white" : "hover:bg-slate-700 text-slate-300"
            }`}
            title="Toggle Cell Border"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Background Highlight Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(showColorPicker === "fill" ? null : "fill")}
              className="flex items-center gap-1 p-1 hover:bg-slate-700 rounded transition-colors"
              title="Fill Color"
            >
              <div
                className="w-3.5 h-3.5 rounded border border-slate-500"
                style={{ backgroundColor: currentCellData.bgColor || "#ffffff" }}
              />
              <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
            </button>

            {showColorPicker === "fill" && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-[#1c1c28] border border-slate-700 rounded-lg shadow-xl grid grid-cols-4 gap-1.5 z-50">
                {["#ffffff", "#fef08a", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa", "#107c41", "transparent"].map(
                  (c) => (
                    <button
                      key={c}
                      onClick={() => {
                        updateCell(activeCell.row, activeCell.col, { bgColor: c === "transparent" ? undefined : c });
                        setShowColorPicker(null);
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

        {/* GROUP 3: Alignment */}
        <div className="flex items-center gap-1 pr-3 border-r border-slate-700">
          <button
            onClick={() => setAlign("left")}
            className={`p-1.5 rounded transition-colors ${
              currentCellData.align === "left" ? "bg-emerald-600 text-white" : "hover:bg-slate-700 text-slate-300"
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setAlign("center")}
            className={`p-1.5 rounded transition-colors ${
              currentCellData.align === "center" ? "bg-emerald-600 text-white" : "hover:bg-slate-700 text-slate-300"
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setAlign("right")}
            className={`p-1.5 rounded transition-colors ${
              currentCellData.align === "right" ? "bg-emerald-600 text-white" : "hover:bg-slate-700 text-slate-300"
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* GROUP 4: Numbers & Formulas */}
        <div className="flex items-center gap-1 pr-3 border-r border-slate-700">
          <button
            onClick={() => applyAutoSum("SUM")}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow-sm transition-all"
            title="AutoSum (Calculates sum of cells above)"
          >
            <Sigma className="w-3.5 h-3.5" />
            <span>AutoSum</span>
          </button>

          <button
            onClick={() => applyAutoSum("AVERAGE")}
            className="px-2 py-1 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
            title="Average of cells above"
          >
            AVG
          </button>

          <button
            onClick={() => applyAutoSum("COUNT")}
            className="px-2 py-1 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
            title="Count cells above"
          >
            COUNT
          </button>
        </div>

        {/* GROUP 5: Sheet Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearCurrentSheet}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/60 transition-colors"
            title="Clear all contents in this sheet"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Grid</span>
          </button>
        </div>
      </div>

      {/* 4. FORMULA BAR (Exact Excel Placement: Name Box + fx + Formula Input) */}
      <div className="bg-[#14141f] border-b border-slate-800 px-3 py-1 flex items-center gap-2 text-xs">
        {/* Name Box (e.g. A1, B4) */}
        <div className="w-20 px-2 py-1 rounded bg-[#0b0a14] border border-slate-700 text-center font-mono font-bold text-emerald-400">
          {activeCellCoord}
        </div>

        {/* Separator / Action Buttons */}
        <div className="flex items-center text-slate-500">
          <button
            onClick={() => setFormulaInput(currentCellData.raw || "")}
            className="p-1 hover:text-rose-400 transition-colors"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={commitFormula}
            className="p-1 hover:text-emerald-400 transition-colors"
            title="Enter / Commit"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <span className="font-serif italic font-bold text-sm text-slate-400 px-1">fx</span>
        </div>

        {/* Formula Input Box */}
        <input
          ref={formulaInputRef}
          type="text"
          value={formulaInput}
          onChange={(e) => setFormulaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commitFormula();
            }
          }}
          placeholder="Enter text, number, or formula (e.g. =SUM(A1:A5) or =A1*B1)"
          className="flex-1 bg-[#0b0a14] border border-slate-700 focus:border-emerald-500 px-3 py-1 rounded text-white font-mono text-xs outline-none transition-colors"
        />
      </div>

      {/* 5. MAIN SPREADSHEET GRID */}
      <div
        className="flex-1 overflow-auto relative bg-[#0e0e18]"
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
      >
        {/* Drag & Drop Overlay */}
        {isDraggingFile && (
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-4 border-dashed border-emerald-400 animate-pulse text-white">
            <Upload className="w-16 h-16 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold">Drop Excel or CSV file here</h3>
            <p className="text-sm text-emerald-200 mt-1">Instant view and edit without uploading to cloud</p>
          </div>
        )}

        <table className="border-collapse table-fixed text-xs font-sans w-max">
          <thead>
            <tr className="sticky top-0 z-20 bg-[#161624]">
              {/* Select All Corner Box */}
              <th className="w-12 h-6 border-b border-r border-slate-700/80 bg-[#1c1c2c] sticky left-0 z-30 text-[10px] text-slate-500 font-mono">
                ◢
              </th>

              {/* Column Headers (A, B, C...) */}
              {Array.from({ length: currentSheet.maxCols }).map((_, colIdx) => {
                const letter = colToLetter(colIdx);
                const isColActive = activeCell.col === colIdx;
                return (
                  <th
                    key={colIdx}
                    className={`w-28 h-6 border-b border-r border-slate-700/80 text-center font-mono text-[11px] font-semibold transition-colors ${
                      isColActive ? "bg-[#107c41] text-white" : "bg-[#1c1c2c] text-slate-300 hover:bg-[#252538]"
                    }`}
                  >
                    {letter}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {Array.from({ length: currentSheet.maxRows }).map((_, rowIdx) => {
              const isRowActive = activeCell.row === rowIdx;
              return (
                <tr key={rowIdx}>
                  {/* Row Header (1, 2, 3...) */}
                  <td
                    className={`w-12 h-6 border-b border-r border-slate-700/80 text-center font-mono text-[10px] font-semibold sticky left-0 z-10 select-none ${
                      isRowActive ? "bg-[#107c41] text-white" : "bg-[#1c1c2c] text-slate-400"
                    }`}
                  >
                    {rowIdx + 1}
                  </td>

                  {/* Row Cells */}
                  {Array.from({ length: currentSheet.maxCols }).map((_, colIdx) => {
                    const key = `${rowIdx}:${colIdx}`;
                    const cell = currentSheet.grid[key];
                    const isSelected = activeCell.row === rowIdx && activeCell.col === colIdx;
                    const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;

                    // Display Value (either formula computed or raw text)
                    let displayVal: string | number = "";
                    if (cell && cell.raw) {
                      if (cell.raw.startsWith("=")) {
                        displayVal = evaluateFormula(cell.raw, currentSheet.grid);
                      } else {
                        displayVal = cell.raw;
                      }
                    }

                    return (
                      <td
                        key={colIdx}
                        onClick={() => {
                          setActiveCell({ row: rowIdx, col: colIdx });
                          setEditingCell(null);
                        }}
                        onDoubleClick={() => {
                          setEditingCell({ row: rowIdx, col: colIdx });
                          setEditValue(cell?.raw || "");
                        }}
                        style={{
                          backgroundColor: isSelected ? undefined : cell?.bgColor,
                          color: cell?.color,
                          fontWeight: cell?.bold ? "bold" : "normal",
                          fontStyle: cell?.italic ? "italic" : "normal",
                          textDecoration: [cell?.underline ? "underline" : "", cell?.strike ? "line-through" : ""]
                            .filter(Boolean)
                            .join(" "),
                          textAlign: cell?.align || "left",
                        }}
                        className={`h-6 px-1.5 border-b border-r border-slate-800 text-slate-100 truncate relative cursor-cell transition-all font-sans ${
                          cell?.border ? "border border-slate-500" : ""
                        } ${
                          isSelected
                            ? "outline-2 outline-[#107c41] -outline-offset-1 bg-[#107c41]/10 z-10"
                            : "hover:bg-slate-800/40"
                        }`}
                      >
                        {isEditing ? (
                          <input
                            ref={cellInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={commitEdit}
                            className="w-full h-full bg-[#0a0914] text-white border-none outline-none font-mono text-xs px-0.5"
                          />
                        ) : (
                          <span>{displayVal}</span>
                        )}

                        {/* Excel Green Fill Handle in Bottom Right */}
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#107c41] border border-white z-20 cursor-crosshair shadow" />
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

      {/* 6. BOTTOM SHEET TABS & STATUS BAR (Exact Excel Bottom Bar) */}
      <div className="bg-[#181824] border-t border-slate-800 px-3 py-1 flex items-center justify-between text-xs z-30">
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
                    ? "bg-[#0e0e18] text-white border-b-2 border-emerald-400 font-bold shadow"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
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
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Add New Sheet"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Status Bar with Live Sum, Avg, Count */}
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
          <span>Ready</span>
          {cellCalculations.count > 0 && (
            <div className="hidden sm:flex items-center gap-3">
              <span>
                AVERAGE: <strong className="text-emerald-400">{cellCalculations.avg}</strong>
              </span>
              <span>
                COUNT: <strong className="text-emerald-400">{cellCalculations.count}</strong>
              </span>
              <span>
                SUM: <strong className="text-emerald-400">{cellCalculations.sum}</strong>
              </span>
            </div>
          )}
          <span className="text-emerald-500 font-bold">100%</span>
        </div>
      </div>

      {/* 7. HIDDEN NATIVE FILE INPUT */}
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

      {/* 8. ADSTERRA / GOOGLE ADSENSE MONETIZATION BANNER */}
      <div className="bg-[#0b0a14] border-t border-slate-800/80 py-2">
        <AdBanner label="Sponsored Partner" />
      </div>
    </div>
  );
}
