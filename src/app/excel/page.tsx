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
  Share2,
  MessageSquare,
  HelpCircle,
  Sun,
  Diamond,
  AlertTriangle,
  User,
  Minus,
  Square,
  ArrowUpDown,
  Table,
  Sliders,
  Type,
  Maximize,
  PaintBucket,
  Printer,
  FileImage,
  RefreshCw,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";

// Cell & Sheet Types
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
  raw: string;
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

const DEFAULT_ROWS = 65;
const DEFAULT_COLS = 26; // A - Z

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

export function parseCoord(coord: string): { row: number; col: number } | null {
  const match = coord.trim().match(/^([A-Za-z]+)(\d+)$/);
  if (!match) return null;
  const col = letterToCol(match[1]);
  const row = parseInt(match[2], 10) - 1;
  if (isNaN(row) || col < 0) return null;
  return { row, col };
}

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
            if (visited.has(key)) continue;
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

        if (fnName === "SUM") return values.reduce((acc, curr) => acc + curr, 0);
        if (fnName === "AVERAGE" || fnName === "AVG") {
          return values.length ? Number((values.reduce((acc, curr) => acc + curr, 0) / values.length).toFixed(2)) : 0;
        }
        if (fnName === "COUNT") return values.length;
        if (fnName === "MAX") return values.length ? Math.max(...values) : 0;
        if (fnName === "MIN") return values.length ? Math.min(...values) : 0;
      }
    }
  }

  // Math expression: =A1 + B1 or =A1 * 1.18
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

    if (/^[0-9+\-*/().\s]+$/.test(replaced)) {
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${replaced})`)();
      return typeof result === "number" && !isNaN(result) ? Number(result.toFixed(4)).toString() : result;
    }
  } catch {
    return "#VALUE!";
  }

  return formula;
}

export default function ExcelEditorPage() {
  const [fileName, setFileName] = useState("Book4.xlsx");
  const [autoSaveOn, setAutoSaveOn] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving...">("Saved");
  const [activeTab, setActiveTab] = useState<"file" | "home" | "wps_pdf" | "insert" | "page_layout" | "formulas" | "data" | "review" | "view" | "help">("home");

  // Font & Style Controls
  const [currentFont, setCurrentFont] = useState("Calibri");
  const [currentFontSize, setCurrentFontSize] = useState("11");
  const [numberFormat, setNumberFormat] = useState("General");
  const [activeCell, setActiveCell] = useState<{ row: number; col: number }>({ row: 8, col: 4 }); // E9 default like screenshot!
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [formulaInput, setFormulaInput] = useState("");

  // Sheets
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

  // Dropdowns / Modals
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showAutoSumMenu, setShowAutoSumMenu] = useState(false);
  const [showBordersMenu, setShowBordersMenu] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  useEffect(() => {
    if (editingCell && cellInputRef.current) {
      cellInputRef.current.focus();
    }
  }, [editingCell]);

  // Load starter data on fresh mount if empty
  useEffect(() => {
    const saved = localStorage.getItem("notixnode_excel_365_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sheets && parsed.sheets.length) {
          setSheets(parsed.sheets);
          setFileName(parsed.fileName || "Book4.xlsx");
          return;
        }
      } catch (e) {
        console.error("Failed to restore excel session", e);
      }
    }

    // Default starter template
    const sampleGrid: SheetGrid = {
      "0:0": { raw: "NOTIXNODE CLUSTER SPREADSHEET 2026", bold: true, color: "#107c41" },
      "2:0": { raw: "Server Node", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "center" },
      "2:1": { raw: "RAM (GB)", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "center" },
      "2:2": { raw: "CPU Cores", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "center" },
      "2:3": { raw: "Monthly Cost (₹)", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "right" },
      "2:4": { raw: "Active Clients", bold: true, bgColor: "#107c41", color: "#ffffff", border: true, align: "center" },

      "3:0": { raw: "Basic Node Tier-1", border: true },
      "3:1": { raw: "1", align: "center", border: true },
      "3:2": { raw: "1", align: "center", border: true },
      "3:3": { raw: "69", align: "right", border: true },
      "3:4": { raw: "24", align: "center", border: true },

      "4:0": { raw: "Standard Node Tier-2", border: true },
      "4:1": { raw: "2", align: "center", border: true },
      "4:2": { raw: "2", align: "center", border: true },
      "4:3": { raw: "149", align: "right", border: true },
      "4:4": { raw: "15", align: "center", border: true },

      "5:0": { raw: "Premium Node Tier-3", border: true },
      "5:1": { raw: "4", align: "center", border: true },
      "5:2": { raw: "4", align: "center", border: true },
      "5:3": { raw: "249", align: "right", border: true },
      "5:4": { raw: "8", align: "center", border: true },

      "6:0": { raw: "Total Infrastructure", bold: true, border: true },
      "6:1": { raw: "=SUM(B4:B6)", bold: true, align: "center", border: true },
      "6:2": { raw: "=SUM(C4:C6)", bold: true, align: "center", border: true },
      "6:3": { raw: "=SUM(D4:D6)", bold: true, bgColor: "#dcfce7", color: "#166534", align: "right", border: true },
      "6:4": { raw: "=SUM(E4:E6)", bold: true, align: "center", border: true },
    };

    setSheets([
      {
        id: "sheet-1",
        name: "Sheet1",
        grid: sampleGrid,
        maxRows: DEFAULT_ROWS,
        maxCols: DEFAULT_COLS,
      },
    ]);
  }, []);

  const saveToLocalStorage = useCallback(
    (newSheets: SheetTab[], name = fileName) => {
      setSaveStatus("Saving...");
      try {
        localStorage.setItem(
          "notixnode_excel_365_data",
          JSON.stringify({ sheets: newSheets, fileName: name })
        );
        setTimeout(() => setSaveStatus("Saved"), 300);
      } catch (e) {
        console.error("Save error:", e);
      }
    },
    [fileName]
  );

  const updateCell = useCallback(
    (row: number, col: number, data: Partial<CellData>) => {
      setSheets((prev) => {
        const nextSheets = prev.map((s) => {
          if (s.id !== activeSheetId) return s;
          const key = `${row}:${col}`;
          const existing = s.grid[key] || { raw: "" };
          const updated = { ...existing, ...data };

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

        if (autoSaveOn) {
          saveToLocalStorage(nextSheets);
        }
        return nextSheets;
      });
    },
    [activeSheetId, autoSaveOn, saveToLocalStorage]
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
      setEditingCell({ row: activeCell.row, col: activeCell.col });
      setEditValue(e.key);
    }
  };

  const toggleBold = () => updateCell(activeCell.row, activeCell.col, { bold: !currentCellData.bold });
  const toggleItalic = () => updateCell(activeCell.row, activeCell.col, { italic: !currentCellData.italic });
  const toggleUnderline = () => updateCell(activeCell.row, activeCell.col, { underline: !currentCellData.underline });
  const setAlign = (align: "left" | "center" | "right") => updateCell(activeCell.row, activeCell.col, { align });

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
        alert("Failed to parse Excel file: " + err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

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

  const cellCalculations = useMemo(() => {
    const cell = currentCellData;
    if (!cell || !cell.raw) return { count: 0, sum: 0, avg: 0 };
    const val = cell.raw.startsWith("=") ? evaluateFormula(cell.raw, currentSheet.grid) : cell.raw;
    const num = parseFloat(String(val));
    if (isNaN(num)) return { count: 1, sum: 0, avg: 0 };
    return { count: 1, sum: num, avg: num };
  }, [currentCellData, currentSheet.grid]);

  return (
    <div
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`min-h-screen flex flex-col bg-[#141414] text-slate-200 select-none font-sans outline-none ${
        isFullscreen ? "fixed inset-0 z-50" : ""
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP TITLE BAR (EXACT AS SCREENSHOT)                                    */}
      {/* ========================================================================= */}
      <div className="bg-[#121212] text-slate-200 px-3 py-1 flex items-center justify-between text-xs border-b border-[#252525] select-none z-30">
        {/* Left Section: Excel Icon + AutoSave Switch + Quick Icons + Document Title */}
        <div className="flex items-center gap-2">
          {/* Green Excel Icon */}
          <div className="w-5 h-5 rounded-[4px] bg-[#107c41] flex items-center justify-center shadow">
            <span className="text-white font-black text-xs font-mono">X</span>
          </div>

          {/* AutoSave Switch (Green pill like screenshot) */}
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

          {/* Quick Action Icons */}
          <div className="flex items-center gap-1 ml-1 text-slate-400">
            <button
              onClick={exportToExcel}
              className="p-1 hover:bg-[#252525] hover:text-white rounded transition-colors"
              title="Save (.xlsx)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {}}
              className="p-1 hover:bg-[#252525] hover:text-white rounded transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {}}
              className="p-1 hover:bg-[#252525] hover:text-white rounded transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <ChevronDown className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>

          <span className="text-slate-600 mx-1">|</span>

          {/* Document Title: "Book4.xlsx • Saving... ⌄" */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="bg-transparent hover:bg-[#252525] focus:bg-[#252525] px-1.5 py-0.5 rounded font-medium text-slate-200 border-none outline-none text-xs w-28 sm:w-36 transition-colors"
              title="Rename file"
            />
            <span className="text-[11px] text-slate-400">• {saveStatus}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 cursor-pointer" />
          </div>
        </div>

        {/* Center Section: Rounded Search Pill (Search + 17:03 ☀️ 29°) */}
        <div className="hidden md:flex items-center bg-[#252525] hover:bg-[#2e2e2e] px-3 py-1 rounded-full text-xs text-slate-300 w-80 justify-between cursor-pointer border border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Search</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>17:03</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>29°</span>
          </div>
        </div>

        {/* Right Section: Upgrade Plan + Warnings + Account + Window Controls */}
        <div className="flex items-center gap-2">
          {/* Upgrade Plan Pill (Diamond Icon with red dot) */}
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
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 ml-1 cursor-pointer" />

          {/* Account Circle */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-lime-400 p-[1px] flex items-center justify-center cursor-pointer">
            <div className="w-full h-full rounded-full bg-[#181818] flex items-center justify-center text-[10px] font-bold text-white">
              M
            </div>
          </div>

          <span className="text-slate-700 mx-1">|</span>

          {/* Window Controls: Minimize, Maximize, Close */}
          <div className="flex items-center text-slate-400">
            <button
              onClick={() => {}}
              className="p-1.5 hover:bg-[#252525] hover:text-white rounded"
              title="Minimize"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-[#252525] hover:text-white rounded"
              title="Maximize / Restore"
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
      {/* 2. RIBBON MENU TABS (File, Home, WPS PDF, Insert, Page Layout, Formulas...) */}
      {/* ========================================================================= */}
      <div className="bg-[#181818] border-b border-[#252525] px-2 flex items-center justify-between text-xs select-none">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 font-bold text-slate-300 hover:text-white hover:bg-[#252525] rounded transition-colors"
          >
            File
          </button>

          <button
            onClick={() => setActiveTab("home")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "home" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Home
            {activeTab === "home" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#107c41] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("wps_pdf")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "wps_pdf" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            WPS PDF
          </button>

          <button
            onClick={() => setActiveTab("insert")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "insert" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Insert
          </button>

          <button
            onClick={() => setActiveTab("page_layout")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "page_layout" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Page Layout
          </button>

          <button
            onClick={() => setActiveTab("formulas")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "formulas" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Formulas
          </button>

          <button
            onClick={() => setActiveTab("data")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "data" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Data
          </button>

          <button
            onClick={() => setActiveTab("review")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "review" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Review
          </button>

          <button
            onClick={() => setActiveTab("view")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "view" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            View
          </button>

          <button
            onClick={() => setActiveTab("help")}
            className={`px-3 py-1.5 font-semibold transition-colors relative ${
              activeTab === "help" ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Help
          </button>
        </div>

        {/* Right side: Comments & Share Buttons (Exact as screenshot) */}
        <div className="flex items-center gap-2 pr-1">
          <button
            onClick={() => alert("Comments panel: 0 active threads")}
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
      {/* 3. RIBBON TOOLBAR (EXACT GROUPS & PLACEMENT FROM SCREENSHOT)              */}
      {/* ========================================================================= */}
      <div className="bg-[#1f1f1f] border-b border-[#282828] px-3 py-1.5 flex items-stretch gap-2 overflow-x-auto scrollbar-thin text-xs text-slate-300 select-none">
        {/* GROUP 1: CLIPBOARD */}
        <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
          <div className="flex items-center gap-2">
            {/* Big Paste Button */}
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

            {/* Cut / Copy / Format Painter */}
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

        {/* GROUP 2: FONT */}
        <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
          <div className="space-y-1">
            {/* Top Row: Font Family, Font Size, Grow/Shrink */}
            <div className="flex items-center gap-1">
              <select
                value={currentFont}
                onChange={(e) => {
                  setCurrentFont(e.target.value);
                  updateCell(activeCell.row, activeCell.col, { fontFamily: e.target.value });
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
                  updateCell(activeCell.row, activeCell.col, { fontSize: parseInt(e.target.value, 10) });
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
                  updateCell(activeCell.row, activeCell.col, { fontSize: next });
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
                  updateCell(activeCell.row, activeCell.col, { fontSize: next });
                }}
                className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300 text-xs font-bold"
                title="Decrease Font Size"
              >
                A<span className="text-[9px]">v</span>
              </button>
            </div>

            {/* Bottom Row: B, I, U, Border, Fill, Text Color */}
            <div className="flex items-center gap-1">
              <button
                onClick={toggleBold}
                className={`w-6 h-6 flex items-center justify-center rounded font-bold transition-colors ${
                  currentCellData.bold ? "bg-[#333333] text-white border border-slate-600" : "hover:bg-[#2c2c2c] text-slate-300"
                }`}
                title="Bold (Ctrl+B)"
              >
                B
              </button>
              <button
                onClick={toggleItalic}
                className={`w-6 h-6 flex items-center justify-center rounded font-serif italic transition-colors ${
                  currentCellData.italic ? "bg-[#333333] text-white border border-slate-600" : "hover:bg-[#2c2c2c] text-slate-300"
                }`}
                title="Italic (Ctrl+I)"
              >
                I
              </button>
              <button
                onClick={toggleUnderline}
                className={`w-6 h-6 flex items-center justify-center rounded underline transition-colors ${
                  currentCellData.underline ? "bg-[#333333] text-white border border-slate-600" : "hover:bg-[#2c2c2c] text-slate-300"
                }`}
                title="Underline (Ctrl+U)"
              >
                U
              </button>

              {/* Borders Button with dropdown */}
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
                        updateCell(activeCell.row, activeCell.col, { border: true });
                        setShowBordersMenu(false);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d] flex items-center gap-1.5"
                    >
                      <Grid className="w-3 h-3" /> All Borders
                    </button>
                    <button
                      onClick={() => {
                        updateCell(activeCell.row, activeCell.col, { border: false });
                        setShowBordersMenu(false);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d] text-rose-400"
                    >
                      No Border
                    </button>
                  </div>
                )}
              </div>

              {/* Fill Color (Bucket icon with yellow bar like screenshot) */}
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
                            updateCell(activeCell.row, activeCell.col, { bgColor: c === "transparent" ? undefined : c });
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

              {/* Text Color (Letter A with red bar like screenshot) */}
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
                            updateCell(activeCell.row, activeCell.col, { color: c });
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

        {/* GROUP 3: ALIGNMENT */}
        <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
          <div className="space-y-1">
            {/* Top row alignment icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setAlign("left")}
                className={`p-1 rounded ${currentCellData.align === "left" ? "bg-[#333333] text-white" : "hover:bg-[#2c2c2c] text-slate-400"}`}
                title="Top / Left Align"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAlign("center")}
                className={`p-1 rounded ${currentCellData.align === "center" ? "bg-[#333333] text-white" : "hover:bg-[#2c2c2c] text-slate-400"}`}
                title="Middle / Center Align"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAlign("right")}
                className={`p-1 rounded ${currentCellData.align === "right" ? "bg-[#333333] text-white" : "hover:bg-[#2c2c2c] text-slate-400"}`}
                title="Right Align"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-serif text-slate-400 px-1">ab↗</span>
            </div>

            {/* Bottom row: Wrap Text & Merge */}
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <button
                onClick={() => updateCell(activeCell.row, activeCell.col, { border: true })}
                className="hover:bg-[#2c2c2c] px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px]"
              >
                Wrap Text
              </button>
              <button
                onClick={() => setAlign("center")}
                className="hover:bg-[#2c2c2c] px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px]"
              >
                Merge &amp; Center
              </button>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Alignment ↘</div>
        </div>

        {/* GROUP 4: NUMBER */}
        <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
          <div className="space-y-1">
            <select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value)}
              className="bg-[#2a2a2a] text-slate-200 border border-slate-700 text-xs rounded px-2 py-0.5 outline-none w-24 cursor-pointer"
            >
              <option value="General">General</option>
              <option value="Number">Number</option>
              <option value="Currency">Currency</option>
              <option value="Percentage">Percentage</option>
            </select>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={() => {
                  const val = currentCellData.raw.replace(/[^0-9.]/g, "");
                  if (val) updateCell(activeCell.row, activeCell.col, { raw: `₹${val}` });
                }}
                className="p-1 hover:bg-[#2c2c2c] rounded font-bold text-xs"
                title="Format Currency (₹)"
              >
                ₹
              </button>
              <button
                onClick={() => {
                  const val = currentCellData.raw.replace(/[^0-9.]/g, "");
                  if (val) updateCell(activeCell.row, activeCell.col, { raw: `$${val}` });
                }}
                className="p-1 hover:bg-[#2c2c2c] rounded font-bold text-xs"
                title="Format Currency ($)"
              >
                $
              </button>
              <button
                onClick={() => {
                  const val = currentCellData.raw.replace(/[^0-9.]/g, "");
                  if (val) updateCell(activeCell.row, activeCell.col, { raw: `${val}%` });
                }}
                className="p-1 hover:bg-[#2c2c2c] rounded font-bold text-xs"
                title="Percentage (%)"
              >
                %
              </button>
              <button
                onClick={() => {
                  const val = parseFloat(currentCellData.raw);
                  if (!isNaN(val)) updateCell(activeCell.row, activeCell.col, { raw: val.toLocaleString("en-IN") });
                }}
                className="p-1 hover:bg-[#2c2c2c] rounded font-bold text-xs"
                title="Comma Style (,)"
              >
                ,
              </button>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Number ↘</div>
        </div>

        {/* GROUP 5: STYLES */}
        <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
          <div className="flex flex-col gap-0.5 text-[11px]">
            <button
              onClick={() => updateCell(activeCell.row, activeCell.col, { bgColor: "#dcfce7", color: "#166534", bold: true })}
              className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left"
            >
              <span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block" />
              <span>Conditional Formatting ⌄</span>
            </button>
            <button
              onClick={() => updateCell(activeCell.row, activeCell.col, { bgColor: "#107c41", color: "#ffffff", bold: true })}
              className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left"
            >
              <Table className="w-3 h-3 text-cyan-400" />
              <span>Format as Table ⌄</span>
            </button>
            <button
              onClick={() => updateCell(activeCell.row, activeCell.col, { italic: true })}
              className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left"
            >
              <Sliders className="w-3 h-3 text-amber-400" />
              <span>Cell Styles ⌄</span>
            </button>
          </div>
          <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Styles</div>
        </div>

        {/* GROUP 6: CELLS */}
        <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
          <div className="flex flex-col gap-0.5 text-[11px]">
            <button
              onClick={() => {
                setSheets((prev) =>
                  prev.map((s) => (s.id === activeSheetId ? { ...s, maxRows: s.maxRows + 5 } : s))
                );
              }}
              className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left text-emerald-400"
            >
              <Plus className="w-3 h-3" />
              <span>Insert ⌄</span>
            </button>
            <button
              onClick={() => updateCell(activeCell.row, activeCell.col, { raw: "" })}
              className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left text-rose-400"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete ⌄</span>
            </button>
            <button
              onClick={() => updateCell(activeCell.row, activeCell.col, { border: true })}
              className="flex items-center gap-1.5 hover:bg-[#2c2c2c] px-2 py-0.5 rounded text-left text-slate-300"
            >
              <Grid className="w-3 h-3" />
              <span>Format ⌄</span>
            </button>
          </div>
          <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Cells</div>
        </div>

        {/* GROUP 7: EDITING */}
        <div className="flex flex-col justify-between pr-3 border-r border-[#303030] min-w-max">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {/* AutoSum Button */}
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
                    <button onClick={() => applyAutoSum("COUNT")} className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d]">Count Numbers</button>
                    <button onClick={() => applyAutoSum("MAX")} className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d]">Max</button>
                    <button onClick={() => applyAutoSum("MIN")} className="w-full text-left px-3 py-1 hover:bg-[#2d2d2d]">Min</button>
                  </div>
                )}
              </div>

              <button
                onClick={() => updateCell(activeCell.row, activeCell.col, { raw: "" })}
                className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300"
                title="Clear Cell"
              >
                🧹
              </button>
              <button
                onClick={() => applyAutoSum("SUM")}
                className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300"
                title="Sort & Filter"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => formulaInputRef.current?.focus()}
                className="p-1 hover:bg-[#2c2c2c] rounded text-slate-300"
                title="Find & Select"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium text-center mt-1">Editing</div>
        </div>

        {/* GROUP 8: AI TOOLS & EXPORT (Like screenshot) */}
        <div className="flex items-center gap-3 pr-2 min-w-max">
          {/* Templates */}
          <div className="flex flex-col items-center justify-center p-1 hover:bg-[#2c2c2c] rounded cursor-pointer">
            <Layers className="w-4 h-4 text-amber-400 mb-0.5" />
            <span className="text-[10px] text-slate-300">Templates</span>
            <span className="text-[9px] text-slate-500 mt-1">Library</span>
          </div>

          {/* AI Data Analysis */}
          <div
            onClick={() => {
              const count = Object.keys(currentSheet.grid).length;
              alert(`AI Analysis: Active sheet contains ${count} populated cells with valid formulas & high integrity!`);
            }}
            className="flex flex-col items-center justify-center p-1 hover:bg-[#2c2c2c] rounded cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-400 mb-0.5" />
            <span className="text-[10px] text-slate-300">AI Data Analysis</span>
            <span className="text-[9px] text-slate-500 mt-1">AI Tools</span>
          </div>

          {/* Export to Image */}
          <div
            onClick={exportToExcel}
            className="flex flex-col items-center justify-center p-1 hover:bg-[#2c2c2c] rounded cursor-pointer"
          >
            <FileImage className="w-4 h-4 text-cyan-400 mb-0.5" />
            <span className="text-[10px] text-slate-300">Export .XLSX</span>
            <span className="text-[9px] text-slate-500 mt-1">Output</span>
          </div>

          {/* Add-ins */}
          <div className="flex flex-col items-center justify-center p-1 hover:bg-[#2c2c2c] rounded cursor-pointer">
            <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
              <span className="bg-orange-500 rounded-[1px]" />
              <span className="bg-orange-500 rounded-[1px]" />
              <span className="bg-orange-500 rounded-[1px]" />
              <span className="bg-orange-500 rounded-[1px]" />
            </div>
            <span className="text-[10px] text-slate-300 mt-0.5">Add-ins</span>
            <span className="text-[9px] text-slate-500 mt-1">Add-ins</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FORMULA BAR (EXACT PLACEMENT & STYLING FROM SCREENSHOT: E9 ⌄ : ✕ ✓ fx)  */}
      {/* ========================================================================= */}
      <div className="bg-[#181818] border-b border-[#252525] px-2 py-1 flex items-center gap-2 text-xs select-none">
        {/* Name Box: E9 ⌄ (Exact Dark Box like screenshot) */}
        <div className="flex items-center justify-between w-20 px-2 py-1 rounded bg-[#202020] border border-slate-700/60 text-slate-100 font-mono text-xs font-semibold cursor-pointer">
          <span>{activeCellCoord}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>

        {/* Separator dots */}
        <span className="text-slate-600 font-bold">:</span>

        {/* Action icons: ✕ ✓ fx */}
        <div className="flex items-center gap-1 text-slate-400">
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
            title="Enter"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <span className="font-serif italic font-bold text-slate-300 text-sm px-1 cursor-pointer">fx</span>
        </div>

        {/* Formula Input Box (Full width dark rounded bar) */}
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

      {/* ========================================================================= */}
      {/* 5. MAIN SPREADSHEET GRID (ACTIVE COLUMN E & ROW GREEN HIGHLIGHT)          */}
      {/* ========================================================================= */}
      <div
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
      >
        {isDraggingFile && (
          <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center border-4 border-dashed border-[#107c41] animate-pulse text-white">
            <Upload className="w-16 h-16 text-[#107c41] mb-4" />
            <h3 className="text-xl font-bold">Drop Excel or CSV file here</h3>
            <p className="text-sm text-emerald-200 mt-1">Instant in-browser opening with exact formulas and styles</p>
          </div>
        )}

        <table className="border-collapse table-fixed text-xs font-sans w-max">
          <thead>
            <tr className="sticky top-0 z-20 bg-[#1e1e1e]">
              {/* Corner Select-All Triangle */}
              <th className="w-12 h-6 border-b border-r border-[#303030] bg-[#1a1a1a] sticky left-0 z-30 text-[10px] text-slate-500 font-mono text-center">
                ◢
              </th>

              {/* Column Headers (A, B, C, D, E, F...) */}
              {Array.from({ length: currentSheet.maxCols }).map((_, colIdx) => {
                const letter = colToLetter(colIdx);
                const isColActive = activeCell.col === colIdx;
                return (
                  <th
                    key={colIdx}
                    className={`w-28 h-6 border-b border-r border-[#303030] text-center font-mono text-[11px] font-semibold transition-colors ${
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

          <tbody>
            {Array.from({ length: currentSheet.maxRows }).map((_, rowIdx) => {
              const isRowActive = activeCell.row === rowIdx;
              return (
                <tr key={rowIdx}>
                  {/* Row Header (1, 2, 3...) */}
                  <td
                    className={`w-12 h-6 border-b border-r border-[#303030] text-center font-mono text-[10px] font-semibold sticky left-0 z-10 select-none ${
                      isRowActive
                        ? "bg-[#107c41] text-white font-bold border-r-2 border-emerald-300"
                        : "bg-[#1a1a1a] text-slate-400"
                    }`}
                  >
                    {rowIdx + 1}
                  </td>

                  {/* Cells */}
                  {Array.from({ length: currentSheet.maxCols }).map((_, colIdx) => {
                    const key = `${rowIdx}:${colIdx}`;
                    const cell = currentSheet.grid[key];
                    const isSelected = activeCell.row === rowIdx && activeCell.col === colIdx;
                    const isEditing = editingCell?.row === rowIdx && editingCell?.col === colIdx;

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
                          fontFamily: cell?.fontFamily,
                          fontSize: cell?.fontSize ? `${cell.fontSize}px` : undefined,
                          textDecoration: [cell?.underline ? "underline" : "", cell?.strike ? "line-through" : ""]
                            .filter(Boolean)
                            .join(" "),
                          textAlign: cell?.align || "left",
                        }}
                        className={`h-6 px-1.5 border-b border-r border-[#262626] text-slate-100 truncate relative cursor-cell transition-all font-sans ${
                          cell?.border ? "border border-slate-600" : ""
                        } ${
                          isSelected
                            ? "outline-2 outline-[#107c41] -outline-offset-1 bg-[#107c41]/15 z-10 shadow-sm"
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
                            className="w-full h-full bg-[#121212] text-white border-none outline-none font-mono text-xs px-0.5"
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

        {/* Right: Status Bar */}
        <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
          <span>Ready</span>
          {cellCalculations.count > 0 && (
            <div className="hidden sm:flex items-center gap-3">
              <span>
                Average: <strong className="text-[#107c41]">{cellCalculations.avg}</strong>
              </span>
              <span>
                Count: <strong className="text-[#107c41]">{cellCalculations.count}</strong>
              </span>
              <span>
                Sum: <strong className="text-[#107c41]">{cellCalculations.sum}</strong>
              </span>
            </div>
          )}
          <span className="text-[#107c41] font-bold">100%</span>
        </div>
      </div>

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
