"use client";

import React, { useRef, useEffect, useState } from "react";
import { useSelectionStore } from "../store/selection-store";
import { useWorkbookStore } from "../store/workbook-store";
import { useUIStore } from "../store/ui-store";
import { coordToAddress } from "../engine/range-manager";
import { Check, X, ChevronDown } from "lucide-react";

const FORMULA_SUGGESTIONS = [
  "SUM", "AVERAGE", "COUNT", "COUNTA", "MAX", "MIN", "IF", "IFS", "VLOOKUP", "XLOOKUP",
  "INDEX", "MATCH", "CONCAT", "LEFT", "RIGHT", "MID", "LEN", "TRIM", "TODAY", "NOW",
  "DATE", "SUMIF", "COUNTIF", "AVERAGEIF", "ROUND", "ROUNDUP", "ROUNDDOWN", "ABS", "SQRT"
];

export function FormulaBar() {
  const { showFormulaBar, toggleModal } = useUIStore();
  const { activeCell, formulaInput, setFormulaInput } = useSelectionStore();
  const { workbook, updateCell } = useWorkbookStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
  const activeAddress = coordToAddress(activeCell.row, activeCell.col);

  // Sync with cell selection changes
  useEffect(() => {
    if (activeSheet) {
      const cellData = activeSheet.grid[`${activeCell.row}:${activeCell.col}`];
      setFormulaInput(cellData?.raw ? String(cellData.raw) : "");
    }
  }, [activeCell.row, activeCell.col, activeSheet, setFormulaInput]);

  const handleCommit = () => {
    updateCell(activeCell.row, activeCell.col, { raw: formulaInput });
    setSuggestions([]);
  };

  const handleCancel = () => {
    if (activeSheet) {
      const cellData = activeSheet.grid[`${activeCell.row}:${activeCell.col}`];
      setFormulaInput(cellData?.raw ? String(cellData.raw) : "");
    }
    setSuggestions([]);
  };

  const handleInputChange = (val: string) => {
    setFormulaInput(val);
    if (val.startsWith("=")) {
      const query = val.substring(1).toUpperCase();
      if (query.length > 0 && !query.includes("(")) {
        const matches = FORMULA_SUGGESTIONS.filter((s) => s.startsWith(query));
        setSuggestions(matches.slice(0, 6));
        return;
      }
    }
    setSuggestions([]);
  };

  const applySuggestion = (s: string) => {
    setFormulaInput(`=${s}(`);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  if (!showFormulaBar) return null;

  return (
    <div className="relative bg-[#181818] border-b border-[#252525] px-2 py-1 flex items-center gap-2 text-xs select-none">
      {/* Name Box */}
      <div className="flex items-center justify-between min-w-[70px] max-w-[120px] px-2 py-1 rounded bg-[#202020] border border-slate-700/60 text-slate-100 font-mono text-xs font-semibold cursor-pointer truncate">
        <span>{activeAddress}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 ml-1 shrink-0" />
      </div>

      <span className="text-slate-600 font-bold">:</span>

      {/* Action icons: ✕ ✓ fx */}
      <div className="flex items-center gap-1 text-slate-400">
        <button
          onClick={handleCancel}
          className="p-1 hover:text-rose-400 transition-colors"
          title="Cancel (Esc)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCommit}
          className="p-1 hover:text-emerald-400 transition-colors"
          title="Enter (Commit)"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <span
          onClick={() => toggleModal("showFunctionWizard", true)}
          className="font-serif italic font-bold text-slate-300 text-sm px-1 cursor-pointer hover:text-emerald-400 transition-colors"
          title="Insert Function Wizard"
        >
          fx
        </span>
      </div>

      {/* Interactive Formula Input Bar */}
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={formulaInput}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCommit();
            if (e.key === "Escape") handleCancel();
          }}
          placeholder="Enter a value or formula (e.g. =SUM(B4:B6) or =D4*E4)"
          className="w-full bg-[#202020] border border-slate-700/80 focus:border-[#107c41] px-3 py-1 rounded-md text-white font-mono text-xs outline-none transition-colors shadow-inner"
        />

        {/* Formula Autocomplete Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-64 bg-[#222222] border border-slate-700 rounded-md shadow-2xl z-50 overflow-hidden">
            {suggestions.map((s) => (
              <div
                key={s}
                onClick={() => applySuggestion(s)}
                className="px-3 py-1.5 hover:bg-[#107c41] hover:text-white cursor-pointer flex items-center justify-between text-slate-300 font-mono text-xs"
              >
                <span className="font-bold">{s}</span>
                <span className="text-[10px] opacity-60">function</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

