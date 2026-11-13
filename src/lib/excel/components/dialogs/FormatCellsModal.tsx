"use client";

import React, { useState } from "react";
import { useUIStore } from "../../store/ui-store";
import { useWorkbookStore } from "../../store/workbook-store";
import { useSelectionStore } from "../../store/selection-store";
import { expandRange } from "../../engine/range-manager";
import { FormatType } from "../../types";
import { X, Check } from "lucide-react";

export function FormatCellsModal() {
  const { showFormatCells, toggleModal } = useUIStore();
  const { updateCells, workbook } = useWorkbookStore();
  const { selectionRange, activeCell } = useSelectionStore();

  const [activeTab, setActiveTab] = useState<"number" | "alignment" | "font" | "border" | "fill">("number");
  const [selectedFormat, setSelectedFormat] = useState<FormatType>("general");
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [fontSize, setFontSize] = useState(11);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("");
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const [wrapText, setWrapText] = useState(false);

  if (!showFormatCells) return null;

  const handleApply = () => {
    const coords = expandRange(selectionRange);
    const updates = coords.map(({ row, col }) => ({
      row,
      col,
      data: {
        format: selectedFormat,
        bold,
        italic,
        underline,
        fontSize,
        textColor: textColor !== "#ffffff" ? textColor : undefined,
        bgColor: bgColor || undefined,
        align,
        wrapText,
      },
    }));
    updateCells(updates);
    toggleModal("showFormatCells", false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="bg-[#202020] border border-[#333333] w-[540px] rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#252525] border-b border-[#303030]">
          <span className="font-semibold text-sm text-white">Format Cells (Ctrl+1)</span>
          <button
            onClick={() => toggleModal("showFormatCells", false)}
            className="p-1 hover:bg-[#303030] rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#303030] bg-[#1a1a1a]">
          {(["number", "alignment", "font", "border", "fill"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 capitalize font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-[#107c41] text-emerald-400 bg-[#222222]"
                  : "border-transparent text-slate-400 hover:text-white hover:bg-[#202020]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 flex-1 min-h-[220px]">
          {activeTab === "number" && (
            <div className="space-y-3">
              <label className="text-slate-400 font-semibold block">Category:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "General", val: "general" },
                  { label: "Number (1,234.56)", val: "number" },
                  { label: "Currency (₹)", val: "currency" },
                  { label: "Accounting ((₹1,234))", val: "accounting" },
                  { label: "Percentage (12.5%)", val: "percentage" },
                  { label: "Date (YYYY-MM-DD)", val: "date" },
                  { label: "Time (HH:MM:SS)", val: "time" },
                  { label: "Scientific (1.23E+04)", val: "scientific" },
                  { label: "Text", val: "text" },
                ].map((fmt) => (
                  <button
                    key={fmt.val}
                    onClick={() => setSelectedFormat(fmt.val as FormatType)}
                    className={`px-3 py-2 text-left rounded border transition-colors ${
                      selectedFormat === fmt.val
                        ? "bg-[#107c41]/30 border-emerald-500 text-emerald-300 font-semibold"
                        : "bg-[#1a1a1a] border-slate-700/60 hover:border-slate-500 text-slate-300"
                    }`}
                  >
                    {fmt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "alignment" && (
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 font-semibold block mb-1.5">Horizontal Alignment:</label>
                <div className="flex gap-2">
                  {(["left", "center", "right"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAlign(a)}
                      className={`flex-1 py-1.5 capitalize rounded border ${
                        align === a ? "bg-emerald-800/40 border-emerald-500 text-white" : "bg-[#1a1a1a] border-slate-700 text-slate-300"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input
                  type="checkbox"
                  checked={wrapText}
                  onChange={(e) => setWrapText(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
                />
                <span>Wrap text automatically</span>
              </label>
            </div>
          )}

          {activeTab === "font" && (
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-slate-400 block mb-1">Font Size:</label>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full bg-[#1a1a1a] border border-slate-700 rounded px-2 py-1.5 text-white"
                  >
                    {[9, 10, 11, 12, 14, 16, 18, 20, 24].map((s) => (
                      <option key={s} value={s}>{s} pt</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-slate-400 block mb-1">Text Color:</label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-8 bg-transparent cursor-pointer rounded border border-slate-700"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setBold(!bold)}
                  className={`flex-1 py-1.5 font-bold rounded border ${
                    bold ? "bg-emerald-800/40 border-emerald-500 text-white" : "bg-[#1a1a1a] border-slate-700 text-slate-300"
                  }`}
                >
                  Bold
                </button>
                <button
                  onClick={() => setItalic(!italic)}
                  className={`flex-1 py-1.5 italic rounded border ${
                    italic ? "bg-emerald-800/40 border-emerald-500 text-white" : "bg-[#1a1a1a] border-slate-700 text-slate-300"
                  }`}
                >
                  Italic
                </button>
                <button
                  onClick={() => setUnderline(!underline)}
                  className={`flex-1 py-1.5 underline rounded border ${
                    underline ? "bg-emerald-800/40 border-emerald-500 text-white" : "bg-[#1a1a1a] border-slate-700 text-slate-300"
                  }`}
                >
                  Underline
                </button>
              </div>
            </div>
          )}

          {activeTab === "fill" && (
            <div className="space-y-3">
              <label className="text-slate-400 font-semibold block">Cell Background Color:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={bgColor || "#107c41"}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-12 h-10 bg-transparent cursor-pointer rounded border border-slate-700"
                />
                <button
                  onClick={() => setBgColor("")}
                  className="px-3 py-1.5 bg-[#1a1a1a] border border-slate-700 hover:border-slate-500 rounded text-slate-300"
                >
                  No Fill (Transparent)
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2 pt-2">
                {["#1E293B", "#107c41", "#0284c7", "#d97706", "#dc2626", "#7c3aed", "#1e3a8a", "#064e3b", "#701a75", "#334155", "#0f172a", "#3f3f46"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setBgColor(c)}
                    style={{ backgroundColor: c }}
                    className="h-8 rounded border border-slate-600 hover:scale-105 transition-transform"
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === "border" && (
            <div className="space-y-3">
              <p className="text-slate-400">Border formatting is applied using the Home ribbon borders picker or double-underline styling for accounting totals.</p>
              <button
                onClick={() => {
                  const coords = expandRange(selectionRange);
                  updateCells(coords.map(({ row, col }) => ({ row, col, data: { borders: { doubleBottom: true } } })));
                  toggleModal("showFormatCells", false);
                }}
                className="px-3 py-2 bg-[#1a1a1a] border border-slate-700 hover:border-emerald-500 rounded text-emerald-300 font-semibold"
              >
                Apply Accounting Double Bottom Border
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 bg-[#1e1e1e] border-t border-[#303030]">
          <button
            onClick={() => toggleModal("showFormatCells", false)}
            className="px-4 py-1.5 bg-[#252525] hover:bg-[#303030] text-slate-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 bg-[#107c41] hover:bg-[#0e6b37] text-white font-medium rounded flex items-center gap-1.5 shadow"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}

