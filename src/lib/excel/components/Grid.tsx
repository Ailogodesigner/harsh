"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useWorkbookStore } from "../store/workbook-store";
import { useSelectionStore } from "../store/selection-store";
import { useUIStore } from "../store/ui-store";
import { colToLetter, normalizeRange } from "../engine/range-manager";
import { formatCellValue } from "../engine/formatting-engine";
import { CellContextMenu } from "./dialogs/CellContextMenu";
import { ChartViewer } from "./ChartViewer";
import { CellData } from "../types";

export function Grid() {
  const { workbook, updateCell, updateCells, clearCells, resizeCol, resizeRow } = useWorkbookStore();
  const {
    activeCell,
    selectionRange,
    isSelecting,
    editingCell,
    setActiveCell,
    setSelectionRange,
    setIsSelecting,
    setEditingCell,
    isAutoFilling,
    autoFillTarget,
    setIsAutoFilling,
    setAutoFillTarget,
  } = useSelectionStore();

  const { showGridlines, showHeadings, zoomScale, toggleModal } = useUIStore();

  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Resizing state
  const [resizingCol, setResizingCol] = useState<{ col: number; startX: number; startWidth: number } | null>(null);
  const [resizingRow, setResizingRow] = useState<{ row: number; startY: number; startHeight: number } | null>(null);

  // Auto-focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const norm = normalizeRange(selectionRange);

  // Keyboard navigation & shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editingCell) return; // Allow normal typing in input

      const { row, col } = activeCell;
      const maxRows = activeSheet ? activeSheet.maxRows : 65;
      const maxCols = activeSheet ? activeSheet.maxCols : 26;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const nextR = Math.max(0, row - 1);
        setActiveCell({ row: nextR, col });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextR = Math.min(maxRows - 1, row + 1);
        setActiveCell({ row: nextR, col });
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const nextC = Math.max(0, col - 1);
        setActiveCell({ row, col: nextC });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const nextC = Math.min(maxCols - 1, col + 1);
        setActiveCell({ row, col: nextC });
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          const nextC = Math.max(0, col - 1);
          setActiveCell({ row, col: nextC });
        } else {
          const nextC = Math.min(maxCols - 1, col + 1);
          setActiveCell({ row, col: nextC });
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        const nextR = Math.min(maxRows - 1, row + 1);
        setActiveCell({ row: nextR, col });
      } else if (e.key === "F2") {
        e.preventDefault();
        setEditingCell({ row, col });
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        clearCells(selectionRange, "contents");
      } else if (e.key === "Home") {
        e.preventDefault();
        if (e.ctrlKey) {
          setActiveCell({ row: 0, col: 0 });
        } else {
          setActiveCell({ row, col: 0 });
        }
      } else if (e.ctrlKey && e.key.toLowerCase() === "1") {
        e.preventDefault();
        toggleModal("showFormatCells", true);
      } else if (e.ctrlKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        toggleModal("showFindReplace", true);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
        // Direct typing into cell starts editing
        setEditingCell({ row, col });
      }
    },
    [activeCell, activeSheet, clearCells, editingCell, selectionRange, setActiveCell, setEditingCell, toggleModal]
  );

  // Column Resizing handlers
  const handleColResizeStart = (e: React.MouseEvent, col: number) => {
    e.stopPropagation();
    const currentW = (activeSheet?.colWidths && activeSheet.colWidths[col]) || 105;
    setResizingCol({ col, startX: e.clientX, startWidth: currentW });
  };

  const handleRowResizeStart = (e: React.MouseEvent, row: number) => {
    e.stopPropagation();
    const currentH = (activeSheet?.rowHeights && activeSheet.rowHeights[row]) || 24;
    setResizingRow({ row, startY: e.clientY, startHeight: currentH });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol) {
        const delta = e.clientX - resizingCol.startX;
        resizeCol(resizingCol.col, Math.max(40, resizingCol.startWidth + delta));
      }
      if (resizingRow) {
        const delta = e.clientY - resizingRow.startY;
        resizeRow(resizingRow.row, Math.max(18, resizingRow.startHeight + delta));
      }
    };

    const handleMouseUp = () => {
      if (resizingCol) setResizingCol(null);
      if (resizingRow) setResizingRow(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingCol, resizingRow, resizeCol, resizeRow]);

  if (!activeSheet) return null;

  const maxRows = Math.min(activeSheet.maxRows, 100);
  const maxCols = Math.min(activeSheet.maxCols, 26);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseUp={() => {
        setIsSelecting(false);
        if (isAutoFilling && autoFillTarget) {
          const sourceCell = activeSheet.grid[`${activeCell.row}:${activeCell.col}`];
          const sourceRaw = sourceCell?.raw ?? "";
          const rStart = Math.min(activeCell.row, autoFillTarget.row);
          const rEnd = Math.max(activeCell.row, autoFillTarget.row);
          const updates: { row: number; col: number; data: Partial<CellData> }[] = [];
          for (let r = rStart; r <= rEnd; r++) {
            updates.push({
              row: r,
              col: activeCell.col,
              data: { raw: sourceRaw, format: sourceCell?.format },
            });
          }
          updateCells(updates);
          setIsAutoFilling(false);
          setAutoFillTarget(null);
        }
      }}
      className="flex-1 overflow-auto relative bg-white select-none outline-none scrollbar-thin"
    >
      {/* Overlaid Dynamic Charts */}
      {(workbook.charts || []).map((chart) => (
        <ChartViewer key={chart.id} chart={chart} />
      ))}

      {/* Grid container with Zoom Scale */}
      <div style={{ transform: `scale(${zoomScale})`, transformOrigin: "top left" }} className="bg-white min-h-full">
        <table className="border-collapse table-fixed text-xs font-sans w-max bg-white">
          {/* Column Headers */}
          {showHeadings && (
            <thead>
              <tr className="sticky top-0 z-20 bg-[#1a1a1a]">
                {/* Select All Corner Button */}
                <th
                  onClick={() => {
                    setSelectionRange({
                      startRow: 0,
                      startCol: 0,
                      endRow: maxRows - 1,
                      endCol: maxCols - 1,
                    });
                  }}
                  className="w-12 h-6 border-b border-r border-[#333333] bg-[#1a1a1a] sticky left-0 z-30 text-[10px] text-slate-400 font-mono text-center cursor-pointer hover:bg-[#252525]"
                  title="Select All (Ctrl+A)"
                >
                  ◢
                </th>

                {Array.from({ length: maxCols }).map((_, cIdx) => {
                  const letter = colToLetter(cIdx);
                  const isColActive =
                    activeCell.col === cIdx || (cIdx >= norm.cMin && cIdx <= norm.cMax);
                  const colWidth = (activeSheet.colWidths && activeSheet.colWidths[cIdx]) || 110;

                  return (
                    <th
                      key={cIdx}
                      style={{ width: colWidth, minWidth: colWidth }}
                      onClick={() => {
                        setActiveCell({ row: 0, col: cIdx });
                        setSelectionRange({
                          startRow: 0,
                          startCol: cIdx,
                          endRow: maxRows - 1,
                          endCol: cIdx,
                        });
                      }}
                      className={`relative h-6 border-b border-r border-[#333333] text-center font-mono text-[11px] transition-colors cursor-pointer select-none ${
                        isColActive
                          ? "bg-[#244b35] text-white font-bold border-b-2 border-emerald-400"
                          : "bg-[#1c1c1c] text-slate-300 hover:bg-[#252525]"
                      }`}
                    >
                      <span>{letter}</span>
                      {/* Resize Handle */}
                      <div
                        onMouseDown={(e) => handleColResizeStart(e, cIdx)}
                        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-500"
                      />
                    </th>
                  );
                })}
              </tr>
            </thead>
          )}

          {/* Table Body & Rows */}
          <tbody>
            {Array.from({ length: maxRows }).map((_, rIdx) => {
              const isRowActive =
                activeCell.row === rIdx || (rIdx >= norm.rMin && rIdx <= norm.rMax);
              const rowHeight = (activeSheet.rowHeights && activeSheet.rowHeights[rIdx]) || 24;

              return (
                <tr key={rIdx} style={{ height: rowHeight }}>
                  {/* Row Header Number */}
                  {showHeadings && (
                    <td
                      onClick={() => {
                        setActiveCell({ row: rIdx, col: 0 });
                        setSelectionRange({
                          startRow: rIdx,
                          startCol: 0,
                          endRow: rIdx,
                          endCol: maxCols - 1,
                        });
                      }}
                      className={`relative w-12 text-center font-mono text-[11px] border-b border-r border-[#333333] sticky left-0 z-10 select-none cursor-pointer transition-colors ${
                        isRowActive
                          ? "bg-[#244b35] text-white font-bold border-r-2 border-emerald-400"
                          : "bg-[#1c1c1c] text-slate-400 hover:bg-[#252525]"
                      }`}
                    >
                      <span>{rIdx + 1}</span>
                      {/* Row Resize Handle */}
                      <div
                        onMouseDown={(e) => handleRowResizeStart(e, rIdx)}
                        className="absolute left-0 right-0 bottom-0 h-1.5 cursor-row-resize hover:bg-emerald-500"
                      />
                    </td>
                  )}

                  {/* Row Cells */}
                  {Array.from({ length: maxCols }).map((_, cIdx) => {
                    const key = `${rIdx}:${cIdx}`;
                    const cell = activeSheet.grid[key];
                    const isSelected =
                      rIdx >= norm.rMin &&
                      rIdx <= norm.rMax &&
                      cIdx >= norm.cMin &&
                      cIdx <= norm.cMax;
                    const isActive = activeCell.row === rIdx && activeCell.col === cIdx;
                    const isEditing = editingCell?.row === rIdx && editingCell?.col === cIdx;

                    // Display Value
                    const displayVal = cell
                      ? formatCellValue(
                          cell.computed !== undefined ? cell.computed : cell.raw,
                          cell.format
                        )
                      : "";

                    // Accounting Double Underline format check
                    const hasDoubleBottom = cell?.borders?.doubleBottom;

                    return (
                      <td
                        key={cIdx}
                        onMouseDown={(e) => {
                          if (e.button === 2) return; // Right click
                          setActiveCell({ row: rIdx, col: cIdx });
                          setIsSelecting(true);
                          setSelectionRange({
                            startRow: rIdx,
                            startCol: cIdx,
                            endRow: rIdx,
                            endCol: cIdx,
                          });
                          setEditingCell(null);
                        }}
                        onMouseEnter={() => {
                          if (isSelecting) {
                            setSelectionRange({
                              ...selectionRange,
                              endRow: rIdx,
                              endCol: cIdx,
                            });
                          }
                          if (isAutoFilling) {
                            setAutoFillTarget({ row: rIdx, col: cIdx });
                          }
                        }}
                        onDoubleClick={() => setEditingCell({ row: rIdx, col: cIdx })}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setActiveCell({ row: rIdx, col: cIdx });
                          setContextMenu({ x: e.clientX, y: e.clientY });
                        }}
                        style={{
                          backgroundColor: cell?.bgColor || "#ffffff",
                          color: cell?.textColor || "#0f172a",
                          fontWeight: cell?.bold ? "bold" : undefined,
                          fontStyle: cell?.italic ? "italic" : undefined,
                          textDecoration: cell?.underline ? "underline" : undefined,
                          fontSize: cell?.fontSize ? `${cell.fontSize}px` : "12px",
                          fontFamily: cell?.fontFamily || "Calibri, Arial, sans-serif",
                          textAlign: cell?.align || (typeof cell?.raw === "number" ? "right" : "left"),
                          whiteSpace: cell?.wrapText ? "normal" : "nowrap",
                        }}
                        className={`relative px-2 py-0.5 transition-colors ${
                          showGridlines ? "border-b border-r border-[#e2e8f0]" : ""
                        } ${
                          hasDoubleBottom
                            ? "border-b-4 border-double border-slate-700 font-bold"
                            : ""
                        } ${
                          isSelected && !isActive ? "bg-emerald-500/10" : ""
                        } ${
                          isActive
                            ? "outline outline-2 outline-[#107c41] -outline-offset-1 z-10"
                            : ""
                        }`}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            type="text"
                            defaultValue={cell?.raw ? String(cell.raw) : ""}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateCell(rIdx, cIdx, { raw: (e.target as HTMLInputElement).value });
                                setEditingCell(null);
                                setActiveCell({ row: Math.min(maxRows - 1, rIdx + 1), col: cIdx });
                              }
                              if (e.key === "Tab") {
                                e.preventDefault();
                                updateCell(rIdx, cIdx, { raw: (e.target as HTMLInputElement).value });
                                setEditingCell(null);
                                setActiveCell({ row: rIdx, col: Math.min(maxCols - 1, cIdx + 1) });
                              }
                              if (e.key === "Escape") {
                                setEditingCell(null);
                              }
                            }}
                            onBlur={(e) => {
                              updateCell(rIdx, cIdx, { raw: e.target.value });
                              setEditingCell(null);
                            }}
                            className="absolute inset-0 w-full h-full bg-white border-2 border-[#107c41] text-black font-sans text-xs px-2 outline-none z-30 shadow-md"
                          />
                        ) : (
                          <span className="block truncate select-none leading-normal">{displayVal}</span>
                        )}

                        {/* Excel Auto-Fill Drag Handle on Active Cell */}
                        {isActive && !isEditing && (
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setIsAutoFilling(true);
                            }}
                            className="absolute -right-1 -bottom-1 w-2 h-2 bg-[#107c41] border border-white cursor-crosshair z-20 hover:scale-125 transition-transform"
                            title="Drag to auto-fill cells"
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

      {/* Right Click Context Menu */}
      {contextMenu && (
        <CellContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCut={() => {
            const cell = activeSheet.grid[`${activeCell.row}:${activeCell.col}`];
            if (cell) {
              navigator.clipboard?.writeText(String(cell.raw || ""));
              updateCell(activeCell.row, activeCell.col, { raw: "" });
            }
          }}
          onCopy={() => {
            const cell = activeSheet.grid[`${activeCell.row}:${activeCell.col}`];
            if (cell) navigator.clipboard?.writeText(String(cell.raw || ""));
          }}
          onPaste={async () => {
            try {
              const text = await navigator.clipboard?.readText();
              if (text !== undefined) updateCell(activeCell.row, activeCell.col, { raw: text });
            } catch (e) {
              console.error(e);
            }
          }}
          onPasteValues={async () => {
            try {
              const text = await navigator.clipboard?.readText();
              if (text !== undefined) updateCell(activeCell.row, activeCell.col, { raw: text, format: "general" });
            } catch (e) {}
          }}
        />
      )}
    </div>
  );
}

