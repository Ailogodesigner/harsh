"use client";

import React, { useEffect } from "react";
import { Ribbon } from "@/lib/excel/components/Ribbon";
import { FormulaBar } from "@/lib/excel/components/FormulaBar";
import { Grid } from "@/lib/excel/components/Grid";
import { SheetBar } from "@/lib/excel/components/SheetBar";
import { FormatCellsModal } from "@/lib/excel/components/dialogs/FormatCellsModal";
import { FindReplaceModal } from "@/lib/excel/components/dialogs/FindReplaceModal";
import { FunctionWizardModal } from "@/lib/excel/components/dialogs/FunctionWizardModal";
import { ChartInsertModal } from "@/lib/excel/components/dialogs/ChartInsertModal";
import { ProtectSheetModal } from "@/lib/excel/components/dialogs/ProtectSheetModal";
import { useWorkbookStore } from "@/lib/excel/store/workbook-store";
import { useSelectionStore } from "@/lib/excel/store/selection-store";
import { useUIStore } from "@/lib/excel/store/ui-store";
import { exportWorkbookToXLSX, triggerPrint } from "@/lib/excel/services/file-service";
import { copyToClipboard, pasteFromClipboard } from "@/lib/excel/services/clipboard-service";
import { expandRange } from "@/lib/excel/engine/range-manager";

// =========================================================================
// BACKWARD-COMPATIBLE EXPORTS FOR UNIT TESTS & CALLERS
// =========================================================================
export { colToLetter, letterToCol, parseCoord } from "@/lib/excel/engine/range-manager";
export { evaluateFormula } from "@/lib/excel/engine/formula-engine";
export { formatCellValue } from "@/lib/excel/engine/formatting-engine";
export type { SheetGrid, CellData, SheetTab } from "@/lib/excel/types";

export default function ExcelEditorPage() {
  const { undo, redo, loadFromStorage, workbook, clearCells, updateCells } = useWorkbookStore();
  const {
    selectionRange,
    activeCell,
    clipboard,
    setEditingCell,
    setActiveCell,
    setSelectionRange,
    setClipboard,
    clearClipboard,
  } = useSelectionStore();
  const { toggleModal, setFindMode } = useUIStore();

  // Load from local storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Global Keyboard Shortcuts (Capture Phase)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if actively typing inside an input or textarea (unless it's a global accelerator)
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        // Undo (Ctrl+Z) & Redo (Ctrl+Y / Ctrl+Shift+Z)
        if (key === "z") {
          e.preventDefault();
          e.stopPropagation();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }

        if (key === "y") {
          e.preventDefault();
          e.stopPropagation();
          redo();
          return;
        }

        // Save (Ctrl+S) -> Downloads XLSX
        if (key === "s") {
          e.preventDefault();
          e.stopPropagation();
          exportWorkbookToXLSX(workbook, workbook.title);
          return;
        }

        // Print (Ctrl+P)
        if (key === "p") {
          e.preventDefault();
          e.stopPropagation();
          triggerPrint();
          return;
        }

        // Format Cells (Ctrl+1)
        if (key === "1") {
          e.preventDefault();
          e.stopPropagation();
          toggleModal("showFormatCells", true);
          return;
        }

        // Find (Ctrl+F)
        if (key === "f") {
          e.preventDefault();
          e.stopPropagation();
          setFindMode("find");
          toggleModal("showFindReplace", true);
          return;
        }

        // Replace (Ctrl+H)
        if (key === "h") {
          e.preventDefault();
          e.stopPropagation();
          setFindMode("replace");
          toggleModal("showFindReplace", true);
          return;
        }

        // Select All (Ctrl+A)
        if (key === "a" && !isInput) {
          e.preventDefault();
          const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
          if (activeSheet) {
            setSelectionRange({
              startRow: 0,
              startCol: 0,
              endRow: activeSheet.maxRows - 1,
              endCol: activeSheet.maxCols - 1,
            });
          }
          return;
        }

        // Copy (Ctrl+C)
        if (key === "c" && !isInput) {
          e.preventDefault();
          e.stopPropagation();
          copyToClipboard(workbook, selectionRange, setClipboard, false);
          return;
        }

        // Cut (Ctrl+X)
        if (key === "x" && !isInput) {
          e.preventDefault();
          e.stopPropagation();
          copyToClipboard(workbook, selectionRange, setClipboard, true);
          return;
        }

        // Paste (Ctrl+V)
        if (key === "v" && !isInput) {
          e.preventDefault();
          e.stopPropagation();
          pasteFromClipboard(workbook, activeCell, clipboard, setClipboard, updateCells, clearCells, false);
          return;
        }

        // Bold (Ctrl+B)
        if (key === "b" && !isInput) {
          e.preventDefault();
          const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
          const cell = activeSheet?.grid[`${activeCell.row}:${activeCell.col}`];
          const coords = expandRange(selectionRange);
          updateCells(coords.map(({ row, col }) => ({ row, col, data: { bold: !cell?.bold } })));
          return;
        }

        // Italic (Ctrl+I)
        if (key === "i" && !isInput) {
          e.preventDefault();
          const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
          const cell = activeSheet?.grid[`${activeCell.row}:${activeCell.col}`];
          const coords = expandRange(selectionRange);
          updateCells(coords.map(({ row, col }) => ({ row, col, data: { italic: !cell?.italic } })));
          return;
        }

        // Underline (Ctrl+U)
        if (key === "u" && !isInput) {
          e.preventDefault();
          const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
          const cell = activeSheet?.grid[`${activeCell.row}:${activeCell.col}`];
          const coords = expandRange(selectionRange);
          updateCells(coords.map(({ row, col }) => ({ row, col, data: { underline: !cell?.underline } })));
          return;
        }
      }

      // Escape key to clear marching ants
      if (e.key === "Escape") {
        clearClipboard();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [
    undo,
    redo,
    workbook,
    toggleModal,
    setFindMode,
    activeCell,
    selectionRange,
    updateCells,
    setSelectionRange,
    clipboard,
    setClipboard,
    clearClipboard,
    clearCells,
  ]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#181818] overflow-hidden font-sans">
      {/* 1. Office Ribbon Toolbar */}
      <div className="print-hide">
        <Ribbon />
      </div>

      {/* 2. Formula Bar & Name Box */}
      <div className="print-hide">
        <FormulaBar />
      </div>

      {/* 3. Interactive Virtualized Grid */}
      <Grid />

      {/* 4. Bottom Sheet Bar & Live Metrics */}
      <div className="print-hide">
        <SheetBar />
      </div>

      {/* 5. Modals & Dialogs */}
      <div className="print-hide">
        <FormatCellsModal />
        <FindReplaceModal />
        <FunctionWizardModal />
        <ChartInsertModal />
        <ProtectSheetModal />
      </div>
    </div>
  );
}
