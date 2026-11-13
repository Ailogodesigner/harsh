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
    <div className="bg-[#181818] border-t border-[#252525] flex items-center justify-between px-2 py-1 select-none text-xs text-slate-300">
      {/* Left: Navigation and Sheet Tabs */}
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

        <button
          onClick={() => addSheet()}
          className="p-1 hover:bg-[#252525] hover:text-emerald-400 rounded text-slate-400 transition-colors mr-1.5"
          title="Add Worksheet"
        >
          <Plus className="w-4 h-4" />
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
                className={`relative px-3 py-1 rounded-t flex items-center gap-1.5 cursor-pointer font-medium transition-all text-xs border-t-2 ${
                  isActive
                    ? "bg-[#252525] text-white border-[#107c41] shadow-sm font-semibold"
                    : "bg-[#1d1d1d] text-slate-400 hover:bg-[#222222] hover:text-slate-200 border-transparent"
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
                      className="bg-black/80 px-1 py-0.5 rounded text-white text-xs border border-emerald-500 outline-none w-24"
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
      </div>

      {/* Sheet Context Menu */}
      {contextPos && contextSheetId && (
        <div
          style={{ left: contextPos.x, top: contextPos.y }}
          className="fixed z-50 w-44 bg-[#222222] border border-[#383838] shadow-2xl rounded-md py-1.5 text-xs text-slate-200"
          onMouseLeave={() => setContextPos(null)}
        >
          <button
            onClick={() => {
              const sheet = workbook.sheets.find((s) => s.id === contextSheetId);
              if (sheet) handleStartRename(sheet.id, sheet.name);
            }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#303030]"
          >
            Rename
          </button>
          <button
            onClick={() => { duplicateSheet(contextSheetId); setContextPos(null); }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#303030]"
          >
            Duplicate Sheet
          </button>
          <button
            onClick={() => { setSheetTabColor(contextSheetId, "#107c41"); setContextPos(null); }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#303030] flex items-center justify-between"
          >
            <span>Tab Color</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#107c41]" />
          </button>
          <button
            onClick={() => { toggleModal("showProtectSheet", true); setContextPos(null); }}
            className="w-full px-3 py-1.5 text-left hover:bg-[#303030]"
          >
            Protect Sheet...
          </button>
          {workbook.sheets.length > 1 && (
            <>
              <div className="h-[1px] bg-[#333333] my-1" />
              <button
                onClick={() => { removeSheet(contextSheetId); setContextPos(null); }}
                className="w-full px-3 py-1.5 text-left hover:bg-[#303030] text-rose-400"
              >
                Delete Sheet
              </button>
            </>
          )}
        </div>
      )}

      {/* Right: Metrics & Zoom Slider */}
      <div className="flex items-center gap-5 text-slate-400">
        {/* Real-time Status Bar Calculations */}
        {stats.count > 0 && (
          <div className="flex items-center gap-3 font-mono text-[11px] border-r border-[#303030] pr-4">
            <span>Average: <strong className="text-white font-sans">{stats.avg}</strong></span>
            <span>Count: <strong className="text-white font-sans">{stats.count}</strong></span>
            <span>Sum: <strong className="text-white font-sans">{stats.sum}</strong></span>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomScale((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
            className="p-1 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={zoomScale}
            onChange={(e) => setZoomScale(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#333333] accent-[#107c41] cursor-pointer"
          />

          <button
            onClick={() => setZoomScale((z) => Math.min(2.0, Math.round((z + 0.1) * 10) / 10))}
            className="p-1 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <span
            onClick={() => setZoomScale(1.0)}
            className="font-mono text-[11px] cursor-pointer hover:text-white w-9 text-right"
            title="Reset Zoom (100%)"
          >
            {Math.round(zoomScale * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
