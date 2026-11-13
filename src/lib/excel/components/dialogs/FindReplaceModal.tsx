"use client";

import React, { useState } from "react";
import { useUIStore } from "../../store/ui-store";
import { useWorkbookStore } from "../../store/workbook-store";
import { useSelectionStore } from "../../store/selection-store";
import { X, Search, Replace } from "lucide-react";

export function FindReplaceModal() {
  const { showFindReplace, findMode, toggleModal, setFindMode } = useUIStore();
  const { workbook, updateCell, updateCells } = useWorkbookStore();
  const { setActiveCell } = useSelectionStore();

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [matchCount, setMatchCount] = useState<number | null>(null);

  if (!showFindReplace) return null;

  const activeSheet = workbook.sheets.find((s) => s.id === workbook.activeSheetId);
  if (!activeSheet) return null;

  const findMatches = () => {
    if (!findText.trim()) return [];
    const matches: { row: number; col: number; val: string }[] = [];
    Object.entries(activeSheet.grid).forEach(([key, cell]) => {
      const rawVal = String(cell?.raw ?? "");
      const isMatch = matchCase
        ? rawVal.includes(findText)
        : rawVal.toLowerCase().includes(findText.toLowerCase());
      if (isMatch) {
        const [r, c] = key.split(":").map(Number);
        matches.push({ row: r, col: c, val: rawVal });
      }
    });
    return matches;
  };

  const handleFindNext = () => {
    const matches = findMatches();
    setMatchCount(matches.length);
    if (matches.length > 0) {
      setActiveCell({ row: matches[0].row, col: matches[0].col });
    }
  };

  const handleReplace = () => {
    const matches = findMatches();
    if (matches.length > 0) {
      const target = matches[0];
      const newRaw = matchCase
        ? target.val.replace(findText, replaceText)
        : target.val.replace(new RegExp(findText, "i"), replaceText);
      updateCell(target.row, target.col, { raw: newRaw });
      handleFindNext();
    }
  };

  const handleReplaceAll = () => {
    const matches = findMatches();
    if (matches.length === 0) return;
    const updates = matches.map((m) => ({
      row: m.row,
      col: m.col,
      data: {
        raw: matchCase
          ? m.val.replaceAll(findText, replaceText)
          : m.val.replace(new RegExp(findText, "gi"), replaceText),
      },
    }));
    updateCells(updates);
    setMatchCount(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-[#202020] border border-[#333333] w-[460px] rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252525] border-b border-[#303030]">
          <div className="flex gap-4">
            <button
              onClick={() => setFindMode("find")}
              className={`font-semibold pb-1 border-b-2 transition-colors ${
                findMode === "find" ? "border-emerald-500 text-white" : "border-transparent text-slate-400"
              }`}
            >
              Find (Ctrl+F)
            </button>
            <button
              onClick={() => setFindMode("replace")}
              className={`font-semibold pb-1 border-b-2 transition-colors ${
                findMode === "replace" ? "border-emerald-500 text-white" : "border-transparent text-slate-400"
              }`}
            >
              Replace (Ctrl+H)
            </button>
          </div>
          <button
            onClick={() => toggleModal("showFindReplace", false)}
            className="p-1 hover:bg-[#303030] rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-slate-400 block mb-1">Find what:</label>
            <input
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Search keyword, formula, or number..."
              className="w-full bg-[#181818] border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-xs focus:border-emerald-500 outline-none"
              autoFocus
            />
          </div>

          {findMode === "replace" && (
            <div>
              <label className="text-slate-400 block mb-1">Replace with:</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replacement value..."
                className="w-full bg-[#181818] border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={matchCase}
                onChange={(e) => setMatchCase(e.target.checked)}
                className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
              />
              <span>Match case</span>
            </label>

            {matchCount !== null && (
              <span className="text-slate-400 font-mono">
                {matchCount > 0 ? `${matchCount} matches found` : "No matches found"}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 px-4 py-3 bg-[#1e1e1e] border-t border-[#303030]">
          <button
            onClick={() => toggleModal("showFindReplace", false)}
            className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-slate-300 rounded"
          >
            Close
          </button>
          <button
            onClick={handleFindNext}
            className="px-3 py-1.5 bg-[#282828] hover:bg-[#353535] border border-slate-700 text-white rounded flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Find Next</span>
          </button>
          {findMode === "replace" && (
            <>
              <button
                onClick={handleReplace}
                className="px-3 py-1.5 bg-[#282828] hover:bg-[#353535] border border-slate-700 text-white rounded"
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                className="px-3 py-1.5 bg-[#107c41] hover:bg-[#0e6b37] text-white font-medium rounded flex items-center gap-1.5 shadow"
              >
                <Replace className="w-3.5 h-3.5" />
                <span>Replace All</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

