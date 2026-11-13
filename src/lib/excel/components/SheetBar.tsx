"use client";

import React, { useState, useMemo } from "react";
import { useWorkbookStore } from "../store/workbook-store";
import { useSelectionStore } from "../store/selection-store";
import { useUIStore } from "../store/ui-store";
import { expandRange } from "../engine/range-manager";
import { parseNumeric } from "../engine/formatting-engine";
import { Plus, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Check, X, ShieldAlert } from "lucide-react";

export function SheetBar() {
  const {
    workbook,
    addSheet,
    removeSheet,
    renameSheet,
    duplicateSheet,
    setActiveSheetId,
    setSheetTabColor,
  } = useWorkbookStore();

  const { selectionRange, activeCell } = useSelectionStore();
  const { zoomScale, setZoomScale, toggleModal } = useUIStore();

  const [editingSheetId, setEditingSheetId] = useState<string | null>(null);
  const [tempName, setTempName] = useState("");
  const [contextSheetId, setContextSheetId] = useState<string | null>(null);
  const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(null);

  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);

  // Status Bar Metrics (Sum, Average, Count of numeric cells in selected range)
  const stats = useMemo(() => {
    if (!activeSheet) return { count: 0, sum: 0, avg: 0 };
    const coords = expandRange(selectionRange);
    let count = 0;
    let sum = 0;

    coords.forEach(({ row, col }) => {
      const cell = activeSheet.grid[`${row}:${col}`];
      if (cell && cell.raw !== "" && cell.raw !== undefined && cell.raw !== null) {
        const val = cell.computed !== undefined ? cell.computed : cell.raw;
        const num = parseNumeric(val);
        if (!isNaN(num) && typeof val !== "boolean") {
          sum += num;
          count++;
        }
      }
    });

    const avg = count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
    return { count, sum: Math.round(sum * 100) / 100, avg };
  }, [activeSheet, selectionRange]);

  const handleStartRename = (id: string, name: string) => {
    setEditingSheetId(id);
    setTempName(name);
    setContextPos(null);
  };

  const handleCommitRename = () => {
    if (editingSheetId && tempName.trim()) {
      renameSheet(editingSheetId, tempName.trim());
    }
    setEditingSheetId(null);
  };

  const handleSheetContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextSheetId(id);
    setContextPos({ x: e.clientX, y: e.clientY - 160 });
  };

  return (
    <div className="bg-[#101010] border-t border-[#262626] flex flex-col select-none text-xs text-slate-300">
      {/* 1. SHEET TABS ROW */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#141414] border-b border-[#202020]">
        <div className="flex items-center gap-1 overflow-x-auto max-w-[65%] scrollbar-none">
          <button
            onClick={() => {
              const idx = workbook.sheets.findIndex((s) => s.id === workbook.activeSheetId);
              if (idx > 0) setActiveSheetId(workbook.sheets[idx - 1].id);
            }}
            className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
            title="Previous Sheet"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              const idx = workbook.sheets.findIndex((s) => s.id === workbook.activeSheetId);
              if (idx < workbook.sheets.length - 1) setActiveSheetId(workbook.sheets[idx + 1].id);
            }}
            className="p-1 hover:bg-[#252525] rounded text-slate-400 hover:text-white"
            title="Next Sheet"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Sheet Tabs */}
          <div className="flex items-center gap-1">
            {workbook.sheets.map((sheet) => {
              const isActive = sheet.id === workbook.activeSheetId;
              return (
                <div
                  key={sheet.id}
                  onClick={() => setActiveSheetId(sheet.id)}
                  onDoubleClick={() => handleStartRename(sheet.id, sheet.name)}
                  onContextMenu={(e) => handleSheetContextMenu(e, sheet.id)}
                  className={`relative px-4 py-1.5 rounded-t flex items-center gap-1.5 cursor-pointer font-medium transition-all text-xs border-t-2 ${
                    isActive
                      ? "bg-white text-slate-900 border-[#107c41] shadow-md font-bold"
                      : "bg-[#1c1c1c] text-slate-400 hover:bg-[#252525] hover:text-slate-200 border-transparent"
                  }`}
                  style={sheet.tabColor ? { borderBottom: `2px solid ${sheet.tabColor}` } : undefined}
                >
                  {editingSheetId === sheet.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCommitRename();
                          if (e.key === "Escape") setEditingSheetId(null);
                        }}
                        autoFocus
                        className="bg-black/80 px-1 py-0.5 rounded text-white text-xs border border-emerald-500 outline-none w-20"
                      />
                      <button onClick={handleCommitRename}><Check className="w-3 h-3 text-emerald-400" /></button>
                    </div>
                  ) : (
                    <span>{sheet.name}</span>
                  )}
                  {sheet.isProtected && (
                    <span title="Protected Sheet">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => addSheet()}
            className="p-1 hover:bg-[#252525] hover:text-emerald-400 rounded text-slate-400 transition-colors ml-1"
            title="Add Worksheet"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Real-time Status Bar Metrics (Sum, Average, Count) */}
        {stats.count > 0 && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 pr-2">
            <span>Average: <strong className="text-white font-sans">{stats.avg}</strong></span>
            <span>Count: <strong className="text-white font-sans">{stats.count}</strong></span>
            <span>Sum: <strong className="text-white font-sans">{stats.sum}</strong></span>
          </div>
        )}
      </div>

      {/* 2. EXCEL BOTTOM STATUS BAR (Ready, Accessibility, Views, Zoom Slider) */}
      <div className="h-6 bg-[#0a0a0a] px-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#1a1a1a]">
        {/* Left: Ready, Accessibility */}
        <div className="flex items-center gap-4">
          <span className="hover:text-white cursor-pointer">Ready</span>
          <div className="flex items-center gap-1.5 hover:text-white cursor-pointer">
            <span className="w-2 h-2 rounded-full border border-slate-500" />
            <span>Accessibility: Investigate</span>
          </div>
        </div>

        {/* Right: View Modes & Zoom Controls */}
        <div className="flex items-center gap-4">
          {/* View Modes Icons: Normal, Page Layout, Page Break */}
          <div className="flex items-center gap-2 border-r border-[#262626] pr-3">
            <span title="Normal View" className="cursor-pointer hover:text-white font-bold">⊞</span>
            <span title="Page Layout" className="cursor-pointer hover:text-white">📄</span>
            <span title="Page Break Preview" className="cursor-pointer hover:text-white">📑</span>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
              className="p-0.5 hover:text-white text-xs font-bold"
              title="Zoom Out"
            >
              -
            </button>

            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={zoomScale}
              onChange={(e) => setZoomScale(parseFloat(e.target.value))}
              className="w-20 h-1 bg-[#333333] accent-[#107c41] cursor-pointer"
            />

            <button
              onClick={() => setZoomScale((z) => Math.min(2.0, Math.round((z + 0.1) * 10) / 10))}
              className="p-0.5 hover:text-white text-xs font-bold"
              title="Zoom In"
            >
              +
            </button>

            <span
              onClick={() => setZoomScale(1.0)}
              className="font-mono cursor-pointer hover:text-white w-9 text-right"
              title="Reset Zoom (100%)"
            >
              {Math.round(zoomScale * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
