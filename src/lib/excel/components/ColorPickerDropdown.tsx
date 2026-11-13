"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";

interface ColorPickerDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectColor: (color: string) => void;
  onNoColor: () => void;
  title?: string;
}

// 10 Columns of Theme Colors (Top Base row + 5 shade rows)
const THEME_COLORS_BASE = [
  "#ffffff", "#000000", "#e7e6e6", "#44546a", "#4472c4",
  "#ed7d31", "#a5a5a5", "#ffc000", "#5b9bd5", "#70ad47"
];

const THEME_COLORS_SHADES = [
  // Tint 1 (Lighter 80%)
  ["#f2f2f2", "#7f7f7f", "#f2f2f2", "#d6dce4", "#d9e1f2", "#fce4d6", "#ededed", "#fff2cc", "#deebf7", "#e2efda"],
  // Tint 2 (Lighter 60%)
  ["#d9d9d9", "#595959", "#d9d9d9", "#acb9ca", "#b4c6e7", "#f8cbad", "#dbdbdb", "#ffe699", "#bdd7ee", "#c6e0b4"],
  // Tint 3 (Lighter 40%)
  ["#bfbfbf", "#3f3f3f", "#bfbfbf", "#8497b0", "#8ea9db", "#f4b084", "#c9c9c9", "#ffd966", "#9bc2e6", "#a9d08e"],
  // Shade 1 (Darker 25%)
  ["#a6a6a6", "#262626", "#a6a6a6", "#333f48", "#305496", "#c65911", "#7b7b7b", "#bf8f00", "#2e75b6", "#548235"],
  // Shade 2 (Darker 50%)
  ["#7f7f7f", "#0c0c0c", "#7f7f7f", "#222a35", "#203764", "#833c0c", "#525252", "#7f6000", "#1f4e78", "#375623"],
];

// 10 Standard Colors Row
const STANDARD_COLORS = [
  "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050",
  "#00b050", "#00b0f0", "#0070c0", "#002060", "#7030a0"
];

export function ColorPickerDropdown({
  isOpen,
  onClose,
  onSelectColor,
  onNoColor,
  title = "No Fill",
}: ColorPickerDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [highContrast, setHighContrast] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customColor, setCustomColor] = useState("#107c41");

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("mousedown", handleOutsideClick);
    }
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-1 w-64 bg-[#232323] border border-[#3b3b3b] shadow-2xl rounded-md p-3 z-50 text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {/* High-contrast only Toggle */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#333333]">
        <span className="text-[12px] text-slate-200">High-contrast only</span>
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] transition-colors ${
            highContrast
              ? "bg-[#107c41] border-[#107c41] text-white"
              : "bg-[#1a1a1a] border-slate-500 text-slate-200"
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full bg-white transition-transform ${
              highContrast ? "order-2" : "order-1"
            }`}
          />
          <span className={`text-[11px] ${highContrast ? "order-1" : "order-2"}`}>
            {highContrast ? "On" : "Off"}
          </span>
        </button>
      </div>

      {/* Theme Colors Section */}
      <div className="pt-1">
        <span className="font-semibold text-slate-200 text-[11px] block mb-1.5">Theme Colors</span>
        
        {/* Base Colors (10 Columns) */}
        <div className="grid grid-cols-10 gap-1 mb-1.5">
          {THEME_COLORS_BASE.map((c, i) => (
            <button
              key={i}
              onClick={() => { onSelectColor(c); onClose(); }}
              style={{ backgroundColor: c }}
              className="w-full h-4 rounded-[1px] border border-slate-600 hover:scale-125 transition-transform"
              title={c}
            />
          ))}
        </div>

        {/* Shades Matrix (10 Columns with 5 vertically contiguous blocks) */}
        <div className="grid grid-cols-10 gap-1 mb-2.5">
          {Array.from({ length: 10 }).map((_, cIdx) => (
            <div key={cIdx} className="flex flex-col overflow-hidden rounded-[1px]">
              {THEME_COLORS_SHADES.map((row, rIdx) => (
                <button
                  key={rIdx}
                  onClick={() => { onSelectColor(row[cIdx]); onClose(); }}
                  style={{ backgroundColor: row[cIdx] }}
                  className="w-full h-3 hover:scale-125 hover:z-10 transition-transform hover:outline hover:outline-1 hover:outline-white"
                  title={row[cIdx]}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Standard Colors Section */}
      <div className="pt-2 border-t border-[#333333]">
        <span className="font-semibold text-slate-200 text-[11px] block mb-1.5">Standard Colors</span>
        <div className="grid grid-cols-10 gap-1 mb-2.5">
          {STANDARD_COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => { onSelectColor(c); onClose(); }}
              style={{ backgroundColor: c }}
              className="w-full h-4 rounded-[1px] border border-slate-700 hover:scale-125 transition-transform"
              title={c}
            />
          ))}
        </div>
      </div>

      {/* No Fill / No Color Button */}
      <div className="pt-1.5 border-t border-[#333333] space-y-1">
        <button
          onClick={() => { onNoColor(); onClose(); }}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 hover:bg-[#2e2e2e] rounded text-slate-200 transition-colors text-left"
        >
          {title === "Automatic" ? (
            <div className="w-4 h-4 border border-slate-600 rounded-[2px] bg-black" />
          ) : (
            <div className="w-4 h-4 border border-slate-600 rounded-[2px] bg-[#1a1a1a]" />
          )}
          <span>{title}</span>
        </button>

        {/* More Colors... Button */}
        <div className="relative">
          <button
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-[#2e2e2e] rounded text-slate-200 transition-colors text-left"
          >
            <Palette className="w-4 h-4 text-emerald-400" />
            <span>More Colors...</span>
          </button>

          {showCustomPicker && (
            <div className="mt-2 p-2 bg-[#1c1c1c] border border-slate-700 rounded flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="flex-1 bg-[#141414] border border-slate-700 px-2 py-1 rounded text-white font-mono text-xs"
              />
              <button
                onClick={() => { onSelectColor(customColor); onClose(); }}
                className="px-2.5 py-1 bg-[#107c41] text-white rounded font-medium text-xs hover:bg-[#0e6b37]"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
