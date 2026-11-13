"use client";

import React, { useRef, useState } from "react";
import { useUIStore } from "../store/ui-store";
import { useWorkbookStore } from "../store/workbook-store";
import { useSelectionStore } from "../store/selection-store";
import { exportWorkbookToXLSX, exportSheetToCSV, importFileToWorkbook, triggerPrint } from "../services/file-service";
import { FormatType, RibbonTab } from "../types";
import { expandRange } from "../engine/range-manager";
import {
  FileSpreadsheet,
  Save,
  Undo2,
  Redo2,
  ChevronDown,
  Scissors,
  Copy,
  Clipboard,
  Paintbrush,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  WrapText,
  DollarSign,
  Percent,
  Sigma,
  Eraser,
  ArrowUpDown,
  Search,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  ShieldCheck,
  FileDown,
  Printer,
  FilePlus,
  FolderOpen,
  Sparkles,
  HelpCircle,
  Table,
  Check,
  Split,
  Layers,
  Diamond,
  AlertTriangle,
  MessageSquare,
  Share2,
  Minus,
  Square,
  X,
  FileText,
  PenTool,
  Grid as GridIcon,
  ChevronUp,
  LayoutGrid
} from "lucide-react";

export function Ribbon() {
  const {
    activeTab,
    setActiveTab,
    showGridlines,
    setShowGridlines,
    showHeadings,
    setShowHeadings,
    showFormulaBar,
    setShowFormulaBar,
    zoomScale,
    setZoomScale,
    toggleModal,
    setFindMode,
  } = useUIStore();

  const {
    workbook,
    setTitle,
    updateCells,
    undo,
    redo,
    historyIndex,
    history,
    autoSaveOn,
    setAutoSaveOn,
    saveStatus,
    insertRow,
    deleteRow,
    insertCol,
    deleteCol,
    clearCells,
    sortRange,
    freezePanes,
    setWorkbook,
  } = useWorkbookStore();

  const { selectionRange, activeCell, setFormulaInput } = useSelectionStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fontFamily, setFontFamily] = useState("Calibri");
  const [fontSize, setFontSize] = useState(11);
  const [formatType, setFormatType] = useState<FormatType>("general");
  const [copiedData, setCopiedData] = useState<{ raw: any; format?: FormatType }[][] | null>(null);

  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
  const activeCellData = activeSheet?.grid[`${activeCell.row}:${activeCell.col}`] || { raw: "" };

  const formatSelection = (partial: any) => {
    const coords = expandRange(selectionRange);
    updateCells(coords.map(({ row, col }) => ({ row, col, data: partial })));
  };

  const handleCopy = () => {
    if (!activeSheet) return;
    const rMin = Math.min(selectionRange.startRow, selectionRange.endRow);
    const rMax = Math.max(selectionRange.startRow, selectionRange.endRow);
    const cMin = Math.min(selectionRange.startCol, selectionRange.endCol);
    const cMax = Math.max(selectionRange.startCol, selectionRange.endCol);

    const rows: { raw: any; format?: FormatType }[][] = [];
    const tsvRows: string[] = [];

    for (let r = rMin; r <= rMax; r++) {
      const rowArr: { raw: any; format?: FormatType }[] = [];
      const tsvCols: string[] = [];
      for (let c = cMin; c <= cMax; c++) {
        const cell = activeSheet.grid[`${r}:${c}`] || { raw: "" };
        rowArr.push({ raw: cell.raw, format: cell.format });
        tsvCols.push(String(cell.computed !== undefined ? cell.computed : cell.raw));
      }
      rows.push(rowArr);
      tsvRows.push(tsvCols.join("\t"));
    }

    setCopiedData(rows);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(tsvRows.join("\n"));
    }
  };

  const handlePaste = () => {
    if (!copiedData || !activeSheet) return;
    const updates: { row: number; col: number; data: any }[] = [];
    copiedData.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        updates.push({
          row: activeCell.row + rIdx,
          col: activeCell.col + cIdx,
          data: { raw: cell.raw, format: cell.format },
        });
      });
    });
    updateCells(updates);
  };

  const handleCut = () => {
    handleCopy();
    clearCells(selectionRange, "contents");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const wb = await importFileToWorkbook(e.target.files[0]);
      setWorkbook(wb);
    }
  };

  return (
    <div className="bg-[#121212] text-slate-200 select-none border-b border-[#2d2d2d] flex flex-col font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP WINDOW TITLE BAR (EXACT MS EXCEL DESKTOP DARK THEME)               */}
      {/* ========================================================================= */}
      <div className="h-10 bg-[#0d0d0d] px-3 flex items-center justify-between text-xs border-b border-[#222222]">
        {/* Left Side: Excel Icon, AutoSave Pill, Quick Access, Document Name */}
        <div className="flex items-center gap-2">
          {/* Excel Green Brand Icon */}
          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-5 h-5 bg-[#107c41] rounded-[3px] flex items-center justify-center font-bold text-white shadow">
              <span className="font-sans font-black text-xs">X</span>
            </div>
          </div>

          {/* AutoSave Pill Toggle */}
          <div
            onClick={() => setAutoSaveOn(!autoSaveOn)}
            className="flex items-center gap-1.5 cursor-pointer bg-[#1c1c1c] border border-slate-700/70 hover:border-slate-500 px-2 py-0.5 rounded-full transition-colors"
          >
            <span className="text-[11px] text-slate-300 font-medium">AutoSave</span>
            <div
              className={`w-7 h-3.5 rounded-full p-0.5 transition-colors flex items-center ${
                autoSaveOn ? "bg-[#107c41] justify-end" : "bg-slate-700 justify-start"
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
            </div>
            <span className={`text-[10px] font-bold ${autoSaveOn ? "text-emerald-400" : "text-slate-400"}`}>
              {autoSaveOn ? "On" : "Off"}
            </span>
          </div>

          {/* Quick Access Icons */}
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => exportWorkbookToXLSX(workbook, workbook.title)}
              className="p-1 hover:bg-[#252525] rounded text-slate-300 hover:text-white"
              title="Save (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-1 rounded ${
                historyIndex > 0 ? "hover:bg-[#252525] text-slate-300 hover:text-white" : "text-slate-600 cursor-not-allowed"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1 rounded ${
                historyIndex < history.length - 1 ? "hover:bg-[#252525] text-slate-300 hover:text-white" : "text-slate-600 cursor-not-allowed"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
            <ChevronDown className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>

          <span className="text-slate-600 mx-1">|</span>

          {/* Editable Document Title with Saving indicator */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={workbook.title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent hover:bg-[#202020] focus:bg-[#202020] px-2 py-0.5 rounded text-white font-medium text-xs border border-transparent focus:border-slate-700 outline-none w-28 truncate"
            />
            <span className="text-slate-400 font-bold">•</span>
            <span className="text-[11px] text-slate-400">{saveStatus}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 cursor-pointer" />
          </div>
        </div>

        {/* Center: Search Bar with Clock & Weather */}
        <div className="hidden lg:flex items-center bg-[#1c1c1c] border border-slate-700/60 rounded-md px-3 py-1 w-80 text-slate-400 focus-within:border-emerald-500 focus-within:text-white justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-3.5 h-3.5 shrink-0" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none w-full text-xs text-white placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") toggleModal("showFindReplace", true);
              }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 border-l border-slate-700/60 pl-2">
            <span>20:43</span>
            <span>☀️ 22°</span>
          </div>
        </div>

        {/* Right Side: Upgrade, Alert, User Badge, Window Controls */}
        <div className="flex items-center gap-2.5">
          {/* Upgrade your plan pill */}
          <button
            onClick={() => alert("NotixNode Cluster 2026 Enterprise Edition")}
            className="relative flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] hover:bg-[#252525] border border-slate-700 rounded-md text-xs font-medium text-slate-200"
          >
            <Diamond className="w-3.5 h-3.5 text-amber-400" />
            <span>Upgrade your plan</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
          </button>

          <span title="Sheet Integrity"><AlertTriangle className="w-4 h-4 text-amber-400 cursor-pointer" /></span>

          {/* User Profile Avatar */}
          <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-white text-[10px]">
            👤
          </div>

          {/* Desktop Window Controls */}
          <div className="flex items-center gap-3 text-slate-400 pl-2">
            <Minus className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
            <Square className="w-3 h-3 hover:text-white cursor-pointer" />
            <X className="w-3.5 h-3.5 hover:text-rose-400 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIBBON TABS ROW                                                        */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between px-3 bg-[#141414] border-b border-[#252525] text-xs">
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setActiveTab("file")}
            className={`px-3 py-1.5 font-semibold transition-colors ${
              activeTab === "file" ? "bg-[#107c41] text-white" : "hover:bg-[#202020] text-slate-300"
            }`}
          >
            File
          </button>

          {[
            { id: "home", label: "Home" },
            { id: "wps_pdf", label: "WPS PDF" },
            { id: "insert", label: "Insert" },
            { id: "page_layout", label: "Page Layout" },
            { id: "formulas", label: "Formulas" },
            { id: "data", label: "Data" },
            { id: "review", label: "Review" },
            { id: "view", label: "View" },
            { id: "help", label: "Help" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as RibbonTab)}
                className={`px-3 py-1.5 font-medium transition-all ${
                  isActive
                    ? "border-b-2 border-[#107c41] text-white font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#202020] border-b-2 border-transparent"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Buttons: Comments & Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("0 comments on workbook")}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#202020] hover:bg-[#282828] border border-slate-700/60 rounded text-slate-300 text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Comments</span>
          </button>

          <button
            onClick={() => exportWorkbookToXLSX(workbook, workbook.title)}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white rounded text-xs font-semibold shadow transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. HOME RIBBON TOOLBAR (EXACT 2-ROW GROUPS AS SHOWN IN IMAGE 1)           */}
      {/* ========================================================================= */}
      {activeTab === "home" && (
        <div className="bg-[#1a1a1a] px-2 py-1.5 flex items-stretch gap-1 overflow-x-auto min-h-[92px] text-xs">
          {/* 1. CLIPBOARD GROUP */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex items-center gap-1.5">
              {/* Big Split Paste Button */}
              <button
                onClick={handlePaste}
                className="flex flex-col items-center justify-center p-1 px-2 hover:bg-[#252525] rounded transition-colors group"
                title="Paste (Ctrl+V)"
              >
                <Clipboard className="w-6 h-6 text-amber-400 group-hover:scale-105 transition-transform" />
                <span className="text-[11px] font-medium mt-0.5">Paste</span>
              </button>

              {/* Stacked Cut, Copy, Format Painter */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={handleCut}
                  className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
                  title="Format Painter"
                >
                  <Paintbrush className="w-3.5 h-3.5 text-amber-400" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>Clipboard</span>
              <span className="text-[9px] cursor-pointer hover:text-slate-300">↘</span>
            </div>
          </div>

          {/* 2. FONT GROUP */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex flex-col gap-1.5">
              {/* Row 1: Font Family, Font Size, A^, A_ */}
              <div className="flex items-center gap-1">
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                    formatSelection({ fontFamily: e.target.value });
                  }}
                  className="bg-[#121212] border border-slate-700/80 rounded px-2 py-0.5 text-white text-xs w-28 h-6"
                >
                  <option value="Calibri">Calibri</option>
                  <option value="Segoe UI">Segoe UI</option>
                  <option value="Arial">Arial</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Inter">Inter</option>
                </select>

                <select
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(Number(e.target.value));
                    formatSelection({ fontSize: Number(e.target.value) });
                  }}
                  className="bg-[#121212] border border-slate-700/80 rounded px-1.5 py-0.5 text-white text-xs w-12 h-6"
                >
                  {[9, 10, 11, 12, 14, 16, 18, 20, 24].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setFontSize((s) => s + 1);
                    formatSelection({ fontSize: fontSize + 1 });
                  }}
                  className="p-1 hover:bg-[#252525] rounded font-bold text-xs"
                  title="Increase Font Size"
                >
                  A<sup>^</sup>
                </button>
                <button
                  onClick={() => {
                    setFontSize((s) => Math.max(8, s - 1));
                    formatSelection({ fontSize: Math.max(8, fontSize - 1) });
                  }}
                  className="p-1 hover:bg-[#252525] rounded text-xs"
                  title="Decrease Font Size"
                >
                  A<sub>v</sub>
                </button>
              </div>

              {/* Row 2: B, I, U, Border, Fill Color, Font Color */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => formatSelection({ bold: !activeCellData.bold })}
                  className={`p-1 rounded font-bold w-6 h-6 flex items-center justify-center ${
                    activeCellData.bold ? "bg-[#107c41] text-white" : "hover:bg-[#252525] text-slate-300"
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => formatSelection({ italic: !activeCellData.italic })}
                  className={`p-1 rounded italic w-6 h-6 flex items-center justify-center ${
                    activeCellData.italic ? "bg-[#107c41] text-white" : "hover:bg-[#252525] text-slate-300"
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => formatSelection({ underline: !activeCellData.underline })}
                  className={`p-1 rounded underline w-6 h-6 flex items-center justify-center ${
                    activeCellData.underline ? "bg-[#107c41] text-white" : "hover:bg-[#252525] text-slate-300"
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                {/* Borders Dropdown */}
                <button
                  onClick={() => formatSelection({ borders: { doubleBottom: true } })}
                  className="p-1 hover:bg-[#252525] rounded text-slate-300 flex items-center"
                  title="Borders"
                >
                  <Square className="w-3.5 h-3.5" />
                  <ChevronDown className="w-2.5 h-2.5 ml-0.5 text-slate-500" />
                </button>

                {/* Fill Color (Paint Bucket with Yellow Indicator) */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => formatSelection({ bgColor: activeCellData.bgColor ? undefined : "#ffff00" })}
                    className="p-1 hover:bg-[#252525] rounded flex flex-col items-center"
                    title="Fill Color"
                  >
                    <div className="w-3.5 h-3.5 border border-slate-500 rounded-sm bg-yellow-400" />
                    <span className="w-3.5 h-0.5 bg-yellow-400 mt-0.5" />
                  </button>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500 cursor-pointer" />
                </div>

                {/* Font Color (Capital A with Red Indicator) */}
                <div className="relative flex items-center">
                  <button
                    onClick={() => formatSelection({ textColor: activeCellData.textColor ? undefined : "#ef4444" })}
                    className="p-1 hover:bg-[#252525] rounded flex flex-col items-center"
                    title="Font Color"
                  >
                    <span className="font-bold text-xs leading-none">A</span>
                    <span className="w-3.5 h-0.5 bg-red-500 mt-0.5" />
                  </button>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500 cursor-pointer" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>Font</span>
              <span className="text-[9px] cursor-pointer hover:text-slate-300">↘</span>
            </div>
          </div>

          {/* 3. ALIGNMENT GROUP */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                {/* Row 1: Top, Middle, Bottom, Orientation */}
                <div className="flex items-center gap-1">
                  <button onClick={() => formatSelection({ valign: "top" })} className="p-1 hover:bg-[#252525] rounded text-slate-300" title="Top Align">
                    <AlignLeft className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  <button onClick={() => formatSelection({ valign: "middle" })} className="p-1 hover:bg-[#252525] rounded text-slate-300" title="Middle Align">
                    <AlignCenter className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  <button onClick={() => formatSelection({ valign: "bottom" })} className="p-1 hover:bg-[#252525] rounded text-slate-300" title="Bottom Align">
                    <AlignRight className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-400 px-1">ab↗</span>
                </div>

                {/* Row 2: Align Left, Center, Align Right */}
                <div className="flex items-center gap-1">
                  <button onClick={() => formatSelection({ align: "left" })} className="p-1 hover:bg-[#252525] rounded text-slate-300" title="Align Left">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => formatSelection({ align: "center" })} className="p-1 hover:bg-[#252525] rounded text-slate-300" title="Center">
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => formatSelection({ align: "right" })} className="p-1 hover:bg-[#252525] rounded text-slate-300" title="Align Right">
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Wrap Text & Merge and Center */}
              <div className="flex flex-col gap-1 border-l border-slate-800 pl-2">
                <button
                  onClick={() => formatSelection({ wrapText: !activeCellData.wrapText })}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] ${
                    activeCellData.wrapText ? "bg-[#107c41] text-white" : "hover:bg-[#252525] text-slate-300"
                  }`}
                  title="Wrap Text"
                >
                  <WrapText className="w-3.5 h-3.5" />
                  <span>Wrap text</span>
                </button>

                <button
                  onClick={() => formatSelection({ align: "center", bold: true })}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-[#252525] text-slate-300"
                  title="Merge & Center"
                >
                  <Split className="w-3.5 h-3.5 rotate-90" />
                  <span>Merge & Center</span>
                  <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>Alignment</span>
              <span className="text-[9px] cursor-pointer hover:text-slate-300">↘</span>
            </div>
          </div>

          {/* 4. NUMBER GROUP */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex flex-col gap-1.5">
              {/* Row 1: Dropdown */}
              <select
                value={activeCellData.format || "general"}
                onChange={(e) => formatSelection({ format: e.target.value as FormatType })}
                className="bg-[#121212] border border-slate-700/80 rounded px-2 py-0.5 text-white text-xs w-28 h-6"
              >
                <option value="general">General</option>
                <option value="number">Number</option>
                <option value="currency">Currency (₹)</option>
                <option value="accounting">Accounting</option>
                <option value="percentage">Percentage (%)</option>
                <option value="date">Short Date</option>
                <option value="time">Time</option>
                <option value="scientific">Scientific</option>
                <option value="text">Text</option>
              </select>

              {/* Row 2: Currency, %, Comma, Decimals */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => formatSelection({ format: "currency" })}
                  className="p-1 hover:bg-[#252525] rounded text-emerald-400"
                  title="Currency (₹)"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => formatSelection({ format: "percentage" })}
                  className="p-1 hover:bg-[#252525] rounded text-cyan-400 font-bold"
                  title="Percent Style (%)"
                >
                  <Percent className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => formatSelection({ format: "number" })}
                  className="p-1 hover:bg-[#252525] rounded text-slate-300 font-bold text-xs"
                  title="Comma Style"
                >
                  ,
                </button>
                <span className="text-[10px] text-slate-400 px-1 font-mono">.00→</span>
                <span className="text-[10px] text-slate-400 px-1 font-mono">←.00</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>Number</span>
              <span className="text-[9px] cursor-pointer hover:text-slate-300">↘</span>
            </div>
          </div>

          {/* 5. STYLES GROUP */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => formatSelection({ bgColor: "#064e3b", textColor: "#6ee7b7" })}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-[#252525] text-slate-300"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-rose-400" />
                <span>Conditional Formatting</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </button>
              <button
                onClick={() => formatSelection({ bgColor: "#1E293B", textColor: "#ffffff", bold: true })}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-[#252525] text-slate-300"
              >
                <Table className="w-3.5 h-3.5 text-blue-400" />
                <span>Format as Table</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </button>
              <button
                onClick={() => toggleModal("showFormatCells", true)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-[#252525] text-slate-300"
              >
                <Square className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cell Styles</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Styles
            </div>
          </div>

          {/* 6. CELLS GROUP */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex flex-col gap-1">
              <button
                onClick={() => insertRow(activeCell.row)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-[#252525] text-slate-300"
              >
                <span className="text-emerald-400 font-bold">+</span>
                <span>Insert</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </button>
              <button
                onClick={() => deleteRow(activeCell.row)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-[#252525] text-slate-300"
              >
                <span className="text-rose-400 font-bold">-</span>
                <span>Delete</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </button>
              <button
                onClick={() => toggleModal("showFormatCells", true)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] hover:bg-[#252525] text-slate-300"
              >
                <span>Format</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Cells
            </div>
          </div>

          {/* 7. EDITING GROUP */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFormulaInput(`=SUM(B4:B6)`)}
                className="flex items-center gap-1 p-1 hover:bg-[#252525] rounded text-slate-200"
                title="AutoSum (Σ)"
              >
                <Sigma className="w-5 h-5 text-emerald-400" />
                <ChevronDown className="w-2.5 h-2.5 text-slate-500" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => clearCells(selectionRange, "contents")}
                  className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
                  title="Clear Contents"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => sortRange(selectionRange, activeCell.col, true)}
                  className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
                  title="Sort & Filter"
                >
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                </button>
                <button
                  onClick={() => toggleModal("showFindReplace", true)}
                  className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
                  title="Find & Select"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Editing
            </div>
          </div>

          {/* 8. LIBRARY (TEMPLATES) */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <button
              onClick={() => alert("Templates Library: NotixNode Cluster, Financial Model, Invoices")}
              className="flex flex-col items-center justify-center p-1 px-2 hover:bg-[#252525] rounded transition-colors group"
            >
              <div className="flex items-center justify-center w-6 h-6">
                <span className="text-lg">📑</span>
              </div>
              <span className="text-[11px] font-medium mt-0.5">Templates</span>
            </button>
            <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Library
            </div>
          </div>

          {/* 9. AI TOOLS */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <button
              onClick={() => alert("AI Data Analysis: Clustering & Formula generation active")}
              className="flex flex-col items-center justify-center p-1 px-2 hover:bg-[#252525] rounded transition-colors group"
            >
              <Sparkles className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium mt-0.5 text-purple-300">AI Data Analysis</span>
            </button>
            <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              AI Tools
            </div>
          </div>

          {/* 10. OUTPUT CONVERSION */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => exportWorkbookToXLSX(workbook, workbook.title)}
                className="flex flex-col items-center p-1 hover:bg-[#252525] rounded text-slate-300"
                title="Export"
              >
                <FileDown className="w-4 h-4 text-blue-400" />
                <span className="text-[9px] mt-0.5">Export</span>
              </button>
              <button
                onClick={() => alert("Split Sheet Rows")}
                className="flex flex-col items-center p-1 hover:bg-[#252525] rounded text-slate-300"
                title="Split"
              >
                <Split className="w-4 h-4 text-emerald-400" />
                <span className="text-[9px] mt-0.5">Split</span>
              </button>
              <button
                onClick={() => alert("Merge Workbooks")}
                className="flex flex-col items-center p-1 hover:bg-[#252525] rounded text-slate-300"
                title="Merge"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-[9px] mt-0.5">Merge</span>
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Output Conversion
            </div>
          </div>

          {/* 11. WPS PDF */}
          <div className="flex flex-col justify-between px-2 border-r border-[#2d2d2d] shrink-0">
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={triggerPrint}
                className="flex flex-col items-center p-1 hover:bg-[#252525] rounded text-slate-300"
                title="Create PDF"
              >
                <FileText className="w-4 h-4 text-rose-500" />
                <span className="text-[9px] mt-0.5">Create PDF</span>
              </button>
              <button
                onClick={() => alert("Document Signing")}
                className="flex flex-col items-center p-1 hover:bg-[#252525] rounded text-slate-300"
                title="Sign"
              >
                <PenTool className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] mt-0.5">Sign</span>
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              WPS PDF
            </div>
          </div>

          {/* 12. ADD-INS */}
          <div className="flex flex-col justify-between px-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert("Office Add-ins Catalog")}
                className="flex flex-col items-center justify-center p-1 px-2 hover:bg-[#252525] rounded transition-colors"
              >
                <GridIcon className="w-6 h-6 text-amber-500" />
                <span className="text-[11px] font-medium mt-0.5">Add-ins</span>
              </button>
              <ChevronUp className="w-3.5 h-3.5 text-slate-500 hover:text-white cursor-pointer ml-1" />
            </div>
            <div className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Add-ins
            </div>
          </div>
        </div>
      )}

      {/* Other Tabs (Insert, Page Layout, Formulas, Data, Review, View, Help) */}
      {activeTab !== "home" && activeTab !== "file" && (
        <div className="bg-[#1a1a1a] px-3 py-2 flex items-center gap-3 min-h-[50px]">
          {activeTab === "insert" && (
            <>
              <button onClick={() => toggleModal("showChartInsert", true)} className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] text-white rounded font-medium shadow">
                <BarChart3 className="w-3.5 h-3.5" /> <span>Bar Chart</span>
              </button>
              <button onClick={() => toggleModal("showChartInsert", true)} className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] text-slate-200 border border-slate-700 rounded">
                <LineChart className="w-3.5 h-3.5 text-cyan-400" /> <span>Line Trend</span>
              </button>
              <button onClick={() => toggleModal("showChartInsert", true)} className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] text-slate-200 border border-slate-700 rounded">
                <PieChart className="w-3.5 h-3.5 text-amber-400" /> <span>Pie / Doughnut</span>
              </button>
            </>
          )}

          {activeTab === "formulas" && (
            <>
              <button onClick={() => toggleModal("showFunctionWizard", true)} className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] text-white rounded font-medium shadow">
                <span className="font-serif italic font-bold">fx</span> <span>Insert Function Wizard</span>
              </button>
              <button onClick={() => setFormulaInput(`=SUM(B4:B6)`)} className="px-2.5 py-1 bg-[#252525] border border-slate-700 rounded text-slate-200 font-mono text-xs">=SUM()</button>
              <button onClick={() => setFormulaInput(`=AVERAGE(D4:D6)`)} className="px-2.5 py-1 bg-[#252525] border border-slate-700 rounded text-slate-200 font-mono text-xs">=AVERAGE()</button>
              <button onClick={() => setFormulaInput(`=IF(E4>20, "High", "Low")`)} className="px-2.5 py-1 bg-[#252525] border border-slate-700 rounded text-slate-200 font-mono text-xs">=IF()</button>
            </>
          )}

          {activeTab === "data" && (
            <>
              <button onClick={() => sortRange(selectionRange, activeCell.col, true)} className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] border border-slate-700 rounded text-slate-200">
                <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" /> <span>Sort A-Z</span>
              </button>
              <button onClick={() => sortRange(selectionRange, activeCell.col, false)} className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] border border-slate-700 rounded text-slate-200">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 rotate-180" /> <span>Sort Z-A</span>
              </button>
              <button onClick={() => toggleModal("showFindReplace", true)} className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] border border-slate-700 rounded text-slate-200">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> <span>Filter Range</span>
              </button>
            </>
          )}

          {activeTab === "review" && (
            <button onClick={() => toggleModal("showProtectSheet", true)} className="flex items-center gap-1.5 px-3 py-1 bg-[#252525] border border-slate-700 rounded text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> <span>Protect Worksheet</span>
            </button>
          )}

          {activeTab === "view" && (
            <div className="flex items-center gap-4 text-xs text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showGridlines} onChange={(e) => setShowGridlines(e.target.checked)} className="rounded" />
                <span>Gridlines</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showHeadings} onChange={(e) => setShowHeadings(e.target.checked)} className="rounded" />
                <span>Headings</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={showFormulaBar} onChange={(e) => setShowFormulaBar(e.target.checked)} className="rounded" />
                <span>Formula Bar</span>
              </label>
              <button onClick={() => freezePanes(1, 0)} className="px-2.5 py-1 bg-[#252525] border border-slate-700 rounded">Freeze Top Row</button>
              <button onClick={() => freezePanes(0, 1)} className="px-2.5 py-1 bg-[#252525] border border-slate-700 rounded">Freeze First Column</button>
            </div>
          )}

          {activeTab === "wps_pdf" && (
            <div className="flex items-center gap-2">
              <button onClick={triggerPrint} className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] text-white rounded font-medium shadow">
                <FileText className="w-3.5 h-3.5" /> <span>Export to PDF</span>
              </button>
            </div>
          )}

          {activeTab === "help" && (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Full Microsoft Excel desktop shortcuts supported: Ctrl+Z, Ctrl+Y, Ctrl+S, Ctrl+1, Ctrl+F, F2.</span>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input for Open file */}
      <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
    </div>
  );
}
