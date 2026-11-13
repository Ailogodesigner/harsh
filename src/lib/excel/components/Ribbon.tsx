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
  Bold,
  Italic,
  Underline,
  Strikethrough,
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
  ZoomIn,
  ZoomOut,
  Maximize2,
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
  Sparkle
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
    <div className="bg-[#1f1f1f] text-slate-200 select-none border-b border-[#2d2d2d] flex flex-col">
      {/* 1. TOP WINDOW TITLE BAR */}
      <div className="h-9 bg-[#181818] border-b border-[#252525] px-3 flex items-center justify-between text-xs">
        {/* Left: Logo, AutoSave, Quick Access, Document Title */}
        <div className="flex items-center gap-2">
          {/* Logo */}
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-5 h-5 bg-[#107c41] rounded flex items-center justify-center font-bold text-white shadow-sm">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-100 hidden sm:inline">Excel Online</span>
          </div>

          {/* AutoSave Toggle */}
          <button
            onClick={() => setAutoSaveOn(!autoSaveOn)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              autoSaveOn
                ? "bg-[#107c41]/30 text-emerald-400 border border-emerald-600/50"
                : "bg-slate-800 text-slate-400 border border-slate-700"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoSaveOn ? "bg-emerald-400" : "bg-slate-500"}`} />
            <span>AutoSave {autoSaveOn ? "On" : "Off"}</span>
          </button>

          {/* Quick Access Icons: Save, Undo, Redo */}
          <div className="flex items-center gap-0.5 ml-1">
            <button
              onClick={() => exportWorkbookToXLSX(workbook, workbook.title)}
              className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
              title="Save Workbook (.xlsx)"
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
          </div>

          <span className="text-slate-600 mx-1">|</span>

          {/* Editable Title */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={workbook.title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent hover:bg-[#252525] focus:bg-[#252525] px-2 py-0.5 rounded text-white font-medium text-xs border border-transparent focus:border-slate-700 outline-none w-36 truncate"
            />
            <span className="text-[11px] text-slate-400">{saveStatus}</span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex items-center bg-[#252525] border border-slate-700/60 rounded-md px-3 py-1 w-64 text-slate-400 focus-within:border-emerald-500 focus-within:text-white">
          <Search className="w-3.5 h-3.5 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search commands (e.g. sort, sum)"
            className="bg-transparent outline-none w-full text-xs text-white placeholder:text-slate-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") toggleModal("showFindReplace", true);
            }}
          />
        </div>

        {/* Right: Actions and Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportWorkbookToXLSX(workbook, workbook.title)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white rounded text-xs font-semibold shadow-sm transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export .XLSX</span>
          </button>
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-bold text-white text-[11px]">
            M
          </div>
        </div>
      </div>

      {/* 2. RIBBON TABS NAVIGATION */}
      <div className="flex items-center gap-1 px-3 bg-[#181818] border-b border-[#2d2d2d] text-xs">
        <button
          onClick={() => setActiveTab("file")}
          className={`px-3 py-1.5 font-semibold transition-colors ${
            activeTab === "file" ? "bg-[#107c41] text-white" : "hover:bg-[#252525] text-slate-300"
          }`}
        >
          File
        </button>

        {(["home", "insert", "page_layout", "formulas", "data", "review", "view", "help"] as RibbonTab[]).map(
          (tab) => {
            const labels: Record<RibbonTab, string> = {
              file: "File",
              home: "Home",
              insert: "Insert",
              page_layout: "Page Layout",
              formulas: "Formulas",
              data: "Data",
              review: "Review",
              view: "View",
              help: "Help",
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 font-medium border-b-2 transition-all capitalize ${
                  isActive
                    ? "border-[#107c41] text-white font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#252525]"
                }`}
              >
                {labels[tab]}
              </button>
            );
          }
        )}
      </div>

      {/* 3. RIBBON TOOLBAR BUTTONS / GROUPS */}
      <div className="bg-[#202020] px-3 py-1.5 flex items-center gap-4 overflow-x-auto min-h-[52px]">
        {/* ========================================================= */}
        {/* FILE TAB (BACKSTAGE CONTROLS)                             */}
        {/* ========================================================= */}
        {activeTab === "file" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm("Create a new blank workbook? Any unsaved edits will be cleared.")) {
                  setWorkbook({
                    id: `wb-${Date.now()}`,
                    title: "Book1.xlsx",
                    sheets: [{ id: "sheet-1", name: "Sheet1", grid: {}, maxRows: 65, maxCols: 26 }],
                    activeSheetId: "sheet-1",
                  });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>New Blank</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Open .XLSX / .CSV</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />

            <button
              onClick={() => exportWorkbookToXLSX(workbook, workbook.title)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white font-medium rounded shadow"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Save As .XLSX</span>
            </button>

            <button
              onClick={() => {
                if (activeSheet) exportSheetToCSV(activeSheet, `${activeSheet.name}.csv`);
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <FileDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <Printer className="w-3.5 h-3.5 text-slate-300" />
              <span>Print Worksheet</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* HOME TAB (FORMATTING, CLIPBOARD, STYLES)                   */}
        {/* ========================================================= */}
        {activeTab === "home" && (
          <div className="flex items-center gap-4">
            {/* Clipboard Group */}
            <div className="flex items-center gap-1 border-r border-[#303030] pr-3">
              <button
                onClick={handlePaste}
                className="flex flex-col items-center justify-center p-1.5 hover:bg-[#2b2b2b] rounded text-slate-200"
                title="Paste (Ctrl+V)"
              >
                <Clipboard className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] mt-0.5">Paste</span>
              </button>
              <div className="flex flex-col gap-1">
                <button
                  onClick={handleCut}
                  className="p-1 hover:bg-[#2b2b2b] rounded text-slate-400 hover:text-white"
                  title="Cut (Ctrl+X)"
                >
                  <Scissors className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-[#2b2b2b] rounded text-slate-400 hover:text-white"
                  title="Copy (Ctrl+C)"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Font Family & Size */}
            <div className="flex items-center gap-1.5 border-r border-[#303030] pr-3">
              <select
                value={fontFamily}
                onChange={(e) => {
                  setFontFamily(e.target.value);
                  formatSelection({ fontFamily: e.target.value });
                }}
                className="bg-[#181818] border border-slate-700 rounded px-2 py-1 text-white text-xs w-28"
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
                className="bg-[#181818] border border-slate-700 rounded px-1.5 py-1 text-white text-xs w-14"
              >
                {[9, 10, 11, 12, 14, 16, 18, 20, 24].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Bold, Italic, Underline */}
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  onClick={() => formatSelection({ bold: !activeCellData.bold })}
                  className={`p-1.5 rounded ${
                    activeCellData.bold ? "bg-[#107c41] text-white" : "hover:bg-[#2b2b2b] text-slate-300"
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => formatSelection({ italic: !activeCellData.italic })}
                  className={`p-1.5 rounded ${
                    activeCellData.italic ? "bg-[#107c41] text-white" : "hover:bg-[#2b2b2b] text-slate-300"
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => formatSelection({ underline: !activeCellData.underline })}
                  className={`p-1.5 rounded ${
                    activeCellData.underline ? "bg-[#107c41] text-white" : "hover:bg-[#2b2b2b] text-slate-300"
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Alignment Group */}
            <div className="flex items-center gap-1 border-r border-[#303030] pr-3">
              <button
                onClick={() => formatSelection({ align: "left" })}
                className="p-1.5 hover:bg-[#2b2b2b] rounded text-slate-300"
                title="Align Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => formatSelection({ align: "center" })}
                className="p-1.5 hover:bg-[#2b2b2b] rounded text-slate-300"
                title="Center"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => formatSelection({ align: "right" })}
                className="p-1.5 hover:bg-[#2b2b2b] rounded text-slate-300"
                title="Align Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => formatSelection({ wrapText: !activeCellData.wrapText })}
                className={`p-1.5 rounded ${activeCellData.wrapText ? "bg-[#107c41] text-white" : "hover:bg-[#2b2b2b] text-slate-300"}`}
                title="Wrap Text"
              >
                <WrapText className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Number Formatting */}
            <div className="flex items-center gap-1.5 border-r border-[#303030] pr-3">
              <select
                value={activeCellData.format || "general"}
                onChange={(e) => formatSelection({ format: e.target.value as FormatType })}
                className="bg-[#181818] border border-slate-700 rounded px-2 py-1 text-white text-xs w-28"
              >
                <option value="general">General</option>
                <option value="number">Number</option>
                <option value="currency">Currency (₹)</option>
                <option value="accounting">Accounting</option>
                <option value="percentage">Percentage (%)</option>
                <option value="date">Date</option>
                <option value="time">Time</option>
                <option value="scientific">Scientific</option>
                <option value="text">Text</option>
              </select>

              <button
                onClick={() => formatSelection({ format: "currency" })}
                className="p-1.5 hover:bg-[#2b2b2b] rounded text-emerald-400"
                title="Format as Currency (₹)"
              >
                <DollarSign className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => formatSelection({ format: "percentage" })}
                className="p-1.5 hover:bg-[#2b2b2b] rounded text-cyan-400"
                title="Percent Style (%)"
              >
                <Percent className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Editing: AutoSum, Clear, Sort, Find */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setFormulaInput(`=SUM(B4:B6)`);
                }}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#181818] hover:bg-[#2b2b2b] border border-slate-700 rounded text-slate-200"
                title="AutoSum (Σ)"
              >
                <Sigma className="w-3.5 h-3.5 text-emerald-400" />
                <span>AutoSum</span>
              </button>

              <button
                onClick={() => clearCells(selectionRange, "contents")}
                className="p-1.5 hover:bg-[#2b2b2b] rounded text-slate-400 hover:text-white"
                title="Clear Contents"
              >
                <Eraser className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => sortRange(selectionRange, activeCell.col, true)}
                className="p-1.5 hover:bg-[#2b2b2b] rounded text-slate-400 hover:text-white"
                title="Sort Ascending (A-Z)"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => toggleModal("showFindReplace", true)}
                className="p-1.5 hover:bg-[#2b2b2b] rounded text-slate-400 hover:text-white"
                title="Find & Replace (Ctrl+F)"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* INSERT TAB (CHARTS, TABLES, SHAPES)                       */}
        {/* ========================================================= */}
        {activeTab === "insert" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleModal("showChartInsert", true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white font-medium rounded shadow"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Insert Bar Chart</span>
            </button>

            <button
              onClick={() => toggleModal("showChartInsert", true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <LineChart className="w-3.5 h-3.5 text-cyan-400" />
              <span>Line Trend</span>
            </button>

            <button
              onClick={() => toggleModal("showChartInsert", true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <PieChart className="w-3.5 h-3.5 text-amber-400" />
              <span>Pie / Doughnut</span>
            </button>

            <div className="h-6 w-[1px] bg-[#333333] mx-1" />

            <button
              onClick={() => {
                formatSelection({
                  bgColor: "#1E293B",
                  textColor: "#ffffff",
                  bold: true,
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <Table className="w-3.5 h-3.5 text-indigo-400" />
              <span>Format as Table</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* FORMULAS TAB                                              */}
        {/* ========================================================= */}
        {activeTab === "formulas" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleModal("showFunctionWizard", true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#107c41] hover:bg-[#0e6b37] text-white font-medium rounded shadow"
            >
              <span className="font-serif italic font-bold">fx</span>
              <span>Insert Function Wizard</span>
            </button>

            <button
              onClick={() => setFormulaInput(`=SUM(B4:B6)`)}
              className="px-2.5 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 rounded text-slate-200 font-mono text-xs"
            >
              =SUM()
            </button>

            <button
              onClick={() => setFormulaInput(`=AVERAGE(D4:D6)`)}
              className="px-2.5 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 rounded text-slate-200 font-mono text-xs"
            >
              =AVERAGE()
            </button>

            <button
              onClick={() => setFormulaInput(`=IF(E4>20, "High", "Low")`)}
              className="px-2.5 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 rounded text-slate-200 font-mono text-xs"
            >
              =IF()
            </button>

            <button
              onClick={() => setFormulaInput(`=VLOOKUP(1, A4:D6, 4, FALSE)`)}
              className="px-2.5 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 rounded text-slate-200 font-mono text-xs"
            >
              =VLOOKUP()
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* DATA TAB (SORTING, FILTERING, VALIDATION)                  */}
        {/* ========================================================= */}
        {activeTab === "data" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => sortRange(selectionRange, activeCell.col, true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sort Ascending (A-Z)</span>
            </button>

            <button
              onClick={() => sortRange(selectionRange, activeCell.col, false)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 rotate-180" />
              <span>Sort Descending (Z-A)</span>
            </button>

            <button
              onClick={() => toggleModal("showFindReplace", true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              <span>Filter Range</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* REVIEW TAB (PROTECT SHEET, COMMENTS)                      */}
        {/* ========================================================= */}
        {activeTab === "review" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleModal("showProtectSheet", true)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 text-slate-200 rounded"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protect Worksheet</span>
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW TAB (FREEZE PANES, GRIDLINES, ZOOM)                  */}
        {/* ========================================================= */}
        {activeTab === "view" && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showGridlines}
                onChange={(e) => setShowGridlines(e.target.checked)}
                className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
              />
              <span>Gridlines</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showHeadings}
                onChange={(e) => setShowHeadings(e.target.checked)}
                className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
              />
              <span>Headings</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={showFormulaBar}
                onChange={(e) => setShowFormulaBar(e.target.checked)}
                className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
              />
              <span>Formula Bar</span>
            </label>

            <div className="h-6 w-[1px] bg-[#333333] mx-1" />

            <button
              onClick={() => freezePanes(1, 0)}
              className="px-2.5 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 rounded text-slate-200"
            >
              Freeze Top Row
            </button>

            <button
              onClick={() => freezePanes(0, 1)}
              className="px-2.5 py-1 bg-[#282828] hover:bg-[#323232] border border-slate-700 rounded text-slate-200"
            >
              Freeze First Column
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* HELP TAB                                                  */}
        {/* ========================================================= */}
        {activeTab === "help" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#282828] border border-slate-700 rounded text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo), Ctrl+F (Find), Ctrl+1 (Format Cells), F2 (Edit)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

